<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
// client.from('packages')
</script>

<template>
 <div>{{ user?.email }}</div>
</template>