import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import type { Category } from '@/types'

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<'trackable' | 'simple'>('simple')
  const [gstReminder, setGstReminder] = useState(true)

  const fetchCategories = () => {
    api.get('/categories').then(({ data }) => setCategories(data))
  }

  useEffect(() => { fetchCategories() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/categories', { name, type, gst_reminder_enabled: gstReminder })
      toast.success('Category created')
      setName('')
      fetchCategories()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create')
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category archived')
      fetchCategories()
    } catch {
      toast.error('Failed to archive')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Expense Categories</h2>

      <form onSubmit={handleAdd} className="flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <select value={type} onChange={e => setType(e.target.value as any)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="simple">Simple</option>
            <option value="trackable">Trackable</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pb-0.5">
          <input type="checkbox" checked={gstReminder} onChange={e => setGstReminder(e.target.checked)} />
          <Label>GST</Label>
        </div>
        <Button type="submit"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </form>

      <div className="space-y-2">
        {categories.map(cat => (
          <Card key={cat.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="font-medium">{cat.name}</span>
                <Badge variant="outline">{cat.type}</Badge>
                {cat.gst_reminder_enabled && <Badge variant="outline" className="text-amber-600">GST reminder</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleArchive(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
