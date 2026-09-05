import { defineStore } from 'pinia';
import type { GameState, NightActionSubmission, NightResult } from '../engine/types';
import { createGame, advanceToNight, submitNightActions, advanceToDay, submitDayVote, nightActingOrder } from '../engine/gameEngine';
import { ROLES } from '../engine/roles';

const SAVE_KEY = 'godfather-save-v1';

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null as GameState | null,
    lastNightResult: null as NightResult | null,
    revealIndex: 0,
    settings: {
      sound: true,
      haptics: true,
      animations: true,
      language: 'en' as 'en' | 'ta',
    },
  }),
  getters: {
    livingPlayers: (s) => s.game?.players.filter((p) => p.status === 'alive') ?? [],
    deadPlayers: (s) => s.game?.players.filter((p) => p.status === 'dead') ?? [],
    nightOrder: (s) => (s.game ? nightActingOrder(s.game) : []),
    roleOf: (s) => (playerId: string) => {
      const p = s.game?.players.find((pl) => pl.id === playerId);
      return p?.role ? ROLES[p.role] : null;
    },
  },
  actions: {
    startNewGame(names: string[]) {
      this.game = createGame(names);
      this.revealIndex = 0;
      this.persist();
    },
    revealNext() {
      if (!this.game) return;
      this.game.players[this.revealIndex].roleRevealed = true;
      this.revealIndex += 1;
      if (this.revealIndex >= this.game.players.length) this.game.phase = 'night';
      this.persist();
    },
    beginNight() {
      if (this.game) { advanceToNight(this.game); this.persist(); }
    },
    resolveNight(submissions: NightActionSubmission[]) {
      if (!this.game) return;
      this.lastNightResult = submitNightActions(this.game, submissions);
      this.persist();
    },
    beginDay() {
      if (this.game) { advanceToDay(this.game); this.persist(); }
    },
    castVote(ballots: Record<string, string>) {
      if (!this.game) return null;
      const outcome = submitDayVote(this.game, ballots);
      this.persist();
      return outcome;
    },
    markStatus(playerId: string, status: 'alive' | 'dead') {
      const p = this.game?.players.find((pl) => pl.id === playerId);
      if (p) { p.status = status; this.persist(); }
    },
    resetGame() {
      this.game = null;
      this.lastNightResult = null;
      localStorage.removeItem(SAVE_KEY);
    },
    persist() {
      if (!this.game) return;
      const serializable = { ...this.game, roleblocked: Array.from(this.game.roleblocked) };
      localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
    },
    loadSaved() {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      parsed.roleblocked = new Set(parsed.roleblocked ?? []);
      this.game = parsed as GameState;
      return true;
    },
  },
});
