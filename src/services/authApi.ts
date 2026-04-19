export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  token?: string;
}

const API_BASE_URL = 'https://apitravelhub.site';
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/v1/auth/login`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/api/v1/auth/register`;

export interface RegisterParams {
  email: string;
  username: string;
  nombre: string;
  password: string;
  telefono?: string;
  pais?: string;
  idioma?: string;
  moneda_preferida?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const capitalize = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

const deriveNameFromEmail = (email: string): string => {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]/).filter(Boolean);
  return parts.map(capitalize).join(' ') || 'Usuario';
};

const toStringSafe = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return String(value);
  }
  return fallback;
};

const parseErrorMessage = (payload: unknown): string => {
  if (payload && typeof payload === 'object') {
    const detail = (payload as {detail?: unknown}).detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as {msg?: unknown};
      if (first && typeof first.msg === 'string') {
        return first.msg;
      }
    }
  }
  return 'No se pudo iniciar sesión';
};

const normalizeUser = (payload: unknown, email: string): User => {
  const obj = (payload ?? {}) as Record<string, unknown>;
  const nested = (obj.user ?? {}) as Record<string, unknown>;

  const pick = (key: string): unknown => obj[key] ?? nested[key];

  const resolvedEmail = toStringSafe(pick('email'), email);
  const id = toStringSafe(pick('id'), `user-${Date.now()}`);
  const nameFromApi = toStringSafe(
    pick('nombre') ?? pick('name') ?? pick('full_name'),
  );
  const name = nameFromApi || deriveNameFromEmail(resolvedEmail);
  const phone = toStringSafe(pick('telefono') ?? pick('phone'));
  const token =
    toStringSafe(obj.access_token) ||
    toStringSafe(obj.token) ||
    toStringSafe(nested.token);

  const user: User = {
    id,
    name,
    email: resolvedEmail,
  };
  if (phone.length > 0) {
    user.phone = phone;
  }
  if (token.length > 0) {
    user.token = token;
  }
  return user;
};

export const login = async (
  email: string,
  password: string,
): Promise<User> => {
  if (!email || !password) {
    throw new Error('Credenciales incompletas');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Correo inválido');
  }

  let response: Response;
  try {
    response = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({email, password}),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload));
  }

  return normalizeUser(payload, email);
};

export const register = async (params: RegisterParams): Promise<User> => {
  const {email, username, nombre, password} = params;
  if (!email || !username || !nombre || !password) {
    throw new Error('Faltan campos obligatorios');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Correo inválido');
  }
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }

  const body: Record<string, string> = {
    email,
    username,
    nombre,
    password,
  };
  if (params.telefono && params.telefono.length > 0) {
    body.telefono = params.telefono;
  }
  if (params.pais && params.pais.length > 0) {
    body.pais = params.pais;
  }
  if (params.idioma && params.idioma.length > 0) {
    body.idioma = params.idioma;
  }
  if (params.moneda_preferida && params.moneda_preferida.length > 0) {
    body.moneda_preferida = params.moneda_preferida;
  }

  let response: Response;
  try {
    response = await fetch(REGISTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload));
  }

  return normalizeUser(payload, email);
};
