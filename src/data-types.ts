export enum REQUEST_TYPES {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export const REQUEST_URLS = {
  GET_CUSTOMER_DETAIL: (customerId) => `/api/customers/${customerId}/`,
  GET_ALL_SUBSCRIPTIONS: '/api/subscriptions/',
  GET_ALL_PLANS: '/api/plans/',
  GET_PLAN_DETAILS: (planId) => `/api/plans/${planId}/`,
  GET_CUSTOMER_FEATURE_ACCESS: '/api/customer_feature_access/',
  GET_CUSTOMER_METRIC_ACCESS: '/api/customer_metric_access/',
  TRACK_EVENT: '/api/track/',
  GET_INVOICES: '/api/invoices/',
  GET_INVOICE_DETAILS: (invoiceId) => `/api/invoices/${invoiceId}/`,
  GET_INVOICE_PDF_DETAILS: '/api/invoiceUrl/',
}

export enum ValidateEventType {
  trackEvent = 'trackEvent',
  customerDetails = 'customerDetails',
  planDetails = 'planDetails',
  customerMetricAccess = 'customerMetricAccess',
  customerFeatureAccess = 'customerFeatureAccess',
  getInvoices = 'getInvoices',
  getInvoicePDFDetails = 'getInvoicePDFDetails',
  invoiceDetails = 'invoiceDetails',
  listSubscriptions = 'listSubscriptions',
}

export interface CustomerDetailsParams {
  customerId: string
}

export interface TrackEventEntity {
  eventName: string
  customerId: string
  idempotencyId: string
  timeCreated: Date
  properties?: any
}

export interface TrackEvent {
  batch: TrackEventEntity[]
}
