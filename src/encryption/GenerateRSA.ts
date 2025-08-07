import { AuthStore } from "@store/AuthStore";
import localforage from "localforage";

// export async function generateAndStoreRSAKeyPair(password: string) {
//   // 1. Generate RSA-OAEP key pair
//   const rsaKeyPair = await crypto.subtle.generateKey(
//     {
//       name: "RSA-OAEP",
//       modulusLength: 4096,
//       publicExponent: new Uint8Array([1, 0, 1]),
//       hash: "SHA-256",
//     },
//     true,
//     ["encrypt", "decrypt"]
//   );

//   // 2. Export and base64 encode public key to send to server
//   const exportedRSAPublicKey = await crypto.subtle.exportKey(
//     "spki",
//     rsaKeyPair.publicKey
//   );
//   const rsaPublicKeyBase64 = btoa(
//     String.fromCharCode(...new Uint8Array(exportedRSAPublicKey))
//   );

//   // 3. Export RSA private key (PKCS8 raw format)
//   const exportedRSAPrivateKey = await crypto.subtle.exportKey(
//     "pkcs8",
//     rsaKeyPair.privateKey
//   );

//   // 4. Derive AES key from password (PBKDF2)
//   const passwordBytes = new TextEncoder().encode(password);
//   const pwKey = await crypto.subtle.importKey(
//     "raw",
//     passwordBytes,
//     "PBKDF2",
//     false,
//     ["deriveKey"]
//   );

//   const salt = crypto.getRandomValues(new Uint8Array(16));
//   const derivedAESKeyForPrivateRSA = await crypto.subtle.deriveKey(
//     {
//       name: "PBKDF2",
//       salt,
//       iterations: 100_000,
//       hash: "SHA-256",
//     },
//     pwKey,
//     { name: "AES-GCM", length: 256 },
//     true,
//     ["encrypt", "decrypt"]
//   );

//   // 5. Encrypt the private RSA key using the derived AES key
//   const iv = crypto.getRandomValues(new Uint8Array(12));
//   const rsaPrivateKeyEncrypted = await crypto.subtle.encrypt(
//     { name: "AES-GCM", iv },
//     derivedAESKeyForPrivateRSA,
//     exportedRSAPrivateKey
//   );

//   // 6. Store the encrypted private key vault in local storage
//   await localforage.setItem("rsa:privateKeyVault", {
//     salt: Array.from(salt),
//     iv: Array.from(iv),
//     encryptedKey: Array.from(new Uint8Array(rsaPrivateKeyEncrypted)),
//   });
//   //setting public key in the localforage as well raw
//   await localforage.setItem("rsa:publicKey", rsaPublicKeyBase64);

//   // const { setRSAKeyPairs } = AuthStore();

//   // setRSAKeyPairs({
//   //   rsaPrivateKey: rsaPrivateKeyEncrypted,
//   //   rsaPublicKey: rsaPublicKeyBase64,
//   // });

//   return { rsaPrivateKeyEncrypted, rsaPublicKeyBase64 }; // 🔑 Send this to your server to share with other users
// }
// ********************************************************************************************************************************************************************************************************
export async function generateAndStoreRSAKeyPair(password: string): Promise<{
  privateKeyBuffer: Uint8Array;
  rsaPrivateKey: CryptoKey;
  privateKeyBase64: string;
  publicKey: CryptoKey;
  publicKeyBase64: string;
}> {
  // 1. Generate RSA key pair
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  // 2. Export keys
  const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", privateKey);
  const exportedPublicKey = await crypto.subtle.exportKey("spki", publicKey);

  // 3. Convert exported keys to Uint8Array
  const privateKeyBytes = new Uint8Array(exportedPrivateKey);
  const publicKeyBytes = new Uint8Array(exportedPublicKey);

  // 4. Base64 encode for storage
  const privateKeyBase64 = btoa(String.fromCharCode(...privateKeyBytes));
  const publicKeyBase64 = btoa(String.fromCharCode(...publicKeyBytes));

  // 5. Derive AES key from password
  const passwordBytes = new TextEncoder().encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const pwKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    pwKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // 6. Encrypt private key
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    privateKeyBytes
  );

  // 7. Save to localForage
  await localforage.setItem("rsa:privateKeyVault", {
    salt: Array.from(salt),
    iv: Array.from(iv),
    encryptedKey: Array.from(new Uint8Array(encryptedKey)),
  });

  await localforage.setItem("rsa:publicKey", publicKeyBase64);

  // 8. Return the key data
  return {
    privateKeyBuffer: privateKeyBytes,
    rsaPrivateKey: privateKey,
    privateKeyBase64,
    publicKey,
    publicKeyBase64,
  };
}

// ********************************************************************************************************************************************************************************************************
export async function unlockRSAPrivateKey(
  password: string
): Promise<{ privateKey: CryptoKey; publicKey: CryptoKey } | null> {
  const vault = await localforage.getItem<{
    salt: number[];
    iv: number[];
    encryptedKey: number[];
  }>("rsa:privateKeyVault");

  const publicKeyBase64 = await localforage.getItem<string>("rsa:publicKey");

  if (!vault || !publicKeyBase64) {
    console.error("❌ RSA key(s) not found.");
    return null;
  }

  try {
    const passwordBytes = new TextEncoder().encode(password);
    const pwKey = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedAESKeyForPrivateRSA = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new Uint8Array(vault.salt),
        iterations: 100_000,
        hash: "SHA-256",
      },
      pwKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const rsaPrivateKeyDecryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(vault.iv) },
      derivedAESKeyForPrivateRSA,
      new Uint8Array(vault.encryptedKey)
    );

    const rsaPrivateKey = await crypto.subtle.importKey(
      "pkcs8",
      rsaPrivateKeyDecryptedBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );

    // Convert ArrayBuffer to base64 for storage
    const privateKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(rsaPrivateKeyDecryptedBuffer))
    );
    const publicKeyRaw = Uint8Array.from(atob(publicKeyBase64), (c) =>
      c.charCodeAt(0)
    );
    const publicKey = await crypto.subtle.importKey(
      "spki",
      publicKeyRaw.buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );

    // return { rsaPrivateKey, publicKey };
    return {
      privateKeyBuffer: new Uint8Array(
        await crypto.subtle.exportKey("pkcs8", rsaPrivateKey)
      ),
      rsaPrivateKey,
      privateKeyBase64,
      publicKey,
      publicKeyBase64, // 👈 include this for comparison!
    };
  } catch (err) {
    console.error("❌ Failed to unlock RSA private key:", err);
    return null;
  }
}
