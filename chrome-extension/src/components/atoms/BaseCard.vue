<template>
  <div class="base-card">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: #262b37;
  border: 1px solid #373e4d;
  border-radius: 8px;
  padding: 16px;
  animation: zoom-fade-in 0.4s ease-out;
}

@keyframes zoom-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
