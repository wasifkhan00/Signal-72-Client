import localforage from "localforage";

interface RSAKeyPair {
  privateKeyBuffer: ArrayBuffer;
  privateKeyBase64: string;
  publicKey: CryptoKey;
  publicKeyBase64: string;
  rsaPrivateKey: CryptoKey;
}

export const createSessionKeyAndCacheRSAKey = async (
  unlockRSAKeyPairs: RSAKeyPair
) => {
  // 1. Generate AES session key
  const sessionKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // 2. Export key to base64
  const sessionKeyBuffer = await crypto.subtle.exportKey("raw", sessionKey);
  const sessionKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(sessionKeyBuffer))
  );

  console.log(unlockRSAKeyPairs);
  // 3. Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // 4. Encrypt RSA private key
  const encryptedRSAPrivateKey = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sessionKey,
    unlockRSAKeyPairs.privateKeyBuffer
  );

  // 5. Save encrypted RSA key, IV, and publicKeyBase64
  await localforage.setItem("encryptedRSAKey", encryptedRSAPrivateKey);
  await localforage.setItem("rsaEncryptionIV", iv);
  await localforage.setItem(
    "rsaPublicKeyBase64",
    unlockRSAKeyPairs.publicKeyBase64
  );

  // 6. Save session key (memory + sessionStorage)
  (window as any).sessionAppKeyBase64 = sessionKeyBase64;
  sessionStorage.setItem("sessionAppKeyBase64", sessionKeyBase64);

  return {
    sessionKeyBase64,
    encryptedRSAPrivateKey,
    publicKeyBase64: unlockRSAKeyPairs.publicKeyBase64,
  };
};

// export const createSessionKeyAndCacheGeneratedRSAKey = async (
//   rsaPrivateKeyEncrypted: ArrayBuffer | CryptoKey,
//   rsaPublicKeyBase64: string
// ) => {
//   // 1. Generate AES session key
//   const sessionKey = await crypto.subtle.generateKey(
//     { name: "AES-GCM", length: 256 },
//     true,
//     ["encrypt", "decrypt"]
//   );

//   // 2. Export session key to base64
//   const sessionKeyBuffer = await crypto.subtle.exportKey("raw", sessionKey);
//   const sessionKeyBase64 = btoa(
//     String.fromCharCode(...new Uint8Array(sessionKeyBuffer))
//   );

//   // 3. Generate IV
//   const iv = crypto.getRandomValues(new Uint8Array(12));

//   // 4. Encrypt RSA private key using sessionKey
//   const encryptedRSAPrivateKey = await crypto.subtle.encrypt(
//     { name: "AES-GCM", iv },
//     sessionKey,
//     rsaPrivateKeyEncrypted
//   );

//   // 5. Save everything locally
//   await localforage.setItem("encryptedRSAKey", encryptedRSAPrivateKey);
//   await localforage.setItem("rsaEncryptionIV", iv);
//   await localforage.setItem("rsaPublicKeyBase64", rsaPublicKeyBase64);

//   // 6. Save session key to memory/sessionStorage
//   (window as any).sessionAppKeyBase64 = sessionKeyBase64;
//   sessionStorage.setItem("sessionAppKeyBase64", sessionKeyBase64);

//   return {
//     sessionKeyBase64,
//     encryptedRSAPrivateKey,
//     publicKeyBase64: rsaPublicKeyBase64,
//   };
// };
