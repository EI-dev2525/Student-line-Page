export interface ContractCourse {
  sf_id: string
  course_name: string
  status: string
  is_regular?: boolean | null
  end_date?: string | null
  [key: string]: any
}

/**
 * 通常コースを判定する
 * 条件1: status が 「受講中」であること
 * 条件2: course_name に 「講習」「Private」「Speaking」のいずれの文字列も含まないこと
 */
export function getRegularCourses(courses: ContractCourse[]) {
  return courses.filter(course => {
    if (course.status !== '受講中') return false

    const name = course.course_name || ''
    if (name.includes('講習') || name.includes('Private') || name.includes('Speaking')) {
      return false
    }

    return true
  })
}

/**
 * 休学申請用の対象コースを特定する
 * 条件: 通常コースの中で「IELTS」「TOEFL」「TOEIC」のいずれかを含むコース
 * 複数ある場合は終了日の降順（最新のもの）を選択
 */
export function getLeaveOfAbsenceTargetCourse(courses: ContractCourse[]) {
  const regularCourses = getRegularCourses(courses)

  const targetedCourses = regularCourses.filter(course => {
    const name = course.course_name || ''
    return name.includes('IELTS') || name.includes('TOEFL') || name.includes('TOEIC')
  })

  if (targetedCourses.length === 0) return null

  // 複数ある場合は end_date が最新（未来）のものを優先
  return targetedCourses.sort((a, b) => {
    if (!a.end_date) return 1
    if (!b.end_date) return -1
    return new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
  })[0]
}
