import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { matchSchema } from '@/lib/validations';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const stmt = db.prepare('SELECT * FROM matches WHERE id = ?');
    const match = stmt.get(id);
    
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validation = matchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.format() }, { status: 400 });
    }
    
    const validatedData = validation.data;
    
    const stmt = db.prepare('SELECT * FROM matches WHERE id = ?');
    const existing = stmt.get(id);
    
    if (!existing) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const updateStmt = db.prepare(`
      UPDATE matches 
      SET date = @date, team1 = @team1, team2 = @team2, winner = @winner, 
          city = @city, result = @result, result_margin = @result_margin, target_runs = @target_runs
      WHERE id = @id
    `);

    updateStmt.run({
      id,
      date: validatedData.date,
      team1: validatedData.team1,
      team2: validatedData.team2,
      winner: validatedData.winner,
      city: validatedData.city,
      result: validatedData.result,
      result_margin: validatedData.result_margin,
      target_runs: validatedData.target_runs,
    });

    return NextResponse.json({ message: 'Match updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const stmt = db.prepare('DELETE FROM matches WHERE id = ?');
    const info = stmt.run(id);
    
    if (info.changes === 0) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Match deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
  }
}
