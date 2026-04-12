import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatusSummaryProps {
  counts: Record<string, number>
}

export default function StatusSummary({ counts }: StatusSummaryProps) {
  const items = [
    { label: 'Pending Approval', key: 'pending_approval', color: 'text-yellow-600' },
    { label: 'Approved', key: 'approved', color: 'text-blue-600' },
    { label: 'Pending Reimbursement', key: 'pending_reimbursement', color: 'text-purple-600' },
    { label: 'Reimbursed', key: 'reimbursed', color: 'text-green-600' },
    { label: 'Rejected', key: 'rejected', color: 'text-red-600' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Status</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.key} className="flex justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className={`font-semibold ${item.color}`}>{counts[item.key] || 0}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
