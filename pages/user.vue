<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-4">用户信息</h1>
        <div class="bg-white shadow-md rounded-lg p-6">
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                    用户名
                </label>
                <input v-model="username"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="username" type="text" placeholder="请输入用户名" />
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                    邮箱
                </label>
                <input v-model="email"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email" type="email" placeholder="请输入邮箱" />
            </div>
            <div class="flex items-center justify-between">
                <button @click="submit"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button">
                    提交
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const email = ref('')

const submit = () => {
    console.log('用户名:', username.value)
    console.log('邮箱:', email.value)
}
</script>

<style scoped>
.container {
    max-width: 600px;
}
</style>