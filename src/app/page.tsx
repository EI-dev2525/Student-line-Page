'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiffAuth } from '@/hooks/use-liff-auth'
import { STUDENT_STATUSES, StudentStatus } from '@/types'
import { Loader2, UserCircle } from 'lucide-react'

export default function MyPage() {
  const { studentData, isLead, isLoading, error } = useLiffAuth()
  const router = useRouter()

  useEffect(() => {
    // データ読み込み完了後かつデータが存在する場合にリダイレクト処理を実行
    if (!isLoading && studentData) {
      /**
       * リダイレクトロジック:
       * - isLead が false（studentsテーブル由来）の場合 -> /vacation へ
       * - isLead が true（leadsテーブル由来）の場合 -> /counseling-form へ
       */
      if (!isLead) {
        router.push('/vacation')
      } else {
        router.push('/counseling-form')
      }
    }
  }, [isLoading, studentData, isLead, router])

  // 1. ローディング表示（判定中 または 判定後の遷移待ち中）
  // ユーザーにダッシュボードが見えないよう、遷移が完了するまでこの画面を維持します
  if (isLoading || studentData) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-700">
          <img 
            src="/ei_logo.png" 
            alt="English Innovations" 
            className="h-14 w-auto opacity-90"
          />
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600/80" />
            <span className="text-slate-400 font-bold tracking-widest text-sm">読み込み中...</span>
          </div>
        </div>
      </main>
    )
  }

  // 2. ユーザー情報が見つからない、または読み込みエラーの場合
  // 指示されたエラーメッセージを表示します
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-sm w-full space-y-10 animate-in zoom-in-95 duration-500">
        <header className="flex justify-center">
          <img 
            src="/ei_logo.png" 
            alt="English Innovations" 
            className="h-10 w-auto"
          />
        </header>
        
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8">
            <UserCircle className="w-12 h-12 text-red-400" />
          </div>
          
          <h2 className="text-xl font-black text-slate-900 mb-6 leading-tight">
            LINEの登録情報が<br />見つかりません
          </h2>
          
          <p className="text-slate-500 text-sm leading-relaxed mb-2 font-medium">
            登録に不備がある可能性がございます。<br />
            お手数ですが、詳しくはスタッフまでお問い合わせください。
          </p>
        </div>

        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          EI Student Platform
        </p>
      </div>
    </main>
  )
}

