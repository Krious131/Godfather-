<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

const store = useGameStore();
const router = useRouter();

const ballots = ref<Record<string, string>>({});
const outcome = ref<ReturnType<typeof store.castVote> | null>(null);

const voters = computed(() => store.livingPlayers);

function setBallot(voterId: string, targetId: string) {
  ballots.value[voterId] = targetId;
}

function tally() {
  outcome.value = store.castVote(ballots.value);
}

function continueGame() {
  if (store.game?.phase === 'ended') router.push('/');
  else router.push('/night');
}
</script>

<template>
  <div class="py-8 flex flex-col gap-6 min-h-screen">
    <h2 class="text-xl font-bold text-center">VOTE</h2>

    <template v-if="!outcome">
      <div v-for="voter in voters" :key="voter.id" class="card p-4">
        <p class="font-semibold mb-2">{{ voter.name }} votes for:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="t in voters.filter((v) => v.id !== voter.id)" :key="t.id"
            class="btn-pill text-xs"
            :class="ballots[voter.id] === t.id ? 'bg-neon text-white' : 'bg-white/10'"
            @click="setBallot(voter.id, t.id)"
          >{{ t.name }}</button>
        </div>
      </div>
      <button class="btn-primary mt-auto" @click="tally">TALLY VOTES</button>
    </template>

    <template v-else>
      <div class="card p-6 text-center flex flex-col gap-2">
        <p v-if="outcome.execution.tied" class="text-lg">The vote was tied. No one is executed.</p>
        <p v-else class="text-lg">{{ outcome.execution.summary }}</p>
        <p v-if="store.game?.winner?.over" class="text-neon font-bold mt-2">
          {{ store.game.winner.winner?.toUpperCase() }} WINS — {{ store.game.winner.reason }}
        </p>
      </div>
      <button class="btn-primary mt-auto" @click="continueGame">
        {{ store.game?.phase === 'ended' ? 'BACK TO HOME' : 'CONTINUE TO NIGHT' }}
      </button>
    </template>
  </div>
</template>
