# IPL Analytics & Match Insights Platform

A proper Full-Stack web application built to analyze, explore, and manage IPL matches data. This project transforms static data analysis into an interactive, real-time dashboard.

## Problem Statement
Analyzing IPL historical data using static python notebooks (like Jupyter/Colab) requires programming knowledge just to view basic charts, making it inaccessible for regular users. It also lacks an interface to explore individual matches dynamically, compare teams, and add or manage new match records interactively.

## Features
- **Main Dashboard**: High-level overview, summary cards, and interactive charts (Wins by Team, Matches by Season).
- **Match Explorer**: Explore historical matches with robust filtering (by team, city, season) and search.
- **Team Analytics**: Deep dive into individual team performance, win/loss ratios, and season-wise trends.
- **Team Comparison**: Select any two teams to view head-to-head records and overall statistical comparisons.
- **Data Management (CRUD)**: A complete interface to Add, Edit, or Delete match records persistently.
- **Real Database**: Uses SQLite for fast, local, and reliable data storage.

## Technology Stack
- **Frontend**: Next.js (App Router), React.js
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Next.js API Routes (Node.js)
- **Database**: SQLite (via `better-sqlite3`)

## Application Architecture
- `src/app/page.js`: Main Dashboard UI.
- `src/app/explorer`, `analytics`, `compare`, `manage`: Specific feature pages.
- `src/components/Sidebar.js`: Navigation UI.
- `src/app/api/matches/route.js` & `[id]/route.js`: RESTful API endpoints handling GET, POST, PUT, DELETE requests.
- `src/lib/db.js`: SQLite database connection and initialization logic.
- `src/data/matches.json`: Initial mock seed data used to populate the database on the first run.

## Dataset Information
The application is pre-seeded using local IPL match data. The model supports fields like `date`, `team1`, `team2`, `winner`, `city`, `result`, `result_margin`, and `target_runs`. Missing fields from the original Kaggle dataset (like `player_of_match`, `toss_decision`) were omitted to strictly adhere to the available and clean data.

## Installation Instructions

1. Clone or download the repository.
2. Ensure you have Node.js installed.
3. Install dependencies:
   ```bash
   npm install
   ```

## How to Run

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
*(The SQLite database `ipl_analytics.db` is automatically created and seeded on the first API request).*

## API Endpoints
- `GET /api/matches` - Retrieves all matches (Supports `?team=` query).
- `POST /api/matches` - Creates a new match record.
- `GET /api/matches/[id]` - Retrieves a specific match.
- `PUT /api/matches/[id]` - Updates a specific match.
- `DELETE /api/matches/[id]` - Deletes a specific match.

## Future Improvements
- Integrate ball-by-ball delivery datasets for deep player analytics.
- Add user authentication (e.g., using NextAuth) to protect the Data Management (CRUD) routes.
- Implement server-side pagination for the Match Explorer to handle extremely large datasets efficiently.
