'use client'

import { useLiffAuth } from '@/hooks/use-liff-auth'
import { FormPageLayout } from '@/components/form-page-layout'
import { VacationRequestForm } from '@/components/vacation-request-form'
import { ErrorDisplay } from '@/components/error-display'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export default function VacationPageClient() {
  const { studentData, isLoading, error } = useLiffAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <FormPageLayout title="Vacation申請">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </FormPageLayout>
    )
  }

  if (error || !studentData) {
    return (
      <FormPageLayout title="Vacation申請">
        <ErrorDisplay 
          externalLink={{
            text: "Vacation・休学申請フォーム",
            url: "https://forms.gle/kSj4ZEqwQ78RaecU7",
            description: "申請はこちらのフォームからも受け付けております。"
          }}
        />
      </FormPageLayout>
    )
  }

  return (
    <FormPageLayout 
      title="Vacation申請" 
      description="希望する期間を入力してください。"
    >
      <VacationRequestForm 
        studentId={studentData.line_id} 
        onSuccess={() => {
          setTimeout(() => router.push('/'), 2000)
        }} 
      />
    </FormPageLayout>
  )
}
