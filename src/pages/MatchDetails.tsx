
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from "../components/layout/MainLayout";
import { fetchMatchDetails } from "../services/cricketApi";
import { MatchDetails as MatchDetailsType } from "../types/cricket";
import LoadingSpinner from "@/components/ui/loading-spinner";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [matchData, setMatchData] = useState<MatchDetailsType | null>(null);

  useEffect(() => {
    const loadMatchData = async () => {
      if (id) {
        setLoading(true);
        const data = await fetchMatchDetails(id);
        setMatchData(data);
        setLoading(false);
      }
    };

    loadMatchData();
  }, [id]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Match Details</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size={8} />
          </div>
        ) : matchData ? (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <pre className="overflow-auto bg-background p-4 rounded text-xs">
              {JSON.stringify(matchData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <p>No match data available</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MatchDetails;
