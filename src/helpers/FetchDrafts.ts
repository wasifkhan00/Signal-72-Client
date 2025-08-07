import getDraftChats from "./DraftChats";
import { decodeEmail } from "./DecodeEmail";

export default function fetchDraftChats() {
  const rawDrafts = getDraftChats();
  if (!rawDrafts || rawDrafts.length === 0) return [];

  return rawDrafts.map((draft: any) => {
    const encryptedAESKeys = draft.encryptedAESKeys || {};

    const decodedAESKeyMap = Object.fromEntries(
      Object.entries(encryptedAESKeys).map(([encodedEmail, aesKey]) => {
        const decoded = decodeEmail(encodedEmail);
        return [decoded, aesKey];
      })
    );

    return {
      ...draft,
      encryptedAESKeysEncoded: encryptedAESKeys, // 🔒 for DB-safe usage
      encryptedAESKeys: decodedAESKeyMap, // 👁️ for UI logic
    };
  });
}
