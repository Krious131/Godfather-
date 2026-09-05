import type { GameState, WinCheckResult } from './types';
import { ROLES } from './roles';

/** Call this after any death (night resolution, execution, chain reaction).
 *  Must be able to end the game mid-resolution, not just at day's end. */
export function checkWinConditions(state: GameState, justExecutedClown = false): WinCheckResult {
  if (justExecutedClown) {
    return { over: true, winner: 'clown', reason: 'The Clown was executed by the village.' };
  }

  const livingPlayers = state.players.filter((p) => p.status === 'alive');
  const livingEvil = livingPlayers.filter((p) => p.role && ROLES[p.role].team === 'evil');
  const livingGood = livingPlayers.filter((p) => p.role && ROLES[p.role].team === 'good');
  const livingNeutralNonClown = livingPlayers.filter(
    (p) => p.role && ROLES[p.role].team === 'neutral' && p.role !== 'clown',
  );

  // Lovers-only endgame: if exactly the two lovers remain (any teams), they win together.
  if (livingPlayers.length === 2 && livingPlayers[0].loverId === livingPlayers[1].id) {
    return { over: true, winner: 'lovers', reason: 'Only the two Lovers remain.' };
  }

  if (livingEvil.length === 0) {
    return { over: true, winner: 'good', reason: 'Every Evil player has been eliminated.' };
  }

  if (livingEvil.length >= livingGood.length + livingNeutralNonClown.length) {
    return { over: true, winner: 'evil', reason: 'Evil equals or outnumbers the rest of the village.' };
  }

  return { over: false };
}
