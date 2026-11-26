<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- Huy hiệu phiên bản xuất hiện phía trên tiêu đề hero trang chủ -->
    <template #home-hero-info-before>
      <span class="hero-badge">Phiên bản thương mại v1.3.0 · Chuẩn hóa 100L</span>
    </template>
  </Layout>
</template>
