<template>
  <h1><img src="../../../icons/icon-48.png" alt="" width="24" height="24" />Author Lookup</h1>
  <div class="content-area">
    <slot name="content" />
  </div>
  <slot name="action" />
</template>

<style scoped>
.content-area {
  flex: 1;
  display: flex;
  align-items: center;
}

.content-area > :deep(*) {
  width: 100%;
}
</style>
