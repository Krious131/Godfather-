<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{ revealed: [] }>();
const holding = ref(false);
const progress = ref(0);
let raf = 0;
const HOLD_MS = 700;

function startHold() {
  holding.value = true;
  const start = performance.now();
  const tick = (t: number) => {
    progress.value = Math.min(1, (t - start) / HOLD_MS);
    if (progress.value >= 1) {
      emit('revealed');
      return;
    }
    if (holding.value) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function endHold() {
  holding.value = false;
  progress.value = 0;
  cancelAnimationFrame(raf);
}
</script>

<template>
  <button
    class="w-full h-40 rounded-3xl border-2 border-dashed border-white/30 flex items-center justify-center relative overflow-hidden select-none"
    @pointerdown="startHold"
    @pointerup="endHold"
    @pointerleave="endHold"
  >
    <div
      class="absolute inset-0 bg-gradient-to-r from-neon to-uv origin-left transition-transform"
      :style="{ transform: `scaleX(${progress})` }"
    />
    <span class="relative z-10 font-semibold tracking-wide">HOLD TO REVEAL</span>
  </button>
</template>
