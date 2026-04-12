import InvoiceForm from '@/components/invoices/InvoiceForm'

export default function NewInvoice() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Submit New Invoice</h2>
      <InvoiceForm />
    </div>
  )
}
