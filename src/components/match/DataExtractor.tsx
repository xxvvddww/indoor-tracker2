
import React from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import useMatchDataExtraction from '../../hooks/useMatchDataExtraction';

interface DataExtractorProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const DataExtractor: React.FC<DataExtractorProps> = ({ displayInfo, matchData }) => {
  // Use the custom hook to handle all data extraction logic
  useMatchDataExtraction(matchData, displayInfo);
  
  // This component doesn't render anything
  return null;
};

export default DataExtractor;
