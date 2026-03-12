import * as crypto from 'crypto';

export const generatePassword = async (password: string, salt: string): Promise<string> => {
  const full_string = salt + password;
  const secret = await crypto.createHash('sha256').update(full_string).digest('hex');
  return secret;
};

export const comparePassword = async (password: string, salt: string, secret: string): Promise<boolean> => {
  const full_string = salt + password;
  const secret_compare = await crypto.createHash('sha256').update(full_string).digest('hex');
  return secret_compare === secret;
};

export const createRandomUserCode = (id) => {
  const salt = crypto.randomBytes(12).toString('base64');
  const userCode = crypto.pbkdf2Sync(id, salt, 99381, 16, 'sha512').toString('base64');
  return userCode;
};
