'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'


// フォームの選択肢定数（DB取得失敗時のフォールバック用）
const FORM_CONSTANTS = {
  purpose: [
    "海外大学進学", "国内大学進学", "国内・海外大学院進学", "交換留学", "中学・高校留学",
    "ワーキングホリデー", "昇進・昇給条件", "就職活動", "転職活動", "英語力向上", "その他"
  ],
  exams: [
    "TOEFL iBT", "TOEIC", "IELTS", "TOEFL ITP", "英検", "どの試験も受けた事がない", "その他"
  ],
  deadlines: [
    "1ヶ月以内", "3ヶ月以内", "半年以内", "1年以内", "1年以上先", "特に期間の定めはない", "その他"
  ],
  studyPeriods: [
    "1ヶ月", "3ヶ月", "6ヶ月", "1年", "1年以上", "カウンセリングを受けてから決めたい"
  ],
  discoverySources: [
    "Google", "Yahoo", "比較・ランキングサイト", "Instagram", "TikTok", "YouTube", "Twitter(X)", "Facebook",
    "在校生・卒業生の紹介", "留学エージェントの紹介", "その他"
  ],
  occupations: [
    "中学1年生", "中学2年生", "中学3年生", "高校1年生", "高校2年生", "高校3年生",
    "専門学校1年生", "専門学校2年生", "短大1年生", "短大2年生",
    "大学1年生", "大学2年生", "大学3年生", "大学4年生", "大学院生", 
    "会社員", "自営業", "主婦", "フリーター", "無職", "浪人生", "予備校生", "その他"
  ]
} as const;

interface FieldSetting {
  field_id: string
  label: string
  description: string | null
  options: string[]
  is_required: boolean
  sort_order: number
  field_type: string
}

// Field Type Mapper (handles both English and Japanese from DB)
const mapFieldType = (type: string | null): string => {
  if (!type) return "text"
  const mapper: Record<string, string> = {
    "チェックボックス": "checkbox",
    "テキスト": "text",
    "プルダウン": "select",
    "ラジオボタン": "radio",
    "テキストエリア": "textarea",
    // Standard English values
    "checkbox": "checkbox",
    "text": "text",
    "select": "select",
    "radio": "radio",
    "textarea": "textarea"
  }
  return mapper[type] || "text"
}

const FALLBACK_SETTINGS: FieldSetting[] = [
  { field_id: "occupation", label: "ご職業", description: null, options: [...FORM_CONSTANTS.occupations], is_required: true, sort_order: 1, field_type: "select" },
  { field_id: "purposes", label: "テスト対策・留学の目的（複数選択可）", description: null, options: [...FORM_CONSTANTS.purpose], is_required: true, sort_order: 2, field_type: "checkbox" },
  { field_id: "target_score", label: "目標スコアやその他目標", description: null, options: [], is_required: false, sort_order: 3, field_type: "text" },
  { field_id: "latest_test_name", label: "直近の試験名", description: "英語の試験を受けたことがある方は、試験名とスコアをご記入ください。", options: [...FORM_CONSTANTS.exams], is_required: true, sort_order: 4, field_type: "select" },
  { field_id: "latest_score", label: "直近のスコア", description: null, options: [], is_required: false, sort_order: 5, field_type: "text" },
  { field_id: "deadline", label: "いつまでに目標を達成したいか", description: null, options: [...FORM_CONSTANTS.deadlines], is_required: true, sort_order: 6, field_type: "select" },
  { field_id: "study_period", label: "イングリッシュイノベーションズでのご受講検討期間", description: null, options: [...FORM_CONSTANTS.studyPeriods], is_required: true, sort_order: 7, field_type: "select" },
  { field_id: "discovery_source", label: "イングリッシュイノベーションズを知ったきっかけ", description: null, options: [...FORM_CONSTANTS.discoverySources], is_required: true, sort_order: 8, field_type: "select" },
  { field_id: "comparing_other_schools", label: "他校と比較検討されていますでしょうか？", description: null, options: ["はい", "いいえ", "Yes", "No"], is_required: true, sort_order: 9, field_type: "radio" },
  { field_id: "wants_counseling", label: "担当のカウンセラーからご自身の目標への最短の道筋のプランニングをご希望されますでしょうか？", description: null, options: ["はい", "いいえ", "Yes", "No"], is_required: true, sort_order: 10, field_type: "radio" },
  { field_id: "remarks", label: "その他、事前に伝えておきたいことや質問など", description: null, options: [], is_required: false, sort_order: 11, field_type: "textarea" },
]

