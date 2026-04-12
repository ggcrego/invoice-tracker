import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function GSTDetails() {
  const [gstin, setGstin] = useState('')
  const [pan, setPan] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/company/gst').then(({ data }) => {
      setGstin(data.gstin || '')
      setPan(data.pan || '')
      setStateCode(data.gst_state_code || '')
    })
  }, [])

  const handleGstinChange = (value: string) => {
    setGstin(value.toUpperCase())
    if (value.length >= 12) setPan(value.substring(2, 12))
    if (value.length >= 2) setStateCode(value.substring(0, 2))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/company/gst', { gstin, pan, gst_state_code: stateCode })
      toast.success('GST details saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const copyGSTIN = () => {
    navigator.clipboard.writeText(gstin)
    toast.success('GSTIN copied!')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">GST Details</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label>GSTIN</Label>
          <div className="flex gap-2">
            <Input value={gstin} onChange={e => handleGstinChange(e.target.value)} maxLength={15} placeholder="e.g. 27AABCU9603R1ZM" />
            <Button type="button" variant="outline" onClick={copyGSTIN} disabled={!gstin}><Copy className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>PAN</Label>
            <Input value={pan} onChange={e => setPan(e.target.value)} maxLength={10} />
          </div>
          <div className="space-y-2">
            <Label>State Code</Label>
            <Input value={stateCode} onChange={e => setStateCode(e.target.value)} maxLength={2} />
          </div>
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </form>
    </div>
  )
}
