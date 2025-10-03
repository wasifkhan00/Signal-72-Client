import React from "react";
import { motion } from "framer-motion";
// import { motion } from "motion/react";
import { MessageCircle, Users } from "lucide-react";

interface ChatLoadingStateProps {
  chatType?: "private" | "group";
  chatName?: string;
}

export function ChatLoadingState({
  chatType = "private",
  chatName = "Chat",
}: ChatLoadingStateProps) {
  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.7, 0.3],
    },
  };

  const shimmerVariants = {
    animate: {
      x: [-200, 200],
    },
  };

  return (
    // <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50/50 via-white/30 to-blue-50/50 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-indigo-900/50">
    <div
      className="w-full flex-1 flex flex-col h-full 
                  bg-gradient-to-br from-slate-50/50 via-white/30 to-blue-50/50 
                  dark:from-slate-900/50 dark:via-slate-800/30 dark:to-indigo-900/50"
    >
      {/* Header Loading */}
      <div className="p-4 border-b border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm ">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative overflow-hidden h-10 w-10 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
            variants={pulseVariants}
            animate="animate"
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-500/50 to-transparent"
              variants={shimmerVariants}
              animate="animate"
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <div className="flex-1">
            <motion.div
              className="relative overflow-hidden h-4 w-32 rounded bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 mb-1"
              variants={pulseVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1,
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-500/50 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.1,
                }}
              />
            </motion.div>
            <motion.div
              className="relative overflow-hidden h-3 w-20 rounded bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
              variants={pulseVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-500/50 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Messages Loading */}
      <div className="flex-1 p-4 space-y-4">
        {/* Center Loading Animation */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            {/* Animated Icon */}
            <motion.div
              className="relative"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.4)",
                    "0 0 0 20px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {chatType === "group" ? (
                  <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                ) : (
                  <MessageCircle className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                )}
              </motion.div>
            </motion.div>

            {/* Loading Text */}
            <div className="space-y-2">
              <motion.h3
                className="text-slate-700 dark:text-slate-300"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Loading {chatName}...
              </motion.h3>
              <motion.p
                className="text-sm text-slate-500 dark:text-slate-400"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                Fetching messages
              </motion.p>
            </div>

            {/* Animated Dots */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-blue-500/60 dark:bg-blue-400/60"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton Message Bubbles */}
        <div className="space-y-4 opacity-30">
          {/* Incoming message skeleton */}
          <div className="flex gap-2">
            <motion.div
              className="relative overflow-hidden h-8 w-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex-shrink-0"
              variants={pulseVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-500/50 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
            </motion.div>
            <motion.div
              className="relative overflow-hidden max-w-xs rounded-2xl rounded-tl-md p-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
              variants={pulseVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-500/50 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
              <div className="h-4 w-32 bg-transparent"></div>
            </motion.div>
          </div>

          {/* Outgoing message skeleton */}
          <div className="flex justify-end">
            <motion.div
              className="relative overflow-hidden max-w-xs rounded-2xl rounded-tr-md p-3 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700"
              variants={pulseVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-blue-500/50 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
              <div className="h-4 w-24 bg-transparent"></div>
            </motion.div>
          </div>

          {/* Another incoming message skeleton */}
          <div className="flex gap-2">
            <motion.div
              className="relative overflow-hidden h-8 w-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex-shrink-0"
              variants={pulseVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-500/50 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
              />
            </motion.div>
            <motion.div
              className="relative overflow-hidden max-w-xs rounded-2xl rounded-tl-md p-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
              variants={pulseVariants}
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7,
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-500/50 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.7,
                }}
              />
              <div className="h-4 w-40 bg-transparent"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Input Loading */}
      <div className="p-4 border-t border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <motion.div
          className="relative overflow-hidden h-12 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
          variants={pulseVariants}
          animate="animate"
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-500/50 to-transparent"
            variants={shimmerVariants}
            animate="animate"
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
