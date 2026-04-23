'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, CalendarIcon, Info, CalendarCheck, CreditCard, Banknote, Coins, BookOpen, Clock } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { format, parseISO, eachDayOfInterval, isMonday, isWithinInterval, startOfDay, addWeeks } from 'date-fns'
import { ja } from 'date-fns/locale'
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
import { supabase } from '@/lib/supabase'
import { SchoolBreak, getVacationStartOptions, getLeaveOfAbsenceEndOptions } from '@/lib/date-utils'
import { getLeaveOfAbsenceTargetCourse } from '@/lib/course-utils'
import { useStudentData } from '@/hooks/use-student-data'

const formSchema = z.object({
  start_date: z.string().min(1, "開始日を選択してください"),
  end_date: z.string().min(1, "終了日を選択してください"),
  payment_method: z.string().min(1, "お支払い方法を選択してください"),
  reason: z.string().max(1000, "1000文字以内で入力してください").optional().or(z.literal('')),
})

interface LeaveRequestFormProps {
  studentId: string
  onSuccess?: () => void
}

export function LeaveRequestForm({ studentId, onSuccess }: LeaveRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [schoolBreaks, setSchoolBreaks] = useState<SchoolBreak[]>([])
  const [isLoadingBreaks, setIsLoadingBreaks] = useState(true)

  const { studentProfile, rawCourses, isLoading: isLoadingStudent } = useStudentData(studentId)

  const targetCourse = useMemo(() => {
    return getLeaveOfAbsenceTargetCourse(rawCourses || [])
  }, [rawCourses])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start_date: "",
      end_date: "",
      payment_method: "",
      reason: "",
    },
  })

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

  // 選択肢の生成
  const mondays = useMemo(() => getVacationStartOptions(schoolBreaks), [schoolBreaks])
  const sundays = useMemo(() => getLeaveOfAbsenceEndOptions(startDate, schoolBreaks), [startDate, schoolBreaks])

  // 期間計算
  const periodCalculation = useMemo(() => {
    if (!startDate || !endDate) return null

    const totalWeeks = Math.round((parseISO(endDate).getTime() - parseISO(startDate).getTime() + 86400000) / (7 * 24 * 60 * 60 * 1000))
    
    // SB週数をカウント（月曜日がSB期間に含まれる週）
    const sbWeeks = eachDayOfInterval({ 
      start: parseISO(startDate), 
      end: parseISO(endDate) 
    }).filter(d => {
      return isMonday(d) && schoolBreaks.some(sb => {
        const start = startOfDay(parseISO(sb.start_date))
        const end = startOfDay(parseISO(sb.end_date))
        return isWithinInterval(d, { start, end })
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
    if (periodCalculation && periodCalculation.actualWeeks < 4) {
      toast.error('休学は実質4週間以上から申請可能です。')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          student_line_id: studentId,
          student_sf_id: studentProfile?.sf_id || null,
          contract_course_sf_id: targetCourse?.sf_id || null,
          start_date: values.start_date,
          end_date: values.end_date,
          reason: values.reason,
          status: 'pending',
          payment_method: values.payment_method,
          total_weeks: periodCalculation?.totalWeeks || 0,
          sb_weeks: periodCalculation?.sbWeeks || 0,
          effective_weeks: periodCalculation?.actualWeeks || 0,
          new_end_date: periodCalculation?.newEndDate
        })

      if (error) throw error

      router.push('/success?type=leave')
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* 説明エリア */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
          <div className="bg-amber-100 px-4 py-2 border-b border-amber-200 flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-700" />
            <span className="text-sm font-bold text-amber-800">重要：休学申請のルール</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-amber-800 font-medium">休学手数料</span>
              <span className="text-amber-900 font-bold bg-white px-3 py-1 rounded-full border border-amber-200">5,500円（税込）</span>
            </div>
            <div className="text-xs text-amber-800 space-y-2 leading-relaxed">
              <p>・休学は実質期間が<strong>4週間以上</strong>から申請可能です。</p>
              <p>・休校期間(School Break)は申請週数に含まれません。</p>
              <p>・お支払い方法を選択し、スタッフの確認をお待ちください。</p>
              <p>・受講期間は申請週数分、後ろ倒しで延長されます。</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-bold">開始日（月曜日）</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white w-full overflow-hidden">
                        <SelectValue placeholder="開始日を選択" className="truncate" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mondays.map((monday) => (
                        <SelectItem key={monday.value} value={monday.value}>
                          {monday.label}
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
                  <FormLabel className="text-base font-bold">終了日（日曜日）</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                    disabled={!startDate}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white w-full overflow-hidden">
                        <SelectValue placeholder={startDate ? "終了日を選択" : "先に開始日を選択してください"} className="truncate" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sundays.map((sunday) => (
                        <SelectItem key={sunday.value} value={sunday.value}>
                          {sunday.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => {
              const paymentMethods = [
                { value: 'bank_transfer', label: 'お振込み', icon: Banknote },
                { value: 'credit_card', label: 'クレジットカード', icon: CreditCard },
                { value: 'cash', label: '現金（校舎窓口）', icon: Coins },
              ]
              const selectedMethod = paymentMethods.find(m => m.value === field.value)

              return (
                <FormItem>
                  <FormLabel className="text-base font-bold">お支払い方法</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white w-full overflow-hidden">
                        <SelectValue placeholder="お支払い方法を選択">
                          {selectedMethod && (
                            <div className="flex items-center gap-2">
                              <selectedMethod.icon className="h-4 w-4 text-slate-500" />
                              <span>{selectedMethod.label}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="h-4 w-4 text-slate-500" />
                            <span>{method.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {periodCalculation && (
            <div className="bg-blue-50/50 rounded-2xl border border-blue-200 p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* メイン表示（横並び） */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="bg-blue-100 p-2.5 rounded-xl">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-800">申請期間：</span>
                  <span className="text-3xl font-black text-blue-900 leading-none flex items-baseline">
                    {periodCalculation.actualWeeks}
                    <span className="text-xl font-bold ml-1">週間</span>
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-blue-200/50 space-y-3">
                {/* 補足説明 */}
                <div className="flex items-center justify-center gap-2 text-blue-700 bg-white/80 py-2.5 px-4 rounded-xl border border-blue-100 shadow-sm mx-auto w-fit">
                  <Info className="h-4 w-4 text-blue-500 shrink-0" />
                  <p className="text-sm font-bold">
                    対象コースの受講終了日が <span className="text-blue-900 font-black">{periodCalculation.actualWeeks}週間</span> 延長されます
                  </p>
                </div>
                
                {periodCalculation.sbWeeks > 0 && (
                  <p className="text-[11px] text-blue-500/70 text-center leading-tight">
                    ※申請期間内の School Break ({periodCalculation.sbWeeks}週間) は、申請期間に含まれません。
                  </p>
                )}
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">休学の理由・スタッフへのメッセージ</FormLabel>
                <FormDescription className="text-xs text-slate-500">
                  ※今後の学習プランの相談等ございましたらご記入ください。
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="理由を入力してください"
                    className="resize-none min-h-[100px] bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-100 transition-all hover:scale-[1.01]"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          休学申請を送信する
        </Button>
      </form>
    </Form>
  )
}
