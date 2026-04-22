'use client'

import { AlertCircle, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  title?: string
  message?: string
  externalLink?: {
    text: string
    url: string
    description: string
  }
}

export function ErrorDisplay({
  title = "エラーが発生しました",
  message = "LINEの登録情報が見つかりません。登録に不備がある可能性がございます。お手数ですが、詳しくはスタッフまでお問い合わせください。",
  externalLink
}: ErrorDisplayProps) {
  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-xl">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="font-bold text-base mb-1">{title}</AlertTitle>
        <AlertDescription className="text-sm leading-relaxed text-red-700">
          {message}
        </AlertDescription>
      </Alert>

      {externalLink && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600">
              {externalLink.description}
            </p>
          </div>
          <Button 
            asChild
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <a 
              href={externalLink.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-5 w-5" />
              {externalLink.text}
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
