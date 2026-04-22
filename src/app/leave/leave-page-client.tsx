'use client'

import { useLiffAuth } from '@/hooks/use-liff-auth'
import { FormPageLayout } from '@/components/form-page-layout'
import { LeaveRequestForm } from '@/components/leave-request-form'
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
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          <p className="font-bold">エラーが発生しました</p>
          <p className="text-sm">ユーザー情報の読み込みに失敗しました。マイページTOPから再度お試しください。</p>
        </div>
      </FormPageLayout>
    )
  }

  return (
    <FormPageLayout 
      title="休学申請" 
      description="休学を希望する期間と理由を入力してください。スタッフが確認後、順次ご連絡いたします。"
    >
      <LeaveRequestForm 
        studentId={studentData.id} 
        onSuccess={() => {
          setTimeout(() => router.push('/'), 2000)
        }} 
      />
    </FormPageLayout>
  )
}
