/**
 * Smoke tests — la app arranca y los elementos clave de cada pantalla
 * renderizan.
 *
 * NOTA SOBRE BOTTOM TABS:
 * Detox 20 + RN 0.84 (Fabric) tienen un bug conocido donde el chequeo
 * estricto de visibilidad (100%) reporta los botones del bottom-tab como
 * "not 100% visible" — incluso cuando lo están. La causa es cómo Fabric
 * calcula visibleBounds para los hijos del `BottomTabBar`.
 *
 * Para evitar ese bug, los tests que dependen de navegar entre tabs
 * (Reservas, Usuario) se cubren con pruebas unitarias del navigator
 * (`__tests__/navigation/`) + QA manual. Las pruebas E2E se concentran
 * en flujos in-screen de la pantalla de Search (tab por defecto).
 */
describe('Smoke', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('launches and renders the Search screen title', async () => {
    await expect(element(by.text('Buscar hospedaje'))).toBeVisible();
  });

  it('renders the search input with destination placeholder', async () => {
    await expect(element(by.id('search-destination'))).toBeVisible();
  });

  it('renders the three bottom tabs', async () => {
    // Usamos testIDs (cross-platform) en vez de accessibilityLabel —
    // `accessibilityLabel="X, tab, Y of N"` es un formato de iOS que
    // React Navigation no replica idénticamente en Android.
    await expect(element(by.id('tab-search'))).toExist();
    await expect(element(by.id('tab-reservations'))).toExist();
    await expect(element(by.id('tab-user'))).toExist();
  });

  it('renders the three counters (adults, children, rooms)', async () => {
    await expect(element(by.id('counter-search-adults-value'))).toBeVisible();
    await expect(element(by.id('counter-search-children-value'))).toBeVisible();
    await expect(element(by.id('counter-search-rooms-value'))).toBeVisible();
  });

  it('renders the calendar with the navigation chevrons', async () => {
    await expect(element(by.text('<'))).toExist();
    await expect(element(by.text('>'))).toExist();
  });

  it('renders the day-of-week headers in the calendar', async () => {
    await expect(element(by.text('Lun'))).toBeVisible();
    await expect(element(by.text('Sáb'))).toBeVisible();
  });

  it('lets the user type a destination', async () => {
    await element(by.id('search-destination')).typeText('Madrid');
    await expect(element(by.text('Madrid'))).toBeVisible();
  });
});
