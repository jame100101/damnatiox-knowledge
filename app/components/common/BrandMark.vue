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
:global(:root[data-theme='light'] .brand-mark) {
  border-color: #8d9f87;
  background: linear-gradient(145deg, #ffffff 0%, #e5ede1 100%);
  box-shadow:
    0 1px 2px rgb(28 43 31 / 18%),
    inset 0 0 0 1px rgb(255 255 255 / 70%);
}
:global(:root[data-theme='light'] .brand-mark span) {
  width: 3.25px;
  background: #4d6800;
  box-shadow: 0 0 0 0.35px rgb(47 68 23 / 25%);
}
</style>
