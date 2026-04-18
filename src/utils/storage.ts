const HS_KEY = 'warehouse_catcher_hs';

export function getHighScore(): number {
  const v = localStorage.getItem(HS_KEY);
  return v ? parseInt(v, 10) : 0;
}

export function saveHighScore(score: number): void {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem(HS_KEY, String(score));
  }
}
