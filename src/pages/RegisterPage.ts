import { BasePage } from './BasePage';
import { UserData } from '../data/types';
import { Constants } from '../common/Constants';
import { UserFactory } from '../data/factories/UserFactory';
import { TestLogger } from '../utils/TestLogger';

type RegistrationOutcome = {
  kind: 'welcome' | 'username-taken' | 'server-error' | 'form-rejected' | 'timeout';
  detail: string;
};

export class RegisterPage extends BasePage {
  get firstNameInput() { return this.page.locator('#customer\\.firstName'); }
  get lastNameInput() { return this.page.locator('#customer\\.lastName'); }
  get addressInput() { return this.page.locator('#customer\\.address\\.street'); }
  get cityInput() { return this.page.locator('#customer\\.address\\.city'); }
  get stateInput() { return this.page.locator('#customer\\.address\\.state'); }
  get zipCodeInput() { return this.page.locator('#customer\\.address\\.zipCode'); }
  get phoneInput() { return this.page.locator('#customer\\.phoneNumber'); }
  get ssnInput() { return this.page.locator('#customer\\.ssn'); }
  get usernameInput() { return this.page.locator('#customer\\.username'); }
  get passwordInput() { return this.page.locator('#customer\\.password'); }
  get confirmPasswordInput() { return this.page.locator('#repeatedPassword'); }
  get registerButton() { return this.page.locator('input[value="Register"]'); }
  get welcomeMessage() { return this.page.locator('#rightPanel h1.title', { hasText: 'Welcome' }); }
  get successMessage() { return this.page.locator('#rightPanel p').first(); }
  get serverErrorHeading() { return this.page.locator('#rightPanel h1.title', { hasText: 'Error' }); }
  get formErrorMessage() { return this.page.locator('#rightPanel .error').first(); }

  async navigateToRegister(): Promise<void> {
    await this.navigate(Constants.PATHS.REGISTER);
  }

  async register(user: UserData): Promise<void> {
    await this.fillAllFields(user);
    await this.ensureFormIntact(user);

    const outcome = await this.submitAndAwaitOutcome();

    if (outcome.kind === 'welcome') return;

    if (outcome.kind === 'username-taken') {
      user.username = UserFactory.generateUsername();
      await this.usernameInput.fill(user.username);
      await this.passwordInput.fill(user.password);
      await this.confirmPasswordInput.fill(user.confirmPassword);
      const retry = await this.submitAndAwaitOutcome();
      if (retry.kind === 'welcome') return;
      throw new Error(
        `Registration still failed after fresh username (${user.username}): ${retry.detail}`
      );
    }

    throw new Error(outcome.detail);
  }

  private async fillAllFields(user: UserData): Promise<void> {
    await this.firstNameInput.waitFor({ state: 'visible' });
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.addressInput.fill(user.address);
    await this.cityInput.fill(user.city);
    await this.stateInput.fill(user.state);
    await this.zipCodeInput.fill(user.zipCode);
    await this.phoneInput.fill(user.phone);
    await this.ssnInput.fill(user.ssn);
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.confirmPassword);
  }

  private async ensureFormIntact(user: UserData): Promise<void> {
    if ((await this.firstNameInput.inputValue()) === user.firstName) return;
    await this.navigateToRegister();
    await this.fillAllFields(user);
  }

  private async submitAndAwaitOutcome(): Promise<RegistrationOutcome> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/parabank/register.htm') &&
          res.request().method() === 'POST',
        { timeout: 30_000 }
      ),
      this.registerButton.click(),
    ]);

    if (response.status() >= 500) {
      return {
        kind: 'server-error',
        detail: `ParaBank returned ${response.status()} on registration POST — server transient`,
      };
    }

    const terminalTimeout = 75_000;
    await Promise.race([
      this.welcomeMessage.waitFor({ state: 'visible', timeout: terminalTimeout }),
      this.serverErrorHeading.waitFor({ state: 'visible', timeout: terminalTimeout }),
      this.formErrorMessage.waitFor({ state: 'visible', timeout: terminalTimeout }),
    ]).catch(() => undefined);

    if (await this.welcomeMessage.isVisible()) {
      return { kind: 'welcome', detail: '' };
    }

    if (await this.serverErrorHeading.isVisible()) {
      const detail = (await this.formErrorMessage.textContent())?.trim() ?? '';
      return { kind: 'server-error', detail: `Server error page: ${detail}` };
    }

    if (await this.formErrorMessage.isVisible()) {
      const detail = (await this.formErrorMessage.textContent())?.trim() ?? '';
      if (/already exists/i.test(detail)) {
        return { kind: 'username-taken', detail };
      }
      return { kind: 'form-rejected', detail: `Registration rejected: ${detail}` };
    }

    const cfStillShowing = await this.page
      .getByText('Performing security verification')
      .isVisible()
      .catch(() => false);
    const currentUrl = this.page.url();

    if (cfStillShowing) {
      TestLogger.warn(
        'CLOUDFLARE',
        `Registration blocked by CF interstitial — did not clear within ${terminalTimeout / 1000}s at ${currentUrl}`
      );
      return {
        kind: 'timeout',
        detail: `Cloudflare bot-challenge did not clear within ${terminalTimeout / 1000}s (url=${currentUrl})`,
      };
    }

    TestLogger.warn(
      'REGISTER-TIMEOUT',
      `Neither welcome nor error rendered within ${terminalTimeout / 1000}s at ${currentUrl}`
    );
    return {
      kind: 'timeout',
      detail: `Neither welcome nor error rendered within ${terminalTimeout / 1000}s (url=${currentUrl})`,
    };
  }

  async getWelcomeTitle(): Promise<string> {
    await this.welcomeMessage.waitFor({ state: 'visible' });
    return (await this.welcomeMessage.textContent()) || '';
  }

  async getSuccessText(): Promise<string> {
    return (await this.successMessage.first().textContent()) || '';
  }
}