const formSchema = z.object({
  occupation: z.string().min(1, "ご職業を選択してください"),
  purpose: z.array(z.string()).min(1, "目的を1つ以上選択してください"),
  target_score: z.string().optional().or(z.literal("")),
  latest_test_name: z.string().min(1, "直近の試験名を選択してください"),
  latest_test_name_other: z.string().optional(),
  latest_score: z.string().optional().or(z.literal("")),
  deadline: z.string().min(1, "期限目標を選択してください"),
  deadline_other: z.string().optional(),
  study_period: z.string().min(1, "受講期間を選択してください"),
  discovery_source: z.string().min(1, "当校を知ったきっかけを選択してください"),
  discovery_source_details: z.string().optional(),
  comparing_other_schools: z.string().min(1, "選択してください"),
  other_school_names: z.string().optional().or(z.literal("")),
  wants_counseling: z.string().min(1, "選択してください"),
  remarks: z.string().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface CounselingFormProps {
  studentId: string
  studentSfId?: string | null
  leadSfId?: string | null
  onSuccess?: () => void
}

export function CounselingForm({ studentId, studentSfId, leadSfId, onSuccess }: CounselingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState<FieldSetting[]>(FALLBACK_SETTINGS)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  // Fetch form settings from Supabase
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('counseling_form_settings')
          .select('*')
          .order('sort_order', { ascending: true })
        
        if (error) throw error
        
        if (data && data.length > 0) {
          const typedData = (data as any[]).map(curr => ({
            ...curr,
            options: Array.isArray(curr.options) ? curr.options : [],
            field_type: curr.field_type || "text"
          })) as FieldSetting[]
          setSettings(typedData)
        }
      } catch (err) {
        console.error('Error fetching settings, using fallback settings:', err)
      } finally {
        setIsLoadingSettings(false)
      }
    }
    fetchSettings()
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      occupation: "",
      purpose: [],
      target_score: "",
      latest_test_name: "",
      latest_test_name_other: "",
      latest_score: "",
      deadline: "",
      deadline_other: "",
      study_period: "",
      discovery_source: "",
      discovery_source_details: "",
      comparing_other_schools: "",
      other_school_names: "",
      wants_counseling: "",
      remarks: "",
    },
  })

  // Watch for conditional fields
  const latestTestName = form.watch("latest_test_name")
  const deadline = form.watch("deadline")
  const discoverySource = form.watch("discovery_source")
  const comparingOtherSchools = form.watch("comparing_other_schools")

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const details = {
        ...values,
        comparing_other_schools: values.comparing_other_schools === "Yes" || values.comparing_other_schools === "はい",
        wants_counseling: values.wants_counseling === "はい" || values.wants_counseling === "Yes",
      }

      const { error } = await supabase
        .from('counseling_forms')
        .insert({
          line_id: studentId,
          student_sf_id: studentSfId || null,
          lead_sf_id: leadSfId || null,
          details: details,
          status: 'pending'
        })

      if (error) throw error

      toast.success('送信が完了しました。ありがとうございます。')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('Submission error:', err)
      toast.error('送信に失敗しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse">お申込み内容を読み込んでいます...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
          カウンセリングフォーム
        </h1>
        <div className="text-[15px] text-slate-600 leading-relaxed space-y-4 font-medium">
          <p>この度は当校の無料体験レッスンのご予約をいただき誠にありがとうございます。</p>
          <p>カウンセリングに参加される前に、以下の質問にご回答頂けると幸いです。</p>
          
          <div className="bg-blue-50/80 border border-blue-100 p-5 rounded-2xl text-blue-900">
            <p className="mb-3">
              所要時間は<strong>1-2分程度</strong>です。目的は事前にニーズを把握させて頂くことで、より短い時間で質の高いカウンセリングをさせて頂く事です。
            </p>
            <p className="text-sm opacity-90">
              体験レッスン当日にご回答頂くことも可能ですが、向かう電車の中などお手すきの際に事前回答頂けますと当日のご案内がスムーズです。
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

          {/* Dynamic Fields Rendering */}
          {settings.map((setting) => {
            const fieldId = setting.field_id
            
            const formNameMap: Record<string, keyof FormValues> = {
              purposes: "purpose",
              target_score: "target_score",
              latest_test_name: "latest_test_name",
              latest_score: "latest_score",
              deadline: "deadline",
              study_period: "study_period",
              discovery_source: "discovery_source",
              comparing_other_schools: "comparing_other_schools",
              wants_counseling: "wants_counseling",
              occupation: "occupation",
              remarks: "remarks"
            }
            const formName = (formNameMap[fieldId] || fieldId) as keyof FormValues
            const fieldType = mapFieldType(setting.field_type)

            return (
              <div key={fieldId} className="space-y-6">
                <FormField
                  control={form.control}
                  name={formName}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="space-y-1">
                        <FormLabel className="text-base font-bold text-slate-800">
                          {setting.label}
                          {setting.is_required && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        {setting.description && (
                          <FormDescription className="text-xs text-slate-500 leading-relaxed">
                            {setting.description}
                          </FormDescription>
                        )}
                      </div>

                      <FormControl>
                        {(() => {
                          // 1. Checkbox group (e.g. purposes)
                          if (fieldType === "checkbox") {
                            const options = setting.options.length > 0 ? setting.options : []
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                {options.map((option: string) => (
                                  <div key={option} className="flex flex-row items-start space-x-3 space-y-0">
                                    <Checkbox
                                      checked={(field.value as string[] | undefined)?.includes(option)}
                                      onCheckedChange={(checked) => {
                                        const val = field.value as string[] || []
                                        return checked
                                          ? field.onChange([...val, option])
                                          : field.onChange(val.filter((v) => v !== option))
                                      }}
                                      className="h-5 w-5 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )
                          }

                          // 2. Radio group
                          if (fieldType === "radio") {
                            return (
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={String(field.value)}
                                className="flex flex-col space-y-2"
                              >
                                {setting.options.map((option: string) => (
                                  <div key={option} className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value={option} id={`${fieldId}-${option}`} />
                                    <Label htmlFor={`${fieldId}-${option}`} className="font-normal text-slate-700 cursor-pointer">
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )
                          }

                          // 3. Select box
                          if (fieldType === "select") {
                            return (
                              <Select onValueChange={field.onChange} value={field.value as string || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-12 text-slate-700 bg-slate-50 border-slate-200 w-full">
                                    <SelectValue placeholder="選択してください" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[300px] w-[var(--radix-select-trigger-width)] min-w-[200px]">
                                  {setting.options.map((option: string) => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          }

                          // 4. Textarea
                          if (fieldType === "textarea") {
                            return (
                              <Textarea 
                                placeholder={setting.label} 
                                className="min-h-[100px] text-slate-700 bg-slate-50 border-slate-200" 
                                {...field} 
                              />
                            )
                          }

                          // 5. Default Input (text)
                          return (
                            <Input 
                              placeholder={fieldId.includes("score") ? "例：550 / 61 / 5.0" : "詳細を入力してください"} 
                              className="h-12 text-slate-700 bg-slate-50 border-slate-200" 
                              {...field} 
                            />
                          )
                        })()}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Visibility Logic (Hardcoded specifically for these IDs to maintain current functionality) */}
                {fieldId === "latest_test_name" && latestTestName === "その他" && (
                  <FormField
                    control={form.control}
                    name="latest_test_name_other"
                    render={({ field }) => (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 ml-4">
                        <Input placeholder="具体的な試験名を入力してください" className="h-12 text-slate-700 bg-slate-50 border-slate-200" {...field} />
                      </div>
                    )}
                  />
                )}

                {fieldId === "deadline" && deadline === "その他" && (
                  <FormField
                    control={form.control}
                    name="deadline_other"
                    render={({ field }) => (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 ml-4">
                        <Input placeholder="例：○月まで、○ヶ月以内など" className="h-12 text-slate-700 bg-slate-50 border-slate-200" {...field} />
                      </div>
                    )}
                  />
                )}

                {fieldId === "discovery_source" && (discoverySource === "在校生・卒業生の紹介" || discoverySource === "留学エージェントの紹介" || discoverySource === "その他") && (
                  <FormField
                    control={form.control}
                    name="discovery_source_details"
                    render={({ field }) => (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 ml-4">
                        <FormDescription className="text-xs text-slate-500 mb-2">
                          ※詳細（紹介者名、媒体など）をご記入ください
                        </FormDescription>
                        <Input placeholder="詳細を入力してください" className="h-12 text-slate-700 bg-slate-50 border-slate-200" {...field} />
                      </div>
                    )}
                  />
                )}

                {fieldId === "comparing_other_schools" && (comparingOtherSchools === "Yes" || comparingOtherSchools === "はい") && (
                  <FormField
                    control={form.control}
                    name="other_school_names"
                    render={({ field }) => (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 ml-4 space-y-2">
                        <Label className="text-sm font-bold text-slate-700">学校名をご記入ください（任意）</Label>
                        <Input placeholder="検討中の他校名" className="h-12 text-slate-700 bg-slate-50 border-slate-200" {...field} />
                      </div>
                    )}
                  />
                )}
              </div>
            )
          })}

          <div className="pt-4 pb-8">
            <Button 
              type="submit" 
              className="w-full h-14 text-xl font-bold rounded-xl shadow-lg transition-all active:scale-95 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  送信中...
                </>
              ) : (
                "この内容で回答する"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
