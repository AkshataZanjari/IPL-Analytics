import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET API endpoint to fetch all matches
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');
    
    let matches;
    if (team) {
      const stmt = db.prepare('SELECT * FROM matches WHERE team1 = ? OR team2 = ? ORDER BY date DESC');
      matches = stmt.all(team, team);
    } else {
      const stmt = db.prepare('SELECT * FROM matches ORDER BY date DESC');
      matches = stmt.all();
    }
    
    return NextResponse.json(matches);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

// POST API endpoint to add a new match
export async function POST(request) {
  try {
    const body = await request.json();
    const newMatch = {
      id: uuidv4(),
      date: body.date,
      team1: body.team1,
      team2: body.team2,
      winner: body.winner,
      city: body.city || 'Unknown',
      result: body.result || 'runs',
      result_margin: parseInt(body.result_margin) || 0,
      target_runs: parseInt(body.target_runs) || 0,
    };

    const insert = db.prepare(`
      INSERT INTO matches (id, date, team1, team2, winner, city, result, result_margin, target_runs)
      VALUES (@id, @date, @team1, @team2, @winner, @city, @result, @result_margin, @target_runs)
    `);
    
    insert.run(newMatch);

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to add match' }, { status: 400 });
  }
}
