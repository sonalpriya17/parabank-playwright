export const Constants = {
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
} as const;
