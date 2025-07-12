import React from "react";
import { X } from "lucide-react"; // Optional: lucide-react icon

interface UserTagProps {
  name: string;
  email: string;
  onRemove: (e: React.MouseEvent<HTMLInputElement>) => void;
}

const UserTag: React.FC<UserTagProps> = ({ name, email, onRemove }) => {
  return (
    // <small style={{ background: "red" }}>
    <span>
      {name}
      <small data-user-email={email} onClick={onRemove}>
        X
      </small>
    </span>
    // </small>
  );
};

export default UserTag;
