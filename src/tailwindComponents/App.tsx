import React from 'react';
import { ChatLayout } from './components/ChatLayout';
import { CallDemo } from './components/CallDemo';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <div className="size-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <ChatLayout />
      <CallDemo />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'glass-morphism border-white/20 dark:border-slate-700/50',
          style: {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
          }
        }}
      />
    </div>
  );
}