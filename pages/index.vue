<script setup lang="ts">
const user = useSupabaseUser();
const imported = useImportFromGithub();
const handleClick = () => imported.fetch({ name: "lxgw", repo: "kose-font" });
</script>

<template>
    <div>{{ user?.email }}</div>
    <button @click="handleClick">
        {{ imported.loading ? 1 : 0 }}
    </button>
</template>
