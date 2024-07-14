<script setup lang="ts">
useSeoMeta({
  title: '你好',
  description: 'A Nuxt template to build your full-stack application on the edge.'
})
useHead({
  htmlAttrs: {
    lang: 'en',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/svg',
      href: '/q.svg',
    },
  ],
})
</script>

<template>
  <NuxtPage />
</template>
