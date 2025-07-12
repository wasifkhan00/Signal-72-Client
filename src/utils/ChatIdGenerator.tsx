import { v4 as uuidv4 } from "uuid";

export function generateChatId({ emailAddress = "" } = {}) {
  const chatId = `${uuidv4()}::${emailAddress}`;
  return chatId;
}
