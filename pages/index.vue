<script setup lang="ts">
const user = useSupabaseUser();
const imported = useImportFromGithub();
const prebuild = usePreBuildFont();
const handleClick = () => imported.fetch({ name: "lxgw", repo: "kose-font" });
const handlePrebuild = () => prebuild.fetch({ name: "lxgw", repo: "kose-font" });
</script>

<template>
    <div>{{ user?.email }}</div>
    <button @click="handleClick">
        {{ imported.loading ? 1 : 0 }}
    </button>
    <button @click="handlePrebuild">
        {{ imported.loading ? 1 : 0 }}
    </button>
</template>
