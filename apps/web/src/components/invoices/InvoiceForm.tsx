import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import api from '@/lib/api'
import GSTCallout from './GSTCallout'
import type { Category, Tool } from '@/types'

export default function InvoiceForm() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)

  const [categoryId, setCategoryId] = useState('')
  const [toolId, setToolId] = useState('')
  const [amount, setAmount] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [billingCycle, setBillingCycle] = useState('')

  const selectedCategory = categories.find(c => c.id === categoryId)
  const showGSTCallout = selectedCategory?.gst_reminder_enabled ?? false
  const showToolSelect = selectedCategory?.type === 'trackable'

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    if (showToolSelect && categoryId) {
      api.get(`/tools?category_id=${categoryId}`).then(({ data }) => setTools(data))
    } else {
      setTools([])
      setToolId('')
    }
  }, [categoryId, showToolSelect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please upload a bill')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('category_id', categoryId)
      if (toolId) formData.append('tool_id', toolId)
      formData.append('amount', amount)
      formData.append('invoice_date', invoiceDate)
      if (description) formData.append('description', description)
      formData.append('is_recurring', String(isRecurring))
      if (billingCycle) formData.append('billing_cycle', billingCycle)
      formData.append('bill_file', file)

      await api.post('/invoices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Invoice submitted!')
      navigate('/invoices')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {showGSTCallout && <GSTCallout />}

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select category...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {showToolSelect && (
        <div className="space-y-2">
          <Label htmlFor="tool">Tool</Label>
          <select
            id="tool"
            value={toolId}
            onChange={e => setToolId(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select tool...</option>
            {tools.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (INR)</Label>
          <Input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Invoice Date</Label>
          <Input id="date" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bill">Upload Bill (image or PDF)</Label>
        <Input id="bill" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} required />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
        <Label htmlFor="recurring">This is a recurring subscription</Label>
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="cycle">Billing Cycle</Label>
          <select
            id="cycle"
            value={billingCycle}
            onChange={e => setBillingCycle(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Invoice'}
      </Button>
    </form>
  )
}
