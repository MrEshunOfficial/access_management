import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Loading...",
  progress,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md dark:bg-black/60">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {message}
        </p>
        {progress !== undefined && (
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoadingOverlay;
