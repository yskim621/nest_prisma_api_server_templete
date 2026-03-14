import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SALT_ROUNDS } from 'src/environment';

/**
 * 비밀번호 해싱 (bcrypt 사용)
 * @param password 평문 비밀번호
 * @returns 해싱된 비밀번호
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 비밀번호 검증 (bcrypt 사용)
 * @param password 평문 비밀번호
 * @param hashedPassword 해싱된 비밀번호
 * @returns 일치 여부
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * 랜덤 사용자 코드 생성
 * @param id 사용자 ID
 * @returns 랜덤 코드
 */
export const createRandomUserCode = (id: string | number): string => {
  const salt = crypto.randomBytes(12).toString('base64');
  const userCode = crypto.pbkdf2Sync(String(id), salt, 99381, 16, 'sha512').toString('base64');
  return userCode;
};
