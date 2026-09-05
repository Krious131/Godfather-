export type Team = 'good' | 'evil' | 'neutral';

export type RoleId =
  | 'killer' | 'assassin' | 'alchemist' | 'puppeteer'
  | 'sheriff' | 'doctor' | 'prophet' | 'bartender' | 'blacksmith'
  | 'grandma' | 'politician' | 'gossip' | 'medium'
  | 'cupid' | 'clown';

export interface RoleDef {
  id: RoleId;
  name: string;
  team: Team;
  tier: 1 | 2 | 3; // 1 = essential/simple, 2 = standard, 3 = advanced/chaos
  category: 'kill' | 'protect' | 'info' | 'support' | 'chaos' | 'social';
  nightAction: boolean;
  oncePerGame: boolean;
  priority: number; // lower = acts earlier in the night
  minPlayers: number;
  maxPlayers: number;
  weight: number; // used by balancer, higher = more likely once eligible
  short: string;
  ability: string;
  objective: string;
  activates: string;
  limitations: string;
  interactions: string;
}

export type PlayerStatus = 'alive' | 'dead';

export interface Player {
  id: string;
  name: string;
  role: RoleId | null;
  status: PlayerStatus;
  roleRevealed: boolean;
  loverId: string | null;
  hasArmor: boolean;
  poisonedUntilNight: number | null; // night number the poison kills, if not cured
  silencedNight: number | null;
  usedOncePerGame: boolean;
  lastProtectedTarget: string | null; // doctor bookkeeping (own id)
  votesWeight: number;
}

export interface NightActionSubmission {
  roleId: RoleId;
  actorId: string;
  targetId?: string;
  secondTargetId?: string;
}

export interface NightResult {
  night: number;
  deaths: { playerId: string; cause: string }[];
  info: { toPlayerId: string; message: string }[];
  log: string[];
  publicSummary: string;
}

export interface WinCheckResult {
  over: boolean;
  winner?: Team | 'clown' | 'lovers';
  reason?: string;
}

export interface GameState {
  players: Player[];
  phase: 'setup' | 'reveal' | 'night' | 'morning' | 'day' | 'voting' | 'ended';
  night: number;
  day: number;
  actions: NightActionSubmission[];
  roleblocked: Set<string>;
  controlled: Record<string, string>; // actorId -> forcedTargetId
  eventLog: string[];
  winner: WinCheckResult | null;
}
