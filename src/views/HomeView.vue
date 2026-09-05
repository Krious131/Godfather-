<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center gap-10">
    <div class="animate-pulse-slow">
      <h1 class="text-5xl font-black tracking-tight bg-gradient-to-r from-neon to-uv bg-clip-text text-transparent">
        GODFATHER
      </h1>
      <p class="mt-2 text-white/60 tracking-[0.3em] text-sm">SHADOWS OF THE VILLAGE</p>
    </div>

    <div class="flex flex-col gap-4 w-full">
      <button class="btn-primary" @click="router.push('/setup')">PLAY</button>
      <button class="btn-secondary" @click="router.push('/library')">ROLE LIBRARY</button>
      <button class="btn-secondary" @click="router.push('/how-to-play')">HOW TO PLAY</button>
      <button class="btn-secondary" @click="router.push('/settings')">SETTINGS</button>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow { animation: pulse 4s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.75; } }
</style>
