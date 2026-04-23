'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, X, Smile } from 'lucide-react'
import liff from '@line/liff'
import { useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type')

  useEffect(() => {
    // LIFFの初期化（closeWindowを使用するために必要）
    const initLiff = async () => {
      try {
        if (process.env.NEXT_PUBLIC_LIFF_ID) {
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID })
        }
      } catch (err) {
        console.error('LIFF initialization failed:', err)
      }
    }
    initLiff()
  }, [])

  const handleClose = () => {
    if (liff.isInClient()) {
      liff.closeWindow()
    } else {
      router.push('/')
    }
  }

  const isLeave = type === 'leave'
  const isCounseling = type === 'counseling'

  let title = 'Vacation申請完了'
  let message: React.ReactNode = 'Vacation申請を受け付けました。'
  let buttonText = '閉じる'

  if (isLeave) {
    title = '休学申請完了'
    message = '休学申請を受け付けました。スタッフからお手続きについてご案内いたしますので連絡をお待ちください。'
  } else if (isCounseling) {
    title = '事前アンケート回答完了'
    message = (
      <span className="whitespace-pre-wrap">
        ご回答いただきありがとうございました。{"\n"}
        当日、お会いできることをスタッフ一同楽しみにしております！{"\n\n"}
        ご不明な点などがございましたら、お気軽にLINEにてお問い合わせください。
      </span>
    )
    buttonText = 'LINEトーク画面に戻る'
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      {/* Logo Header */}
      <header className="pt-8 pb-8 flex justify-center w-full">
        <img 
          src="/ei_logo.png" 
          alt="English Innovations" 
          className="h-10 w-auto"
        />
      </header>

      <Card className="w-full max-w-md p-8 border-none shadow-xl bg-white rounded-3xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-50 p-4 rounded-full">
            {isCounseling ? (
              <Smile className="h-16 w-16 text-green-500" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <div className="text-slate-600 leading-relaxed font-medium">
            {message}
          </div>
        </div>

        <div className="pt-4 space-y-3">
          {type === 'vacation' && (
            <Button 
              onClick={() => router.push('/vacation')} 
              className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <CheckCircle className="h-5 w-5" />
              続けて別のコースも申請する
            </Button>
          )}
          <Button 
            onClick={handleClose} 
            className="w-full h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <X className="h-5 w-5" />
            {buttonText}
          </Button>
        </div>
      </Card>
      
      <p className="mt-8 text-slate-400 text-sm">
        閉じるボタンを押してトーク画面へお戻りください
      </p>
    </main>
  )
}

export default function SuccessPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
