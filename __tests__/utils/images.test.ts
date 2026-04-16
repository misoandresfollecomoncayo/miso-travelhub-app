import {
  PLACEHOLDER_IMAGE,
  resolveImage,
  resolveImageList,
} from '../../src/utils/images';

describe('resolveImage', () => {
  it('returns first https URL when available', () => {
    expect(resolveImage(['https://example.com/a.jpg'])).toBe(
      'https://example.com/a.jpg',
    );
  });

  it('returns first http URL when available', () => {
    expect(resolveImage(['http://example.com/a.jpg'])).toBe(
      'http://example.com/a.jpg',
    );
  });

  it('returns placeholder for empty array', () => {
    expect(resolveImage([])).toBe(PLACEHOLDER_IMAGE);
  });

  it('returns placeholder for invalid URL', () => {
    expect(resolveImage(['not-a-url'])).toBe(PLACEHOLDER_IMAGE);
  });

  it('returns placeholder when first image is empty string', () => {
    expect(resolveImage([''])).toBe(PLACEHOLDER_IMAGE);
  });
});

describe('resolveImageList', () => {
  it('returns all valid URLs', () => {
    const input = ['https://a.com/1.jpg', 'http://b.com/2.jpg'];
    expect(resolveImageList(input)).toEqual(input);
  });

  it('filters out invalid URLs', () => {
    const input = ['https://a.com/1.jpg', 'invalid', ''];
    expect(resolveImageList(input)).toEqual(['https://a.com/1.jpg']);
  });

  it('returns placeholder list when all invalid', () => {
    expect(resolveImageList(['', 'invalid'])).toEqual([PLACEHOLDER_IMAGE]);
  });

  it('returns placeholder list for empty array', () => {
    expect(resolveImageList([])).toEqual([PLACEHOLDER_IMAGE]);
  });
});
