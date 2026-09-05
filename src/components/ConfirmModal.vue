<script setup lang="ts">
defineProps<{ open: boolean; title: string; message: string }>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
    <div class="card p-6 w-full max-w-sm flex flex-col gap-4">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <p class="text-sm text-white/70">{{ message }}</p>
      <div class="flex gap-3">
        <button class="btn-secondary flex-1" @click="emit('cancel')">CANCEL</button>
        <button class="btn-primary flex-1" @click="emit('confirm')">CONFIRM</button>
      </div>
    </div>
  </div>
</template>
