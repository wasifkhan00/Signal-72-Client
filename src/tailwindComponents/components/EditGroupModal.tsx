import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Edit } from "lucide-react";
import { Chat } from "./ChatLayout";
import { toast } from "sonner";

interface EditGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Chat;
  onEditGroup: (groupId: string, newName: string) => void;
}

export function EditGroupModal({
  open,
  onOpenChange,
  group,
  onEditGroup,
}: EditGroupModalProps) {
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (open && group) {
      setGroupName(group.name);
    }
  }, [open, group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (groupName.trim() === group.name) {
      toast.info("No changes made");
      onOpenChange(false);
      return;
    }

    onEditGroup(group.id, groupName.trim());
    toast.success("Group name updated successfully");
  };

  const handleClose = () => {
    onOpenChange(false);
    setGroupName(group?.name || "");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Group Name
          </DialogTitle>
          <DialogDescription>
            Change the name of "{group?.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter new group name..."
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!groupName.trim() || groupName.trim() === group?.name}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
