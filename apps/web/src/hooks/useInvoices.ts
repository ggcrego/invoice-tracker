import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { Invoice } from '@/types'

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get('/invoices/my')
      setInvoices(data)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return { invoices, loading, refetch: fetchInvoices }
}
