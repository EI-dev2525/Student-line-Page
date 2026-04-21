'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, CalendarIcon, Info, CalendarCheck, BookOpen } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { format, parseISO, addWeeks, isAfter } from 'date-fns'
import { toast } from 'sonner'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getVacationStartOptions, getVacationEndOptions, SchoolBreak } from '@/lib/date-utils'
import { supabase } from '@/lib/supabase'
import { useStudentData } from '@/hooks/use-student-data'

const formSchema = z.object({
  contract_course_id: z.string().min(1, "対象コースを選択してください"),
  start_date: z.string().min(1, "開始日を選択してください"),
  end_date: z.string().min(1, "終了日を選択してください"),
  reason: z.string().min(1, "理由を入力してください").max(1000, "1000文字以内で入力してください"),
}).refine((data) => {
  const start = parseISO(data.start_date)
  const end = parseISO(data.end_date)
  return isAfter(end, start)
}, {
  message: "終了日は開始日より後の日付を選択してください",
  path: ["end_date"],
})

interface VacationRequestFormProps {
  studentId: string
  onSuccess?: () => void
}

export function VacationRequestForm({ studentId, onSuccess }: VacationRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [schoolBreaks, setSchoolBreaks] = useState<SchoolBreak[]>([])
  const [isLoadingBreaks, setIsLoadingBreaks] = useState(true)

  const { studentProfile, regularCourses, isLoading: isLoadingStudent } = useStudentData(studentId)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract_course_id: "",
      start_date: "",
      end_date: "",
      reason: "",
    },
  })

  // 監視対象
  const startDate = useWatch({
    control: form.control,
    name: "start_date",
  })

  const endDate = useWatch({
    control: form.control,
    name: "end_date",
  })

  // 初期データの取得
  useEffect(() => {
    const fetchBreaks = async () => {
      try {
        // 休校期間の取得
        const { data: breaksData, error: breaksError } = await supabase
          .from('school_breaks')
          .select('start_date, end_date')
        
        if (breaksError) throw breaksError
        setSchoolBreaks(breaksData || [])
      } catch (err) {
        console.error('Error fetching breaks data:', err)
      } finally {
        setIsLoadingBreaks(false)
      }
    }
    fetchBreaks()
  }, [])

  // 単一コースの場合に自動選択
  useEffect(() => {
    if (regularCourses.length === 1) {
      form.setValue('contract_course_id', regularCourses[0].sf_id)
      // 必要に応じてフォームのバリデーション状態を更新
      form.trigger('contract_course_id')
    }
  }, [regularCourses, form])

  // 選択肢の生成
  const mondays = useMemo<{ value: string; label: string }[]>(() => {
    return getVacationStartOptions(schoolBreaks)
  }, [schoolBreaks])

  // 開始日によって終了日の選択肢を生成
  const filteredSundays = useMemo<{ value: string; label: string }[]>(() => {
    return getVacationEndOptions(startDate || "", schoolBreaks)
  }, [startDate, schoolBreaks])

  // 期間（週数）の計算
  const periodCalculation = useMemo(() => {
    if (!startDate || !endDate) return null

    const start = parseISO(startDate)
    const end = parseISO(endDate)

    // 全ての日付をリストアップして月曜日（週の数）を数える
    const days = []
    let current = start
    while (current <= end) {
      if (format(current, 'i') === '1') { // Monday
        days.push(current)
      }
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000)
    }

    const totalWeeks = days.length
    
    // School Breakに含まれる週を数える
    const sbWeeks = days.filter(d => {
      return schoolBreaks.some(sb => {
        const sbStart = parseISO(sb.start_date)
        const sbEnd = parseISO(sb.end_date)
        return d >= sbStart && d <= sbEnd
      })
    }).length

    const actualWeeks = totalWeeks - sbWeeks
    
    // 延長後の終了日計算
    let newEndDate = null
    const currentEndDate = studentProfile?.current_course_end_date
    if (currentEndDate) {
      newEndDate = format(addWeeks(parseISO(currentEndDate), actualWeeks), 'yyyy-MM-dd')
    }

    return { totalWeeks, sbWeeks, actualWeeks, newEndDate }
  }, [startDate, endDate, schoolBreaks, studentProfile?.current_course_end_date])

  const router = useRouter()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('requests')
        .insert({
          user_id: studentId,
          student_sf_id: studentProfile?.sf_id || null,
          contract_course_sf_id: values.contract_course_id,
          request_type: 'vacation',
          start_date: values.start_date,
          end_date: values.end_date,
          reason: values.reason,
          status: 'pending',
          sb_weeks_count: periodCalculation?.sbWeeks || 0,
          extension_weeks: periodCalculation?.actualWeeks || 0,
          original_end_date: studentProfile?.current_course_end_date || null,
          new_end_date: periodCalculation?.newEndDate,
          // 標準カラム
          total_weeks: periodCalculation?.totalWeeks || 0,
          sb_weeks: periodCalculation?.sbWeeks || 0,
          effective_weeks: periodCalculation?.actualWeeks || 0
        })

      if (error) throw error

      router.push('/success?type=vacation')
    } catch (err: any) {
      console.error('Submission error details:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
        error: err
      })
      toast.error('申請に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingBreaks || isLoadingStudent) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-slate-800">
        
        {regularCourses.length === 1 ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <p className="text-sm text-slate-500 font-bold mb-1 flex items-center gap-2">
              対象コース
            </p>
            <p className="text-base font-bold text-slate-800">{regularCourses[0].course_name}</p>
            {/* hiddenフィールドを使わなくてもsetValueで状態管理されているため値は送信されます */}
          </div>
        ) : (
          <FormField
            control={form.control}
            name="contract_course_id"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  対象コース
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-white">
                      <SelectValue placeholder="対象コースを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regularCourses.map((c) => (
                      <SelectItem key={c.sf_id} value={c.sf_id}>
                        {c.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  いつから（月曜）
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-white">
                      <SelectValue placeholder="開始週を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mondays.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  いつまで（日曜）
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-white" disabled={!startDate}>
                      <SelectValue placeholder={startDate ? "終了週を選択" : "開始日を先に選択してください"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredSundays.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {periodCalculation && (
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-3 text-blue-800">
              <CalendarCheck className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">申請期間：{periodCalculation.actualWeeks} 週間</span>
            </div>
            {periodCalculation.sbWeeks > 0 && (
              <p className="text-xs text-blue-600 text-center leading-relaxed max-w-[280px]">
                ※ 期間内にSchool Break期間が含まれるため、<br />その分は申請期間から除外されます。
              </p>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-bold">お休みの理由やスタッフへのメッセージ</FormLabel>
              <FormDescription className="text-xs text-slate-500">
                ※必須ではございませんが、よろしければ理由を記載ください。
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="例：体調不良・私用・残業・学校行事等の理由を入力してください"
                  className="resize-none min-h-[100px] bg-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
          <p className="text-sm text-blue-800 leading-relaxed">
            ※ Vacation申請は、申請いただいた期間分、受講期間が延長されます。<br/>
            ※ 複数コースをご受講の場合は、クラスごとに申請をお送りください。<br/>
            ※ 4週間以上連続でお休みする場合は休学申請となります。<br/>
            　（1回の申請につき5,500円(税込)の手数料が発生します。）
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          この内容でVacation申請する
        </Button>
      </form>
    </Form>
  )
}
