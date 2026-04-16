export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const capitalize = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

const deriveNameFromIdentifier = (identifier: string): string => {
  if (EMAIL_REGEX.test(identifier)) {
    const local = identifier.split('@')[0];
    const parts = local.split(/[._-]/).filter(Boolean);
    return parts.map(capitalize).join(' ') || 'Usuario';
  }
  return 'Usuario';
};

const simulateDelay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const login = async (
  identifier: string,
  password: string,
): Promise<User> => {
  await simulateDelay(1000);

  if (!identifier || !password) {
    throw new Error('Credenciales incompletas');
  }

  const isEmail = EMAIL_REGEX.test(identifier);
  const name = deriveNameFromIdentifier(identifier);

  return {
    id: `user-${Date.now()}`,
    name,
    email: isEmail ? identifier : '',
    phone: isEmail ? undefined : identifier,
  };
};
