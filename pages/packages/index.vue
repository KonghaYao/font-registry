<script setup lang="ts">
import { type Database } from "~/types/database.types";

definePageMeta({
    layout: "packages",
});


const client = useSupabaseClient<Database>();
const PackagesData = useAsyncAction(async () =>
    client
        .from("packages")
        .select("name,latest,keywords,created_at,homepage,description")
        .order("created_at", { ascending: false })
);
onMounted(() => {
    PackagesData.fetch(null);
});
</script>

<template>
    <ul v-if="PackagesData.data" class="flex flex-col gap-8">
        <li
            class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            v-for="pack in PackagesData.data.data"
        >
            <header class="flex justify-between items-baseline">
                <NuxtLink
                    :to="`/packages/${pack.name}`"
                    class="text-2xl font-bold leading-tight text-gray-900 flex items-center mb-4"
                >
                    <span class="pr-4">{{ pack.name }}</span>
                </NuxtLink>
                <b class="text-xl text-gray-700">{{ pack.latest }}</b>
                <div class="flex-1 flex justify-end">
                    <NuxtLink v-if="pack.homepage" :to="pack.homepage">
                        <UIcon
                            name="icon-park-outline:link"
                            class="w-5 h-5 text-primary-500"
                        />
                    </NuxtLink>
                </div>
            </header>
            <div class="text-gray-600 mb-6">
                {{ pack.description }}
            </div>
            <footer class="flex -m-2 justify-between">
                <div class="p-2 w-full md:w-1/2 lg:w-1/3">
                    <ul class="flex gap-2">
                        <li
                            v-for="tag in pack.keywords"
                            :key="tag"
                            class="bg-blue-50 text-blue-400 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800"
                        >
                            {{ tag }}
                        </li>
                    </ul>
                </div>
                <div class="p-2 text-sm text-gray-500">
                    <time datetime="{{ pack.created_at }}">
                        {{ new Date(pack.created_at).toLocaleString() }}
                    </time>
                </div>
            </footer>
        </li>
    </ul>
</template>
