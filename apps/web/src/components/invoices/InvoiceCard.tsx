import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import type { Invoice } from '@/types'

const statusColors: Record<string, string> = {
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  pending_reimbursement: 'bg-purple-100 text-purple-800',
  reimbursed: 'bg-green-100 text-green-800',
}

const statusLabels: Record<string, string> = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  pending_reimbursement: 'Pending Reimbursement',
  reimbursed: 'Reimbursed',
}

export default function InvoiceCard({ invoice }: { invoice: Invoice }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <div className="font-medium">
            {invoice.category_name || 'Invoice'} {invoice.tool_name ? `— ${invoice.tool_name}` : ''}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(invoice.invoice_date), 'MMM d, yyyy')}
            {invoice.description && ` · ${invoice.description}`}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold">₹{Number(invoice.amount).toLocaleString('en-IN')}</span>
          <Badge className={statusColors[invoice.status] || ''}>
            {statusLabels[invoice.status] || invoice.status}
          </Badge>
          {invoice.is_gst_compliant && (
            <Badge variant="outline" className="text-green-600 border-green-600">GST ✓</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
