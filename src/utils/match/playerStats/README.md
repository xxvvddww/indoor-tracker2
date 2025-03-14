
# Player Statistics Extraction

This directory contains the code for extracting player statistics from match data. The code is organized as follows:

- `extractorService.ts`: Main entry point for extracting player statistics. It coordinates the extraction process.
- `summaryExtractor.ts`: Extracts player statistics from MatchSummary data.
- `bowlerBatsmanExtractor.ts`: Extracts player statistics from Batsmen and Bowlers data.
- `ballDataExtractor.ts`: Extracts player statistics from Ball data.
- `teamStatsInitializer.ts`: Initializes team statistics containers.
- `ballStatsCalculator.ts`: Calculates player statistics from Ball data.
- `playerStatsUpdater.ts`: Updates player statistics with calculated values.
- `batsmanStatsProcessor.ts`: Processes batsman statistics.
- `bowlerStatsProcessor.ts`: Processes bowler statistics.

## Data Source Priority

The extraction process tries different data sources in the following order:

1. MatchSummary (highest quality)
2. Batsmen and Bowlers data
3. Ball-by-ball data (last resort)

If a higher-quality data source is available and yields player data, the process stops there.
