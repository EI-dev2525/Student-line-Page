'use client'

import { useLiffAuth } from '@/hooks/use-liff-auth'
import { FormPageLayout } from '@/components/form-page-layout'
import { LeaveRequestForm } from '@/components/leave-request-form'
import { ErrorDisplay } from '@/components/error-display'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export default function LeavePageClient() {
  const { studentData, isLoading, error } = useLiffAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <FormPageLayout title="休学申請">
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
      <FormPageLayout title="休学申請">
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
      title="休学申請" 
      description="休学を希望する期間と理由を入力してください。スタッフが確認後、順次ご連絡いたします。"
    >
      <LeaveRequestForm 
        studentId={studentData.line_id} 
        onSuccess={() => {
          setTimeout(() => router.push('/'), 2000)
        }} 
      />
    </FormPageLayout>
  )
}
