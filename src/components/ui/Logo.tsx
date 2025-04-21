
import { TrainFront } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TrainFront className="h-6 w-6 text-railway-700" />
      {showText && <span className="font-semibold text-lg">Railway Resolve</span>}
    </div>
  );
}
