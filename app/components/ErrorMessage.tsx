"use client";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  errorType?: "steam" | "roast" | "network" | "validation";
}

export default function ErrorMessage({ message, onRetry, errorType = "network" }: ErrorMessageProps) {
  const getIcon = () => {
    switch (errorType) {
              case "steam": return "🎮";
      case "roast": return "🔥";
      case "validation": return "⚠️";
      default: return "❌";
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl bg-red-500/10 border border-red-500/30">
      <div className="flex items-start gap-4">
        <span className="text-3xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="text-red-300 font-medium mb-2">{message}</p>
          
          {onRetry && (
                        <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <span>🔄</span> Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}