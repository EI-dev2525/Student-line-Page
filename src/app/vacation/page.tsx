'use client'

import { useLiffAuth } from '@/hooks/use-liff-auth'
import { FormPageLayout } from '@/components/form-page-layout'
import { VacationRequestForm } from '@/components/vacation-request-form'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export default function VacationPage() {
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
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          <p className="font-bold">エラーが発生しました</p>
          <p className="text-sm">ユーザー情報の読み込みに失敗しました。マイページTOPから再度お試しください。</p>
        </div>
      </FormPageLayout>
    )
  }

  return (
    <FormPageLayout 
      title="Vacation申請" 
      description="希望する期間を入力してください。"
    >
      <VacationRequestForm 
        studentId={studentData.id} 
        onSuccess={() => {
          setTimeout(() => router.push('/'), 2000)
        }} 
      />
    </FormPageLayout>
  )
}
