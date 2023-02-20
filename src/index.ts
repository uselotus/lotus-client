import { v4 as uuidv4 } from 'uuid'
import axios, { AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import ms from 'ms'
import { eventValidation } from './event-validation'
import { components, operations } from './types-camel'
import { operations as operationsSnake } from './types'
import {
  ValidateEventType,
  REQUEST_TYPES,
  CustomerDetailsParams,
  REQUEST_URLS,
  TrackEvent,
} from './data-types'
import { ListCustomerResponse } from './responses/ListCustomerResponse'

const noop = () => {}

const setImmediate = (functionToExecute, args?: any) => {
  return functionToExecute(args)
}

async function wrapResponse<T>(
  response: AxiosResponse<T>,
): Promise<AxiosResponse<T>> {
  const data = response.data
  const camelData = convertKeysToCamelCase(data)
  return { ...response, data: camelData }
}

function convertKeysToCamelCase<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => convertKeysToCamelCase(item)) as T
  }

  if (typeof data === 'object' && data !== null) {
    const newData = {}
    for (const key of Object.keys(data)) {
      const camelKey = key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase())
      newData[camelKey] = convertKeysToCamelCase(data[key])
    }
    return newData as T
  }

  return data
}

async function callReq<T>(req) {
  try {
    const response = await axios(req)

    return wrapResponse<T>(response)
  } catch (error) {
    throw new Error(error)
  }
}

class Lotus {
  private readonly host: any
  private readonly apiKey: any
  private readonly timeout: boolean
  private readonly flushAt: number
  private readonly flushInterval: any
  private readonly headers: { 'X-API-KEY': string }
  private queue: any[]
  private readonly enable: boolean
  private timer: number

  private getRequestObject<T = any | undefined>(
    method: REQUEST_TYPES,
    url: string,
    data?: T,
    params?: any,
  ) {
    if (data) {
      Object.keys(data).forEach((k) => data[k] == null && delete data[k])
    }

    // if(params) {
    //    Object.keys(params).forEach((p) => params[p] == null && delete data[p]);
    // }

    if (!data && params) {
      return {
        method: method,
        url: this.getRequestUrl(url),
        headers: this.headers,
        params: params,
      }
    }

    if (!params && data) {
      return {
        method: method,
        url: this.getRequestUrl(url),
        headers: this.headers,
        data: data,
      }
    }

    return {
      method: method,
      url: this.getRequestUrl(url),
      params: params === undefined ? {} : params,
      data: data === undefined ? {} : data,
      headers: this.headers,
    }
  }

  private getRequestUrl = (url: string): string => `${this.host}${url}`

  /**
   * Initialize a new `Lotus` with your Lotus organization's `apiKey` and an
   * optional dictionary of `options`.
   *
   * @param {String} apiKey
   * @param {Object} [options] (optional)
   *   @property {Number} flushAt (default: 20)
   *   @property {Number} flushInterval (default: 10000)
   *   @property {String} host (default: 'https://www.uselotus.app/')
   *   @property {Boolean} enable (default: true)
   */
  constructor(apiKey, options) {
    options = options || {}

    if (!apiKey) {
      throw new Error('Api Key is required')
    }

    this.queue = []
    this.apiKey = apiKey
    const host_url = options.host || 'https://api.uselotus.io/'
    this.host = host_url.replace(/\/$/, '')
    this.timeout = options.timeout || false
    this.flushAt = Math.max(options.flushAt, 1) || 20
    this.flushInterval =
      typeof options.flushInterval === 'number' ? options.flushInterval : 10000
    this.enable = typeof options.enable === 'boolean' ? options.enable : true
    this.headers = {
      'X-API-KEY': this.apiKey,
    }
    // axiosRetry(axios, {
    //   retries: options.retryCount || 3,
    //   retryCondition: this._isErrorRetryable,
    //   retryDelay: axiosRetry.exponentialDelay,
    // });
  }

