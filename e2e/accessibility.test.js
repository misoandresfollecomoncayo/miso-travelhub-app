/**
 * Pruebas E2E de accesibilidad.
 *
 * Estos tests corren tanto en iOS (a través de VoiceOver-equivalent en el
 * Simulator) como en Android (TalkBack-equivalent en el emulador), porque
 * la API de Detox `by.label()`, `by.id()`, `by.traits()` se mapea a las
 * APIs nativas de accesibilidad de cada plataforma.
 *
 * NOTA: no se simula realmente VoiceOver/TalkBack — pero al matchear por
 * `accessibilityLabel` y `accessibilityRole` garantizamos que esas APIs
 * recibirán el árbol semántico correcto si el usuario las activa.
 */
describe('A11y — Search screen', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('the destination input is reachable by its accessibilityLabel', async () => {
    // Hay varios elementos con la palabra "Destino:" (Text del label + el
    // propio TextInput con accessibilityLabel). Detox matchea por índice;
    // verificamos sólo que al menos uno existe en el árbol semántico.
    await expect(element(by.label('Destino:')).atIndex(0)).toExist();
  });

  it('the search button is reachable by its accessibilityLabel', async () => {
    // `by.label('BUSCAR')` en Android matchea por contentDescription O por
    // texto de TextView, así que cae el ReactViewGroup del botón
    // (accessibilityLabel="BUSCAR") *y* el `<Text>BUSCAR</Text>` interno —
    // ambiguo. Disambiguamos con atIndex(0): el primer match es el botón,
    // que es lo que valida la prueba (presencia en el árbol de a11y).
    // toExist en vez de toBeVisible porque el botón está al final del scroll.
    await expect(element(by.label('BUSCAR')).atIndex(0)).toExist();
  });

  it('the counter increment buttons have accessible labels', async () => {
    await expect(
      element(by.label('Aumentar Número de adultos')),
    ).toBeVisible();
    await expect(
      element(by.label('Aumentar Número de niños')),
    ).toBeVisible();
    await expect(
      element(by.label('Aumentar Número de habitaciones')),
    ).toBeVisible();
  });

  it('the counter decrement buttons have accessible labels', async () => {
    await expect(
      element(by.label('Disminuir Número de adultos')),
    ).toBeVisible();
    await expect(
      element(by.label('Disminuir Número de niños')),
    ).toBeVisible();
    await expect(
      element(by.label('Disminuir Número de habitaciones')),
    ).toBeVisible();
  });

  it('the three tabs expose accessibility tags (testID)', async () => {
    // El formato exacto del accessibilityLabel difiere entre iOS
    // ("X, tab, Y of N") y Android (sólo el nombre). Verificamos vía
    // testID que React Navigation expone en ambas plataformas.
    await expect(element(by.id('tab-search'))).toExist();
    await expect(element(by.id('tab-reservations'))).toExist();
    await expect(element(by.id('tab-user'))).toExist();
  });
});

describe('A11y — interactive counter via accessibility label', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('the adults counter increments when tapped by its label', async () => {
    // Validamos que un usuario con tecnología de asistencia puede usar el
    // contador sin depender del testID, sólo con el accessibilityLabel.
    await element(by.label('Aumentar Número de adultos')).tap();
    await element(by.label('Aumentar Número de adultos')).tap();
    await expect(element(by.id('counter-search-adults-value'))).toHaveText('3');
  });
});
