// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    // ตัวแปรที่ใช้ได้เฉพาะ server-side
    groqApiKey: process.env.GROQ_API_KEY,
    
    // ตัวแปรที่ใช้ได้ทั้ง client และ server
    public: {
      apiBase: process.env.API_BASE_URL
    }
  }
})