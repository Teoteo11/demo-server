import CryptoJS from 'crypto-js';

export const transformPassword = (password: string, action: 'decrypt' | 'encrypt') => {
  return action === 'encrypt' 
  ? CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString()
  : CryptoJS.AES.decrypt(password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
}