import { Metadata } from 'next'
import VacationPageClient from './vacation-page-client'

export const metadata: Metadata = {
  title: 'Vacation申請 | English Innovations',
  description: '休暇の申請はこちらから。',
}

export default function VacationPage() {
  return <VacationPageClient />
}
