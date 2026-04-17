export const Constants = {
  API_BASE_URL:
    process.env.API_BASE_URL ||
    'https://parabank.parasoft.com/parabank/services/bank',

  DEFAULT_PASSWORD: 'Test@1234',

  PATHS: {
    HOME: '/parabank/index.htm',
    REGISTER: '/parabank/register.htm',
    LOGIN: '/parabank/login.htm',
    OPEN_ACCOUNT: '/parabank/openaccount.htm',
    ACCOUNTS_OVERVIEW: '/parabank/overview.htm',
    TRANSFER_FUNDS: '/parabank/transfer.htm',
    BILL_PAY: '/parabank/billpay.htm',
  },

  NAVIGATION_LINKS: {
    'Open New Account': 'openaccount',
    'Accounts Overview': 'overview',
    'Transfer Funds': 'transfer',
    'Bill Pay': 'billpay',
    'Find Transactions': 'findtrans',
    'Update Contact Info': 'updateprofile',
    'Request Loan': 'requestloan',
  } as Record<string, string>,
} as const;
