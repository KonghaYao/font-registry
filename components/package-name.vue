<script setup lang="ts">
defineProps<{
    name_cn?: string;
    name: string;
}>();
</script>
<template>
    <NuxtLink :to="`/packages/${name}`" class="leading-tight text-gray-900 mb-4">
        <span class="text-xl font-bold">
            {{ name_cn || name }}
        </span>
        <span class="ml-4 text-sm text-gray-500" v-if="name_cn">{{ name }}</span>
    </NuxtLink>
</template>
