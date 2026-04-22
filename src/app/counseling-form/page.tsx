import { Metadata } from 'next'
import CounselingFormClient from './counseling-form-client'

export const metadata: Metadata = {
  title: 'カウンセリング事前アンケート | English Innovations',
  description: 'カウンセリング事前アンケート回答はこちら。',
}

export default function CounselingPage() {
  return <CounselingFormClient />
}
