import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Invoice } from '@/types'

export default function ActiveSubs({ subscriptions }: { subscriptions: Invoice[] }) {
  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Active Subscriptions</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">No active subscriptions</p></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Active Subscriptions</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {subscriptions.map(sub => (
          <div key={sub.id} className="flex items-center justify-between">
            <span className="text-sm font-medium">{sub.tool_name || sub.category_name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">₹{Number(sub.amount).toLocaleString('en-IN')}</span>
              {sub.billing_cycle && <Badge variant="outline">{sub.billing_cycle}</Badge>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
