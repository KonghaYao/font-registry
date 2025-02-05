<script setup lang="ts">
definePageMeta({
    layout: "packages",
});

const route = useRoute();
let pkgId: number | undefined = parseInt(route.params.pkgId as string);
if (isNaN(pkgId)) pkgId = undefined;
let versionId: number | undefined = parseInt(route.params.versionId[0] as string);
if (isNaN(versionId)) versionId = undefined;
</script>
<template>
    <div class="min-w-48 max-w-[980px] mx-auto p-12">
        <version-form :pkgId="pkgId!" :id="versionId"></version-form>
    </div>
</template>
