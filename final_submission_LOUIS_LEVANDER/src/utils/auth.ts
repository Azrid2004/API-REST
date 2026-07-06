export const generateFakeToken = (username: string) => {
  return Buffer.from(username, 'utf-8').toString('base64');
}

export const validateFakeToken = (token: string) => {
  return Buffer.from(token, 'base64').toString('utf-8');
}
