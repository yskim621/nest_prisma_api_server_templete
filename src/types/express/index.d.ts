import { UserPayload } from '../../common/Auth.interface';
// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      ip?: string;
    }
  }
}
