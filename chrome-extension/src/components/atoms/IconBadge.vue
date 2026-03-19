<script setup lang="ts">
defineProps<{
  icon: string;
  variant: "error" | "info";
}>();
</script>

<template>
  <p
    :class="[
      'flex items-center justify-center shrink-0 w-9 h-9 rounded-full text-lg font-bold',
      variant === 'error' ? 'bg-error-bg text-error-text' : 'bg-blue-900 text-blue-300 italic',
    ]"
  >
    {{ icon }}
  </p>
</template>
