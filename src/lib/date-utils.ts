import { 
  addDays, 
  eachDayOfInterval, 
  format, 
  isMonday, 
  isSunday, 
  isWithinInterval, 
  parseISO, 
  startOfDay,
  startOfWeek,
  subDays
} from 'date-fns'
import { ja } from 'date-fns/locale'

export type SchoolBreak = {
  start_date: string
  end_date: string
}

/**
 * Vacation申請用の開始日（月曜）リストを生成する
 * 
 * @param schoolBreaks 除外すべき休校期間
 * @returns { value, label }[]
 */
export function getVacationStartOptions(schoolBreaks: SchoolBreak[]) {
  const today = startOfDay(new Date())
  
  // 開始日の起点:
  // 本日が「日曜日」の場合：6日前の月曜日（＝今週の月曜日）を起点にする
  // それ以外の日：今週の月曜日を起点とする
  const startDateLimit = startOfWeek(today, { weekStartsOn: 1 })
  
  // 表示範囲: 起点から約60日後まで
  const endDateLimit = addDays(startDateLimit, 60)
  
  const allDays = eachDayOfInterval({ 
    start: startDateLimit, 
    end: endDateLimit 
  })
  
  const isSkipDate = (date: Date) => {
    return schoolBreaks.some(sb => {
      try {
        const start = startOfDay(parseISO(sb.start_date))
        const end = startOfDay(parseISO(sb.end_date))
        return isWithinInterval(date, { start, end })
      } catch (e) {
        return false
      }
    })
  }

  return allDays
    .filter(d => isMonday(d) && !isSkipDate(d))
    .map(d => ({
      value: format(d, 'yyyy-MM-dd'),
      label: format(d, 'yyyy/MM/dd (月)', { locale: ja })
    }))
}

/**
 * 選択された開始日に基づいて、終了日（日曜）の選択肢を生成する
 * 
 * @param startDateStr 'yyyy-MM-dd'
 * @param schoolBreaks 除外すべき休校期間
 * @returns { value, label }[]
 */
export function getVacationEndOptions(startDateStr: string, schoolBreaks: SchoolBreak[]) {
  if (!startDateStr) return []

  const startDate = parseISO(startDateStr)
  
  // 終了日の候補: 開始日から 6日後(1週), 13日後(2週), 20日後(3週)
  const candidates = [
    addDays(startDate, 6),
    addDays(startDate, 13),
    addDays(startDate, 20)
  ]

  const isSkipDate = (date: Date) => {
    return schoolBreaks.some(sb => {
      try {
        const start = startOfDay(parseISO(sb.start_date))
        const end = startOfDay(parseISO(sb.end_date))
        return isWithinInterval(date, { start, end })
      } catch (e) {
        return false
      }
    })
  }

  return candidates
    .filter(d => !isSkipDate(d))
    .map(d => ({
      value: format(d, 'yyyy-MM-dd'),
      label: format(d, 'yyyy/MM/dd (日)', { locale: ja })
    }))
}

/**
 * 休学申請用の終了日（日曜）の選択肢を生成する
 * 4週間後から24週間後までの日曜日を候補とする
 * 
 * @param startDateStr 'yyyy-MM-dd'
 * @param schoolBreaks 除外すべき休校期間
 * @returns { value, label }[]
 */
export function getLeaveOfAbsenceEndOptions(startDateStr: string, schoolBreaks: SchoolBreak[]) {
  if (!startDateStr) return []

  const startDate = parseISO(startDateStr)
  const isSkipDate = (date: Date) => {
    return schoolBreaks.some(sb => {
      try {
        const start = startOfDay(parseISO(sb.start_date))
        const end = startOfDay(parseISO(sb.end_date))
        return isWithinInterval(date, { start, end })
      } catch (e) {
        return false
      }
    })
  }

  const options = []
  // 4週目(27日後)から24週目(167日後)までループ
  for (let i = 3; i < 24; i++) {
    const candidate = addDays(startDate, i * 7 + 6)
    if (!isSkipDate(candidate)) {
      options.push({
        value: format(candidate, 'yyyy-MM-dd'),
        label: format(candidate, 'yyyy/MM/dd (日)', { locale: ja })
      })
    }
  }

  return options
}
