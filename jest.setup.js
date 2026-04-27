jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('react-native-qrcode-svg', () => 'QRCode');

jest.mock('react-native-svg', () => {
  const React = require('react');
  const Mock = (name) => (props) => React.createElement(name, props, props.children);
  return {
    __esModule: true,
    default: Mock('Svg'),
    Svg: Mock('Svg'),
    Circle: Mock('Circle'),
    Ellipse: Mock('Ellipse'),
    G: Mock('G'),
    Text: Mock('SvgText'),
    TSpan: Mock('TSpan'),
    TextPath: Mock('TextPath'),
    Path: Mock('Path'),
    Polygon: Mock('Polygon'),
    Polyline: Mock('Polyline'),
    Line: Mock('Line'),
    Rect: Mock('Rect'),
    Use: Mock('Use'),
    Image: Mock('SvgImage'),
    Symbol: Mock('Symbol'),
    Defs: Mock('Defs'),
    LinearGradient: Mock('LinearGradient'),
    RadialGradient: Mock('RadialGradient'),
    Stop: Mock('Stop'),
    ClipPath: Mock('ClipPath'),
    Pattern: Mock('Pattern'),
    Mask: Mock('Mask'),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key) => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key, value) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
      multiGet: jest.fn((keys) =>
        Promise.resolve(keys.map((k) => [k, store[k] ?? null])),
      ),
      multiSet: jest.fn((entries) => {
        entries.forEach(([k, v]) => {
          store[k] = v;
        });
        return Promise.resolve();
      }),
      multiRemove: jest.fn((keys) => {
        keys.forEach((k) => {
          delete store[k];
        });
        return Promise.resolve();
      }),
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}) => children,
  SafeAreaView: ({children}) => children,
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      destination: 'Cartagena, Colombia',
      dateRange: '19 enero 2026 - 23 enero 2026',
      adults: 2,
      children: 0,
    },
  }),
  NavigationContainer: ({children}) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));
