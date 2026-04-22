import { Metadata } from 'next'
import LeavePageClient from './leave-page-client'

export const metadata: Metadata = {
  title: '休学申請 | English Innovations',
  description: '休学のお手続きはこちらから。',
}

export default function LeavePage() {
  return <LeavePageClient />
}