  /**
   * Add a `message` of type `type` to the queue and
   * check whether it should be flushed.
   *
   * @param params
   * @param {Function} [callback] (optional)
   * @api private
   */
  private enqueue(params: TrackEvent, callback) {
    callback = callback || noop

    if (!this.enable) {
      return setImmediate(callback)
    }

    params.batch.forEach((message) => {
      const data = {
        time_created: message.timeCreated || new Date(),
        idempotency_id: message.idempotencyId || uuidv4(),
        customer_id: message.customerId,
        event_name: message.eventName,
      }
      if (message.properties) {
        data['properties'] = message.properties
      }
      this.queue.push({ data, callback })
    })

    if (this.queue.length >= this.flushAt) {
      this.flush()
    }

    if (this.flushInterval && !this.timer) {
      // @ts-ignore
      this.timer = setTimeout(() => this.flush(), this.flushInterval)
    }
  }

  /**
   * Flush the current queue
   *
   * @param {Function} [callback] (optional)
   * @return {Lotus}
   */
  flush(callback?: any) {
    callback = callback || noop

    if (!this.enable) {
      return setImmediate(callback)
    }

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (!this.queue.length) {
      return setImmediate(callback)
    }

    const items = this.queue.splice(0, this.flushAt)
    // const callbacks = items.map(item => item.callback)
    // const messages = items.map(item => item.message)

    const data = {
      batch: items.map((item) => item.data),
    }

    // const done = (err?:any) => {
    //     callbacks.forEach((callback) => callback(err))
    //     callback(err, data)
    // }

    const req = this.getRequestObject(
      REQUEST_TYPES.POST,
      REQUEST_URLS.TRACK_EVENT,
      data,
    )

    this.setRequestTimeout(req)
    return callReq(req)
  }

  /**
   * Send a trackEvent `message`.
   *
   * @param {Object} message (Should contain event name and customer id)
   * @param {Function} [callback] (optional)
   * @return {Lotus}
   */
  track_event(message, callback) {
    eventValidation(message, ValidateEventType.trackEvent)

    const properties = Object.assign({}, message.properties, {
      $lib: 'lotus-client-sdk',
    })

    const apiMessage = Object.assign({}, message, { properties })

    this.enqueue(apiMessage, callback)

    return this
  }

