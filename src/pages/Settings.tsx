
import React, { useState } from 'react';
import MainLayout from "../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { setCurrentSeasonId, getCurrentSeasonId } from "../services/cricketApi";
import { toast } from "@/components/ui/use-toast";

const Settings = () => {
  const [seasonId, setSeasonId] = useState(getCurrentSeasonId());

  const handleSeasonChange = () => {
    setCurrentSeasonId(seasonId);
    toast({
      title: "Season ID updated",
      description: `The season ID has been updated to ${seasonId}`,
    });
    // In a real app you would refresh data after changing the season
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Cricket Season</CardTitle>
            <CardDescription>Change the current season to view different data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="seasonId">Season ID</Label>
              <div className="flex w-full gap-2">
                <Input
                  id="seasonId"
                  value={seasonId}
                  onChange={(e) => setSeasonId(e.target.value)}
                  placeholder="Enter season ID"
                />
                <Button onClick={handleSeasonChange}>Update</Button>
              </div>
              <p className="text-sm text-muted-foreground">Current season ID: {getCurrentSeasonId()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
