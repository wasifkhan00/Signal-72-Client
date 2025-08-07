export default function getDraftChats() {
  const data = localStorage.getItem("draftChats");
  if (!data) return false;
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveDraftChat(newDraft: any) {
  const existing = localStorage.getItem("draftChats");
  let drafts = [];

  if (existing) {
    drafts = JSON.parse(existing);

    // Check if draft for same chatId already exists
    const alreadyExists = drafts.find((d) => d.chatId === newDraft.chatId);
    if (alreadyExists) {
      return "chat_already_exists";
    }
  }

  drafts.push(newDraft);
  localStorage.setItem("draftChats", JSON.stringify(drafts));
  return "chat_saved";
}

export function removeDraftChat(chatId: any) {
  const data = localStorage.getItem("draftChats");
  if (!data) return;

  const drafts = JSON.parse(data);
  const updated = drafts.filter((d) => d.chatId !== chatId);

  localStorage.setItem("draftChats", JSON.stringify(updated));
}
