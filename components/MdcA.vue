<template>
    <a :href="realHref" :target="target">
        <slot></slot>
    </a>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
    href: {
        type: String,
        default: "",
    },
    target: {
        type: String as PropType<"_blank" | "_parent" | "_self" | "_top" | (string & object) | undefined>,
        default: undefined,
        required: false,
    },
});
const realHref = computed(() => {
    const baseUrl = inject<any>("mdc-base-url");
    if (props.href.startsWith("http")) {
        return props.href;
    }
    if (baseUrl?.a) {
        return new URL(props.href, baseUrl?.a).toString();
    } else {
        return props.href;
    }
});
</script>
