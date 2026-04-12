import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MessageSquare, Search } from 'lucide-react'
import api from '@/lib/api'
import type { DirectoryTool } from '@/types'

export default function ToolDirectory() {
  const [tools, setTools] = useState<DirectoryTool[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/directory')
      .then(({ data }) => setTools(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="animate-pulse">Loading directory...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tool Directory</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tools..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No tools found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(tool => (
            <Card key={tool.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  {tool.icon_url ? (
                    <img src={tool.icon_url} alt="" className="h-8 w-8 rounded" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {tool.name[0]}
                    </div>
                  )}
                  <CardTitle className="text-base">{tool.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3">
                  {tool.subscriber_count} active subscriber{tool.subscriber_count !== 1 ? 's' : ''}
                </Badge>
                {tool.subscribers.length > 0 && (
                  <div className="space-y-2">
                    {tool.subscribers.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between text-sm">
                        <span>{sub.full_name}</span>
                        {sub.slack_user_id && (
                          <a href={`slack://user?id=${sub.slack_user_id}`} className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted">
                            <MessageSquare className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {tool.subscriber_count === 0 && (
                  <p className="text-xs text-muted-foreground">No active subscribers</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
