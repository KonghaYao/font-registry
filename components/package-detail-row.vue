<script setup lang="ts">
import type PackageType from "#server-endpoint/api/packages/get.ts";
defineProps<{
    pack: PackageType.Output;
}>();
</script>

<template>
    <div class="p-2 text-sm text-gray-500 flex items-center gap-4 transition-all">
        <a v-if="pack.author?.link" :href="pack.author?.link || ''" class="flex gap-2 flex-1">
            <img
                v-if="pack.author?.avatar"
                class="w-5 h-5 rounded-full overflow-hidden object-fit"
                :src="pack.author?.avatar"
                alt="avatar"
            />

            {{ pack.author?.name }}
        </a>
        <slot></slot>
        <NuxtLink v-if="pack?.from === 'github_api'" :to="'https://github.com/' + pack?.name">
            <u-icon name="ant-design:github-filled" class="w-5 h-5 hover:text-black"></u-icon>
        </NuxtLink>
        <div class="hover:text-gray-900">
            <UIcon name="icon-park-outline:balance-two" class="scale-150 mr-2" />
            {{ pack.license ?? "unknown" }}
        </div>
        <div class="hover:text-gray-900">
            <UIcon name="icon-park-outline:tag-one" class="scale-150 mr-2" />
            {{ pack.latest }}
        </div>
        <time datetime="{{ pack.created_at }}" class="hover:text-gray-900">
            <UIcon name="icon-park-outline:calendar" class="scale-150 mr-2" />
            {{ new Date(pack.created_at).toLocaleDateString() }}
        </time>
    </div>
</template>
