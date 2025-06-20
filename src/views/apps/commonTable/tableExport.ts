import { unparse as convertToCSV } from 'papaparse'
import { saveAs } from 'file-saver'

interface ExportConfig {
  fileName: string
  mappings: Record<
    string,
    {
      key: string
      transform?: (value: any) => string
    }
  >
}

type DataRecord = Record<string, any>

const defaultTransforms = {
  boolean: (value: boolean) => (value ? 'Yes' : 'No'),
  date: (value: string) => value || '-',
  string: (value: string | null | undefined) => value || '-'
}

const exportConfigs: Record<string, ExportConfig> = {
  staff: {
    fileName: 'staff-list.csv',
    mappings: {
      ID: { key: 'id' },
      First_Name: { key: 'first_name' },
      Last_Name: { key: 'last_name' },
      Email: { key: 'email', transform: defaultTransforms.string },
      Phone_Number: { key: 'phone_number', transform: defaultTransforms.string },
      Is_Active: { key: 'is_active', transform: defaultTransforms.boolean },
      Position: { key: 'position', transform: defaultTransforms.string },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  caseTypes: {
    fileName: 'case-types-list.csv',
    mappings: {
      ID: { key: 'id' },
      Name: { key: 'name' },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date },
      Created_By: { key: 'created_by', transform: defaultTransforms.string },
      Updated_By: { key: 'updated_by', transform: defaultTransforms.string }
    }
  },
  orders: {
    fileName: 'orders-list.csv',
    mappings: {
      ID: { key: 'id' },
      Order_Number: { key: 'order_number' },
      Customer_Name: { key: 'customer.name', transform: defaultTransforms.string },
      Customer_Email: { key: 'customer.email', transform: defaultTransforms.string },
      Amount: { key: 'amount', transform: value => `${value || 0}` },
      Status: { key: 'status', transform: defaultTransforms.string },
      Payment_Method: { key: 'payment_method', transform: defaultTransforms.string },
      Payment_Status: { key: 'payment_status', transform: defaultTransforms.string },
      Subscription: { key: 'is_subscription', transform: defaultTransforms.boolean },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  transactions: {
    fileName: 'transactions-list.csv',
    mappings: {
      ID: { key: 'id' },
      Transaction_ID: { key: 'transaction_id' },
      Amount: { key: 'amount' },
      Status: { key: 'status' },
      Created_At: { key: 'created_at', transform: defaultTransforms.date }
    }
  },
  subscriptions: {
    fileName: 'subscriptions-list.csv',
    mappings: {
      ID: { key: 'id' },
      Plan_Name: { key: 'plan.name', transform: defaultTransforms.string },
      Status: { key: 'status' },
      Start_Date: { key: 'start_date', transform: defaultTransforms.date },
      End_Date: { key: 'end_date', transform: defaultTransforms.date },
      Billing_Cycle: { key: 'billing_cycle' },
      Amount: { key: 'amount' }
    }
  },
  users: {
    fileName: 'users-list.csv',
    mappings: {
      ID: { key: 'id' },
      Username: { key: 'username', transform: defaultTransforms.string },
      Email: { key: 'email', transform: defaultTransforms.string },
      First_Name: { key: 'first_name', transform: defaultTransforms.string },
      Last_Name: { key: 'last_name', transform: defaultTransforms.string },
      Is_Active: { key: 'is_active', transform: defaultTransforms.boolean },
      Is_Staff: { key: 'is_staff', transform: defaultTransforms.boolean },
      Is_Superuser: { key: 'is_superuser', transform: defaultTransforms.boolean },
      Last_Login: { key: 'last_login', transform: defaultTransforms.date },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  positions: {
    fileName: 'positions-list.csv',
    mappings: {
      ID: { key: 'id' },
      Name: { key: 'name', transform: defaultTransforms.string },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date },
      Created_By: { key: 'created_by', transform: defaultTransforms.string },
      Updated_By: { key: 'updated_by', transform: defaultTransforms.string }
    }
  },
  groups: {
    fileName: 'groups-list.csv',
    mappings: {
      ID: { key: 'id' },
      Name: { key: 'name', transform: defaultTransforms.string },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  services: {
    fileName: 'services-list.csv',
    mappings: {
      ID: { key: 'id' },
      Name: { key: 'name', transform: defaultTransforms.string },
      Slug: { key: 'slug', transform: defaultTransforms.string },
      Description: { key: 'description', transform: defaultTransforms.string },
      Service_Type: { key: 'service_type', transform: defaultTransforms.string },
      Price: { key: 'price', transform: value => `${value || 0}` },
      Price_Before_Discount: { key: 'price_before_discount', transform: value => `${value || 0}` },
      Billing_Cycle: { key: 'billing_cycle', transform: defaultTransforms.string },
      Trial_Period_Days: { key: 'trial_period_days', transform: value => `${value || 0}` },
      Is_Active: { key: 'is_active', transform: defaultTransforms.boolean },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  serviceCategories: {
    fileName: 'service-categories-list.csv',
    mappings: {
      ID: { key: 'id' },
      Name: { key: 'name', transform: defaultTransforms.string },
      Description: { key: 'description', transform: defaultTransforms.string },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  cases: {
    fileName: 'cases-list.csv',
    mappings: {
      ID: { key: 'id' },
      Title: { key: 'title', transform: defaultTransforms.string },
      Summary: { key: 'summary', transform: defaultTransforms.string },
      Cost_Amount: { key: 'cost_amount', transform: value => `${value || 0}` },
      Payment_Schedule: { key: 'payment_schedule', transform: defaultTransforms.string },
      Status: { key: 'status', transform: defaultTransforms.boolean },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  documents: {
    fileName: 'documents-list.csv',
    mappings: {
      ID: { key: 'id' },
      Note: { key: 'note', transform: defaultTransforms.string },
      Document_Type: { key: 'document_type', transform: defaultTransforms.string },
      Expiration_Date: { key: 'expiration_date', transform: defaultTransforms.date },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  documentTypes: {
    fileName: 'document-types-list.csv',
    mappings: {
      ID: { key: 'id' },
      Name: { key: 'name', transform: defaultTransforms.string },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  notifications: {
    fileName: 'notifications-list.csv',
    mappings: {
      ID: { key: 'id' },
      Title: { key: 'title', transform: defaultTransforms.string },
      Content: { key: 'content', transform: defaultTransforms.string },
      Type: { key: 'type', transform: defaultTransforms.string },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  coupons: {
    fileName: 'coupons-list.csv',
    mappings: {
      ID: { key: 'id' },
      Code: { key: 'code', transform: defaultTransforms.string },
      Discount_Type: { key: 'discount_type', transform: defaultTransforms.string },
      Discount_Value: { key: 'discount_value', transform: value => `${value || 0}` },
      Valid_From: { key: 'valid_from', transform: defaultTransforms.date },
      Valid_Until: { key: 'valid_until', transform: defaultTransforms.date },
      Is_Active: { key: 'is_active', transform: defaultTransforms.boolean },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  invoices: {
    fileName: 'invoices-list.csv',
    mappings: {
      ID: { key: 'id' },
      Invoice_Number: { key: 'invoice_number' },
      Notes: { key: 'notes', transform: defaultTransforms.string },
      Subtotal: { key: 'subtotal', transform: value => `${value || 0}` },
      Status: { key: 'status' },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  todoItems: {
    fileName: 'todo-items-list.csv',
    mappings: {
      ID: { key: 'id' },
      Subject: { key: 'subject', transform: defaultTransforms.string },
      Description: { key: 'description', transform: defaultTransforms.string },
      Due_Date: { key: 'due_date', transform: defaultTransforms.date },
      Completed: { key: 'completed', transform: defaultTransforms.boolean },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  blogPosts: {
    fileName: 'blog-posts-list.csv',
    mappings: {
      ID: { key: 'id' },
      Title: { key: 'title', transform: defaultTransforms.string },
      Category: { key: 'category', transform: defaultTransforms.string },
      Status: { key: 'status', transform: defaultTransforms.string },
      Views: { key: 'views', transform: value => String(value || 0) },
      Published_At: { key: 'published_at', transform: defaultTransforms.date },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  blogCategories: {
    fileName: 'blog-categories-list.csv',
    mappings: {
      ID: { key: 'id' },
      Name: { key: 'name', transform: defaultTransforms.string },
      Slug: { key: 'slug', transform: defaultTransforms.string },
      Description: { key: 'description', transform: defaultTransforms.string },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  blogTags: {
    fileName: 'blog-tags-list.csv',
    mappings: {
      ID: { key: 'id' },
      Name: { key: 'name', transform: defaultTransforms.string },
      Slug: { key: 'slug', transform: defaultTransforms.string },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  refunds: {
    fileName: 'refunds-list.csv',
    mappings: {
      ID: { key: 'id' },
      Refund_Reference_ID: { key: 'refund_reference_id' },
      Amount: { key: 'amount' },
      Reason: { key: 'reason' },
      Status: { key: 'status' },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date }
    }
  },
  paymentAuditLogs: {
    fileName: 'payment-audit-logs-list.csv',
    mappings: {
      ID: { key: 'id' },
      Action: { key: 'action' },
      IP_Address: { key: 'ip_address' },
      User_Agent: { key: 'user_agent' },
      Created_At: { key: 'created_at', transform: defaultTransforms.date },
      Updated_At: { key: 'updated_at', transform: defaultTransforms.date },
      Transaction_ID: { key: 'transaction_id' }
    }
  }
}

export const exportTableToCSV = (data: DataRecord[], type: keyof typeof exportConfigs): void => {
  if (!data?.length) {
    alert('No data available to export.')
    return
  }

  const config = exportConfigs[type]
  if (!config) {
    console.error(`Export configuration not found for type: ${type}`)
    return
  }

  const formattedData = data.map(item => {
    const formatted: Record<string, string> = {}

    Object.entries(config.mappings).forEach(([header, { key, transform }]) => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], item)
      formatted[header] = transform ? transform(value) : String(value ?? '')
    })

    return formatted
  })

  const csv = convertToCSV(formattedData, { header: true })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, config.fileName)
}

// Helper functions for specific tables
export const exportStaffToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'staff')
export const exportCaseTypesToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'caseTypes')
export const exportOrdersToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'orders')
export const exportTransactionsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'transactions')
export const exportSubscriptionsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'subscriptions')
export const exportUsersToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'users')
export const exportPositionsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'positions')
export const exportGroupsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'groups')
export const exportServicesToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'services')
export const exportServiceCategoriesToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'serviceCategories')
export const exportCasesToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'cases')
export const exportDocumentsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'documents')
export const exportDocumentTypesToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'documentTypes')
export const exportNotificationsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'notifications')
export const exportCouponsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'coupons')
export const exportRefundsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'refunds')
export const exportPaymentAuditLogsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'paymentAuditLogs')
export const exportInvoicesToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'invoices')
export const exportTodoItemsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'todoItems')
export const exportBlogPostsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'blogPosts')
export const exportBlogCategoriesToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'blogCategories')
export const exportBlogTagsToCSV = (data: DataRecord[]): void => exportTableToCSV(data, 'blogTags')
