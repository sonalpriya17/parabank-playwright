import { TransactionResponse } from './response/TransactionResponse';

export interface UserData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface SessionData {
  sessionKey: string;
  user?: UserData;
  accountNumber?: string;
  initialBalance?: string;
  lastPaymentAmount?: string;
  capturedTransactions?: TransactionResponse[];
}

export interface BillPayeeData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  accountNumber: string;
  verifyAccountNumber: string;
  amount: string;
}
