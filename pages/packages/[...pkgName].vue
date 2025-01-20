<script setup lang="ts">
import { type Database } from "../../types/database.types";
import "github-markdown-css/github-markdown.css";
import { createFontLink } from "~/composables/useFont";
definePageMeta({
    layout: "packages",
});

const route = useRoute();
const pkgName = route.params.pkgName as string[];

const pkgKey = pkgName.join("/");
const client = useSupabaseClient<Database>();
const pkgDetail = useAsyncData(async () => {
    if (!pkgKey) throw new Error("pkgKey is empty");
    const data = await client.from("packages").select("*").eq("name", pkgKey).single();
    return data.data;
});

function base64ToUtf8(base64String: string) {
    if (typeof Buffer === "function") {
        // Node.js 环境
        return Buffer.from(base64String, "base64").toString("utf8");
    } else if (typeof atob === "function" && typeof TextDecoder === "function") {
        // 浏览器环境
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder("utf-8").decode(bytes);
    } else {
        throw new Error("Unsupported environment");
    }
}
const items = [
    {
        label: "Readme",
    },
    {
        label: "版本",
    },
];
const fontInfoOfStyle = computed(() => {
    return (pkgDetail.data.value?.style || {}) as {
        family: string;
        weight: string;
        file_name: string;
    };
});
</script>
<template>
    <div
        class="min-w-48 max-w-[980px] mx-auto p-12"
        :style="{
            fontFamily: `'${fontInfoOfStyle.family}'`,
            fontWeight: fontInfoOfStyle.weight,
        }"
    >
        <link
            v-if="pkgDetail.data.value?.name && fontInfoOfStyle?.file_name"
            rel="stylesheet"
            :href="createFontLink(pkgDetail.data.value?.name, pkgDetail.data.value?.latest, fontInfoOfStyle?.file_name)"
        />
        <div class="my-6 p-8 bg-blue-50">
            <div class="text-2xl font-bold leading-tight text-gray-900 flex items-center mb-4">
                {{ pkgDetail.data.value?.name }}
            </div>
            <div>
                {{ pkgDetail.data.value?.description }}
            </div>
            <div>最新版本： {{ pkgDetail.data.value?.latest }}</div>
        </div>

        <UTabs :items="items" :default-index="0">
            <template #item="{ item }">
                <MDC
                    v-if="item.label === 'Readme'"
                    class="markdown-body mt-4"
                    :value="base64ToUtf8(pkgDetail.data.value?.readme || '')"
                    tag="article"
                />
                <version-panel
                    v-if="item.label === '版本'"
                    :pkg-id="pkgDetail.data.value?.id!"
                    :pkg-name="pkgDetail.data.value?.name!"
                >
                </version-panel>
            </template>
        </UTabs>
    </div>
</template>
