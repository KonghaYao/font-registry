<script setup lang="ts">
import { useMagicDialog } from "~/composables/useMagicDialog";

const user = useSupabaseUser();
const prebuild = usePreBuildFont();
const handlePrebuild = () => prebuild.fetch({ name: "atelier-anchor/smiley-sans", force: true });

const data = useAsyncJSON(() => {
    return { url: "/api/system/cdn-changelog" };
});
onMounted(() => {
    data.fetch(null);
});
</script>

<template>
    <div>{{ user?.email }}</div>
    <el-button :loading="prebuild.loading" @click="handlePrebuild"> 预构建字体 </el-button>
</template>
