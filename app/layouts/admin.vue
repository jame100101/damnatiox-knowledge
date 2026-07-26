<script setup lang="ts">
import { BookOpen, FilePlus2, Files, FolderTree, Gauge, LogOut } from 'lucide-vue-next'

const auth = useAuth()
const { isDemo } = useKnowledge()
</script>

<template>
  <div class="admin-shell">
    <aside>
      <NuxtLink to="/" class="admin-brand"
        ><BrandMark /><span
          ><strong>Damnatiox</strong><small>ADMIN CONSOLE</small></span
        ></NuxtLink
      >
      <nav>
        <NuxtLink to="/admin"><Gauge :size="16" /> 仪表盘</NuxtLink>
        <NuxtLink to="/admin/folders"><FolderTree :size="16" /> 文件夹</NuxtLink>
        <NuxtLink to="/admin/documents"><Files :size="16" /> 文档管理</NuxtLink>
        <NuxtLink to="/admin/documents/new"><FilePlus2 :size="16" /> 新建文档</NuxtLink>
      </nav>
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
  min-height: 100vh;
  display: grid;
  grid-template-columns: 220px 1fr;
}
aside {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 17px 12px 12px;
  border-right: 1px solid var(--kb-border);
  background: var(--kb-surface);
}
.admin-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 2px 7px 24px;
}
.admin-brand span {
  display: grid;
}
.admin-brand strong {
  font-size: 13px;
}
.admin-brand small {
  color: var(--kb-text-subtle);
  font: 8px monospace;
  letter-spacing: 0.12em;
}
nav {
  display: grid;
  gap: 3px;
}
nav a,
.admin-bottom a,
.admin-bottom button {
  min-height: 39px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border: 0;
  border-radius: var(--kb-radius-sm);
  background: transparent;
  color: var(--kb-text-muted);
  font-size: 13px;
  cursor: pointer;
}
nav a:hover,
nav a.router-link-exact-active,
.admin-bottom a:hover,
.admin-bottom button:hover {
  background: var(--kb-surface-hover);
  color: var(--kb-text);
}
nav a.router-link-exact-active {
  box-shadow: inset 2px 0 var(--kb-accent);
}
.admin-bottom {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--kb-border);
}
.admin-bottom button {
  width: 100%;
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
@media (max-width: 720px) {
  .admin-shell {
    grid-template-columns: 1fr;
    padding-bottom: 58px;
  }
  aside {
    position: fixed;
    inset: auto 0 0;
    z-index: 30;
    width: auto;
    height: 58px;
    display: block;
    padding: 5px;
    border: 1px solid var(--kb-border);
  }
  .admin-brand,
  .admin-bottom {
    display: none;
  }
  nav {
    height: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
  nav a {
    min-width: 0;
    justify-content: center;
    padding: 7px;
    font-size: 0;
  }
  nav a svg {
    width: 19px;
    height: 19px;
  }
}
</style>
