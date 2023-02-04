import jwt from 'jsonwebtoken';

export const generateToken = (payload: any, token: 'access' | 'refresh', expiresIn: string) => {
  return jwt.sign(
    { payload },
    process.env[`${token === 'access' ? 'ACCESS_TOKEN_KEY' : 'REFRESH_TOKEN_KEY'}`],
    { expiresIn }
  );
}