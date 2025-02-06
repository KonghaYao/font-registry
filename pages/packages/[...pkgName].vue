<script setup lang="ts">
import "github-markdown-css/github-markdown-light.css";
import { createFontLink } from "~/composables/useFont";
import type PackageType from "#server-endpoint/api/packages/get.ts";
definePageMeta({
    layout: "packages",
});

const route = useRoute();
const pkgName = route.params.pkgName as string[];

const pkgKey = pkgName.join("/");
console.log(pkgKey);
const urlConfig = reactive({ a: "", img: "" });
provide("mdc-base-url", urlConfig);
const { data: pkgDetail } = await useFetch<PackageType.Output>("/api/packages/get?pkgKey=" + pkgKey);
// console.log(pkgDetail.value);
if (pkgDetail.value?.from === "github_api") {
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
    return (pkgDetail.value?.style || {}) as {
        family: string;
        weight: string;
        file_name: string;
    };
});
useHead({
    link: [
        {
            href: createFontLink(pkgDetail.value?.name!, pkgDetail.value?.latest!, fontInfoOfStyle.value.file_name),
            rel: "stylesheet",
        },
    ],
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
        <div class="my-6 p-4 border">
            <div class="text-2xl font-bold leading-tight text-gray-900 flex items-center mb-2">
                <package-name :name="pkgDetail?.name!" :name_cn="pkgDetail?.name_cn!"></package-name>
            </div>
            <div class="mb-4">
                {{ pkgDetail?.description }}
            </div>
            <PackageDetailRow :pack="pkgDetail!"></PackageDetailRow>
        </div>
        <UTabs :items="items" :default-index="0">
            <template #item="{ item }">
                <MDC
                    v-if="item.label === 'Readme'"
                    class="markdown-body mt-4"
                    :value="pkgDetail?.readme || ''"
                    tag="article"
                />
                <version-panel v-if="item.label === '版本'" :pkg-id="pkgDetail?.id!" :pkg-name="pkgDetail?.name!">
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
