
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner = ({ size = 24, className = "" }: LoadingSpinnerProps) => {
  return (
    <div className="flex justify-center items-center w-full">
      <Loader2 className={`animate-spin h-${size} w-${size} ${className}`} />
    </div>
  );
};

export default LoadingSpinner;
