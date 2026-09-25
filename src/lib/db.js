import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize the database connection
const dbPath = path.join(process.cwd(), 'ipl_analytics.db');
const db = new Database(dbPath, { verbose: console.log });

// Create matches table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    date TEXT,
    team1 TEXT,
    team2 TEXT,
    winner TEXT,
    city TEXT,
    result TEXT,
    result_margin INTEGER,
    target_runs INTEGER
  )
`);

// Seed database if empty
const stmt = db.prepare('SELECT COUNT(*) AS count FROM matches');
const { count } = stmt.get();

if (count === 0) {
  try {
    const seedFilePath = path.join(process.cwd(), 'src', 'data', 'matches.json');
    if (fs.existsSync(seedFilePath)) {
      const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));
      const insert = db.prepare(`
        INSERT INTO matches (id, date, team1, team2, winner, city, result, result_margin, target_runs)
        VALUES (@id, @date, @team1, @team2, @winner, @city, @result, @result_margin, @target_runs)
      `);
      
      const insertMany = db.transaction((matches) => {
        for (const match of matches) {
          insert.run(match);
        }
      });
      
      insertMany(seedData);
      console.log('Database seeded successfully from JSON.');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

export default db;
