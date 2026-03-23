// Express Request 타입 확장
export {};

declare global {
  namespace Express {
    interface User {
      userId: number;
      email: string;
      role: string;
      type: 'access' | 'refresh';
    }
  }
}
