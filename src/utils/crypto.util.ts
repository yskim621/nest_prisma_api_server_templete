import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * 암호화 키 검증 및 생성
 * 프로덕션 환경에서는 반드시 ENCRYPTION_SECRET_KEY 환경변수가 설정되어야 함
 */
function getEncryptionKey(): Buffer {
  const secretKey = process.env.ENCRYPTION_SECRET_KEY;

  if (!secretKey || secretKey.trim() === '') {
    const nodeEnv = process.env.NODE_ENV || 'local';
    if (nodeEnv === 'prod' || nodeEnv === 'production') {
      throw new Error('ENCRYPTION_SECRET_KEY 환경변수가 설정되지 않았습니다. 프로덕션 환경에서는 필수입니다.');
    }
    console.warn('[WARNING] ENCRYPTION_SECRET_KEY가 설정되지 않았습니다. 개발 환경에서만 허용됩니다.');
    // 개발 환경에서는 임시 키 사용 (프로덕션에서는 절대 사용 금지)
    return crypto.createHash('sha256').update('dev-only-temp-key').digest();
  }

  return crypto.createHash('sha256').update(secretKey).digest();
}

// 지연 초기화를 통해 환경변수 로드 타이밍 문제 해결
let _encryptionKey: Buffer | null = null;
function getKey(): Buffer {
  if (!_encryptionKey) {
    _encryptionKey = getEncryptionKey();
  }
  return _encryptionKey;
}

/**
 * 양방향 암호화 함수 (복호화 가능)
 * 메시지나 DB에 암호화해서 저장할 데이터에 사용
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

/**
 * 양방향 복호화 함수
 */
export function decrypt(encrypted: string): string {
  const [ivStr, data] = encrypted.split(':');
  if (!ivStr || !data) {
    throw new Error('잘못된 암호화 데이터 형식입니다.');
  }
  const iv = Buffer.from(ivStr, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * 암호학적으로 안전한 난수(salt) 생성 함수
 */
export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString('hex');
}
