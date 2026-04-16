import { UserFactory } from '../data/factories/UserFactory';
import { UserData, SessionData } from '../data/types';

interface DataTableRow {
  PARAM: string;
  VALUE: string;
}

export class DataTableParser {
  static parseUserData(
    rows: DataTableRow[],
    session: SessionData
  ): UserData {
    const generated = UserFactory.create(session.sessionKey);
    const overrides: Record<string, string> = {};

    for (const row of rows) {
      const value = DataTableParser.resolveValue(
        row.VALUE,
        session,
        generated
      );
      overrides[row.PARAM] = value;
    }

    return { ...generated, ...overrides } as UserData;
  }

  static parseKeyValuePairs(
    rows: DataTableRow[],
    session: SessionData
  ): Record<string, string> {
    const result: Record<string, string> = {};
    const generated = UserFactory.create(session.sessionKey);

    for (const row of rows) {
      result[row.PARAM] = DataTableParser.resolveValue(
        row.VALUE,
        session,
        generated
      );
    }

    return result;
  }

  private static resolveValue(
    value: string,
    session: SessionData,
    generated: UserData
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

    if (value.includes('<lastPaymentAmount>')) {
      return value.replace(
        '<lastPaymentAmount>',
        session.lastPaymentAmount || ''
      );
    }

    return value;
  }
}
