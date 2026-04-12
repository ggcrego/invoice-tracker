import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { format } from 'date-fns'
import api from '@/lib/api'
import type { Invoice } from '@/types'

export default function ApprovalQueue() {
  const [pending, setPending] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [actionInvoiceId, setActionInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    api.get('/approvals/pending')
      .then(({ data }) => setPending(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleAction = async (invoiceId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/approvals/${invoiceId}`, { action, comment })
      setPending(prev => prev.filter(i => i.id !== invoiceId))
      setComment('')
      setActionInvoiceId(null)
      toast.success(`Invoice ${action}d`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to ${action}`)
    }
  }

  if (loading) return <div className="animate-pulse">Loading approvals...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Approval Queue</h2>
      {pending.length === 0 ? (
        <p className="text-muted-foreground">No invoices pending your approval.</p>
      ) : (
        <div className="space-y-4">
          {pending.map(invoice => (
            <Card key={invoice.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{invoice.submitter_name || 'Employee'}</span>
                    <span className="text-muted-foreground"> · {invoice.category_name} {invoice.tool_name ? `— ${invoice.tool_name}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">₹{Number(invoice.amount).toLocaleString('en-IN')}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(invoice.invoice_date), 'MMM d, yyyy')}</span>
                    {invoice.is_gst_compliant ? (
                      <Badge className="bg-green-100 text-green-800">GST ✓</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">No GST</Badge>
                    )}
                  </div>
                </div>
                {actionInvoiceId === invoice.id && (
                  <Textarea placeholder="Optional comment..." value={comment} onChange={e => setComment(e.target.value)} />
                )}
                <div className="flex gap-2">
                  {actionInvoiceId === invoice.id ? (
                    <>
                      <Button size="sm" onClick={() => handleAction(invoice.id, 'approve')}>Confirm Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(invoice.id, 'reject')}>Confirm Reject</Button>
                      <Button size="sm" variant="ghost" onClick={() => setActionInvoiceId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => setActionInvoiceId(invoice.id)}>Review</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
