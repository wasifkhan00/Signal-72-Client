import { v4 as uuidv4 } from "uuid";

export function generateChatId({ emailAddress = "" } = {}) {
  console.log("im called chatid generator");
  const chatId = `${uuidv4()}::${emailAddress}`;
  return chatId;
}
