<script setup lang="ts">
import "github-markdown-css/github-markdown-light.css";
definePageMeta({
    layout: "packages",
});

const route = useRoute();
const pkgName = route.params.pkgName as string[];

const pkgKey = pkgName.join("/");
console.log(pkgKey);
const urlConfig = reactive({ a: "", img: "" });
provide("mdc-base-url", urlConfig);
</script>
<template>
    <div class="min-w-48 max-w-[980px] mx-auto p-12">
        <package-form></package-form>
    </div>
</template>
