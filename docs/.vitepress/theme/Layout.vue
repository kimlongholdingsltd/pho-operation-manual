<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- Huy hiệu ấn bản xuất hiện phía trên tiêu đề hero trang chủ -->
    <template #home-hero-info-before>
      <span class="hero-badge">Ấn bản chuẩn hóa thực chiến · Mẻ nấu 100L</span>
    </template>
  </Layout>
</template>
