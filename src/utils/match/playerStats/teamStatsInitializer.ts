
import { DisplayableMatchInfo } from "../../../components/match/types";
import { Team } from "../../../types/cricket";

/**
 * Ensures that each team has a stats entry, even if empty
 */
export const ensureTeamStats = (teams: Team[], displayInfo: DisplayableMatchInfo): void => {
  teams.forEach(team => {
    if (!displayInfo.playerStats![team.Id]) {
      displayInfo.playerStats![team.Id] = {
        name: team.Name,
        players: []
      };
    }
  });
};
