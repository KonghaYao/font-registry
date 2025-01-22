<script setup lang="ts">
definePageMeta({
    layout: "packages",
});
const PackagesData = useAsyncJSON<{query?:string},any>(() =>{
    return {
        url: "/api/packages/list",
    }
});
onMounted(() => {
    PackagesData.fetch({});
});
</script>

<template>
    <ul v-if="PackagesData.data" class="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
        <u-card class="w-full" v-for="pack in PackagesData.data.data">
            <header class="flex justify-between items-baseline">
                <NuxtLink
                    :to="`/packages/${pack.name}`"
                    class="text-2xl font-bold leading-tight text-gray-900 flex items-center mb-4"
                >
                    <span class="pr-4">{{ pack.name_cn ?? pack.name }}</span>
                </NuxtLink>
                <div class="flex-1 flex justify-end">
                    <NuxtLink v-if="pack.homepage" :to="pack.homepage">
                        <UIcon name="icon-park-outline:link" class="w-5 h-5 text-primary-500" />
                    </NuxtLink>
                </div>
            </header>
            <div class="text-gray-600 mb-6">
                {{ pack.description }}
            </div>
            <footer class="flex-col -m-2 justify-between text-sm">
                <div class="p-2 w-full md:w-1/2 lg:w-1/3">
                    <ul class="flex gap-2">
                        <li
                            v-for="tag in pack.keywords"
                            :key="tag"
                            class="bg-blue-50 text-blue-400 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 flex-none"
                        >
                            {{ tag }}
                        </li>
                    </ul>
                </div>
                <div class="p-2 text-sm text-gray-500 flex gap-4">
                    <a :href="pack.author?.link||''" class="flex gap-2">
                        <img v-if="pack.author?.avatar" class="w-5 h-5 rounded-full overflow-hidden object-fit" :src="pack.author?.avatar" alt="avatar"> </img>
                        {{ pack.author?.name }}
                    </a>
                    <div>
                        {{ pack.latest }}
                    </div>
                    <div>
                        {{ pack.license }}
                    </div>
                    <time datetime="{{ pack.created_at }}">
                        {{ new Date(pack.created_at).toLocaleString() }}
                    </time>
                </div>
            </footer>
        </u-card>
    </ul>
</template>
