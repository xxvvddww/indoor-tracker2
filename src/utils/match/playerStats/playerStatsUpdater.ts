
import { DisplayableMatchInfo } from '../../../components/match/types';
import { BowlerBatsman } from '../../../types/cricket';

// Update player stats with calculated values
export const updatePlayerStatsWithCalculatedValues = (
  displayData: DisplayableMatchInfo,
  teamId: string,
  bowlers: BowlerBatsman[],
  bowlerBalls: {[bowlerId: string]: number},
  bowlerRuns: {[bowlerId: string]: number},
  bowlerWickets: {[bowlerId: string]: number},
  batsmen: BowlerBatsman[],
  batsmanRuns: {[batsmanId: string]: number},
  batsmanBalls: {[batsmanId: string]: number}
): void => {
  displayData.playerStats![teamId].players.forEach(player => {
    // Update bowler stats
    const bowler = bowlers.find(b => b.Name === player.Name && b.TeamId === teamId);
    if (bowler && bowler.Id) {
      const bowlerId = bowler.Id;
      const ballsBowled = bowlerBalls[bowlerId] || 0;
      const overs = Math.floor(ballsBowled / 6); // Assuming 6 balls per over
      
      player.OB = overs.toString();
      player.RC = (bowlerRuns[bowlerId] || 0).toString();
      player.Wkts = (bowlerWickets[bowlerId] || 0).toString();
      
      // Calculate economy
      if (overs > 0) {
        const economy = (bowlerRuns[bowlerId] || 0) / overs;
        player.Econ = economy.toFixed(1);
      }
    }
    
    // Update batsman stats
    const batsman = batsmen.find(b => b.Name === player.Name && b.TeamId === teamId);
    if (batsman && batsman.Id) {
      const batsmanId = batsman.Id;
      
      player.RS = (batsmanRuns[batsmanId] || 0).toString();
      
      // Calculate strike rate
      const ballsFaced = batsmanBalls[batsmanId] || 0;
      if (ballsFaced > 0) {
        const strikeRate = ((batsmanRuns[batsmanId] || 0) / ballsFaced) * 100;
        player.SR = strikeRate.toFixed(1);
      }
    }
  });
};
