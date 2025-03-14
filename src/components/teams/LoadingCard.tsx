
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from '../ui/loading-spinner';

const LoadingCard = () => {
  return (
    <Card>
      <CardContent className="pt-6 py-12">
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <LoadingSpinner size={8} />
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingCard;
