import { createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPT_METHOD = 'aes-256-cbc'; // 暗号化方式
const ENCRYPTION_KEY = 'HH95XH7sYAbznRBJSUE9W8RQxzQIGSpy'; // 32Byte. このまま利用しないこと！
const BUFFER_KEY = 'RfHBdAR5RJHqp5wm'; // 16Byte. このまま利用しないこと！
const ENCODING = 'hex'; // 暗号化時のencoding
const UTF8 = 'utf8';

/**
 * encrypt
 * 暗号化
 * @param {string} text - 暗号化対象の文字列
 * @returns {string} - 暗号化した文字列
 */
export const encrypt = (text: string): string => {
  const cipher = createCipheriv(ENCRYPT_METHOD, Buffer.from(ENCRYPTION_KEY), BUFFER_KEY);
  let encrypted = cipher.update(text, UTF8, ENCODING);
  encrypted += cipher.final(ENCODING);
  return encrypted;
};

/**
 * decrypt
 * 復号化
 * @param {string} encrypted - 復号化対象の文字列
 * @returns {string} 復号化した文字列
 */
export const decrypt = (encrypted: string): string => {
  const decipher = createDecipheriv(ENCRYPT_METHOD, Buffer.from(ENCRYPTION_KEY), BUFFER_KEY);
  let decrypted = decipher.update(encrypted, ENCODING, UTF8);
  decrypted += decipher.final(UTF8);
  return decrypted;
};
