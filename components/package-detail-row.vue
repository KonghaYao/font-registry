<script setup lang="ts">
defineProps<{
    pack: any;
}>();
</script>

<template>
    <div class="p-2 text-sm text-gray-500 flex gap-4">
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
        <div>
            <UIcon name="icon-park-outline:balance-two" class="scale-150 mr-2" />
            {{ pack.license ?? "unknown" }}
        </div>
        <div>
            <UIcon name="icon-park-outline:tag-one" class="scale-150 mr-2" />
            {{ pack.latest }}
        </div>
        <time datetime="{{ pack.created_at }}">
            <UIcon name="icon-park-outline:calendar" class="scale-150 mr-2" />
            {{ new Date(pack.created_at).toLocaleString() }}
        </time>
    </div>
</template>
