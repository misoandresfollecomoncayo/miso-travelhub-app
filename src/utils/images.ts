export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400';

const isValidUrl = (value: string): boolean => /^https?:\/\//i.test(value);

export const resolveImage = (images: string[]): string => {
  const first = images[0];
  if (first && isValidUrl(first)) {
    return first;
  }
  return PLACEHOLDER_IMAGE;
};

export const resolveImageList = (images: string[]): string[] => {
  const valid = images.filter(img => typeof img === 'string' && isValidUrl(img));
  if (valid.length === 0) {
    return [PLACEHOLDER_IMAGE];
  }
  return valid;
};
