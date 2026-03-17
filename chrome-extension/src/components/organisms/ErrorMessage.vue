<script setup lang="ts">
import StatusCard from "../molecules/StatusCard.vue";

defineProps<{
  message: string;
}>();
</script>

<template>
  <StatusCard icon="!" variant="error">
    <p>{{ message }}</p>
  </StatusCard>
</template>
