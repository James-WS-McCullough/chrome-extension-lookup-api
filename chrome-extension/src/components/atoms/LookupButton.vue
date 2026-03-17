<script setup lang="ts">
defineProps<{
  loading: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button type="button" :disabled="loading" @click="$emit('click')">
    <span v-if="loading" class="spinner" />
    <template v-else>
      <span class="material-symbols-outlined">person_search</span>
      Get Author Data
    </template>
  </button>
</template>

<style scoped>
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  background: #1d62dd;
  color: #f0f2f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button .material-symbols-outlined {
  font-size: 20px;
}

button:hover {
  background: #1752ba;
}

button:disabled {
  background: #373e4d;
  color: #7e879a;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #7e879a;
  border-top-color: #f0f2f5;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
