import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function TeamAssignment() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEmployees = () => {
    api.get('/team/members').then(({ data }) => {
      setEmployees(data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchEmployees() }, [])

  const handleAssign = async (employeeId: string, approverId: string | null) => {
    try {
      await api.put('/team/assign', { employee_id: employeeId, approver_id: approverId || null })
      toast.success('Approver assigned')
      fetchEmployees()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to assign')
    }
  }

  if (loading) return <div className="animate-pulse">Loading...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Team Assignments</h2>
      <p className="text-muted-foreground">Assign an approver for each employee. Their invoices will go to their approver for review.</p>
      <div className="space-y-2">
        {employees.map(emp => (
          <Card key={emp.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <span className="font-medium">{emp.full_name}</span>
                <span className="text-sm text-muted-foreground ml-2">{emp.email}</span>
              </div>
              <select
                value={emp.approver_id || ''}
                onChange={e => handleAssign(emp.id, e.target.value || null)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">No approver</option>
                {employees.filter(e => e.id !== emp.id).map(e => (
                  <option key={e.id} value={e.id}>{e.full_name}</option>
                ))}
              </select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
