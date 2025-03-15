
import React from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import useMatchDataExtraction from '../../hooks/useMatchDataExtraction';

interface DataExtractorProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const DataExtractor: React.FC<DataExtractorProps> = ({ displayInfo, matchData }) => {
  // Use the custom hook to handle data extraction
  useMatchDataExtraction(matchData, displayInfo);
  
  // This is a non-rendering component
  return null;
};

export default DataExtractor;
