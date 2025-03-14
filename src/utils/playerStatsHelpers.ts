
import { Player } from "../types/cricket";

export const calculateBattingAverage = (player: Player) => {
  const runsScored = parseInt(player.RunsScored);
  const timesOut = parseInt(player.TimesOut);
  
  if (timesOut === 0) return runsScored > 0 ? "∞" : "-";
  
  const average = runsScored / timesOut;
  return average.toFixed(2);
};

export const calculateBowlingAverage = (player: Player) => {
  const runsConceded = parseInt(player.RunsConceded);
  const wickets = parseInt(player.Wickets);
  
  if (wickets === 0) return "-";
  
  const average = runsConceded / wickets;
  return average.toFixed(2);
};

export const calculatePerformanceTrend = (player: Player) => {
  const runsScored = parseInt(player.RunsScored);
  const wickets = parseInt(player.Wickets);
  
  if (runsScored > 100 || wickets > 5) {
    return "up";
  } else if (runsScored < 20 && parseInt(player.Games) > 3) {
    return "down";
  }
  
  return "neutral";
};
