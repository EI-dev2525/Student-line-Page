import { Database } from './database'

export type Student = Database['public']['Tables']['students']['Row']

export type StudentStatus = 
  | '問い合わせ'
  | '来校日程調整中'
  | '来校日程セット済'
  | 'リサイクル'
  | '来校済'
  | '見込生徒'
  | '不成約'
  | 'ポジポジ'
  | '中途解約'
  | '休学中'
  | '卒業生'

export const LEAD_STATUSES: StudentStatus[] = [
  '問い合わせ',
  '来校日程調整中',
  '来校日程セット済',
  'リサイクル',
  '来校済',
  '見込生徒',
  '不成約'
]

export const STUDENT_STATUSES: StudentStatus[] = [
  'ポジポジ',
  '中途解約',
  '休学中',
  '卒業生'
]

/**
 * 契約コースのステータス
 */
export type CourseStatus = 
  | 'before'          // 受講前
  | 'during'          // 受講中
  | 'class_change'    // クラスチェンジ
  | 'course_change'   // コースチェンジ
  | 'on_leave'        // 休学中
  | 'withdrawn'       // 中途解約
  | 'completed'       // 修了
