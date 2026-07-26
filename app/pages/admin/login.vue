<script setup lang="ts">
import { ArrowLeft, KeyRound, LockKeyhole, Mail } from 'lucide-vue-next'

definePageMeta({ layout: false })
useHead({ title: '管理员登录' })
const { $supabaseConfigured } = useNuxtApp()
const auth = useAuth()
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await auth.signIn(email.value, password.value)
    if (!auth.isAdmin.value) {
      await auth.signOut()
      throw new Error('此账户没有管理员权限')
    }
    await navigateTo('/admin')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '登录失败'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <NuxtLink to="/" class="back"><ArrowLeft :size="15" /> 返回知识库</NuxtLink>
    <section class="login-card">
      <div class="login-brand"><BrandMark /><span><strong>Damnatiox</strong><small>SECURE ADMIN ACCESS</small></span></div>
      <div class="login-icon"><LockKeyhole :size="22" /></div>
      <span class="eyebrow">ADMIN CONSOLE</span>
      <h1>管理员登录</h1>
      <p>使用 Supabase Auth 中已被授予 admin 角色的账户。</p>
      <div v-if="!$supabaseConfigured" class="config-notice">
        当前尚未配置 Supabase 环境变量。本地开发可直接访问
        <NuxtLink to="/admin">管理后台</NuxtLink>。
      </div>
      <form v-else @submit.prevent="submit">
        <div class="field"><label>邮箱</label><div class="input-wrap"><Mail :size="15" /><input v-model="email" type="email" autocomplete="email" required placeholder="admin@example.com" /></div></div>
        <div class="field"><label>密码</label><div class="input-wrap"><KeyRound :size="15" /><input v-model="password" type="password" autocomplete="current-password" required placeholder="••••••••••••" /></div></div>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button class="button primary" :disabled="busy" type="submit">{{ busy ? '正在验证…' : '进入管理后台' }}</button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--kb-bg); }
.back { position: fixed; top: 22px; left: 24px; display: flex; align-items: center; gap: 7px; color: var(--kb-text-subtle); font-size: 12px; }
.back:hover { color: var(--kb-text); }
.login-card { width: min(430px, 100%); padding: 31px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-lg); background: var(--kb-surface); box-shadow: var(--kb-shadow); }
.login-brand { display: flex; align-items: center; gap: 9px; padding-bottom: 27px; margin-bottom: 29px; border-bottom: 1px solid var(--kb-border); }
.login-brand span { display: grid; }
.login-brand strong { font-size: 13px; }
.login-brand small { color: var(--kb-text-subtle); font: 8px monospace; letter-spacing: .12em; }
.login-icon { width: 44px; height: 44px; display: grid; place-items: center; margin-bottom: 19px; border: 1px solid var(--kb-border-strong); border-radius: 10px; color: var(--kb-accent); background: var(--kb-code-bg); }
h1 { margin: 8px 0 9px; font-size: 28px; letter-spacing: -.04em; }
.login-card > p { margin: 0 0 24px; color: var(--kb-text-muted); font-size: 13px; line-height: 1.6; }
form { display: grid; gap: 16px; }
.input-wrap { height: 42px; display: flex; align-items: center; gap: 9px; padding: 0 11px; border: 1px solid var(--kb-border); border-radius: var(--kb-radius-sm); background: var(--kb-bg); color: var(--kb-text-subtle); }
.input-wrap:focus-within { border-color: var(--kb-accent); }
.input-wrap input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--kb-text); }
.config-notice { padding: 12px; border: 1px solid #3c4023; border-radius: var(--kb-radius-sm); background: #171a0f; color: #b7c17c; font-size: 12px; line-height: 1.6; }
.config-notice a { color: var(--kb-accent); text-decoration: underline; }
</style>
