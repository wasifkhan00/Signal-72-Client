import { AuthStore } from "@store/AuthStore";
import localforage from "localforage";

// ********************************************************************************************************************************************************************************************************
export async function generateAndStoreRSAKeyPair(password: string): Promise<{
  privateKeyBuffer: Uint8Array;
  rsaPrivateKey: CryptoKey;
  privateKeyBase64: string;
  publicKey: CryptoKey;
  publicKeyBase64: string;
  // New encrypted versions for DB storage
  encryptedPrivateKeyForDB: string;
  encryptedPublicKeyForDB: string;
  // Salt and IVs needed for decryption
  saltBase64: string;
  privateKeyIVBase64: string;
  publicKeyIVBase64: string;
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

  // await storeRSAKeyInLocalForage(privateKey);
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
  // const iv = crypto.getRandomValues(new Uint8Array(12));
  const privateKeyIV = crypto.getRandomValues(new Uint8Array(12));
  const publicKeyIV = crypto.getRandomValues(new Uint8Array(12));

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
  const encryptedPrivateKey = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: privateKeyIV },
    aesKey,
    privateKeyBytes
  );

  const encryptedPublicKey = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: publicKeyIV },
    aesKey,
    publicKeyBytes
  );

  // 7. Convert encrypted keys to base64 for DB storage
  const encryptedPrivateKeyForDB = btoa(
    String.fromCharCode(...new Uint8Array(encryptedPrivateKey))
  );
  const encryptedPublicKeyForDB = btoa(
    String.fromCharCode(...new Uint8Array(encryptedPublicKey))
  );
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const privateKeyIVBase64 = btoa(String.fromCharCode(...privateKeyIV));
  const publicKeyIVBase64 = btoa(String.fromCharCode(...publicKeyIV));

  // 7. Save to localForage
  await localforage.setItem("rsa:privateKeyVault", {
    salt: Array.from(salt),
    iv: Array.from(privateKeyIV),
    encryptedKey: Array.from(new Uint8Array(encryptedPrivateKey)),
  });

  await localforage.setItem("rsa:publicKey", publicKeyBase64);

  // 8. Return the key data
  return {
    privateKeyBuffer: privateKeyBytes,
    rsaPrivateKey: privateKey,
    privateKeyBase64,
    publicKey,
    publicKeyBase64,

    // Encrypted versions for DB storage
    encryptedPrivateKeyForDB,
    encryptedPublicKeyForDB,
    saltBase64,
    privateKeyIVBase64,
    publicKeyIVBase64,
  };
}

// ***nEW aPPROACH****************************************************************************************************************************************************************************
// async function storeRSAKeyInLocalForage(privateKey: CryptoKey) {
//   await localforage.setItem("rsaPrivateKey", privateKey);

//   console.log("RSA private key securely saved in IndexedDB.");
// }
// ***nEW aPPROACH****************************************************************************************************************************************************************************
// ***nEW aPPROACH****************************************************************************************************************************************************************************
export async function unlockRSAPrivateKey({
  password,
  encryptedPrivateKey,
  encryptedPublicKey,
  saltBase64,
  privateKeyIVBase64,
  publicKeyIVBase64,
}: {
  password: string;
  encryptedPrivateKey?: string;
  encryptedPublicKey?: string;
  saltBase64?: string;
  privateKeyIVBase64?: string;
  publicKeyIVBase64?: string;
}): Promise<{
  privateKeyBuffer: Uint8Array;
  rsaPrivateKey: CryptoKey;
  privateKeyBase64: string;
  publicKey: CryptoKey;
  publicKeyBase64: string;
} | null> {
  try {
    // 1. FIRST: Try to get keys from LocalForage (original logic)
    const vault = await localforage.getItem<{
      salt: number[];
      iv: number[];
      encryptedKey: number[];
    }>("rsa:privateKeyVault");

    const publicKeyBase64 = await localforage.getItem<string>("rsa:publicKey");

    // If LocalForage has the keys, use the original logic
    if (vault && publicKeyBase64) {
      console.log("🔓 Using keys from LocalForage");

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

      return {
        privateKeyBuffer: new Uint8Array(rsaPrivateKeyDecryptedBuffer),
        rsaPrivateKey,
        privateKeyBase64,
        publicKey,
        publicKeyBase64,
      };
    }

    // 2. IF LocalForage doesn't have keys, check if DB parameters were provided
    if (
      !encryptedPrivateKey ||
      !encryptedPublicKey ||
      !saltBase64 ||
      !privateKeyIVBase64 ||
      !publicKeyIVBase64
    ) {
      console.error(
        "❌ RSA keys not found in LocalForage and DB parameters not provided"
      );
      return null;
    }

    console.log("🔓 Using keys from Database parameters");

    // 3. Use DB parameters to decrypt keys
    const salt = new Uint8Array(
      atob(saltBase64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const privateKeyIV = new Uint8Array(
      atob(privateKeyIVBase64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const publicKeyIV = new Uint8Array(
      atob(publicKeyIVBase64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const encryptedPrivateKeyBytes = new Uint8Array(
      atob(encryptedPrivateKey)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const encryptedPublicKeyBytes = new Uint8Array(
      atob(encryptedPublicKey)
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    // // 4. Derive AES key from password using stored salt
    const passwordBytes = new TextEncoder().encode(password);
    const pwKey = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedAESKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100_000,
        hash: "SHA-256",
      },
      pwKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // 5. Decrypt private key
    const rsaPrivateKeyDecryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: privateKeyIV },
      derivedAESKey,
      encryptedPrivateKeyBytes
    );

    // 6. Decrypt public key
    const rsaPublicKeyDecryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: publicKeyIV },
      derivedAESKey,
      encryptedPublicKeyBytes
    );

    // 7. Import decrypted keys as CryptoKey objects
    const rsaPrivateKey = await crypto.subtle.importKey(
      "pkcs8",
      rsaPrivateKeyDecryptedBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );

    const publicKey = await crypto.subtle.importKey(
      "spki",
      rsaPublicKeyDecryptedBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );

    // 8. Convert to base64 for consistency
    const privateKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(rsaPrivateKeyDecryptedBuffer))
    );
    const publicKeyBase64FromDB = btoa(
      String.fromCharCode(...new Uint8Array(rsaPublicKeyDecryptedBuffer))
    );

    // 9. Optionally store in LocalForage for next time
    await localforage.setItem("rsa:privateKeyVault", {
      salt: Array.from(salt),
      iv: Array.from(privateKeyIV),
      encryptedKey: Array.from(encryptedPrivateKeyBytes),
    });
    await localforage.setItem("rsa:publicKey", publicKeyBase64FromDB);

    return {
      privateKeyBuffer: new Uint8Array(rsaPrivateKeyDecryptedBuffer),
      rsaPrivateKey,
      privateKeyBase64,
      publicKey,
      publicKeyBase64: publicKeyBase64FromDB,
    };
  } catch (err) {
    console.error("❌ Failed to unlock RSA keys:", err);
    return null;
  }
}
// *******************************************************************************************************************************************************************************
