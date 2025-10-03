"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { MessageSquare, UserPlus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Mock user database - searchable by typing 2+ characters
const mockUsers = [
  {
    id: "1",
    name: "Wasif Ahmed",
    email: "wasif.ahmed@company.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Bob Smith",
    email: "bob.smith@company.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "6",
    name: "Emma Davis",
    email: "emma.davis@company.com",
    avatar:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "7",
    name: "John Martinez",
    email: "john.martinez@company.com",
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "8",
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@company.com",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "9",
    name: "David Kumar",
    email: "david.kumar@company.com",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "10",
    name: "Amy Thompson",
    email: "amy.thompson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "11",
    name: "Ryan Johnson",
    email: "ryan.johnson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: "12",
    name: "Maria Garcia",
    email: "maria.garcia@company.com",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face",
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface CreateContactModalProps {
  children?: React.ReactNode;
}

export function CreateContactModal({ children }: CreateContactModalProps = {}) {
  const [isOpen, setIsOpen] = useState(true);
  const [contactName, setContactName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search users when typing in email field
  useEffect(() => {
    if (emailAddress.length >= 2 && !selectedUser) {
      setIsSearching(true);

      // Simulate API call delay
      const timeoutId = setTimeout(() => {
        const results = mockUsers.filter(
          (user) =>
            user.email.toLowerCase().includes(emailAddress.toLowerCase()) ||
            user.name.toLowerCase().includes(emailAddress.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [emailAddress, selectedUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactName.trim()) {
      toast.error("Please enter a contact name");
      return;
    }

    if (!emailAddress.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Simulate creating contact
    toast.success(`Contact "${contactName}" added successfully! 🎉`);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setContactName("");
    setEmailAddress("");
    setSearchResults([]);
    setSelectedUser(null);
  };

  const handleUserSelect = (user: User) => {
    setContactName(user.name);
    setEmailAddress(user.email);
    setSelectedUser(user);
    setSearchResults([]);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(e.target.value);
    if (selectedUser) {
      setSelectedUser(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add New Contact
          </DialogTitle>
          <DialogDescription>
            Start a private conversation with a new contact
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter contact name..."
              autoFocus
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="emailAddress">Email Address</Label>
            <div className="relative">
              <Input
                id="emailAddress"
                value={emailAddress}
                onChange={handleEmailChange}
                placeholder="Enter email address..."
                autoComplete="off"
                type="email"
                className={searchResults.length > 0 ? "rounded-b-none" : ""}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-popover border border-border border-t-0 rounded-b-md shadow-lg ">
                <ScrollArea className="max-h-48">
                  <div className="p-1 bg-[#F8F8FF]">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-black text-white rounded-full">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Search hint */}
            {emailAddress.length >= 1 && emailAddress.length < 2 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Search className="h-3 w-3" />
                Type 2+ characters to search for existing users
              </p>
            )}
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
              className="flex-1 bg-[#9370DB] text-white"
              disabled={!contactName.trim() || !emailAddress.trim()}
            >
              Add Contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
