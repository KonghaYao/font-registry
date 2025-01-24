<script setup lang="ts">
import { useMagicDialog } from "~/composables/useMagicDialog";

const user = useSupabaseUser();
const prebuild = usePreBuildFont();
const handlePrebuild = () => prebuild.fetch({ name: "atelier-anchor/smiley-sans", force: true });
</script>

<template>
    <div>{{ user?.email }}</div>
    <button @click="handlePrebuild">
        {{ prebuild.loading ? 1 : 0 }}
    </button>

    <button @click="useMagicDialog().toggle('import-from-github-dialog')">导入 github 字体</button>

    <import-from-github-dialog />
</template>
