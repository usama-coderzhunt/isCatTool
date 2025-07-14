import { editTask } from '@/redux-store/slices/kanban'

export const API_ROUTES = {
  // Document Routes
  DOCUMENT: {
    createDocument: '/api/docs/',
    getDocuments: '/api/docs/',
    viewDocument: '/api/docs/',
    deleteDocument: '/api/docs/',
    updateDocument: '/api/docs/'
  },

  // Document Type Routes
  DOCUMENT_TYPES: {
    getDocumentTypes: '/api/docs/doc-types/',
    createDocumentType: '/api/docs/doc-types/',
    deleteDocumentType: (id: number | null) => `/api/docs/doc-types/${id}/`,
    updateDocumentType: (id: number | null) => `/api/docs/doc-types/${id}/`,
    bulkDelete: `/api/docs/doc-types/bulk_delete/`
  },

  // Translation Services Routes
  TRANSLATION_SERVICES: {
    createTransService: '/api/trans/services/',
    getTransServices: '/api/trans/services/',
    editTransService: '/api/trans/services/',
    deleteTransService: '/api/trans/services/'
  },

  // Todos Routes
  TODOS: {
    getTodos: '/api/case-flow/cases/todos/',
    getTodoItems: (id: number) => `/api/case-flow/cases/todoitems/?todo_id=${id}`,
    getAllTodoItems: '/api/case-flow/cases/todoitems/',
    createTodoItem: '/api/case-flow/cases/todoitems/',
    editTodoItem: '/api/case-flow/cases/todoitems/',
    deleteTodoItem: '/api/case-flow/cases/todoitems/',
    bulkDeleteTodoItems: '/api/case-flow/cases/todoitems/bulk_delete/'
  },

  // Lawyer Clients Routes
  LAWYER_CLIENTS: {
    createLawyerClient: '/api/case-flow/lawyer-clients/',
    getLawyerClients: '/api/case-flow/lawyer-clients/',
    editLawyerClient: '/api/case-flow/lawyer-clients/',
    deleteLawyerClient: '/api/case-flow/lawyer-clients/'
  },

  // Service Category Routes
  SERVICES_CATEGORY: {
    getServicesCategories: '/api/services/category/',
    createServiceCategory: '/api/services/category/',
    editServiceCategory: (id: number) => `/api/services/category/${id}/`,
    deleteServiceCategory: (id: number) => `/api/services/category/${id}/`,
    getServiceCategoryById: (id: number) => `/api/services/category/${id}/`
  },

  // Service Management Hooks
  SERVICE_MANAGEMENT: {
    getServices: '/api/services/',
    getServiceById: '/api/services/',
    createService: '/api/services/',
    editService: '/api/services/',
    deleteService: '/api/services/'
  },

  // Service Categories Hooks
  SERVICE_CATEGORIES: {
    getServiceCategories: '/api/services/category/',
    createServiceCategory: '/api/services/category/',
    editServiceCategory: '/api/services/category/',
    deleteServiceCategory: '/api/services/category/',
    getServiceCategoryById: '/api/services/category/'
  },

  // Version Management Routes
  VERSION: {
    LIST: '/api/versions',
    DETAIL: (id: number) => `/api/versions/${id}`,
    HISTORY: (entityType: string, entityId: number) => `/api/versions/${entityType}/${entityId}/history`,
    COMPARE: '/api/versions/compare',
    ROLLBACK: (id: number) => `/api/versions/${id}/rollback`,
    BRANCH: (id: number) => `/api/versions/${id}/branch`
  },

  // Permission Management Routes
  PERMISSION: {
    LIST: '/api/permissions',
    DETAIL: (id: number) => `/api/permissions/${id}`,
    ROLES: '/api/permissions/roles',
    ROLE_DETAIL: (id: number) => `/api/permissions/roles/${id}`,
    ASSIGN: '/api/permissions/assign',
    INHERIT: '/api/permissions/inherit'
  },

  // Activity Log Routes
  ACTIVITY: {
    LIST: '/api/activities',
    DETAIL: (id: number) => `/api/activities/${id}`,
    FILTER: '/api/activities/filter',
    ANALYTICS: '/api/activities/analytics',
    EXPORT: '/api/activities/export'
  },

  // Backup Management Routes
  BACKUP: {
    LIST: '/api/backups',
    DETAIL: (id: number) => `/api/backups/${id}`,
    CREATE: '/api/backups/create',
    RESTORE: (id: number) => `/api/backups/${id}/restore`,
    SCHEDULE: '/api/backups/schedule',
    VERIFY: (id: number) => `/api/backups/${id}/verify`
  },

  // Health Check Routes
  HEALTH: {
    STATUS: '/api/health',
    SERVICES: '/api/health/services',
    METRICS: '/api/health/metrics',
    ERRORS: '/api/health/errors'
  },

  // Auth Routes
  AUTH: {
    userRegister: '/api/auth/register/',
    loginUrl: '/api/auth/login/',
    forgotPasswordUrl: '/api/auth/forgot-password/',
    resetPassword: '/api/auth/reset-password/',
    userDetails: '/api/auth/account/me/'
  },

  // Transaction Services

  TRANSACTION_SERVICES: {
    clientTransactions: '/api/trans/clients/',
    deleteClientTransaction: '/api/trans/clients/',
    createClientTransaction: '/api/trans/clients/',
    getSingleClientTransaction: '/api/trans/clients/'
  },

  // User and Permission Management Routes
  USER_PERMISSIONS: {
    ASSIGNABLE: '/api/permissions/assignable_permissions/',
    CONTENT_TYPES: '/api/permissions/available_content_types/',
    USER_PERMISSIONS: (userId: number) => `/api/users/${userId}/user_permissions/`,
    USER_GROUPS: (userId: number) => `/api/users/${userId}/user_groups/`
  },
  GROUPS: {
    LIST: '/api/groups/',
    DETAIL: (groupId: number | null) => `/api/groups/${groupId}/`,
    USERS: (groupId: number) => `/api/groups/${groupId}/group_users/`,
    GROUP_PERMISSIONS: (groupId: number) => `/api/groups/${groupId}/group_permissions/`
  },
  LANGUAGES: {
    LIST: '/api/ista/languages/'
  },
  BUSINESS_UNIT: {
    LIST: '/api/bu/',
    DETAIL: (id: string) => `/api/bu/${id}/`,
    EXTENDED_GROUPS: '/api/extended-groups/',
    getBusinessUnit: '/api/bu/',
    getBusinessUnitById: '/api/bu/',
    createBusinessUnit: '/api/bu/',
    editBusinessUnit: '/api/bu/',
    deleteBusinessUnit: '/api/bu/',
    bulkDeleteBusinessUnit: '/api/bu/bulk_delete/',
    businessUnitAssignToUser: (id: number) => `/api/users/${id}/assign-business-unit/`
  },

  //Case Flow Cases Routes
  CASES: {
    getCases: '/api/case-flow/cases/',
    getCaseById: '/api/case-flow/cases/',
    createCase: '/api/case-flow/cases/',
    editCase: '/api/case-flow/cases/',
    deleteCase: '/api/case-flow/cases/',
    getCaseTypes: '/api/case-flow/case-types/',
    createCaseType: '/api/case-flow/case-types/',
    editCaseType: '/api/case-flow/case-types/',
    deleteCaseType: '/api/case-flow/case-types/',
    getCaseTypeById: '/api/case-types/'
  },

  // Notification Routes
  NOTIFICATIONS: {
    getNotifications: '/api/notifications/',
    createNotification: '/api/notifications/',
    editNotification: '/api/notifications/',
    deleteNotification: '/api/notifications/'
  },
  // General Settings
  GENERAL_SETTINGS: {
    getSettings: '/api/dashboard/general/1/'
  },

  // Logo Settings
  LOGO_SETTINGS: {
    manageLogos: '/api/dashboard/logo/1/'
  },

  // Finance Settings
  FINANCE_SETTINGS: {
    manageFinance: '/api/dashboard/finance/1/'
  },

  // API Tokens
  API_TOKENS: {
    manageTokens: '/api/dashboard/api-tokens/1/'
  },

  // Social Tracking
  SOCIAL_TRACKING: {
    manageTracking: '/api/dashboard/social-tracking/1/'
  },

  // Social Links
  SOCIAL_LINKS: {
    manageLinks: '/api/dashboard/social-links/1/'
  },

  // Header and Footer Settings
  HEADER_SETTINGS: {
    manageHeader: '/api/dashboard/custom-code/1/'
  },
  FOOTER_SETTINGS: {
    manageFooter: '/api/dashboard/footer/1/'
  },

  // SEO Settings
  SEO_SETTINGS: {
    manageSEO: '/api/dashboard/seo/1/'
  },

  ADMIN_SETTINGS: {
    // General Settings
    GENERAL: {
      get: '/api/dashboard/general/',
      update: `/api/dashboard/general/`,
      create: '/api/dashboard/general/',
      delete: `/api/dashboard/general/`
    },
    // Logo Settings
    LOGO: {
      get: '/api/dashboard/logo/',
      update: `/api/dashboard/logo/`,
      create: '/api/dashboard/logo/',
      delete: `/api/dashboard/logo/`,
      public: '/api/dashboard/logo/public/'
    },
    // Finance Settings
    FINANCE: {
      get: '/api/dashboard/finance/',
      update: `/api/dashboard/finance/`,
      create: '/api/dashboard/finance/',
      delete: `/api/dashboard/finance/`,
      public: '/api/dashboard/finance/public/'
    },
    // API Tokens
    API_TOKENS: {
      get: '/api/dashboard/api-tokens/',
      update: `/api/dashboard/api-tokens/`,
      create: '/api/dashboard/api-tokens/',
      delete: `/api/dashboard/api-tokens/`
    },
    // Social Tracking
    SOCIAL_TRACKING: {
      get: '/api/dashboard/social-tracking/',
      update: `/api/dashboard/social-tracking/`,
      create: '/api/dashboard/social-tracking/',
      delete: `/api/dashboard/social-tracking/`,
      public: '/api/dashboard/social-tracking/public/'
    },
    // Custom Code
    CUSTOM_CODE: {
      get: '/api/dashboard/custom-code/',
      create: '/api/dashboard/custom-code/',
      update: '/api/dashboard/custom-code/',
      delete: '/api/dashboard/custom-code/'
    },
    // Social Links
    SOCIAL_LINKS: {
      get: '/api/dashboard/social-links/',
      update: `/api/dashboard/social-links/`,
      create: '/api/dashboard/social-links/',
      delete: `/api/dashboard/social-links/`,
      public: '/api/dashboard/social-links/public/'
    },
    // Footer
    FOOTER: {
      get: '/api/dashboard/footer/',
      update: `/api/dashboard/footer/`,
      create: '/api/dashboard/footer/',
      delete: `/api/dashboard/footer/`,
      public: '/api/dashboard/footer/public/'
    },
    // SEO
    SEO: {
      get: '/api/dashboard/seo/',
      update: `/api/dashboard/seo/`,
      create: '/api/dashboard/seo/',
      delete: `/api/dashboard/seo/`,
      public: '/api/dashboard/seo/public/'
    },
    // Payment Settings
    PAYMENT: {
      get: '/api/dashboard/payment/',
      update: '/api/dashboard/payment/',
      create: '/api/dashboard/payment/',
      delete: '/api/dashboard/payment/'
    },
    PAYPAL: {
      get: '/api/dashboard/paypal/',
      update: '/api/dashboard/paypal/',
      create: '/api/dashboard/paypal/',
      delete: '/api/dashboard/paypal/'
    },
    STRIPE: {
      get: '/api/dashboard/stripe/',
      update: '/api/dashboard/stripe/',
      create: '/api/dashboard/stripe/',
      delete: '/api/dashboard/stripe/'
    },
    MANUAL_PAYMENT: {
      get: '/api/dashboard/manual-payment/',
      update: '/api/dashboard/manual-payment/',
      create: '/api/dashboard/manual-payment/',
      delete: '/api/dashboard/manual-payment/'
    }
  },
  // User Management Routes
  USER_MANAGEMENT: {
    createUser: '/api/users/',
    getUsers: '/api/users/',
    deleteUser: '/api/users/',
    bulkDeleteUsers: '/api/users/bulk_delete/'
  },

  // Service Plans Routes
  SERVICE_PLANS: {
    createServicePlan: '/api/services/plan/',
    getServicePlans: '/api/services/plan/',
    editServicePlan: '/api/services/plan/',
    deleteServicePlan: '/api/services/plan/',
    getActiveServicePlans: '/api/services/active-service-plans/'
  },

  // Payments Routes
  PAYMENTS_MANAGEMENT: {
    paymentsInitiateOneTimePayment: '/api/transaction-manager/payments/initiate/',
    paymentsCaptureOneTimePayment: '/api/transaction-manager/payments/capture/',
    paymentsRefundOneTimePayment: '/api/transaction-manager/refunds/initiate/',
    paymentsSubscriptionChangePlan: '/api/transaction-manager/subscriptions/change-plan/',
    paymentsInitiateSubscription: '/api/transaction-manager/payments/initiate/',
    paymentsCaptureSubscription: '/api/transaction-manager/payments/capture/',
    cancelSubscription: (id: number) => `/api/transaction-manager/subscriptions/${id}/cancel/`,
    refundSubscription: '/api/transaction-manager/subscription-refund/',
    paypalWebhook: '/api/transaction-manager/payments/webhooks/paypal/',
    paymentAuditLogs: '/api/transaction-manager/payment-audit-logs/',
    getRefunds: '/api/transaction-manager/refunds/'
  },

  // Coupons Routes
  COUPONS: {
    createCoupon: '/api/transaction-manager/coupons/',
    getCoupons: '/api/transaction-manager/coupons/',
    getCouponById: '/api/transaction-manager/coupons/',
    deleteCoupon: '/api/transaction-manager/coupons/'
  },

  // Orders Routes
  ORDERS: {
    getOrders: '/api/transaction-manager/orders/',
    getOrderById: '/api/transaction-manager/orders/',
    createOrderOneTimePayment: '/api/transaction-manager/orders/',
    createOrderSubscription: '/api/transaction-manager/orders/',
    editOrder: '/api/transaction-manager/orders/'
  },

  // Subscribers Routes
  SUBSCRIPTIONS: {
    getSubscriptions: '/api/transaction-manager/subscriptions/',
    getSubscriptionById: '/api/transaction-manager/subscriptions/',
    getSubscriptionByOrderId: '/api/transaction-manager/subscriptions/',
    createSubscription: '/api/transaction-manager/subscriptions/',
    updateSubscription: '/api/transaction-manager/subscriptions/',
    deleteSubscription: '/api/transaction-manager/subscriptions/'
  },

  // Transactions Routes
  TRANSACTIONS: {
    getTransactions: '/api/transaction-manager/transactions/',
    getTransactionById: '/api/transaction-manager/transactions/',
    createTransaction: '/api/transaction-manager/transactions/',
    updateTransaction: '/api/transaction-manager/transactions/',
    deleteTransaction: '/api/transaction-manager/transactions/'
  },

  // Staff Routes
  STAFF: {
    getStaff: '/api/staff/'
  },

  // Invoices Routes
  INVOICES: {
    getInvoices: '/api/transaction-manager/invoices/',
    editInvoice: '/api/transaction-manager/invoices/'
  },

  // LLM Operators Routes
  LLM_OPERATORS: {
    getLlmOperators: '/api/ista/llm-operators/',
    createLlmOperator: '/api/ista/llm-operators/',
    editLlmOperator: '/api/ista/llm-operators/',
    deleteLlmOperator: '/api/ista/llm-operators/',
    bulkDeleteLlmOperators: '/api/ista/llm-operators/bulk_delete/'
  },

  // Projects Routes
  PROJECTS: {
    getProjects: '/api/ista/projects/',
    createProject: '/api/ista/projects/',
    editProject: '/api/ista/projects/',
    deleteProject: '/api/ista/projects/'
  },

  // Projects Tasks Routes
  TASKS: {
    getTasks: '/api/ista/tasks/',
    getTaskById: '/api/ista/tasks/',
    createTask: '/api/ista/tasks/',
    editTask: '/api/ista/tasks/',
    deleteTask: '/api/ista/tasks/',
    bulkDeleteTasks: '/api/ista/tasks/bulk_delete/',
    taskSplitByCount: (id: number | null) => `/api/ista/tasks/${id}/split_by_count/`
  },

  // Files Routes
  FILES: {
    getFiles: '/api/ista/files/',
    getFileById: '/api/ista/files/',
    createFile: '/api/ista/files/',
    editFile: '/api/ista/files/',
    deleteFile: '/api/ista/files/',
    bulkDeleteFiles: '/api/ista/files/bulk_delete/'
  },

  // Translation Models Routes
  TRANSLATION_MODELS: {
    getTranslationModels: '/api/ista/translation-models/',
    getTranslationModelsById: '/api/ista/translation-models/',
    createTranslationModels: '/api/ista/translation-models/',
    editTranslationModels: '/api/ista/translation-models/',
    deleteTranslationModels: '/api/ista/translation-models/',
    bulkDeleteTranslationModels: '/api/ista/translation-models/bulk_delete/',
    translationModelPermissions: (id: number | null) => `/api/ista/translation-models/${id}/add_user_permission/`
  },

  // Translation Subjects Routes
  TRANSLATION_SUBJECTS: {
    getTranslationSubjects: '/api/ista/translation-subjects/',
    getTranslationSubjectById: '/api/ista/translation-subjects/',
    createTranslationSubject: '/api/ista/translation-subjects/',
    editTranslationSubject: '/api/ista/translation-subjects/',
    deleteTranslationSubject: '/api/ista/translation-subjects/',
    bulkDeleteTranslationSubjects: '/api/ista/translation-subjects/bulk_delete/'
  },

  // Translation Languages Routes
  TRANSLATION_LANGUAGES: {
    getTranslationLanguages: '/api/ista/translation-languages/'
  },

  // Translation Memory Routes
  TRANSLATION_MEMORY: {
    getTranslationMemory: '/api/ista/tm/',
    getTranslationMemoryById: '/api/ista/tm/',
    createTranslationMemory: '/api/ista/tm/',
    editTranslationMemory: '/api/ista/tm/',
    deleteTranslationMemory: '/api/ista/tm/',
    bulkDeleteTranslationMemory: '/api/ista/tm/bulk_delete/',
    exportTranslationMemory: (id: number | null) => `/api/ista/tm/${id}/export/`,
    importTranslationMemory: (id: number | null) => `/api/ista/tm/${id}/import/`
  },

  // Translation Memory Entries Routes
  TRANSLATION_MEMORY_ENTRIES: {
    getEntries: '/api/ista/tm-entries/',
    getEntryById: '/api/ista/tm-entries/',
    createEntry: '/api/ista/tm-entries/',
    editEntry: '/api/ista/tm-entries/',
    deleteEntry: '/api/ista/tm-entries/',
    bulkDeleteEntries: '/api/ista/tm-entries/bulk_delete/'
  },

  TERM_BASE: {
    getTermBase: '/api/ista/tb/',
    getTermBaseById: '/api/ista/tb/',
    createTermBase: '/api/ista/tb/',
    editTermBase: '/api/ista/tb/',
    deleteTermBase: '/api/ista/tb/',
    bulkDeleteTermBase: '/api/ista/tb/bulk_delete/',
    exportTermBase: (id: number | null) => `/api/ista/tb/${id}/export/`,
    importTermBase: (id: number | null) => `/api/ista/tb/${id}/import/`
  },

  TERM_BASE_ENTRIES: {
    getTermBaseEntries: '/api/ista/tb-entries/',
    getTermBaseEntryById: '/api/ista/tb-entries/',
    createTermBaseEntry: '/api/ista/tb-entries/',
    editTermBaseEntry: '/api/ista/tb-entries/',
    deleteTermBaseEntry: '/api/ista/tb-entries/',
    bulkDeleteTermBaseEntries: '/api/ista/tb-entries/bulk_delete/'
  },
  // Language Routes
  LANGUAGE: {
    getLanguages: '/api/ista/languages/',
    createLanguage: '/api/ista/languages/',
    editLanguage: '/api/ista/languages/',
    deleteLanguage: '/api/ista/languages/',
    bulkDeleteLanguage: '/api/ista/languages/bulk_delete/'
  }
}
