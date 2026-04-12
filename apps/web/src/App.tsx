import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/routes/auth/Login'
import Register from '@/routes/auth/Register'
import Dashboard from '@/routes/dashboard/Dashboard'
import NewInvoice from '@/routes/invoices/NewInvoice'
import InvoiceList from '@/routes/invoices/InvoiceList'
import ApprovalQueue from '@/routes/approvals/ApprovalQueue'
import ToolDirectory from '@/routes/directory/ToolDirectory'
import CompanySettings from '@/routes/admin/CompanySettings'
import GSTDetails from '@/routes/admin/GSTDetails'
import CategoryManager from '@/routes/admin/CategoryManager'
import ToolCatalog from '@/routes/admin/ToolCatalog'
import EmployeeManager from '@/routes/admin/EmployeeManager'
import TeamAssignment from '@/routes/admin/TeamAssignment'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/new" element={<NewInvoice />} />
            <Route path="approvals" element={<ApprovalQueue />} />
            <Route path="directory" element={<ToolDirectory />} />

            <Route path="admin/company" element={<CompanySettings />} />
            <Route path="admin/gst" element={<GSTDetails />} />
            <Route path="admin/categories" element={<CategoryManager />} />
            <Route path="admin/tools" element={<ToolCatalog />} />
            <Route path="admin/employees" element={<EmployeeManager />} />
            <Route path="admin/teams" element={<TeamAssignment />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
