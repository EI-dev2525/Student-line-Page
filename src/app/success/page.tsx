import { Metadata } from 'next'
import SuccessPageClient from './success-page-client'

export const metadata: Metadata = {
  title: '申請完了 | English Innovations',
}

export default function SuccessPage() {
  return <SuccessPageClient />
}
