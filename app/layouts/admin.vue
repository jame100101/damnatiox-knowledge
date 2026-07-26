<script setup lang="ts">
import { BookOpen, LogOut, Menu, X } from 'lucide-vue-next'

const auth = useAuth()
const { isDemo } = useKnowledge()
const route = useRoute()
const mobileOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)
</script>

<template>
  <div class="admin-shell">
    <header class="admin-mobile-header">
      <button type="button" aria-label="打开知识文件" @click="mobileOpen = true">
        <Menu :size="20" />
      </button>
      <NuxtLink to="/admin"><BrandMark /><strong>Damnatiox</strong></NuxtLink>
      <ThemeToggle />
    </header>

    <div v-if="mobileOpen" class="admin-backdrop" @click="mobileOpen = false" />
    <aside :class="{ mobileOpen }">
      <div class="admin-brand-row">
        <NuxtLink to="/admin" class="admin-brand"
          ><BrandMark /><span
            ><strong>Damnatiox</strong><small>KNOWLEDGE WORKSPACE</small></span
          ></NuxtLink
        >
        <button
          class="mobile-close"
          type="button"
          aria-label="关闭知识文件"
          @click="mobileOpen = false"
        >
          <X :size="17" />
        </button>
      </div>

      <AdminExplorer />

      <div class="admin-bottom">
        <NuxtLink to="/"><BookOpen :size="15" /> 查看知识库</NuxtLink>
        <ThemeToggle show-label />
        <button v-if="!isDemo" type="button" @click="auth.signOut">
          <LogOut :size="15" /> 退出登录
        </button>
      </div>
    </aside>
    <main>
      <div v-if="isDemo" class="admin-demo">开发演示模式 · 更改仅保存在当前内存</div>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  --admin-sidebar-width: 294px;
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr);
}
aside {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 100vh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 13px 10px 10px;
  border-right: 1px solid var(--kb-border);
  background: var(--kb-surface);
}
.admin-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.admin-brand {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 6px 16px;
}
.admin-brand span {
  min-width: 0;
  display: grid;
}
.admin-brand strong {
  font-size: 13px;
}
.admin-brand small {
  overflow: hidden;
  color: var(--kb-text-subtle);
  font: 7px monospace;
  letter-spacing: 0.12em;
  white-space: nowrap;
}
.mobile-close {
  display: none;
}
.admin-bottom {
  display: grid;
  gap: 2px;
  padding-top: 7px;
  border-top: 1px solid var(--kb-border);
}
.admin-bottom a,
.admin-bottom button {
  width: 100%;
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 8px;
  border: 0;
  border-radius: var(--kb-radius-sm);
  background: transparent;
  color: var(--kb-text-muted);
  font-size: 11px;
  cursor: pointer;
}
.admin-bottom a:hover,
.admin-bottom button:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
main {
  min-width: 0;
}
.admin-demo {
  min-height: 28px;
  display: grid;
  place-items: center;
  border-bottom: 1px solid var(--kb-demo-border);
  background: var(--kb-demo-bg);
  color: var(--kb-demo-text);
  font: 10px monospace;
}
.admin-mobile-header,
.admin-backdrop {
  display: none;
}
@media (max-width: 760px) {
  .admin-shell {
    display: block;
    padding-top: 54px;
  }
  .admin-mobile-header {
    position: fixed;
    inset: 0 0 auto;
    z-index: 45;
    height: 54px;
    display: grid;
    grid-template-columns: 36px 1fr 36px;
    align-items: center;
    padding: 0 10px;
    border-bottom: 1px solid var(--kb-border);
    background: var(--kb-panel-bg);
    backdrop-filter: blur(8px);
  }
  .admin-mobile-header > button {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: var(--kb-text-muted);
  }
  .admin-mobile-header > a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
  }
  aside {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(310px, 88vw);
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }
  aside.mobileOpen {
    transform: translateX(0);
  }
  .mobile-close {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: var(--kb-text-muted);
  }
  .admin-backdrop {
    position: fixed;
    inset: 0;
    z-index: 35;
    display: block;
    background: rgb(0 0 0 / 64%);
  }
}
</style>
