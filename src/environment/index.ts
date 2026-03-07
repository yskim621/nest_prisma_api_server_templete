// environment
const NODE_ENV: string = process.env.NODE_ENV || 'local';

// application
const SERVICE_DOMAIN: string = process.env.SERVICE_DOMAIN || 'localhost';
const PORT: number = +process.env.PORT || 4010;
const SOCKETPORT: number = +process.env.SOCKETPORT || 4011;
const FE_URL: string = process.env.FE_URL || 'xxx';
const RATE_LIMIT_MAX: number = +process.env.RATE_LIMIT_MAX || 10000;

// bcrypt
const SALT: string = process.env.SALT || 'bcrypt_default_salt';
const ACCESS_TOKEN_SECRET_KEY: string = process.env.ACCESS_TOKEN_SECRET_KEY || 'your_access_jwt_token_secret_key';
const ENCRYPTION_SECRET_KEY: string = process.env.ENCRYPTION_SECRET_KEY || 'f82a36b2e7987809847c2ca49ed79017f2e0a7582f2f94807ce5b8c54a6378f4';

// database
const PRISMA_DATABASE_URL: string = process.env.PRISMA_DATABASE_URL || 'mysql://yskim621:930621tjr!@localhost:3306/mindsai_platform?connection_limit=20';

// aws
const AWS = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  s3: {
    host: 'https://s3-ap-northeast-2.amazonaws.com',
    bucket: process.env.NODE_ENV != 'prod' ? 'mindsai-dev-files' : 'mindsai-files',
    frontPath:
      process.env.NODE_ENV != 'prod' ? 'https://s3.ap-northeast-2.amazonaws.com/mindsai-dev-files' : 'https://s3.ap-northeast-2.amazonaws.com/mindsai-files',
    originUserImage: 'original',
    thumbnailUserImage: 'thumbnails',
  },
};

// redis
const REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT: string = process.env.REDIS_PORT || '6379';
const REDIS_DB: string = process.env.REDIS_DB || '0';
const REDIS_USERNAME: string = process.env.REDIS_USERNAME || '';
const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';


export { NODE_ENV, SERVICE_DOMAIN, PORT, SOCKETPORT, FE_URL, RATE_LIMIT_MAX, SALT, ACCESS_TOKEN_SECRET_KEY, PRISMA_DATABASE_URL, AWS, REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_USERNAME };
