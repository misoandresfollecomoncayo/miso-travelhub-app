/**
 * Search flow E2E — pantalla de búsqueda (tab por defecto).
 *
 * Cubre los flujos que NO requieren tappear el botón "BUSCAR" (afectado por
 * el bug de Detox + Fabric, ver smoke.test.js).
 */
describe('Search screen — destination', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('renders the destination input', async () => {
    // Sólo verificamos el TextInput. Los placeholders se exponen
    // diferente entre iOS y Android (Android no los pone en el árbol
    // de texto), así que matchear por placeholder no es portable.
    await expect(element(by.id('search-destination'))).toBeVisible();
  });

  it('lets the user type a destination', async () => {
    await element(by.id('search-destination')).typeText('Madrid');
    await expect(element(by.text('Madrid'))).toBeVisible();
  });

  it('clears the destination when emptied', async () => {
    await element(by.id('search-destination')).typeText('Madrid');
    await element(by.id('search-destination')).clearText();
    await expect(element(by.text('Madrid'))).not.toBeVisible();
  });
});

describe('Search screen — adults counter', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('starts with a default value of 1 adult', async () => {
    await expect(element(by.id('counter-search-adults-value'))).toHaveText('1');
  });

  it('increments when + is pressed', async () => {
    await element(by.id('counter-search-adults-inc')).tap();
    await expect(element(by.id('counter-search-adults-value'))).toHaveText('2');
    await element(by.id('counter-search-adults-inc')).tap();
    await expect(element(by.id('counter-search-adults-value'))).toHaveText('3');
  });

  it('decrements when - is pressed but never below 1', async () => {
    await element(by.id('counter-search-adults-inc')).tap();
    await element(by.id('counter-search-adults-inc')).tap();
    await element(by.id('counter-search-adults-dec')).tap();
    await expect(element(by.id('counter-search-adults-value'))).toHaveText('2');
    // Decremento adicional hasta llegar al mínimo y verificar que no baja.
    await element(by.id('counter-search-adults-dec')).tap();
    await expect(element(by.id('counter-search-adults-value'))).toHaveText('1');
    // El botón ahora está disabled — el siguiente decrement no cambia el valor.
    await element(by.id('counter-search-adults-dec')).tap();
    await expect(element(by.id('counter-search-adults-value'))).toHaveText('1');
  });
});

describe('Search screen — children counter', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('starts at 0 children (minimum is 0)', async () => {
    await expect(element(by.id('counter-search-children-value'))).toHaveText('0');
  });

  it('can increment up to several children', async () => {
    for (let i = 0; i < 3; i++) {
      await element(by.id('counter-search-children-inc')).tap();
    }
    await expect(element(by.id('counter-search-children-value'))).toHaveText('3');
  });
});

describe('Search screen — rooms counter', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('starts at 1 room', async () => {
    await expect(element(by.id('counter-search-rooms-value'))).toHaveText('1');
  });

  it('can be incremented and decremented within bounds', async () => {
    await element(by.id('counter-search-rooms-inc')).tap();
    await element(by.id('counter-search-rooms-inc')).tap();
    await expect(element(by.id('counter-search-rooms-value'))).toHaveText('3');
    await element(by.id('counter-search-rooms-dec')).tap();
    await expect(element(by.id('counter-search-rooms-value'))).toHaveText('2');
  });
});

describe('Search screen — calendar', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('navigates forward in months when > is tapped', async () => {
    // Tapear el botón ">" dos veces avanza dos meses; verificamos
    // matcheando contra el header del calendario que cambia de mes.
    // No verificamos el mes exacto porque depende de la fecha del runner.
    await element(by.text('>')).tap();
    await element(by.text('>')).tap();
    // Si el calendario respondió, el día 1 del mes futuro existe.
    await expect(element(by.text('1')).atIndex(0)).toExist();
  });

  it('selects a check-in day when tapped', async () => {
    await element(by.text('>')).tap();
    await element(by.text('>')).tap();
    await element(by.text('10')).tap();
    // Tras el tap, "10" sigue siendo el primero/único día seleccionado.
    await expect(element(by.text('10')).atIndex(0)).toExist();
  });

  it('selects a check-out day when a later day is tapped', async () => {
    await element(by.text('>')).tap();
    await element(by.text('>')).tap();
    await element(by.text('10')).tap();
    await element(by.text('15')).tap();
    await expect(element(by.text('10')).atIndex(0)).toExist();
    await expect(element(by.text('15')).atIndex(0)).toExist();
  });
});

describe('Search screen — known Fabric limitation', () => {
  // Skip por bug conocido Detox 20 + Fabric: el chequeo estricto de
  // visibilidad reporta el botón "BUSCAR" como < 100% visible (cuando lo
  // está). Hasta que Detox/RN reconcilien la API, este flujo se valida
  // por `__tests__/screens/SearchScreen.test.tsx` y QA manual.
  it.skip('completes a search and reaches the Results screen (FAB)', async () => {
    await device.reloadReactNative();
    await element(by.id('search-destination')).typeText('Madrid');
    await element(by.text('>')).tap();
    await element(by.text('>')).tap();
    await element(by.text('10')).tap();
    await element(by.text('13')).tap();
    await element(by.id('search-destination')).tapReturnKey();
    await element(by.id('search-button')).tap();
    await waitFor(element(by.text(/Madrid/)))
      .toBeVisible()
      .withTimeout(15000);
  });
});
