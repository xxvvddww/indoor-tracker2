
import { DisplayableMatchInfo } from "../../../components/match/types";
import { Team } from "../../../types/cricket";

/**
 * Ensures that each team has a stats entry, even if empty
 */
export const ensureTeamStats = (teams: Team[], displayInfo: DisplayableMatchInfo): void => {
  console.log("Ensuring team stats for", teams.length, "teams");
  
  // Make sure playerStats object exists
  if (!displayInfo.playerStats) {
    displayInfo.playerStats = {};
  }
  
  teams.forEach(team => {
    if (!displayInfo.playerStats![team.Id]) {
      console.log("Creating empty stats for team:", team.Name);
      displayInfo.playerStats![team.Id] = {
        name: team.Name,
        players: []
      };
    } else {
      console.log("Team already has stats:", team.Name);
    }
  });
  
  console.log("Final playerStats structure:", Object.keys(displayInfo.playerStats));
};
