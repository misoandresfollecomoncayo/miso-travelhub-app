/**
 * Login flow E2E.
 *
 * Estos tests están bloqueados por el bug Detox 20 + RN Fabric con el
 * `BottomTabBar` (ver `smoke.test.js`): no se puede tappear de manera
 * confiable el tab "Usuario" para llegar a la pantalla de Login.
 *
 * El flujo se cubre ampliamente con pruebas unitarias en
 * `__tests__/screens/LoginScreen.test.tsx` (validación de email,
 * habilitación del botón, navegación a Register, llamada al AuthContext,
 * etc.).
 *
 * Cuando Detox/RN reconcilien la API o agreguemos deep linking, retirar
 * el `describe.skip` y ejecutar con credenciales reales del backend:
 *
 *   export E2E_USER_EMAIL=usuario@ejemplo.co
 *   export E2E_USER_PASSWORD='contraseña_segura'
 *   npm run e2e:test:ios
 */
describe.skip('Login flow (bloqueado por Detox + Fabric)', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await element(by.label('Usuario, tab, 3 of 3')).tap();
  });

  it('rejects invalid emails (shows error on blur)', async () => {
    await element(by.id('login-email')).typeText('not-an-email');
    await element(by.id('login-password')).typeText('something1!');
    await element(by.id('login-password')).tap();
    await expect(element(by.id('login-email-error'))).toBeVisible();
  });

  it('logs in with valid credentials and lands on the profile screen', async () => {
    await element(by.id('login-email')).typeText(
      process.env.E2E_USER_EMAIL || '',
    );
    await element(by.id('login-password')).typeText(
      process.env.E2E_USER_PASSWORD || '',
    );
    await element(by.id('login-submit-button')).tap();
    await waitFor(element(by.text('Mi perfil')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('navigates from login → register and back', async () => {
    await element(by.id('login-register-button')).tap();
    await expect(element(by.id('register-back-button'))).toBeVisible();
    await element(by.id('register-back-button')).tap();
    await expect(element(by.id('login-email'))).toBeVisible();
  });
});
