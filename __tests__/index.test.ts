const axios = require('axios')
const { Lotus } = require('../src/index')
const { handlers } = require('./handlers')
const { setupServer } = require('msw/node')
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterAll(() => server.close())
const lotus = new Lotus(process.env.API_KEY, {
  host: 'https://api.uselotus.io/',
  flushAT: 1,
})

it('loads up Lotus successfully', () => {
  expect(lotus).toBeTruthy()
  expect(lotus.headers['X-API-KEY']).toEqual(process.env.API_KEY)
})

it('lists all plans', async () => {
  const plans = await lotus.listPlans()

  expect(plans.data.data[0].planName).toEqual('Starter Plan')
  expect(plans.data.data.length).toEqual(1)
})
it('gets plan details', async () => {
  const plan = await lotus.getPlan({
    planId: 'plan_8bd8a9a56d8c4b7cb5c56d76fc76f237',
  })
  expect(plan.data.data.planName).toEqual('Starter Plan')
})

it('gets all subscriptions', async () => {
  const params = { customerId: 'MSN-0010002' }
  const subscriptions = await lotus.listSubscriptions(params)

  expect(subscriptions.data.data.length).toEqual(1)
  expect(subscriptions.data.data[0].customer.customerId).toEqual(
    params.customerId,
  )
})

it('gets customer detail', async () => {
  const params = { customerId: 'MSN-0010002' }
  const customerDetail = await lotus.getCustomer(params)
  expect(customerDetail.data.data.customerName).toEqual('Customer Charlie')
})
it('gets all invoices for a customer', async () => {
  const params = { customerId: 'MSN-0010002', paymentStatus: ['unpaid'] }
  const invoicesForCustomer = await lotus.listInvoices(params)
  console.log(invoicesForCustomer.data.data)
  expect(invoicesForCustomer.data.data[0].paymentStatus).toEqual(
    params.paymentStatus[0],
  )
  expect(invoicesForCustomer.data.data.length).toEqual(1)
})
