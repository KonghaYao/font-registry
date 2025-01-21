<template>
    <img :src="refinedSrc" :alt="props.alt" :width="props.width" :height="props.height" />
</template>

<script setup lang="ts">
import { withTrailingSlash, withLeadingSlash, joinURL } from "ufo";
import { useRuntimeConfig, computed } from "#imports";

const props = defineProps({
    src: {
        type: String,
        default: "",
    },
    alt: {
        type: String,
        default: "",
    },
    width: {
        type: [String, Number],
        default: undefined,
    },
    height: {
        type: [String, Number],
        default: undefined,
    },
});

const refinedSrc = computed(() => {
    const baseUrl = inject<any>("mdc-base-url");
    if (props.src.startsWith("http")) {
        return props.src;
    }
    if (baseUrl?.img) {
        return new URL(props.src, baseUrl?.img).toString();
    } else {
        return props.src;
    }
});
</script>
