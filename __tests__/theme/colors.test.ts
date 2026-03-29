import {Colors} from '../../src/theme/colors';

describe('Colors', () => {
  it('exports primary color', () => {
    expect(Colors.primary).toBe('#1565C0');
  });

  it('exports primaryDark color', () => {
    expect(Colors.primaryDark).toBe('#0D47A1');
  });

  it('exports accent color', () => {
    expect(Colors.accent).toBe('#FDD835');
  });

  it('exports white and black', () => {
    expect(Colors.white).toBe('#FFFFFF');
    expect(Colors.black).toBe('#000000');
  });

  it('exports gray variants', () => {
    expect(Colors.gray).toBe('#9E9E9E');
    expect(Colors.grayLight).toBe('#F5F5F5');
    expect(Colors.grayBorder).toBe('#E0E0E0');
  });

  it('exports text colors', () => {
    expect(Colors.textPrimary).toBe('#212121');
    expect(Colors.textSecondary).toBe('#757575');
  });

  it('exports star colors', () => {
    expect(Colors.star).toBe('#FFC107');
    expect(Colors.starEmpty).toBe('#E0E0E0');
  });

  it('has all expected keys', () => {
    const expectedKeys = [
      'primary', 'primaryDark', 'accent', 'white', 'black',
      'gray', 'grayLight', 'grayBorder', 'textPrimary',
      'textSecondary', 'star', 'starEmpty',
    ];
    expectedKeys.forEach(key => {
      expect(Colors).toHaveProperty(key);
    });
  });
});
