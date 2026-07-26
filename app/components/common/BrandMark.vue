<template>
  <div class="brand-mark" aria-hidden="true">
    <span />
    <span />
    <span />
  </div>
</template>

<style scoped>
.brand-mark {
  width: 27px;
  height: 27px;
  position: relative;
  display: grid;
  place-items: center;
  border: 1px solid var(--kb-border-strong);
  border-radius: 7px;
  background: var(--kb-code-bg);
}
.brand-mark span {
  position: absolute;
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: var(--kb-accent);
  transform: rotate(30deg);
}
.brand-mark span:first-child { translate: -6px 2px; height: 8px; }
.brand-mark span:last-child { translate: 6px -2px; height: 8px; }
</style>
