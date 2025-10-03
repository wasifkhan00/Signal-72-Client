import React, { useState } from 'react';
import { Button } from './ui/button';
import { IncomingCallOverlay } from './IncomingCallOverlay';
import { CallModal } from './CallModal';
import { Phone, Video, Users } from 'lucide-react';
import { Chat } from './ChatLayout';
import { toast } from 'sonner@2.0.3';

export function CallDemo() {
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showActiveCall, setShowActiveCall] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<'voice' | 'video'>('voice');

  // Demo contact
  const demoContact: Chat = {
    id: 'demo',
    type: 'private',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    status: 'online',
    isOnline: true,
  };

  const triggerIncomingVoiceCall = () => {
    setCurrentCallType('voice');
    setShowIncomingCall(true);
    toast.info('📞 Incoming voice call from Sarah Chen');
  };

  const triggerIncomingVideoCall = () => {
    setCurrentCallType('video');
    setShowIncomingCall(true);
    toast.info('📹 Incoming video call from Sarah Chen');
  };

  const triggerGroupCall = () => {
    const groupChat: Chat = {
      id: 'group-demo',
      type: 'group',
      name: 'Design Squad',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop',
      participants: ['Sarah Chen', 'Mike Rodriguez', 'Jessica Taylor', 'Alex Rivera'],
    };
    
    setCurrentCallType('video');
    setShowActiveCall(true);
    toast.info('📹 Starting group video call');
  };

  const handleAcceptCall = () => {
    setShowIncomingCall(false);
    setShowActiveCall(true);
    toast.success('Call accepted! 🎉');
  };

  const handleDeclineCall = () => {
    setShowIncomingCall(false);
    toast.info('Call declined');
  };

  const handleQuickMessage = () => {
    setShowIncomingCall(false);
    toast.success('Quick message sent: "Can\'t talk now, will call you back!" 💬');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Demo controls */}
      <div className="flex flex-col gap-3 p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <p className="text-sm font-medium text-center mb-2">Call Demo</p>
        
        <Button
          variant="outline"
          size="sm"
          onClick={triggerIncomingVoiceCall}
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          Incoming Voice Call
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={triggerIncomingVideoCall}
          className="flex items-center gap-2"
        >
          <Video className="h-4 w-4" />
          Incoming Video Call
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={triggerGroupCall}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Group Video Call
        </Button>
      </div>

      {/* Incoming call overlay */}
      <IncomingCallOverlay
        show={showIncomingCall}
        chat={demoContact}
        callType={currentCallType}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        onQuickMessage={handleQuickMessage}
      />

      {/* Active call modal */}
      <CallModal
        open={showActiveCall}
        onOpenChange={setShowActiveCall}
        chat={demoContact}
        callType={currentCallType}
      />
    </div>
  );
}