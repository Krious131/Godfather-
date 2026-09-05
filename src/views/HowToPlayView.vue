<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const steps = [
  'One player is the Narrator and does not play a role — they guide the phone around the table and resolve the night.',
  'Choose 8-16 players. The app builds a balanced mix of Good, Evil, and Neutral roles for that count.',
  'Pass the phone to each player privately. Hold to reveal your role, then hide it and pass it on.',
  'At night, the Narrator follows the on-screen order, collecting each role\'s action privately.',
  'At dawn, the app reveals who died (if anyone). Discuss, then vote to execute a suspect.',
  'The game ends automatically when a team\'s win condition is met.',
];
</script>
<template>
  <div class="py-8 flex flex-col gap-6 min-h-screen">
    <div class="flex items-center gap-3">
      <button class="btn-secondary" @click="router.back()">←</button>
      <h2 class="text-xl font-bold">HOW TO PLAY</h2>
    </div>
    <div v-for="(s, i) in steps" :key="i" class="card p-4 flex gap-3">
      <span class="font-black text-neon">{{ i + 1 }}</span>
      <p class="text-sm text-white/80">{{ s }}</p>
    </div>
  </div>
</template>
