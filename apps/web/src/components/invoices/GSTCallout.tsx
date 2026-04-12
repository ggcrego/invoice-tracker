import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink } from 'lucide-react'
import { useCompany } from '@/hooks/useCompany'
import { toast } from 'sonner'

export default function GSTCallout() {
  const { company } = useCompany()

  if (!company?.gstin) return null

  const copyGSTIN = () => {
    navigator.clipboard.writeText(company.gstin!)
    toast.success('GSTIN copied to clipboard!')
  }

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertDescription className="flex items-center justify-between">
        <span>Did you add the company GSTIN while making this purchase?</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyGSTIN}>
            <Copy className="h-4 w-4 mr-1" />
            Copy GSTIN
          </Button>
          <Button variant="link" size="sm" asChild>
            <a href="/admin/gst" target="_blank">
              <ExternalLink className="h-4 w-4 mr-1" />
              View details
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
