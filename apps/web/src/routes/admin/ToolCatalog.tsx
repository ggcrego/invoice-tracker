import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import type { Tool, Category } from '@/types'

export default function ToolCatalog() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')

  const fetchTools = () => api.get('/tools').then(({ data }) => setTools(data))

  useEffect(() => {
    fetchTools()
    api.get('/categories').then(({ data }) => setCategories(data.filter((c: Category) => c.type === 'trackable')))
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/tools', { name, category_id: categoryId, website_url: websiteUrl || null })
      toast.success('Tool added')
      setName('')
      setWebsiteUrl('')
      fetchTools()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add tool')
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await api.delete(`/tools/${id}`)
      toast.success('Tool deactivated')
      fetchTools()
    } catch {
      toast.error('Failed to deactivate')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Tool Catalog</h2>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">Create a trackable category first to add tools.</p>
      ) : (
        <form onSubmit={handleAdd} className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label>Tool Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Website (optional)</Label>
            <Input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
          </div>
          <Button type="submit"><Plus className="h-4 w-4 mr-1" />Add</Button>
        </form>
      )}

      <div className="space-y-2">
        {tools.map(tool => (
          <Card key={tool.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {tool.name[0]}
                </div>
                <span className="font-medium">{tool.name}</span>
                {tool.website_url && <a href={tool.website_url} target="_blank" className="text-xs text-muted-foreground hover:underline">{tool.website_url}</a>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeactivate(tool.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
