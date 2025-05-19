// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CommonResponse<T = any> {
  success: boolean;
  message: string;
  code: number;
  data?: T;
}

export function getCommonResponse<T>(): CommonResponse<T> {
  return {
    success: false,
    message: 'not working',
    code: 0,
    data: undefined,
  };
}
