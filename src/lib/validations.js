import { z } from 'zod';

export const matchSchema = z.object({
  date: z.string().min(1, "Date is required"),
  team1: z.string().min(1, "Team 1 is required"),
  team2: z.string().min(1, "Team 2 is required"),
  winner: z.string().min(1, "Winner is required"),
  city: z.string().optional().default('Unknown'),
  result: z.enum(['runs', 'wickets']).optional().default('runs'),
  result_margin: z.union([z.string(), z.number()]).transform(v => parseInt(v, 10) || 0).optional().default(0),
  target_runs: z.union([z.string(), z.number()]).transform(v => parseInt(v, 10) || 0).optional().default(0)
}).refine(data => data.team1 !== data.team2, {
  message: "Team 1 and Team 2 cannot be the same",
  path: ["team2"]
}).refine(data => data.winner === data.team1 || data.winner === data.team2, {
  message: "Winner must be either Team 1 or Team 2",
  path: ["winner"]
});
