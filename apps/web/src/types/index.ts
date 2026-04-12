export interface Company {
  id: string
  name: string
  address: string | null
  gstin: string | null
  gst_state_code: string | null
  pan: string | null
  email: string | null
  phone: string | null
  logo_url: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'employee'
  company_id: string
  approver_id: string | null
  has_team_members: boolean
  slack_user_id?: string
  avatar_url?: string
}

export interface Category {
  id: string
  name: string
  type: 'trackable' | 'simple'
  gst_reminder_enabled: boolean
  is_active: boolean
  display_order: number
  created_at: string
}

export interface Tool {
  id: string
  name: string
  category_id: string
  company_id: string
  icon_url: string | null
  website_url: string | null
  is_active: boolean
  created_at: string
}

export interface Invoice {
  id: string
  category_id: string
  tool_id: string | null
  amount: number
  currency: string
  invoice_date: string
  description: string | null
  bill_file_url: string
  bill_file_name: string | null
  is_gst_compliant: boolean
  gst_amount: number | null
  is_recurring: boolean
  billing_cycle: string | null
  status: InvoiceStatus
  approval_comment: string | null
  created_at: string
  submitted_by: string
  submitter_name?: string
  category_name?: string
  tool_name?: string
}

export type InvoiceStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'pending_reimbursement'
  | 'reimbursed'

export interface DirectoryTool {
  id: string
  name: string
  icon_url: string | null
  website_url: string | null
  subscriber_count: number
  subscribers: Array<{
    id: string
    full_name: string
    avatar_url: string | null
    slack_user_id: string | null
  }>
}
