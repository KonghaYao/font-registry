<script setup lang="ts">
import { isClient } from "@vueuse/core";
import "github-markdown-css/github-markdown.css";
import { createFontLink } from "~/composables/useFont";
definePageMeta({
    layout: "packages",
});

const route = useRoute();
const pkgName = route.params.pkgName as string[];

const pkgKey = pkgName.join("/");
const urlConfig = reactive({ a: "", img: "" });
provide("mdc-base-url", urlConfig);
const pkgDetail = useFetch("/api/packages/get?pkgKey=" + pkgKey);
if (pkgDetail.data.value?.from === "github_api") {
    Object.assign(urlConfig, {
        a: "https://github.com/" + pkgKey + "/",
        img: "https://ik.imagekit.io/github/" + pkgKey + "/raw/HEAD/",
    });
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
                {{ pkgDetail.data.value?.name_cn }}
                {{ pkgDetail.data.value?.name }}
            </div>
            <div>
                {{ pkgDetail.data.value?.description }}
            </div>
            <PackageDetailRow :pack="pkgDetail.data.value!"></PackageDetailRow>
        </div>
        <UTabs :items="items" :default-index="0">
            <template #item="{ item }">
                <MDC
                    v-if="item.label === 'Readme'"
                    class="markdown-body mt-4"
                    :value="pkgDetail.data.value?.readme || ''"
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

<style>
.markdown-body p a {
    display: inline;
}
</style>
