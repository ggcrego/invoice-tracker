import { useInvoices } from '@/hooks/useInvoices'
import InvoiceCard from '@/components/invoices/InvoiceCard'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export default function InvoiceList() {
  const { invoices, loading } = useInvoices()

  if (loading) return <div className="animate-pulse">Loading invoices...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Invoices</h2>
        <Button asChild>
          <Link to="/invoices/new"><PlusCircle className="h-4 w-4 mr-2" />New Invoice</Link>
        </Button>
      </div>
      {invoices.length === 0 ? (
        <p className="text-muted-foreground">No invoices yet. Submit your first invoice to get started.</p>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}
        </div>
      )}
    </div>
  )
}
