import type { GameState, NightActionSubmission, Player } from './types';
import { buildComposition, shuffledCopy } from './balance';
import { ROLES } from './roles';
import { resolveNight } from './nightEngine';
import { tallyVotes, resolveExecution } from './voting';
import { checkWinConditions } from './winConditions';

export function createGame(names: string[]): GameState {
  const n = names.length;
  const composition = buildComposition(n);
  const roles = shuffledCopy(composition.roles);

  const players: Player[] = names.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    role: roles[i],
    status: 'alive',
    roleRevealed: false,
    loverId: null,
    hasArmor: false,
    poisonedUntilNight: null,
    silencedNight: null,
    usedOncePerGame: false,
    lastProtectedTarget: null,
    votesWeight: roles[i] === 'politician' ? 2 : 1,
  }));

  return {
    players,
    phase: 'reveal',
    night: 0,
    day: 0,
    actions: [],
    roleblocked: new Set(),
    controlled: {},
    eventLog: [`Game created for ${n} players. Composition: ${JSON.stringify(composition.counts)}`],
    winner: null,
  };
}

/** Returns the night-acting roles present, alive, and not yet consumed (for once-per-game
 * roles), in the fixed priority order the narrator should walk through. */
export function nightActingOrder(state: GameState): string[] {
  return state.players
    .filter((p) => p.status === 'alive' && p.role && ROLES[p.role].nightAction)
    .filter((p) => {
      if (!p.role) return false;
      const def = ROLES[p.role];
      if (def.oncePerGame && p.usedOncePerGame) return false;
      if (p.role === 'cupid' && state.night !== 1) return false;
      return true;
    })
    .sort((a, b) => ROLES[a.role!].priority - ROLES[b.role!].priority)
    .map((p) => p.role!);
}

export function advanceToNight(state: GameState) {
  state.night += 1;
  state.phase = 'night';
  state.actions = [];
}

export function submitNightActions(state: GameState, submissions: NightActionSubmission[]) {
  for (const s of submissions) {
    const actor = state.players.find((p) => p.id === s.actorId);
    if (actor && actor.role && ROLES[actor.role].oncePerGame) actor.usedOncePerGame = true;
  }
  const result = resolveNight(state, submissions);
  state.phase = 'morning';
  state.winner = checkWinConditions(state);
  if (state.winner.over) state.phase = 'ended';
  return result;
}

export function advanceToDay(state: GameState) {
  state.day += 1;
  state.phase = 'day';
}

export function submitDayVote(state: GameState, ballots: Record<string, string>) {
  const tally = tallyVotes(state, ballots);
  const execution = resolveExecution(state, tally);
  const executedPlayer = state.players.find((p) => p.id === execution.executedId);
  const clownWin = executedPlayer?.role === 'clown';
  state.winner = checkWinConditions(state, clownWin);
  if (state.winner.over) state.phase = 'ended';
  return { tally, execution };
}
