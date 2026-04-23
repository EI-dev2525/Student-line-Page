import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ContractCourse, getRegularCourses } from '@/lib/course-utils'

export interface StudentProfile {
  sf_id: string | null
  current_course_end_date: string | null
  campus?: string | null
  course?: string | null
  level?: string | null
  purpose?: string | null
  target_score?: string | null
  starting_score?: string | null
}

export function useStudentData(lineId: string | undefined) {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [isLead, setIsLead] = useState<boolean>(false)
  const [regularCourses, setRegularCourses] = useState<ContractCourse[]>([])
  const [rawCourses, setRawCourses] = useState<ContractCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!lineId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 1. まずは students テーブルを確認 (既存生徒優先)
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('current_course_end_date, sf_id, campus, target_score, starting_score')
          .eq('line_id', lineId)
          .single()

        if (studentData) {
          setStudentProfile(studentData)
          setIsLead(false)

          if (studentData.sf_id) {
            // 契約コースの取得
            const { data: coursesData, error: coursesError } = await supabase
              .from('contract_courses')
              .select('sf_id, course_name, status, end_date, start_date, campus, student_line_id, student_name, student_id')
              .eq('student_id', studentData.sf_id)

            if (coursesError) throw coursesError
            
            const fetchedCourses = coursesData as ContractCourse[]
            const regular = getRegularCourses(fetchedCourses)
            
            setRawCourses(fetchedCourses)
            setRegularCourses(regular)
          } else {
            setRawCourses([])
            setRegularCourses([])
          }
        } else {
          // 2. 存在しなければ leads テーブルを確認
          const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .select('sf_id, campus, course, level, purpose')
            .eq('line_id', lineId)
            .single()

          if (leadData) {
            setStudentProfile({
              sf_id: leadData.sf_id,
              current_course_end_date: null,
              campus: leadData.campus,
              course: leadData.course,
              level: leadData.level,
              purpose: leadData.purpose
            })
            setIsLead(true)
            setRawCourses([])
            setRegularCourses([])
          } else {
            setStudentProfile(null)
            setIsLead(false)
          }
        }

      } catch (err: any) {
        if (err.code === 'PGRST116') {
          // Record not found is handled above
        } else {
          console.error('Error in useStudentData:', err)
          setError(err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [lineId])

  return {
    studentProfile,
    isLead,
    regularCourses,
    rawCourses,
    isLoading,
    error
  }
}
