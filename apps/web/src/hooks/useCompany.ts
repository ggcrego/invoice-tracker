import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { Company } from '@/types'

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/company')
      .then(({ data }) => setCompany(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { company, loading, refetch: () => {
    api.get('/company').then(({ data }) => setCompany(data))
  }}
}
