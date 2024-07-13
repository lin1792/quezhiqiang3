// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt 4 directory structure and features
  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: { compatibilityVersion: 4 },
  // devServer: {
  //   host: '0.0.0.0', // 或指定特定的 IP 地址，例如 '192.168.1.100'
  //   port: 3000 // 你想要使用的端口
  // },
  // Nuxt Modules
  // https://nuxt.com/modules
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    // '@nuxtjs/tailwindcss',
    '@element-plus/nuxt'
  ],
  css: [
    './assets/css/reset.scss',
    './assets/css/element.scss',
    './assets/css/common.scss'
  ],
  hub: {
    database: true,
    kv: true,
    blob: true,
    cache: true,
  },

  nitro: {
    experimental: {
      // Enable Server API documentation within NuxtHub
      openAPI: true
    }
  },

  // Development
  devtools: { enabled: true },

  compatibilityDate: '2024-07-09',
})
