import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusSummary from '@/components/dashboard/StatusSummary'
import ActiveSubs from '@/components/dashboard/ActiveSubs'
import api from '@/lib/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const endpoint = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/employee'
    api.get(endpoint)
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="animate-pulse">Loading dashboard...</div>

  if (user?.role === 'admin' && data) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Invoices</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{data.total_invoices}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">GST Compliance</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{data.gst_compliance_rate}%</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Approvals</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{data.pending_approvals}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Reimbursements</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{data.pending_reimbursements}</p></CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Monthly Spend</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{data?.monthly_spend?.toLocaleString('en-IN') || '0'}</p>
          </CardContent>
        </Card>
        <StatusSummary counts={data?.status_counts || {}} />
      </div>
      <ActiveSubs subscriptions={data?.active_subscriptions || []} />
    </div>
  )
}
