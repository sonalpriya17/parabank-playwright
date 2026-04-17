import { faker } from '@faker-js/faker';
import { UserData } from '../types';
import { Constants } from '../../common/Constants';

export const UserFactory = {
  create(sessionKey?: string): UserData {
    const username = sessionKey
      ? `user_${sessionKey.slice(0, 8)}`
      : `user_${faker.string.alphanumeric(8)}`;

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
