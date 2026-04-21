'use client'

import { useLiffAuth } from '@/hooks/use-liff-auth'
import { FormPageLayout } from '@/components/form-page-layout'
import { CounselingForm } from '@/components/counseling-form'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CounselingPage() {
  const { studentData, isLoading, error } = useLiffAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <FormPageLayout title="">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </FormPageLayout>
    )
  }

  if (error || !studentData) {
    return (
      <FormPageLayout title="">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          <p className="font-bold">エラーが発生しました</p>
          <p className="text-sm">ユーザー情報の読み込みに失敗しました。</p>
        </div>
      </FormPageLayout>
    )
  }

  return (
    <FormPageLayout title="">
      <CounselingForm 
        studentId={studentData.id} 
        onSuccess={() => {
          router.push('/success?type=counseling')
        }} 
      />
    </FormPageLayout>
  )
}
