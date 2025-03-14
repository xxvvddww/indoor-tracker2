
import { Award } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  fixturesLength: number;
  playersLength: number;
  loading: boolean;
}

export const EmptyState = ({ fixturesLength, playersLength, loading }: EmptyStateProps) => {
  if (fixturesLength === 0 && playersLength === 0 && !loading) {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
        <Award className="mx-auto h-12 w-12 text-primary/50" />
        <h2 className="mt-2 text-xl font-medium">No Cricket Data Available</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          There are no fixtures or statistics available for the current season.
        </p>
        <div className="mt-4">
          <Link to="/settings" className="text-primary hover:underline text-sm">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }
  return null;
};
