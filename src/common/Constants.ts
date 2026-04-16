export const Constants = {
  BASE_URL: process.env.BASE_URL || 'https://parabank.parasoft.com',
  API_BASE_URL:
    process.env.API_BASE_URL ||
    'https://parabank.parasoft.com/parabank/services/bank',

  PATHS: {
    HOME: '/parabank/index.htm',
    REGISTER: '/parabank/register.htm',
    LOGIN: '/parabank/login.htm',
    OPEN_ACCOUNT: '/parabank/openaccount.htm',
    ACCOUNTS_OVERVIEW: '/parabank/overview.htm',
    TRANSFER_FUNDS: '/parabank/transfer.htm',
    BILL_PAY: '/parabank/billpay.htm',
  },

  TIMEOUTS: {
    DEFAULT: 10_000,
    NAVIGATION: 30_000,
    ACTION: 15_000,
  },
} as const;
