'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { supabase } from '@/lib/supabase'
import { Student } from '@/types'

export function useLiffAuth() {
  const [studentData, setStudentData] = useState<any | null>(null)
  const [isLead, setIsLead] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initLiff = async () => {
      let lineId = 'dummy_line_id_123'

      try {
        // LIFFの初期化
        if (process.env.NEXT_PUBLIC_LIFF_ID && process.env.NEXT_PUBLIC_LIFF_ID !== 'YOUR_LIFF_ID_HERE') {
          await liff.init({
            liffId: process.env.NEXT_PUBLIC_LIFF_ID,
          })

          if (liff.isLoggedIn()) {
            const profile = await liff.getProfile()
            lineId = profile.userId
          } else if (!window.location.hostname.includes('localhost')) {
            liff.login({
              redirectUri: window.location.href
            })
            return
          }
        }
      } catch (err: any) {
        console.warn('LIFF initialization failed, using dummy ID for development:', err)
      }

      try {
        // 1. まずは students テーブルを確認
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('line_id', lineId)
          .single()

        if (student) {
          setStudentData(student)
          setIsLead(false)
        } else {
          // 2. 存在しなければ leads テーブルを確認
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('line_id', lineId)
            .single()

          if (lead) {
            setStudentData(lead)
            setIsLead(true)
          } else {
            setStudentData(null)
            setIsLead(false)
          }
        }
      } catch (err: any) {
        console.error('Supabase Error:', err)
        setError(err.message || 'データの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    initLiff()
  }, [])

  return {
    studentData,
    isLead,
    isLoading,
    error,
  }
}
