/**
 * Environment Configuration
 *
 * 모든 민감한 정보는 .env 파일에서 관리됩니다.
 * 기본값은 개발 환경에서만 사용되며, 프로덕션에서는 반드시 환경변수를 설정해야 합니다.
 */

// environment
const NODE_ENV: string = process.env.NODE_ENV || 'local';

// 프로덕션 환경에서 필수 환경변수 검증
const validateEnvVariables = (): void => {
  if (NODE_ENV === 'prod' || NODE_ENV === 'production') {
    const requiredVars = ['PRISMA_DATABASE_URL', 'ACCESS_TOKEN_SECRET_KEY', 'ENCRYPTION_SECRET_KEY', 'REDIS_PASSWORD'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
};

// 앱 시작시 검증 실행
validateEnvVariables();

// application
const SERVICE_DOMAIN: string = process.env.SERVICE_DOMAIN || 'localhost';
const PORT: number = +process.env.PORT || 4010;
const SOCKETPORT: number = +process.env.SOCKETPORT || 4011;
const FE_URL: string = process.env.FE_URL || 'http://localhost:3000';
const RATE_LIMIT_MAX: number = +process.env.RATE_LIMIT_MAX || 10000;

// bcrypt & security (민감 정보 - 반드시 .env에서 설정)
const SALT_ROUNDS: number = +process.env.SALT_ROUNDS || 10;
const ACCESS_TOKEN_SECRET_KEY: string = process.env.ACCESS_TOKEN_SECRET_KEY || '';
const REFRESH_TOKEN_SECRET_KEY: string = process.env.REFRESH_TOKEN_SECRET_KEY || '';
const ENCRYPTION_SECRET_KEY: string = process.env.ENCRYPTION_SECRET_KEY || '';
const ACCESS_TOKEN_EXPIRES_IN: string = process.env.ACCESS_TOKEN_EXPIRES_IN || '6h';
const REFRESH_TOKEN_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || '24h';

// database (민감 정보 - 반드시 .env에서 설정)
const PRISMA_DATABASE_URL: string = process.env.PRISMA_DATABASE_URL || '';

// aws
const AWS = {
  accessKeyId: process.env.ACCESS_KEY_ID || '',
  secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  s3: {
    host: 'https://s3-ap-northeast-2.amazonaws.com',
    bucket: NODE_ENV !== 'prod' ? 'mindsai-dev-files' : 'mindsai-files',
    frontPath:
      NODE_ENV !== 'prod'
        ? 'https://s3.ap-northeast-2.amazonaws.com/mindsai-dev-files'
        : 'https://s3.ap-northeast-2.amazonaws.com/mindsai-files',
    originUserImage: 'original',
    thumbnailUserImage: 'thumbnails',
  },
};

// redis (민감 정보 - 반드시 .env에서 설정)
const REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT: string = process.env.REDIS_PORT || '6379';
const REDIS_DB: string = process.env.REDIS_DB || '0';
const REDIS_USERNAME: string = process.env.REDIS_USERNAME || '';
const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';

export {
  NODE_ENV,
  SERVICE_DOMAIN,
  PORT,
  SOCKETPORT,
  FE_URL,
  RATE_LIMIT_MAX,
  SALT_ROUNDS,
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  ENCRYPTION_SECRET_KEY,
  PRISMA_DATABASE_URL,
  AWS,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_DB,
  REDIS_USERNAME,
  REDIS_PASSWORD,
};
