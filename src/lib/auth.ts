const MIN_USERNAME = 3;
const MIN_PASSWORD = 6;

export interface StoredUser {
  username: string;
  salt: string;
  hash: string;
}

const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

export const normalizeUsername = (username: string): string => username.trim().toLowerCase();

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(new Uint8Array(digest));
};

export const createUser = async (users: StoredUser[], username: string, password: string): Promise<StoredUser[]> => {
  const name = normalizeUsername(username);

  if (name.length < MIN_USERNAME) {
    throw new Error(`El usuario debe tener al menos ${MIN_USERNAME} caracteres.`);
  }
  if (password.length < MIN_PASSWORD) {
    throw new Error(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
  }
  if (users.some((user) => user.username === name)) {
    throw new Error('Ese usuario ya existe.');
  }

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await hashPassword(password, salt);
  return [...users, { username: name, salt, hash }];
};

export const verifyUser = async (users: StoredUser[], username: string, password: string): Promise<boolean> => {
  const user = users.find((candidate) => candidate.username === normalizeUsername(username));
  if (!user) return false;

  return (await hashPassword(password, user.salt)) === user.hash;
};
