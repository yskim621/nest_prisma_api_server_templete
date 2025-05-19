import * as crypto from 'crypto';

// 🔒 단방향 해시 함수 (복호화 불가능, 비밀번호 검증용)
export function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// 🔑 암호학적으로 안전한 난수(salt) 생성 함수
export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

export function comparePassword(password: string, hashedPassword: string, salt: string): boolean {
  // console.log('🚀 ~ comparePassword ~ ', password, hashedPassword);
  const hash = hashPassword(password, salt);
  // console.log('🚀 ~ comparePassword ~ hash:', hash);
  return hash === hashedPassword;
}

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET_KEY).digest(); // 32 bytes key
const IV_LENGTH = 16; // AES block size

// 🔐 양방향 암호화 함수 (복호화 가능, 메시지나 기타 디비에 암호화해서 저장할 데이터)
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

// 🔓 양방향 복호화 함수
export function decrypt(encrypted: string): string {
  const [ivStr, data] = encrypted.split(':');
  const iv = Buffer.from(ivStr, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
