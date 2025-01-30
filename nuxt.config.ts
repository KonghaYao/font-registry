import netlifyBlobsDriver from "unstorage/drivers/netlify-blobs";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    devtools: { enabled: false },
    modules: ["@nuxtjs/supabase", "@vueuse/nuxt", "@element-plus/nuxt", "@nuxt/ui", "@nuxtjs/mdc"],
    supabase: {
        redirect: false,
    },
    runtimeConfig: {
        NUXT_SPLIT_SERVER: process.env.NUXT_SPLIT_SERVER,
        NUXT_SPLIT_SERVER_TOKEN: process.env.NUXT_SPLIT_SERVER_TOKEN,
        NUXT_WEBSITE_URL: process.env.NUXT_WEBSITE_URL,
        NUXT_OSS_ROOT: process.env.NUXT_OSS_ROOT,
        VITE_CDN_ROOT: process.env.VITE_CDN_ROOT,
    },
    components: [
        {
            global: true,
            path: "./components",
        },
    ],
    nitro: {
        storage: {
            cache: {
                name: "server-cache",
                driver: "netlify-blobs",
                options: {
                    name: "server-cache",
                    deployScoped: true,
                },
            },
        },
    },

    mdc: {
        components: {
            prose: false,
            map: {
                a: "mdc-a",
                img: "mdc-img",
            },
        },
    },
});
