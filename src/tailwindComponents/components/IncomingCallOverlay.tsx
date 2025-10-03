import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Phone, PhoneOff, Video, MessageSquare, Clock } from 'lucide-react';
import { Chat } from './ChatLayout';
import { toast } from 'sonner@2.0.3';

interface IncomingCallOverlayProps {
  show: boolean;
  chat: Chat | null;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
  onQuickMessage?: () => void;
}

export function IncomingCallOverlay({ 
  show, 
  chat, 
  callType, 
  onAccept, 
  onDecline, 
  onQuickMessage 
}: IncomingCallOverlayProps) {
  const [ringDuration, setRingDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let autoDeclineTimer: NodeJS.Timeout;
    
    if (show && chat) {
      // Start ring timer
      interval = setInterval(() => {
        setRingDuration(prev => prev + 1);
      }, 1000);
      
      // Auto-decline after 30 seconds
      autoDeclineTimer = setTimeout(() => {
        onDecline();
        setRingDuration(0);
        toast.error(`Missed call from ${chat.name}`);
      }, 30000);
    } else {
      setRingDuration(0);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(autoDeclineTimer);
    };
  }, [show, chat, onDecline]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!show || !chat) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      {/* Mobile-style incoming call overlay */}
      <div className="relative w-full max-w-sm mx-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>
        
        {/* Main card */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white text-center">
          {/* Animated rings */}
          <div className="relative mb-8">
            <div className="absolute inset-0 call-ring">
              <div className="w-40 h-40 rounded-full bg-white/10"></div>
            </div>
            <div className="absolute inset-4 call-ring" style={{ animationDelay: '0.5s' }}>
              <div className="w-32 h-32 rounded-full bg-white/15"></div>
            </div>
            <div className="absolute inset-8 call-ring" style={{ animationDelay: '1s' }}>
              <div className="w-24 h-24 rounded-full bg-white/20"></div>
            </div>
            
            {/* Avatar */}
            <Avatar className="relative h-24 w-24 mx-auto ring-4 ring-white/30 shadow-2xl">
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl">
                {chat.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            {/* Call type badge */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg call-pulse">
              {callType === 'video' ? (
                <Video className="h-5 w-5 text-white" />
              ) : (
                <Phone className="h-5 w-5 text-white" />
              )}
            </div>
          </div>

          {/* Call info */}
          <div className="mb-8">
            <p className="text-sm text-white/70 mb-2">
              Incoming {callType} call
            </p>
            <h2 className="text-2xl font-semibold mb-2 call-pulse">{chat.name}</h2>
            <p className="text-white/80">
              {chat.type === 'group' 
                ? `Group call • ${chat.participants?.length || 0} members`
                : 'Private call'
              }
            </p>
            
            {/* Ring duration */}
            <div className="flex items-center justify-center gap-2 text-white/60 mt-3">
              <Clock className="h-4 w-4" />
              <span>Ringing {formatDuration(ringDuration)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-8 mb-6">
            {/* Decline */}
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-red-300/50 hover:border-red-300 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm"
              onClick={onDecline}
            >
              <PhoneOff className="h-6 w-6 text-red-300" />
            </Button>

            {/* Quick message */}
            {onQuickMessage && (
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-12 rounded-full border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                onClick={onQuickMessage}
              >
                <MessageSquare className="h-5 w-5 text-white" />
              </Button>
            )}

            {/* Accept */}
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl call-button-accept"
              onClick={onAccept}
            >
              <Phone className="h-6 w-6 text-white" />
            </Button>
          </div>

          {/* Swipe hint for mobile */}
          <div className="text-xs text-white/50">
            Swipe up to decline • Swipe down to accept
          </div>
        </div>
      </div>
    </div>
  );
}