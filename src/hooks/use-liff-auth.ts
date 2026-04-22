'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { supabase } from '@/lib/supabase'
import { Student } from '@/types'

export function useLiffAuth() {
  const [studentData, setStudentData] = useState<Student | null>(null)
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
            // ログインしていない場合はログイン画面へ
            // ログイン後に現在のパス（/vacation等）を維持するため、redirectUriに現在のURLを指定します
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
        // Supabaseから学生データを取得
        const { data, error: sbError } = await supabase
          .from('students')
          .select('*')
          .eq('line_id', lineId)
          .single()

        if (sbError) {
          if (sbError.code === 'PGRST116') {
            setStudentData(null)
          } else {
            throw new Error(sbError.message)
          }
        } else {
          setStudentData(data)
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
    isLoading,
    error,
  }
}
