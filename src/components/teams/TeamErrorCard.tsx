
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface TeamErrorCardProps {
  error: unknown;
}

const TeamErrorCard = ({ error }: TeamErrorCardProps) => {
  return (
    <Card className="border-yellow-500">
      <CardHeader>
        <CardTitle className="text-yellow-600">API Error</CardTitle>
        <CardDescription>Using sample data for demonstration</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">There was an error loading the teams data from the API. We're showing sample data for demonstration purposes.</p>
        <p className="text-sm text-muted-foreground">Error details: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </CardContent>
    </Card>
  );
};

export default TeamErrorCard;
