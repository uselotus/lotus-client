# Lotus Client SDK

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat)](https://opensource.org/licenses/MIT)

Official Lotus Web Client SDK to capture and send events to any Lotus instance (self-hosted or cloud).

## Installing

Install the lotus-client package for use in your node.js based backend.

```bash
npm install lotus-client-sdk
```

## Initializing

First grab a new api key from the Settings tab. Then change the host to wherever you want to send data to and omit the line if you are using Lotus Cloud.

```jsx
const lotus = new Lotus(api_key, {
  host: 'https://www.uselotus.app/', // You can omit this line if using Lotus Cloud
})
```

## Currently Supported Methods

```

1. Get Customer Details
2. Get All Subscriptions
3. Get All Plans
4. Get Plan Details
5. List All Invoices
6. Get Invoice Details
7. Get Invoice PDF Details
8. Get Feature Access
9. Get Metric Access
```

## Making calls

Please refer to the [Lotus documentation](https://docs.uselotus.io/docs/api/) for more information on how to use the library.

## Questions?

### [Join our Slack community.](https://lotus-community.slack.com)

## Thank you
