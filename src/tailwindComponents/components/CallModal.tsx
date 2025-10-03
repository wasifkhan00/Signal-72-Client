import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MoreVertical,
  MessageSquare,
  Monitor,
  Users,
  VolumeX,
  Volume2,
  Maximize,
  Minimize,
  RotateCcw,
  Clock,
  Wifi,
} from "lucide-react";
import { Chat } from "./ChatLayout";
import { toast } from "sonner";

interface CallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: Chat | null;
  callType: "voice" | "video";
  isIncoming?: boolean;
}

export function CallModal({
  open,
  onOpenChange,
  chat,
  callType,
  isIncoming = false,
}: CallModalProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === "video");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "reconnecting"
  >("connecting");
  const [ringDuration, setRingDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(false);

  // Incoming call ringing effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isIncoming && !isConnected && open) {
      setIsRinging(true);
      interval = setInterval(() => {
        setRingDuration((prev) => prev + 1);
      }, 1000);

      // Auto-decline after 30 seconds
      const autoDeclineTimer = setTimeout(() => {
        if (!isConnected) {
          onOpenChange(false);
          setRingDuration(0);
          toast.error("Missed call from " + chat?.name);
        }
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(autoDeclineTimer);
        setIsRinging(false);
      };
    }
    return () => {
      clearInterval(interval);
      setIsRinging(false);
    };
  }, [isIncoming, isConnected, open, chat?.name, onOpenChange]);

  // Call duration tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected && open) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected, open]);

  // Simulate connection process
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connecting");
      const timer = setTimeout(() => {
        setConnectionStatus("connected");
        toast.success("Call connected!");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAccept = () => {
    setIsConnected(true);
    setRingDuration(0);
    setIsRinging(false);
    toast.success("Call accepted!");
  };

  const handleDecline = () => {
    onOpenChange(false);
    setIsConnected(false);
    setCallDuration(0);
    setRingDuration(0);
    setIsRinging(false);
    toast.info("Call declined");
  };

  const handleEndCall = () => {
    onOpenChange(false);
    setIsConnected(false);
    setCallDuration(0);
    setRingDuration(0);
    setIsRinging(false);
    toast.info(`Call ended • Duration: ${formatDuration(callDuration)}`);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.success(
      isScreenSharing ? "Screen sharing stopped" : "Screen sharing started"
    );
  };

  if (!chat) return null;

  // Enhanced Incoming call UI
  if (isIncoming && !isConnected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-xl text-white">
          <div className="flex flex-col items-center space-y-8 py-8">
            {/* Enhanced animated pulse rings with multiple layers */}
            <div className="relative">
              {/* Multiple pulse rings */}
              <div className="absolute inset-0 call-ring">
                <div className="w-56 h-56 rounded-full bg-gradient-to-r from-indigo-400/30 to-purple-400/30"></div>
              </div>
              <div
                className="absolute inset-8 call-ring"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-indigo-400/40 to-purple-400/40"></div>
              </div>
              <div
                className="absolute inset-16 call-ring"
                style={{ animationDelay: "1s" }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400/50 to-purple-400/50"></div>
              </div>

              {/* Main avatar with glow effect */}
              <Avatar className="relative h-32 w-32 ring-4 ring-white/50 shadow-2xl call-glow">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {chat.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {/* Call type indicator */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg call-pulse">
                {callType === "video" ? (
                  <Video className="h-6 w-6 text-white" />
                ) : (
                  <Phone className="h-6 w-6 text-white" />
                )}
              </div>
            </div>

            {/* Call information */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-white/70 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Incoming {callType} call</span>
              </div>
              <h2 className="text-3xl font-semibold text-white call-pulse">
                {chat.name}
              </h2>
              <p className="text-white/80 text-lg">
                {chat.type === "group"
                  ? `Group call • ${chat.participants?.length || 0} members`
                  : "Private call"}
              </p>

              {/* Ring duration */}
              <div className="flex items-center justify-center gap-2 text-white/60">
                <Clock className="h-4 w-4" />
                <span>Ringing {formatDuration(ringDuration)}</span>
              </div>
            </div>

            {/* Enhanced action buttons */}
            <div className="flex items-center gap-16">
              {/* Decline button */}
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full call-ring"></div>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 w-16 rounded-full border-red-200 hover:border-red-300 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm transition-all duration-200"
                  onClick={handleDecline}
                >
                  <PhoneOff className="h-6 w-6 text-red-300" />
                </Button>
              </div>

              {/* Accept button */}
              <div className="relative">
                <div
                  className="absolute inset-0 bg-green-500/20 rounded-full call-ring"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl call-button-accept transition-all duration-200"
                  onClick={handleAccept}
                >
                  <Phone className="h-6 w-6 text-white" />
                </Button>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-6 pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={() => toast.info("Quick message sent!")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Quick Reply
              </Button>

              {chat.type === "private" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add to Group
                </Button>
              )}
            </div>

            {/* Connection quality indicator */}
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Wifi className="h-3 w-3" />
              <span>Excellent connection</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Active call UI (same as before but with some enhancements)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-0 ${
          isFullscreen ? "w-screen h-screen max-w-none" : "sm:max-w-2xl"
        }`}
      >
        <div
          className={`flex flex-col h-full ${
            isFullscreen ? "min-h-screen" : "min-h-[600px]"
          }`}
        >
          {/* Enhanced call header */}
          <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/30">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {chat.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{chat.name}</h3>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-green-500"
                        : connectionStatus === "connecting"
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-red-500 animate-pulse"
                    }`}
                  />
                  <span>
                    {connectionStatus === "connected"
                      ? formatDuration(callDuration)
                      : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Reconnecting..."}
                  </span>
                  {callType === "video" && (
                    <>
                      <span>•</span>
                      <Video className="h-3 w-3" />
                      <span>HD</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Video area */}
          <div className="flex-1 relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            {callType === "video" && isVideoOn ? (
              <div className="relative w-full h-full">
                {/* Main video (remote user) */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  {isScreenSharing ? (
                    <div className="w-full h-full bg-blue-900/50 flex items-center justify-center">
                      <div className="text-center">
                        <Monitor className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                        <p className="text-xl font-medium">
                          {chat.name}'s screen
                        </p>
                        <p className="text-white/70">
                          Screen sharing in progress
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Avatar className="h-32 w-32 mx-auto mb-4">
                        <AvatarImage src={chat.avatar} alt={chat.name} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl">
                          {chat.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xl font-medium">{chat.name}</p>
                      <p className="text-white/70">Camera is off</p>
                    </div>
                  )}
                </div>

                {/* Picture-in-picture (your video) */}
                <div className="absolute top-4 right-4 w-32 h-24 bg-slate-700 rounded-lg border-2 border-white/20 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        You
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced connection quality indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-xs text-white/70">HD Quality</span>
                </div>
              </div>
            ) : (
              // Voice call or video off
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 animate-pulse">
                      <div className="w-48 h-48 rounded-full bg-indigo-400/20"></div>
                    </div>
                    <Avatar className="relative h-40 w-40 ring-8 ring-indigo-500/30 shadow-2xl">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-5xl">
                        {chat.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h2 className="text-3xl font-semibold mb-2">{chat.name}</h2>
                  <p className="text-white/70 text-lg">
                    {connectionStatus === "connected"
                      ? callType === "video"
                        ? "Video call"
                        : "Voice call"
                      : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Reconnecting..."}
                  </p>
                  {connectionStatus === "connected" && (
                    <div className="flex items-center justify-center gap-2 text-white/50 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Connected with excellent quality</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced call controls */}
          <div className="p-6 bg-black/30 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4">
              {/* Mute button */}
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className={`h-14 w-14 rounded-full transition-all duration-200 ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
                onClick={() => {
                  setIsMuted(!isMuted);
                  toast.success(
                    isMuted ? "Microphone unmuted" : "Microphone muted"
                  );
                }}
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              {/* Video toggle (only in video calls) */}
              {callType === "video" && (
                <Button
                  variant={!isVideoOn ? "destructive" : "secondary"}
                  size="lg"
                  className={`h-14 w-14 rounded-full transition-all duration-200 ${
                    !isVideoOn
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                  onClick={() => {
                    setIsVideoOn(!isVideoOn);
                    toast.success(
                      isVideoOn ? "Camera turned off" : "Camera turned on"
                    );
                  }}
                >
                  {isVideoOn ? (
                    <Video className="h-6 w-6" />
                  ) : (
                    <VideoOff className="h-6 w-6" />
                  )}
                </Button>
              )}

              {/* Screen share (only in video calls) */}
              {callType === "video" && (
                <Button
                  variant={isScreenSharing ? "default" : "secondary"}
                  size="lg"
                  className={`h-14 w-14 rounded-full transition-all duration-200 ${
                    isScreenSharing
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                  onClick={toggleScreenShare}
                >
                  <Monitor className="h-6 w-6" />
                </Button>
              )}

              {/* Speaker toggle (voice calls) */}
              {callType === "voice" && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
                  onClick={() => {
                    setIsSpeakerOn(!isSpeakerOn);
                    toast.success(isSpeakerOn ? "Speaker off" : "Speaker on");
                  }}
                >
                  {isSpeakerOn ? (
                    <Volume2 className="h-6 w-6" />
                  ) : (
                    <VolumeX className="h-6 w-6" />
                  )}
                </Button>
              )}

              {/* Chat button */}
              <Button
                variant="secondary"
                size="lg"
                className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>

              {/* Reconnect button (when connection issues) */}
              {connectionStatus === "reconnecting" && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-14 w-14 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white transition-all duration-200"
                  onClick={() => {
                    setConnectionStatus("connecting");
                    setTimeout(() => setConnectionStatus("connected"), 2000);
                  }}
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              )}

              {/* End call button */}
              <Button
                variant="destructive"
                size="lg"
                className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>

            {/* Enhanced call stats */}
            {connectionStatus === "connected" && (
              <div className="flex items-center justify-center mt-4 text-xs text-white/50 gap-6">
                <span>Quality: {callType === "video" ? "HD" : "High"}</span>
                <span>•</span>
                <span>Encryption: End-to-end</span>
                <span>•</span>
                <span>
                  {chat.type === "group"
                    ? `${chat.participants?.length || 0} participants`
                    : "Private call"}
                </span>
                <span>•</span>
                <span>Latency: 12ms</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
