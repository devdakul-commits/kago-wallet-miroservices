export const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^(?:\+234|0)?[789]\d{9}$/;
export const bvnRegex = /^\d{11}$/;
export const ninRegex = /^\d{11}$/;

export function sanitizeString(value: unknown) {
  return String(value ?? '').trim();
}

export function validateEmail(email: string): [boolean, string] {
  const normalized = sanitizeString(email);
  if (!normalized) {
    return [false, 'Email is required'];
  }
  if (normalized.length > 255) {
    return [false, 'Email is too long'];
  }
  if (!emailRegex.test(normalized)) {
    return [false, 'Invalid email format'];
  }
  return [true, ''];
}

export function validatePhone(phone: string): [boolean, string] {
  const normalized = sanitizeString(phone);
  if (!normalized) {
    return [false, 'Phone number is required'];
  }
  if (!phoneRegex.test(normalized)) {
    return [false, 'Invalid Nigerian phone number'];
  }
  return [true, ''];
}

export function validateBVN(bvn: string): [boolean, string] {
  const normalized = sanitizeString(bvn);
  if (!normalized) {
    return [false, ''];
  }
  if (!bvnRegex.test(normalized)) {
    return [false, 'BVN must be 11 digits'];
  }
  return [true, ''];
}

export function validateNIN(nin: string): [boolean, string] {
  const normalized = sanitizeString(nin);
  if (!normalized) {
    return [false, ''];
  }
  if (!ninRegex.test(normalized)) {
    return [false, 'NIN must be 11 digits'];
  }
  return [true, ''];
}

export function validateBusinessName(name: string): [boolean, string] {
  const normalized = sanitizeString(name);
  if (!normalized) {
    return [false, 'Business name is required'];
  }
  if (normalized.length < 2) {
    return [false, 'Business name must be at least 2 characters'];
  }
  if (normalized.length > 100) {
    return [false, 'Business name is too long'];
  }
  return [true, ''];
}

export function validateOwnerName(name: string): [boolean, string] {
  const normalized = sanitizeString(name);
  if (!normalized) {
    return [false, 'Owner name is required'];
  }
  if (normalized.length < 2) {
    return [false, 'Owner name must be at least 2 characters'];
  }
  if (normalized.length > 100) {
    return [false, 'Owner name is too long'];
  }
  return [true, ''];
}
