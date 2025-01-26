<script setup lang="ts">
import { useMagicDialog } from "~/composables/useMagicDialog";

const user = useSupabaseUser();
const prebuild = usePreBuildFont();
const handlePrebuild = () => prebuild.fetch({ name: "atelier-anchor/smiley-sans", force: true });
</script>

<template>
    <div>{{ user?.email }}</div>
    <el-button :loading="prebuild.loading" @click="handlePrebuild"> 预构建字体 </el-button>

    <el-button @click="useMagicDialog().toggle('import-from-github-dialog')">导入 github 字体</el-button>

    <import-from-github-dialog />
</template>
