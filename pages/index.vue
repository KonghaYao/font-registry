<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const imported = useImportFromGithub()
</script>

<template>
    <div>{{ user?.email }}</div>
    <button @click="() => imported.refetch({ name: 'KonghaYao', repo: 'cn-font-split' })">

        {{ imported.loading ? 1 : 0 }}
        {{ imported.data }}
    </button>
</template>