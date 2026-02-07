"use client";

interface LoadingSpinnerProps {
  message?: string;
  stage?: "steam" | "roast";
}

export default function LoadingSpinner({ message, stage }: LoadingSpinnerProps) {
  const getMessage = () => {
        if (message) return message;
    switch (stage) {
      case "steam":
        return "Fetching your Steam library...";
      case "roast":
        return "Generating your personalized roast...";
      default:
        return "Loading...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-white/20"></div>
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">🔥</div>
      </div>
      
      <p className="mt-6 text-xl text-gray-300 font-medium">{getMessage()}</p>
      
      <div className="flex gap-2 mt-4">
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "0s" }}></div>
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
    </div>
  );
}