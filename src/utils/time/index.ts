export const getCurrentTime = (): Date => {
  const offset = 1000 * 60 * 60 * 9;
  const koreaNow = new Date(new Date().getTime() + offset);
  return koreaNow;
};

export const changeKoreaTime = (date): Date => {
  const offset = 1000 * 60 * 60 * 9;
  const koreaNow = new Date(date.getTime() + offset);
  return koreaNow;
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