  /**
   * Get Customer Detail.
   *
   * @return {Object} (customers Details)
   * @param message
   */
  async getCustomer(
    params: CustomerDetailsParams,
  ): Promise<AxiosResponse<ListCustomerResponse>> {
    eventValidation(params, ValidateEventType.customerDetails)
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_DETAIL(params.customerId),
    )
    this.setRequestTimeout(req)
    return callReq(req)
  }

  /**
   * Get all subscriptions.
   *
   */
  async listSubscriptions(
    params: operations['apiSubscriptionsList']['parameters']['query'],
  ): Promise<AxiosResponse<components['schemas']['SubscriptionRecord'][]>> {
    eventValidation(params, ValidateEventType.listSubscriptions)
    let data
    if (!!Object.keys(params).length) {
      data = {
        customer_id: params.customerId,
        status: params.status || [],
        range_start: params.rangeStart || null,
        range_end: params.rangeEnd || null,
        plan_id: params.planId || null,
      }
    }

    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_SUBSCRIPTIONS,
      null,
      data,
    )
    this.setRequestTimeout(req)
    return callReq<components['schemas']['SubscriptionRecord'][]>(req)
  }

  /**
   * Get All plans.
   *
   */
  async listPlans(): Promise<AxiosResponse<components['schemas']['Plan'][]>> {
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_ALL_PLANS,
    )
    this.setRequestTimeout(req)
    return callReq<components['schemas']['Plan'][]>(req)
  }

  /**
   * Get plan details. planId
   *
   * @param params
   *
   */
  async getPlan(
    params: operations['apiPlansRetrieve']['parameters']['path'],
  ): Promise<AxiosResponse<components['schemas']['Plan']>> {
    eventValidation(params, ValidateEventType.planDetails)
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_PLAN_DETAILS(params.planId),
    )
    this.setRequestTimeout(req)
    return callReq<components['schemas']['Plan']>(req)
  }

  /**
   * Get customer feature access.
   *
   * @param params
   *
   */
  async getCustomerFeatureAccess(
    params: operations['apiCustomerFeatureAccessList']['parameters']['query'],
  ): Promise<AxiosResponse<components['schemas']['GetFeatureAccess'][]>> {
    eventValidation(params, ValidateEventType.customerFeatureAccess)
    const data = {
      customer_id: params.customerId,
      feature_name: params.featureName,
    }
    if (params.subscriptionFilters?.length) {
      data['subscription_filters'] = params.subscriptionFilters?.map((v) => {
        return {
          property_name: v.propertyName,
          value: v.value,
        }
      })
    }
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_FEATURE_ACCESS,
      null,
      data,
    )
    this.setRequestTimeout(req)
    return callReq<components['schemas']['GetFeatureAccess'][]>(req)
  }

  /**
   * Get customer access.
   *
   * @param params
   *
   */
  async getCustomerMetricAccess(
    params: operations['apiCustomerMetricAccessList']['parameters']['query'],
  ): Promise<AxiosResponse<components['schemas']['GetEventAccess'][]>> {
    eventValidation(params, ValidateEventType.customerMetricAccess)
    const data = {
      customer_id: params.customerId,
      event_name: params.eventName || null,
      metric_id: params.metricId || null,
    }

    if (params.subscriptionFilters?.length) {
      data['subscription_filters'] = params.subscriptionFilters?.map((v) => {
        return {
          property_name: v.propertyName,
          value: v.value,
        }
      })
    }
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_CUSTOMER_METRIC_ACCESS,
      null,
      data,
    )
    this.setRequestTimeout(req)
    return callReq<components['schemas']['GetEventAccess'][]>(req)
  }

  /**
   * Get invoices.
   *
   * @param params
   *
   */
  async listInvoices(
    params: operations['apiInvoicesList']['parameters']['query'],
  ): Promise<AxiosResponse<components['schemas']['Invoice'][]>> {
    const data = {
      customer_id: params.customerId || null,
      payment_status: params.paymentStatus || null,
    }
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_INVOICES,
      data,
    )
    this.setRequestTimeout(req)
    return callReq<components['schemas']['Invoice'][]>(req)
  }
  /**
   * Get invoice.
   *
   * @param params
   *
   */
  async getInvoice(
    params: operations['apiInvoicesRetrieve']['parameters']['path'],
  ): Promise<AxiosResponse<components['schemas']['Invoice']>> {
    eventValidation(params, ValidateEventType.invoiceDetails)
    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_INVOICE_DETAILS(params.invoiceId),
    )
    this.setRequestTimeout(req)
    return callReq<components['schemas']['Invoice']>(req)
  }
  /**
   * Get invoice PDF URL
   *
   * @param params
   *
   */
  async getInvoicePDF(
    params: operations['apiInvoiceUrlRetrieve']['parameters']['query'],
  ): Promise<AxiosResponse<components['schemas']['GetInvoicePdfURLResponse']>> {
    eventValidation(params, ValidateEventType.getInvoicePDFDetails)

    const data: operationsSnake['api_invoice_url_retrieve']['parameters']['query'] =
      {
        invoice_id: params.invoiceId,
        invoice_number: params.invoiceNumber,
      }

    const req = this.getRequestObject(
      REQUEST_TYPES.GET,
      REQUEST_URLS.GET_INVOICE_PDF_DETAILS,
      null,
      data,
    )

    this.setRequestTimeout(req)
    return callReq<components['schemas']['GetInvoicePdfURLResponse']>(req)
  }

  _isErrorRetryable(error) {
    // Retry Network Errors.
    if (axiosRetry.isNetworkError(error)) {
      return true
    }

    if (!error.response) {
      // Cannot determine if the request can be retried
      return false
    }

    // Retry Server Errors (5xx).
    if (error.response.status >= 500 && error.response.status <= 599) {
      return true
    }

    // Retry if rate limited.
    return error.response.status === 429
  }

  private setRequestTimeout = (req) => {
    if (this.timeout) {
      req['timeout'] =
        typeof this.timeout === 'string' ? ms(this.timeout) : this.timeout
    }
  }
}

export { Lotus }
