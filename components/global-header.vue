<script setup lang="ts">
const user = useSupabaseUser();
const { auth } = useSupabaseClient()
const links = [
    {
        name: "Home",
        to: "/",
    },
];

const userDropdowns = computed(() => [
    [
        {
            label: user.value?.email ?? "账号详情",
            click() {
                useRouter().push('/user');
            }
        },
    ],
    [
        {
            label: "退出登录",
            icon: "i-heroicons-trash-20-solid",
            click() {
                auth.signOut().then(res => {
                    ElMessage.success("请重新登录")
                    useRouter().push('/login');
                })
            }
        },
    ],
]);
</script>

<template>
    <header>
        <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
            <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                <NuxtLink to="/" class="flex items-center">
                    <!-- <img src="https://flowbite.com/docs/images/logo.svg" class="mr-3 h-6 sm:h-9" alt="Logo" /> -->
                    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">FRP</span>
                </NuxtLink>
                <div class="flex items-center lg:order-2">
                    <UDropdown :items="userDropdowns" :popper="{ placement: 'bottom-start' }">
                        <UAvatar :src="'https://cdn.sep.cc/avatar/' + user?.email"></UAvatar>
                    </UDropdown>
                </div>
                <div class="justify-between items-center w-full lg:flex lg:w-auto lg:order-1">
                    <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                        <li v-for="link in links">
                            <NuxtLink :to="link.to"
                                class="block py-2 pr-4 pl-3 text-black rounded bg-primary-700 lg:bg-transparent lg:p-0 dark:text-white"
                                aria-current="page">
                                {{ link.name }}
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>
