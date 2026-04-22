'use client'

import { useLiffAuth } from '@/hooks/use-liff-auth'
import { FormPageLayout } from '@/components/form-page-layout'
import { CounselingForm } from '@/components/counseling-form'
import { ErrorDisplay } from '@/components/error-display'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export default function CounselingFormClient() {
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
        <ErrorDisplay 
          externalLink={{
            text: "フォームから回答する",
            url: "https://forms.gle/5qBMwN2JBjRMpDcLA",
            description: "こちらから直接ご回答いただけます。"
          }}
        />
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
