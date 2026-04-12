import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/team/members')
      .then(({ data }) => setEmployees(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse">Loading...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Manage Employees</h2>
      <div className="space-y-2">
        {employees.map(emp => (
          <Card key={emp.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <span className="font-medium">{emp.full_name}</span>
                <span className="text-sm text-muted-foreground ml-2">{emp.email}</span>
              </div>
              <Badge variant="outline">{emp.role}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
