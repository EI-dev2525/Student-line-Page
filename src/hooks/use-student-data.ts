import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ContractCourse, getRegularCourses } from '@/lib/course-utils'

export interface StudentProfile {
  sf_id: string | null
  current_course_end_date: string | null
}

export function useStudentData(studentId: string | undefined) {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [regularCourses, setRegularCourses] = useState<ContractCourse[]>([])
  const [rawCourses, setRawCourses] = useState<ContractCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!studentId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 学生プロフィールの取得
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('current_course_end_date, sf_id')
          .eq('id', studentId)
          .single()

        if (studentError) throw studentError
        setStudentProfile(studentData)

        if (studentData?.sf_id) {
          // 契約コースの取得（Salesforce IDを使って紐付け）
          const { data: coursesData, error: coursesError } = await supabase
            .from('contract_courses')
            .select('sf_id, course_name, status, end_date')
            .eq('student_sf_id', studentData.sf_id)

          if (coursesError) throw coursesError

          const fetchedCourses = coursesData as ContractCourse[]
          setRawCourses(fetchedCourses)
          
          // 通常コースのみフィルタリングして保持
          setRegularCourses(getRegularCourses(fetchedCourses))
        } else {
          setRawCourses([])
          setRegularCourses([])
        }

      } catch (err: any) {
        console.error('Error in useStudentData:', err)
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [studentId])

  return {
    studentProfile,
    regularCourses,
    rawCourses,
    isLoading,
    error
  }
}
