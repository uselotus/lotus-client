import {
  CustomerDetailsParams,
  ValidateEventType,
  TrackEvent,
} from './data-types'
import { operations } from './types-camel'

/**
 * Validate an event.
 */

export function eventValidation(event, type) {
  switch (type) {
    case ValidateEventType.customerDetails:
      return validateCustomerDetailsEvent(event)
    case ValidateEventType.planDetails:
      return validatePlanDetailsEvent(event)
    case ValidateEventType.customerMetricAccess:
      return validateCustomerMetricAccessEvent(event)
    case ValidateEventType.customerFeatureAccess:
      return validateCustomerFeatureAccessEvent(event)
    case ValidateEventType.trackEvent:
      return validateTrackEventEvent(event)
    case ValidateEventType.invoiceDetails:
      return validateInvoiceDetails(event)
    case ValidateEventType.getInvoicePDFDetails:
      return validategetInvoicePDFDetails(event)
    case ValidateEventType.listSubscriptions:
      return validateListSubscriptionEvent(event)
    default:
      throw new Error('Invalid Event Type')
  }
}

/**
 * Validate a "CustomerDetails" event.
 */
function validateCustomerDetailsEvent(event: CustomerDetailsParams) {
  if (!event.customerId) {
    throw new Error('customerId is a required key')
  }
}

/**
 * Validate a "Customer Access" event.
 */
function validateCustomerFeatureAccessEvent(
  event: operations['apiCustomerFeatureAccessList']['parameters']['query'],
) {
  if (!event.customerId) {
    throw new Error('customerId is a required key')
  }

  if (!event.featureName) {
    throw new Error('featureName is a required key')
  }

  if (event.subscriptionFilters && !Array.isArray(event.subscriptionFilters)) {
    throw new Error('subscriptionFilters must be an array')
  }
}

/**
 * Validate a "Customer Access" event.
 */
function validateCustomerMetricAccessEvent(
  event: operations['apiCustomerMetricAccessList']['parameters']['query'],
) {
  if (!event.customerId) {
    throw new Error('customerId is a required key')
  }

  if (event.subscriptionFilters && !Array.isArray(event.subscriptionFilters)) {
    throw new Error('subscriptionFilters must be an array')
  }
}

/**
 * Validate a "trackEvent" event.
 */
function validateTrackEventEvent(event: TrackEvent) {
  if (!event.batch || !event.batch.length) {
    throw new Error("Messages batch can't be empty")
  }

  event.batch.forEach((messaage) => {
    if (!messaage.customerId) {
      throw new Error('customerId is a required key')
    }

    if (!messaage.eventName) {
      throw new Error('eventName is a required key')
    }
  })
}

/**
 * Validate a "PlanDetails" event.
 */
function validatePlanDetailsEvent(
  event: operations['apiPlansRetrieve']['parameters']['path'],
) {
  if (!event.planId) {
    throw new Error('planId is a required key')
  }
}
/**
 * Validate a "invoiceDetails" event.
 */
function validateInvoiceDetails(
  event: operations['apiInvoicesRetrieve']['parameters']['path'],
) {
  if (!event.invoiceId) {
    throw new Error('invoiceId is a required key')
  }
}
/**
 * Validate a "getInvoicePDFDetails" event.
 */
function validategetInvoicePDFDetails(
  event: operations['apiInvoiceUrlRetrieve']['parameters']['query'],
) {
  if (!event.invoiceId) {
    throw new Error('invoiceId is a required key')
  }
  if (!event.invoiceNumber) {
    throw new Error('invoiceNumber is a required key')
  }
}

/**
 * Validate a "ListSubscription" event.
 */

function validateListSubscriptionEvent(
  event: operations['apiSubscriptionsList']['parameters']['query'],
) {
  if (!event.customerId) {
    throw new Error('customerId is a required key')
  }

  const allowed_status = ['active', 'not_started', 'ended']

  if (event.status && !Array.isArray(event.status)) {
    throw new Error('subscriptionFilters must be an array')
  }

  if (event.status?.length) {
    event.status.forEach((status) => {
      if (!allowed_status.includes(status)) {
        throw new Error(
          `status Must be one the these "active","prorate", "charge_full"`,
        )
      }
    })
  }
}
