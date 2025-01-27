<script setup lang="ts">
import bgImg from "~/assets/images/serwin365-kcGWxQW7smo-unsplash.jpg";
const user = useSupabaseUser();
const { auth } = useSupabaseClient();
watchEffect(() => {
    if (user.value) {
        navigateTo("/");
    }
});
const githubLogin = () => {
    return auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo: new URL("/", location.href).toString(),
        },
    });
};
definePageMeta({
    layout: "none",
});
</script>

<template>
    <div
        class="min-h-screen bg-cover flex items-center justify-end py-12 sm:px-6 lg:px-8 bg-center"
        :style="{ backgroundImage: `url(${bgImg})` }"
    >
        <div class="max-w-md w-full space-y-8">
            <div
                class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden bg-white/70 backdrop-blur-md border-2 border-white/70"
            >
                <div class="pb-4 border-b border-white/40">
                    <!-- 网站名称 -->
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">中文网字计划</h2>
                    <p class="mt-2 text-center text-sm text-gray-600">大道至简，汉字之美</p>
                </div>
                <div class="max-w-md w-full mx-auto">
                    <div class="py-8 px-4 border-b-2 border-gray-200">
                        <!-- GitHub 登录按钮 -->
                        <button
                            @click="githubLogin"
                            type="button"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                        >
                            <u-icon name="ant-design:github-filled" class="w-5 h-5 text-white"></u-icon>
                            使用 GitHub 登录
                        </button>
                    </div>
                    <!-- 中文点缀 -->
                    <div class="bg-gray-50 py-4 text-center">
                        <span class="text-gray-500">探索汉字的奥秘</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
