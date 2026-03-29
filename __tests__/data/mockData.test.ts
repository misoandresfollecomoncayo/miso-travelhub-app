import {mockAccommodations, Accommodation} from '../../src/data/mockData';

describe('mockData', () => {
  it('contains 18 accommodations', () => {
    expect(mockAccommodations).toHaveLength(18);
  });

  it('each accommodation has required fields', () => {
    mockAccommodations.forEach((item: Accommodation) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('pricePerNight');
      expect(item).toHaveProperty('rating');
      expect(item).toHaveProperty('reviews');
      expect(item).toHaveProperty('image');
    });
  });

  it('all ids are unique', () => {
    const ids = mockAccommodations.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all ratings are between 1 and 5', () => {
    mockAccommodations.forEach(item => {
      expect(item.rating).toBeGreaterThanOrEqual(1);
      expect(item.rating).toBeLessThanOrEqual(5);
    });
  });

  it('all prices are positive', () => {
    mockAccommodations.forEach(item => {
      expect(item.pricePerNight).toBeGreaterThan(0);
    });
  });

  it('all images are valid URLs', () => {
    mockAccommodations.forEach(item => {
      expect(item.image).toMatch(/^https?:\/\//);
    });
  });
});
