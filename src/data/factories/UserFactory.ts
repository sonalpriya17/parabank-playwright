import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { UserData } from '../types';
import { Constants } from '../../common/Constants';

export const UserFactory = {
  generateUsername(sessionKey?: string): string {
    const fakerPart = faker.string.alphanumeric({ length: 6, casing: 'mixed' });
    const uuidPart = randomUUID().replace(/-/g, '').slice(0, 8);
    const prefix = sessionKey ? sessionKey.slice(0, 4) : 'u';
    return `u_${prefix}_${fakerPart}${uuidPart}`;
  },

  create(sessionKey?: string): UserData {
    const username = UserFactory.generateUsername(sessionKey);

    const password = Constants.DEFAULT_PASSWORD;

    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode('#####'),
      phone: faker.phone.number({ style: 'national' }),
      ssn: faker.string.numeric(9),
      username,
      password,
      confirmPassword: password,
    };
  },
};
