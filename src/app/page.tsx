'use client'

import { useLiffAuth } from '@/hooks/use-liff-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  PauseCircle, 
  Umbrella,
  Target, 
  ChevronRight,
  MessageSquare,
  UserCircle,
  FileText,
  Clock
} from 'lucide-react'
import { STUDENT_STATUSES, StudentStatus } from '@/types'
import Link from 'next/link'

export default function MyPage() {
  const { studentData, isLoading, error } = useLiffAuth()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 space-y-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          <h2 className="font-bold text-lg mb-2">システムエラー</h2>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            再読み込み
          </Button>
        </div>
      </main>
    )
  }

  if (!studentData) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <UserCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">会員登録が見つかりません</h2>
        <p className="text-slate-500 mb-6">
          まだ会員登録がお済みでないか、読み込み中に問題が発生しました。
        </p>
        <Button 
          className="w-full max-w-xs bg-lime-600 hover:bg-lime-700 font-bold"
          onClick={() => console.log('新規登録へ遷移')}
        >
          新規登録はこちら
        </Button>
      </main>
    )
  }

  const { full_name, status, course_name, goal_score } = studentData
  
  // ステータス判定: 生徒表示グループに属するかどうか
  const isStudent = STUDENT_STATUSES.includes(status as StudentStatus)

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Logo Header */}
      <header className="pt-8 pb-2 flex justify-center">
        <img 
          src="/ei_logo.png" 
          alt="English Innovations" 
          className="h-10 w-auto"
        />
      </header>

      <div className="px-5 py-6 space-y-6 max-w-md mx-auto">
        {isStudent ? (
          /* パターンA: 既存生徒向けUI */
          <>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {full_name} 様
              </h1>
            </div>

            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-900 to-indigo-900 text-white overflow-hidden rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-200 tracking-wider font-bold">
                  <Target className="h-4 w-4" />
                  現在の学習状況
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 col-span-2">
                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mb-1">受講コース</p>
                    <p className="text-base font-black">{course_name || '未設定'}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <p className="text-[10px] text-blue-200 mb-1 font-bold uppercase tracking-widest">目標スコア</p>
                    <p className="text-lg font-black">{goal_score || '未設定'}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <p className="text-[10px] text-blue-200 mb-1 font-bold uppercase tracking-widest">ステータス</p>
                    <p className="text-lg font-black">{status || '未設定'}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 col-span-2">
                    <p className="text-[10px] text-blue-200 mb-1 font-bold uppercase tracking-widest">現在の受講終了日</p>
                    <p className="text-base font-black">
                      {studentData.current_course_end_date 
                        ? new Date(studentData.current_course_end_date).toLocaleDateString('ja-JP') 
                        : '未設定'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/vacation" className="col-span-1">
                <Card className="h-32 flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 border-none shadow-sm rounded-3xl group transition-all cursor-pointer">
                  <div className="p-3 bg-sky-50 rounded-2xl group-hover:scale-110 transition-transform">
                    <Umbrella className="h-8 w-8 text-sky-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Vacation申請</span>
                </Card>
              </Link>

              <Link href="/leave" className="col-span-1">
                <Card className="h-32 flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 border-none shadow-sm rounded-3xl group transition-all cursor-pointer">
                  <div className="p-3 bg-orange-50 rounded-2xl group-hover:scale-110 transition-transform">
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">休学申請</span>
                </Card>
              </Link>
            </div>
          </>
        ) : (
          /* パターンB: 新規リード向けUI */
          <>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {full_name} 様
              </h1>
            </div>

            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden rounded-3xl">
              <CardHeader className="relative pb-2">
                <CardTitle className="text-xl font-black italic">こんにちは！</CardTitle>
                <CardDescription className="text-blue-100 font-medium">
                  事前アンケートのお願い
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm leading-relaxed mb-6 font-medium text-blue-50">
                  あなたにぴったりのカリキュラムをご提案するため、無料体験レッスン・カウンセリング前に、簡単なアンケートへのご協力をお願いします。
                </p>
                <Link href="/counseling-form">
                  <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black border-none rounded-2xl h-14 shadow-lg text-lg flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5" />
                    アンケートに回答する
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <Button 
                variant="outline"
                className="w-full h-24 flex items-center justify-between px-6 bg-white hover:bg-slate-50 border-none shadow-sm rounded-3xl group transition-all text-slate-900"
                onClick={() => console.log('来校予約クリック')}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-rose-50 rounded-2xl">
                    <Calendar className="h-8 w-8 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">来校予約・日程変更</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Booking</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
