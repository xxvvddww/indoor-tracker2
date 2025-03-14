
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const TeamEmptyState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Teams Found</CardTitle>
        <CardDescription>There are no teams available for the current season</CardDescription>
      </CardHeader>
      <CardContent>
        <p>No team data was returned by the API for the current season. Please check back later or try a different season.</p>
      </CardContent>
    </Card>
  );
};

export default TeamEmptyState;
