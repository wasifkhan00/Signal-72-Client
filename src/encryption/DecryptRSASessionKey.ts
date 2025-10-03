import localforage from "localforage";

interface DecryptedRSAKeys {
  rsaPrivateKey: ArrayBuffer;
  rsaPublicKey: string; // base64
}

export const decryptRSAKeyFromSessionKey =
  async (): Promise<DecryptedRSAKeys | null> => {
    try {
      const sessionKeyBase64 =
        (window as any).sessionAppKeyBase64 ||
        (await localforage.getItem("sessionAppKeyBase64"));

      if (!sessionKeyBase64) throw new Error("Session key not found.");

      // Decode session key
      const sessionKeyRaw = Uint8Array.from(atob(sessionKeyBase64), (c) =>
        c.charCodeAt(0)
      );

      const sessionKey = await crypto.subtle.importKey(
        "raw",
        sessionKeyRaw,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const [encryptedPrivateKeyRaw, ivRaw, publicKeyBase64] =
        await Promise.all([
          localforage.getItem("encryptedRSAKey"),
          localforage.getItem("rsaEncryptionIV"),
          localforage.getItem("rsaPublicKeyBase64"),
        ]);

      if (
        !(encryptedPrivateKeyRaw instanceof ArrayBuffer) ||
        !(ivRaw instanceof Uint8Array) ||
        typeof publicKeyBase64 !== "string"
      ) {
        throw new Error("Invalid encrypted RSA key or IV or public key.");
      }

      const iv = new Uint8Array(ivRaw.buffer); // ensure proper Uint8Array
      const encryptedPrivateKey = new Uint8Array(encryptedPrivateKeyRaw); // wrap as Uint8Array

      if (!encryptedPrivateKey || !iv || !publicKeyBase64)
        throw new Error("Missing encrypted RSA data.");

      // Decrypt private key
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        sessionKey,
        encryptedPrivateKey
      );

      return {
        rsaPrivateKey: decryptedBuffer,
        rsaPublicKey: publicKeyBase64, // already stored as base64
      };
    } catch (error) {
      // localStorage.removeItem("emails");
      // localStorage.removeItem("names");
      // localStorage.removeItem("token");
      // window.location.reload();
      // alert("Logging Out Session Key Expired");
      console.error("RSA key decryption failed:", error);
      return null;
    }
  };
