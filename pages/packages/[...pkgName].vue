<script setup lang="ts">
import { type Database } from "../../types/database.types";
import "github-markdown-css/github-markdown.css";
import prettyBytes from "pretty-bytes";
const route = useRoute();
const pkgName = route.params.pkgName as string[];

const pkgKey = pkgName.join("/");
const client = useSupabaseClient<Database>();
const pkgDetail = useAsyncData(async () => {
    return client.from("packages").select("*").eq("name", pkgKey).single();
});
const allVersions = useAsyncAction(
    async () => {
        const id = pkgDetail.data.value?.data?.id!;
        return client
            .from("versions")
            .select("*, assets!inner(*)")
            .eq("package_id", id);
    },
    {
        onSuccess(data) {
            console.log(data);
        },
    }
);
function base64ToUtf8(base64String: string) {
    if (typeof Buffer === "function") {
        // Node.js 环境
        return Buffer.from(base64String, "base64").toString("utf8");
    } else if (
        typeof atob === "function" &&
        typeof TextDecoder === "function"
    ) {
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
function onChange(index: number) {
    const item = items[index];

    item.label === "版本" && !allVersions.data && allVersions.fetch(null);
}
</script>
<template>
    <div class="min-w-48 max-w-[980px] mx-auto p-12">
        <div class="my-6 p-8 bg-blue-50">
            <div
                class="text-3xl font-bold leading-tight text-gray-900 flex items-center mb-4"
            >
                {{ pkgDetail.data.value?.data?.name }}
            </div>
            <div>
                {{ pkgDetail.data.value?.data?.description }}
            </div>
        </div>

        <UTabs :items="items" :default-index="0" @change="onChange">
            <template #item="{ item }">
                <MDC
                    v-if="item.label === 'Readme'"
                    class="markdown-body mt-4"
                    :value="
                        base64ToUtf8(pkgDetail.data.value?.data?.readme || '')
                    "
                    tag="article"
                />
                <div v-if="item.label === '版本'">
                    <ul class="flex flex-col gap-4">
                        <li
                            v-for="(item, index) in allVersions.data?.data"
                            class="border-b border-gray-300 py-4"
                        >
                            <div
                                class="text-3xl font-bold leading-tight text-gray-900 flex items-center"
                            >
                                {{ item.version }}
                            </div>

                            <MDC
                                class="markdown-body py-4"
                                :value="item.description || ''"
                                tag="div"
                            />
                            <ul>
                                <li
                                    v-for="(asset, index) in item.assets"
                                    class="flex justify-between"
                                >
                                    <NuxtLink :to="asset.download_url">
                                        {{ asset.assets_name }}
                                    </NuxtLink>
                                    <span class="text-gray-500">
                                        {{ prettyBytes(asset.size) }}
                                        {{ " " }}
                                        {{
                                            new Date(
                                                item.created_at
                                            ).toLocaleString()
                                        }}
                                    </span>
                                </li>
                            </ul>
                            <div class="text-gray-500">
                                {{ new Date(item.created_at).toLocaleString() }}
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
        </UTabs>
    </div>
</template>
