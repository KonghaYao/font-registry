<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const imported = useImportFromGithub()
const handleClick = () => imported.refetch({ name: 'lxgw', repo: 'kose-font' })
</script>

<template>
    <div>{{ user?.email }}</div>
    <button @click="handleClick">

        {{ imported.loading ? 1 : 0 }}
        {{ imported.data }}
    </button>
</template>