<template>
  <h1 class="flex items-center gap-2 text-lg text-grey-50"><img src="../../../icons/icon-48.png" alt="" width="24" height="24" />Author Lookup</h1>
  <div class="flex-1 flex items-center [&>*]:w-full">
    <slot name="content" />
  </div>
  <slot name="action" />
</template>
