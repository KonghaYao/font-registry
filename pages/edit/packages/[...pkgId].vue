<script setup lang="ts">
definePageMeta({
    layout: "packages",
});

const route = useRoute();
let pkgId: number | undefined = parseInt((route.params.pkgId as string[])[0]);
if (isNaN(pkgId)) pkgId = undefined;
</script>
<template>
    <div class="min-w-48 max-w-[980px] mx-auto p-12">
        <package-form :id="pkgId"></package-form>
    </div>
</template>
