import localforage from "localforage";
import { unlockRSAPrivateKey } from "./GenerateRSA";
import { AuthStore } from "@store/AuthStore";
import useChatStore from "@store/ChatStore";

// 🔐 AES Chat Key Handling Module
export const AESChatKey = {
  async importRSAPublicKey(base64Key: string): Promise<CryptoKey> {
    const binaryDer = Uint8Array.from(atob(base64Key), (char) =>
      char.charCodeAt(0)
    );
    return await crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );
  },

  // 1️⃣ Generate AES-256 key and store it for this private chat
  async generateKeyForChat(chatId: string, userRsaPublicKey: string) {
    // console.log("im being generated AES KEY");
    // 1. Generate AES key
    const aesChatKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // 2. Export the AES key into raw format
    const exportedAESKey = await crypto.subtle.exportKey("raw", aesChatKey);

    // 3. Get your own public key
    const { rsaPublicKey, emailAddress } = AuthStore.getState();

    if (!rsaPublicKey) throw new Error("❌ RSA Public Key missing");

    const myRSAPublicKeyCryptoKey = await this.importRSAPublicKey(rsaPublicKey);

    // 4. Encrypt AES key with your own public key
    const encryptedForMeBuffer = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      myRSAPublicKeyCryptoKey,
      exportedAESKey
    );
    const encryptedForMe = btoa(
      String.fromCharCode(...new Uint8Array(encryptedForMeBuffer))
    );

    // 5. Convert user's public key (base64 string) and my to CryptoKey
    const userRSAPublicKeyCryptoKey = await this.importRSAPublicKey(
      userRsaPublicKey
    );

    const encryptedForThemBuffer = await crypto.subtle.encrypt(
      { name: "RSA-OAEP", hash: "SHA-256" },
      userRSAPublicKeyCryptoKey,
      exportedAESKey
    );

    const encryptedForThem = btoa(
      String.fromCharCode(...new Uint8Array(encryptedForThemBuffer))
    );

    // 7. Store both encrypted AES keys (for you and for them)
    const { selectedGroupMemberPayload } = useChatStore.getState();
    // frontend version
    const encodeEmail = (email: string) => {
      return btoa(email); // Encode to Base64
    };

    const encryptedAESKeyObject = {
      [encodeEmail(emailAddress)]: encryptedForMe,
      [encodeEmail(selectedGroupMemberPayload[0].email)]: encryptedForThem,
    };

    // console.log(aesChatKey);
    // console.log(encryptedAESKeyObject);

    await this.storeKeyLocally(chatId, encryptedForMe);

    return { aesChatKey, encryptedAESKeyObject };
  },

  // *************************************************************************************************************************************************************************************************************
  async generateKeyForGroupChat(
    chatId: string,
    members: { email: string; rsaPublicKey: string }[]
  ) {
    // console.log("🔐 Generating AES key for GROUP chat:", chatId);
    // console.log(members);

    // 1. Generate AES key
    const aesChatKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // 2. Export AES key to raw
    const exportedAESKey = await crypto.subtle.exportKey("raw", aesChatKey);

    // // 3. Get your own public key
    const { rsaPublicKey, emailAddress } = AuthStore.getState();

    if (!rsaPublicKey) throw new Error("❌ Your RSA Public Key is missing");

    const myRSAPublicKeyCryptoKey = await this.importRSAPublicKey(rsaPublicKey);

    // // 4. Encrypt AES key for yourself
    const encryptedForMeBuffer = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      myRSAPublicKeyCryptoKey,
      exportedAESKey
    );
    const encryptedForMe = btoa(
      String.fromCharCode(...new Uint8Array(encryptedForMeBuffer))
    );

    // // 5. Encrypt AES key for each group member
    const encryptedAESKeyObject: Record<string, string> = {};

    // const encodeEmail = (email: string) => btoa(email);
    function encodeEmail(rawEmail) {
      return Buffer.from(rawEmail).toString("base64");
    }

    // // Include yourself
    encryptedAESKeyObject[encodeEmail(emailAddress)] = encryptedForMe;

    for (const member of members) {
      if (!member.rsaPublicKey || !member.email) continue;
      try {
        const memberRSAPublicKeyCryptoKey = await this.importRSAPublicKey(
          member.rsaPublicKey
        );
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: "RSA-OAEP" },
          memberRSAPublicKeyCryptoKey,
          exportedAESKey
        );
        const encryptedBase64 = btoa(
          String.fromCharCode(...new Uint8Array(encryptedBuffer))
        );
        encryptedAESKeyObject[encodeEmail(member.email)] = encryptedBase64;
      } catch (err) {
        console.warn(`Failed to encrypt AES key for ${member.email}`, err);
      }
    }

    // 6. Store your encrypted version locally
    await this.storeKeyLocally(chatId, encryptedForMe);

    // console.log("🟢 Group AES Key Generated:", encryptedAESKeyObject);

    return { aesChatKey, encryptedAESKeyObject };
  },
  // *************************************************************************************************************************************************************************************************************

  // *********************************************************************************************************************
  // decrypt aes key now
  async decryptAESKeyForChat(
    encryptedAESKeyBase64: string,
    rsaPrivateKey: any
  ): Promise<CryptoKey> {
    // Step 1: Decode Base64 → Uint8Array
    const encryptedBytes = Uint8Array.from(atob(encryptedAESKeyBase64), (c) =>
      c.charCodeAt(0)
    );
    // console.log("breakpoint 1");

    const decoded = atob(encryptedAESKeyBase64);
    // console.log("Length of decoded AES key:", decoded.length);

    // Step 2: Ensure rsaPrivateKey is a CryptoKey
    let usablePrivateKey: CryptoKey;

    if (rsaPrivateKey instanceof CryptoKey) {
      // console.log("converted cryptokey");
      usablePrivateKey = rsaPrivateKey;
    } else if (rsaPrivateKey instanceof ArrayBuffer) {
      // console.log("converting to cryptokey");

      usablePrivateKey = await crypto.subtle.importKey(
        "pkcs8",
        rsaPrivateKey,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["decrypt"]
      );
      // console.log("converting to cryptokey 2");
    } else {
      throw new Error(
        "Invalid RSA private key type: must be CryptoKey or ArrayBuffer."
      );
    }
    // console.log("decrypting boy");

    // Step 3: Decrypt the AES key with RSA-OAEP
    try {
      const rawAESKey = await crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        usablePrivateKey,
        encryptedBytes
      );

      // Step 4: Import raw AES key into usable CryptoKey
      const aesCryptoKey = await crypto.subtle.importKey(
        "raw",
        rawAESKey,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
      );

      // console.log("✅ AES Key Decryption Successful");
      return aesCryptoKey;
    } catch (e) {
      console.error("❌ AES Key Decryption failed:", e);
      throw e;
    }
  },

  // *********************************************************************************************************************

  // 4️⃣ Save AES key to local storage
  async storeKeyLocally(chatId: string, encryptedAESKeyBase64: string) {
    const storageKey = `e2ee:encryptedAESKey:${chatId}`;
    try {
      const existing = await localforage.getItem(storageKey);
      if (existing) {
        // console.log("🔁 Key already exists, skipping storage.");
        return null;
      }

      await localforage.setItem(storageKey, {
        encryptedKey: encryptedAESKeyBase64,
      });
      // console.log("✅ Key stored successfully");
    } catch (err) {
      console.error("❌ Error storing key:", err);
    }
  },

  async loadKeyLocally(chatId: string): Promise<CryptoKey | null> {
    const { rsaPrivateKey } = AuthStore.getState();

    const item = await localforage.getItem<{ encryptedKey: string }>(
      `e2ee:encryptedAESKey:${chatId}`
    );

    if (!item || !item.encryptedKey) {
      console.warn("⚠️ No AES key found for chat:", chatId);
      return null;
    }

    // Decode Base64 → Uint8Array → ArrayBuffer
    const encryptedKeyBuffer = Uint8Array.from(atob(item.encryptedKey), (c) =>
      c.charCodeAt(0)
    ).buffer;

    if (!rsaPrivateKey) {
      console.error("❌ RSA private key not found in AuthStore.");
      return null;
    }

    let privateKey: CryptoKey;

    try {
      if (rsaPrivateKey instanceof CryptoKey) {
        privateKey = rsaPrivateKey;
        console.log(privateKey);
      } else {
        // Assuming rsaPrivateKey is ArrayBuffer
        privateKey = await crypto.subtle.importKey(
          "pkcs8",
          rsaPrivateKey, // raw ArrayBuffer from AuthStore
          {
            name: "RSA-OAEP",
            hash: "SHA-256",
          },
          true,
          ["decrypt"]
        );
      }
    } catch (err) {
      console.error("❌ Failed to import RSA private key:", err);
      return null;
    }

    let decryptedAESKeyBuffer: ArrayBuffer;

    try {
      decryptedAESKeyBuffer = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedKeyBuffer
      );
      // console.log("✅ AES key decrypted successfully.");
    } catch (err) {
      console.error("❌ Error decrypting AES key:", err);
      return null;
    }

    try {
      const aesKey = await crypto.subtle.importKey(
        "raw",
        decryptedAESKeyBuffer,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
      );

      // console.log("🔑 AES key imported successfully.");
      return aesKey;
    } catch (err) {
      console.error("❌ Failed to import decrypted AES key:", err);
      return null;
    }
  },

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString("base64");
  },

  async encryptMessage(
    chatId: string,
    message: string
  ): Promise<{ ciphertextBase64: string; ivBase64: string }> {
    console.log("executed encryptmessage");
    const aesChatKey = await this.loadKeyLocally(chatId);
    if (!aesChatKey) throw new Error("AES chat key not found");

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(message);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesChatKey,
      encodedText
    );

    return {
      ciphertextBase64: this.arrayBufferToBase64(encryptedBuffer),
      ivBase64: this.arrayBufferToBase64(iv.buffer),
    };
  },

  // 3️⃣ Decrypt a message using the chat's AES key
  async decryptMessage(
    chatId: string,
    ciphertextBase64: string,
    ivBase64: string
  ): Promise<string> {
    const aesChatKey = await this.loadKeyLocally(chatId);
    if (!aesChatKey) throw new Error("AES chat key not found");

    const ciphertext = Uint8Array.from(atob(ciphertextBase64), (c) =>
      c.charCodeAt(0)
    );
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesChatKey,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  },

  //  5️⃣ Load AES key from local storage
};
