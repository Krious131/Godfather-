<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

const store = useGameStore();
const router = useRouter();

const seconds = ref(180);
let timer: number | undefined;
function toggleTimer() {
  if (timer) { clearInterval(timer); timer = undefined; return; }
  timer = window.setInterval(() => { if (seconds.value > 0) seconds.value -= 1; }, 1000);
}
onUnmounted(() => timer && clearInterval(timer));

const mm = () => String(Math.floor(seconds.value / 60)).padStart(2, '0');
const ss = () => String(seconds.value % 60).padStart(2, '0');
</script>

<template>
  <div class="py-8 flex flex-col gap-6 min-h-screen">
    <h2 class="text-xl font-bold text-center">☀️ DAY {{ store.game?.day }}</h2>

    <div class="card p-6 text-center">
      <p class="text-4xl font-mono">{{ mm() }}:{{ ss() }}</p>
      <button class="btn-secondary mt-4" @click="toggleTimer">{{ timer ? 'PAUSE' : 'START DISCUSSION' }}</button>
    </div>

    <div>
      <p class="text-xs uppercase tracking-widest text-white/50 mb-2">Alive ({{ store.livingPlayers.length }})</p>
      <div class="flex flex-wrap gap-2">
        <span v-for="p in store.livingPlayers" :key="p.id" class="btn-pill bg-white/10 text-sm">{{ p.name }}</span>
      </div>
    </div>

    <div v-if="store.deadPlayers.length">
      <p class="text-xs uppercase tracking-widest text-white/50 mb-2">Dead ({{ store.deadPlayers.length }})</p>
      <div class="flex flex-wrap gap-2">
        <span v-for="p in store.deadPlayers" :key="p.id" class="btn-pill bg-white/5 text-white/40 line-through text-sm">{{ p.name }}</span>
      </div>
    </div>

    <button class="btn-primary mt-auto" @click="router.push('/vote')">GO TO VOTE</button>
  </div>
</template>
