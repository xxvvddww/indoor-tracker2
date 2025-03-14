
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from '../ui/loading-spinner';
import { useIsMobile } from '@/hooks/use-mobile';

const LoadingCard = () => {
  const isMobile = useIsMobile();
  const compactMode = isMobile;
  
  return (
    <Card className={compactMode ? "border-2 border-gray-300 dark:border-gray-700" : ""}>
      <CardContent className={compactMode ? "py-6" : "pt-6 py-12"}>
        <div className="flex flex-col items-center justify-center p-4 gap-4">
          <LoadingSpinner size={compactMode ? 6 : 8} />
          <p className={`text-muted-foreground ${compactMode ? "text-sm" : ""}`}>Loading team data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingCard;
