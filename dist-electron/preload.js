import { contextBridge, ipcRenderer } from "electron";
import * as crypto from "crypto";
const cryptoAPI = {
  // Base64
  base64Encode: (str) => Buffer.from(str).toString("base64"),
  base64Decode: (str) => Buffer.from(str, "base64").toString("utf-8"),
  // Hash
  hash: (algorithm, data) => {
    const hash = crypto.createHash(algorithm);
    hash.update(data);
    return hash.digest("hex");
  },
  // AES
  generateKey: () => crypto.randomBytes(32).toString("hex"),
  generateIV: () => crypto.randomBytes(16).toString("hex"),
  aesEncrypt: (data, key, iv) => {
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  },
  aesDecrypt: (data, key, iv) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },
  // RSA
  generateRSAKeyPair: () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
      }
    });
    return { publicKey, privateKey };
  },
  rsaEncrypt: (data, publicKey) => {
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(data)
    );
    return encrypted.toString("base64");
  },
  rsaDecrypt: (data, privateKey) => {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(data, "base64")
    );
    return decrypted.toString("utf8");
  }
};
contextBridge.exposeInMainWorld("electronAPI", {
  // IPC 通信
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  once: (channel, func) => {
    ipcRenderer.once(channel, (event, ...args) => func(...args));
  },
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  },
  // Crypto API
  crypto: cryptoAPI
});
