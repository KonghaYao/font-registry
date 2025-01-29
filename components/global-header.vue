<script setup lang="ts">
import { getFullName, getUserAvatar } from "~/composables/useUser";
const user = useSupabaseUser();
const { auth } = useSupabaseClient();
const links = [
    {
        name: "首页",
        to: "/",
    },
    {
        name: "字体库",
        to: "/packages",
    },
];
const userDropdowns = computed(() => [
    [
        {
            label: getFullName() ?? "账号详情",
            click() {
                useRouter().push("/user");
            },
        },
    ],
    [
        {
            label: "缓存管理",
            click() {
                useRouter().push("/cache");
            },
        },
        {
            label: "维护日志",
            click() {
                useRouter().push("/system/changelog");
            },
        },
    ],
    [
        {
            label: "退出登录",
            click() {
                auth.signOut().then((res) => {
                    ElMessage.success("退出登录成功");
                });
            },
        },
    ],
]);
</script>

<template>
    <header class="sticky top-0 left-0 z-50">
        <nav class="bg-gray-50 border-gray-200 px-4 lg:px-6 py-3 dark:bg-gray-800 border-b">
            <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                <NuxtLink to="/" class="flex items-center">
                    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"> 字索 </span>
                </NuxtLink>
                <div class="flex items-center lg:order-2">
                    <UDropdown v-if="user?.email" :items="userDropdowns" :popper="{ placement: 'bottom-start' }">
                        <UAvatar :src="getUserAvatar()"></UAvatar>
                    </UDropdown>
                    <NuxtLink v-else to="/login"> 登录 </NuxtLink>
                </div>
                <div
                    class="justify-between items-center w-full lg:flex lg:w-auto lg:order-1 border-t mt-2 lg:mt-0 lg:border-t-0"
                >
                    <ul class="flex font-medium flex-row lg:space-x-8">
                        <li v-for="link in links">
                            <NuxtLink
                                :to="link.to"
                                class="block pt-2 lg:py-2 pr-4 hover:text-primary-700 transition-all rounded lg:p-0 dark:text-white"
                                aria-current="page"
                            >
                                {{ link.name }}
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>
