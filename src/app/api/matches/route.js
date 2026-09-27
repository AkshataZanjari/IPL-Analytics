import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { matchSchema } from '@/lib/validations';
import { auth } from '@/auth';

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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    
    // Validate request body
    const validation = matchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.format() }, { status: 400 });
    }
    
    const validatedData = validation.data;

    const newMatch = {
      id: uuidv4(),
      date: validatedData.date,
      team1: validatedData.team1,
      team2: validatedData.team2,
      winner: validatedData.winner,
      city: validatedData.city,
      result: validatedData.result,
      result_margin: validatedData.result_margin,
      target_runs: validatedData.target_runs,
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
