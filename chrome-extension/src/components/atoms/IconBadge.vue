<script setup lang="ts">
defineProps<{
  icon: string;
  variant: "error" | "info";
}>();
</script>

<template>
  <p :class="['icon-badge', `icon-badge--${variant}`]">{{ icon }}</p>
</template>

<style scoped>
.icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
}

.icon-badge--error {
  background: #3f1a1a;
  color: #f87171;
}

.icon-badge--info {
  background: #1a2a3f;
  color: #60a5fa;
  font-style: italic;
}
</style>
