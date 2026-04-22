const API_URL = 'http://localhost:4000';

export async function startSession(gameId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { token: string };
    return data.token;
  } catch {
    return null;
  }
}

export interface LeaderboardEntry {
  login: string;
  score: number;
  duration_seconds: number | null;
  victory: number | null;
  created_at: string;
}

export async function submitScore(payload: {
  login: string;
  score: number;
  duration_seconds: number;
  stats: Record<string, number>;
  token: string | null;
}): Promise<void> {
  try {
    await fetch(`${API_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: 'nu_pogodi', victory: false, ...payload }),
    });
  } catch {
    // backend unavailable — silently ignore
  }
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${API_URL}/api/leaderboard/nu_pogodi?limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
