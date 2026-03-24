const KOREA_TIMEZONE = 'Asia/Seoul';

export const getCurrentTime = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: KOREA_TIMEZONE }));
};

export const changeKoreaTime = (date: Date): Date => {
  return new Date(date.toLocaleString('en-US', { timeZone: KOREA_TIMEZONE }));
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
