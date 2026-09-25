import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
      date: body.date || existing.date,
      team1: body.team1 || existing.team1,
      team2: body.team2 || existing.team2,
      winner: body.winner || existing.winner,
      city: body.city || existing.city,
      result: body.result || existing.result,
      result_margin: body.result_margin !== undefined ? parseInt(body.result_margin) : existing.result_margin,
      target_runs: body.target_runs !== undefined ? parseInt(body.target_runs) : existing.target_runs,
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
