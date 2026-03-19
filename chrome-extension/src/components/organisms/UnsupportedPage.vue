<script setup lang="ts">
import StatusCard from "../molecules/StatusCard.vue";
</script>

<template>
  <StatusCard icon="i" variant="info">
    <p>Navigate to <a href="https://quotes.toscrape.com" target="_blank">quotes.toscrape.com</a> to use this extension.</p>
  </StatusCard>
</template>

<style scoped>
a {
  color: var(--blue-300);
}
</style>
