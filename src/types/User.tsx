export interface UserProps {
  marginTop?: string | number;
  showWholeElementCursor?: boolean;
  showCursor?: boolean;
  groupName?: string;
  lastMessageSentBy?: string;
  lastMessage?: string;
  time?: string;
  topChatContainer?: boolean;
  wholeElementClicked?: (e: React.MouseEvent<HTMLElement>) => void;
  onClick?: (e: React.MouseEvent<any>) => void;
  chatId?: string;
  userId?: string;
  rsaPublicKey?: string;
}
