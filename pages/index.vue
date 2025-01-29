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
    <div class="h-page flex items-center justify-center bg-gray-100 text-gray-800">
        <!-- 主容器 -->
        <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <!-- 标题 -->
                <h1
                    class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                    style="letter-spacing: 0.5rem"
                >
                    <span
                        class="block xl:inline bg-gradient-to-t from-pink-600 to-pink-500 bg-clip-text text-transparent"
                        >字索</span
                    >
                    <div
                        class="bg-gradient-to-t from-indigo-600 via-purple-400 to-pink-500 bg-clip-text text-transparent"
                    >
                        /
                    </div>
                    <span
                        class="block bg-gradient-to-t from-indigo-600 to-indigo-500 bg-clip-text text-transparent xl:inline"
                        >东方字体库</span
                    >
                </h1>
                <!-- 描述 -->
                <p class="my-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    字索致力于为用户提供高质量、易用的在线字体版本发布与展示服务。
                </p>
                <div class="flex gap-4 justify-center">
                    <NuxtLink to="/packages">
                        <el-button type="primary">进入字体库</el-button>
                    </NuxtLink>
                    <el-button v-if="user" @click="useMagicDialog().toggle('import-from-github-dialog')">
                        从 github 导入
                    </el-button>
                    <import-from-github-dialog />
                    <NuxtLink to="/login" v-if="!user">
                        <el-button>登录</el-button>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
