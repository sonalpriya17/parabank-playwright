import { UserFactory } from '../data/factories/UserFactory';
import { UserData, SessionData, BillPayeeData } from '../data/types';
import { Constants } from '../common/Constants';

export type DataTableRow = Record<string, string>;

export class DataTableParser {
  static parseUserData(
    rows: DataTableRow[],
    session: SessionData
  ): UserData {
    const generated = UserFactory.create(session.sessionKey);
    const overrides: Record<string, string> = {};

    for (const row of rows) {
      if (row.VALUE === '<generated>') {
        continue;
      }
      const value = DataTableParser.resolveValue(row.VALUE, session);
      overrides[row.PARAM] = value;
    }

    return { ...generated, ...overrides } as UserData;
  }

  static parseBillPayData(
    rows: DataTableRow[],
    session: SessionData
  ): BillPayeeData {
    const data = DataTableParser.parseKeyValuePairs(rows, session);

    return {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      phone: data.phone,
      accountNumber: data.accountNumber,
      verifyAccountNumber: data.verifyAccountNumber,
      amount: data.amount,
    };
  }

  static parseKeyValuePairs(
    rows: DataTableRow[],
    session: SessionData
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const row of rows) {
      result[row.PARAM] = DataTableParser.resolveValue(row.VALUE, session);
    }

    return result;
  }

  private static resolveValue(
    value: string,
    session: SessionData
  ): string {
    if (value === '<generated>') {
      return '';
    }

    if (value.includes('<sessionKey>')) {
      return value.replace('<sessionKey>', session.sessionKey.slice(0, 8));
    }

    if (value.includes('<accountNumber>')) {
      return value.replace('<accountNumber>', session.accountNumber || '');
    }

    if (value.includes('<defaultPassword>')) {
      return value.replace('<defaultPassword>', Constants.DEFAULT_PASSWORD);
    }

    if (value.includes('<lastPaymentAmount>')) {
      return value.replace(
        '<lastPaymentAmount>',
        session.lastPaymentAmount || ''
      );
    }

    return value;
  }
}
