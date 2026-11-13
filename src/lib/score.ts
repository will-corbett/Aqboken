/** Scores coloured by achievement. */
export const scoreClass = (pct: number) => (pct >= 90 ? 'score-green' : pct >= 75 ? 'score-yellow' : pct >= 50 ? 'score-orange' : 'score-red');
