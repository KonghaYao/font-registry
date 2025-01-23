import netlifyBlobsDriver from "unstorage/drivers/netlify-blobs";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    devtools: { enabled: false },
    modules: ["@nuxtjs/supabase", "@vueuse/nuxt", "@element-plus/nuxt", "@nuxt/ui", "@nuxtjs/mdc"],
    supabase: {
        redirect: false,
    },
    components: [
        {
            global: true,
            path: "./components",
        },
    ],
    nitro: {
        storage: {
            driver: netlifyBlobsDriver({
                deployScoped: true
            }),
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
