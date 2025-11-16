/**
 * Database seeding script
 *
 * This script helps populate the database with sample data for development and testing.
 * Run with: npx tsx src/scripts/seed.ts
 */

import { connectDatabase } from '../config/database';
import { Game } from '../models/Game';
import { SteamUser } from '../models/SteamUser';
import { SteamToGiantBomb } from '../models/SteamToGiantBomb';
import { logger } from '../utils/logger';

const sampleGames = [
  {
    gbId: 19564,
    name: 'Half-Life 2',
    deck: 'The sequel to the game named "Game of the Year" over 50 times, Half-Life 2 challenges players with the return of the critically acclaimed first-person shooter.',
    genres: [{ id: 1, name: 'Action', api_detail_url: 'https://www.giantbomb.com/api/genre/3060-1/' }],
    developers: [{ id: 1, name: 'Valve', api_detail_url: 'https://www.giantbomb.com/api/company/3010-1/' }],
  },
  {
    gbId: 24024,
    name: 'Portal',
    deck: 'A puzzle game where players use portals to solve spatial challenges.',
    genres: [{ id: 2, name: 'Puzzle', api_detail_url: 'https://www.giantbomb.com/api/genre/3060-2/' }],
    developers: [{ id: 1, name: 'Valve', api_detail_url: 'https://www.giantbomb.com/api/company/3010-1/' }],
  },
];

const sampleSteamUser = {
  steamID64: '76561198000000000',
  username: 'sample_user',
  realname: 'Sample User',
  gameCount: 2,
  games: [
    { appid: 220, name: 'Half-Life 2', playtime_forever: 1500 },
    { appid: 400, name: 'Portal', playtime_forever: 800 },
  ],
};

const sampleMappings = [
  { steamAppId: 220, steamName: 'Half-Life 2', gbId: 19564, gbName: 'Half-Life 2', confidence: 1.0, verified: true },
  { steamAppId: 400, steamName: 'Portal', gbId: 24024, gbName: 'Portal', confidence: 1.0, verified: true },
];

async function seed() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing sample data
    logger.info('Clearing existing sample data...');
    await Game.deleteMany({ gbId: { $in: sampleGames.map(g => g.gbId) } });
    await SteamUser.deleteMany({ steamID64: sampleSteamUser.steamID64 });
    await SteamToGiantBomb.deleteMany({ steamAppId: { $in: sampleMappings.map(m => m.steamAppId) } });

    // Insert sample games
    logger.info(`Inserting ${sampleGames.length} sample games...`);
    await Game.insertMany(sampleGames);

    // Insert sample Steam user
    logger.info('Inserting sample Steam user...');
    await SteamUser.create(sampleSteamUser);

    // Insert sample mappings
    logger.info(`Inserting ${sampleMappings.length} sample mappings...`);
    await SteamToGiantBomb.insertMany(sampleMappings);

    logger.info('✅ Database seeding completed successfully!');
    logger.info('\nSample data created:');
    logger.info(`  - ${sampleGames.length} games`);
    logger.info(`  - 1 Steam user (ID: ${sampleSteamUser.steamID64})`);
    logger.info(`  - ${sampleMappings.length} game mappings`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed();
}

export { seed };
