<script setup lang="ts">
const user = useSupabaseUser()
const { auth } = useSupabaseClient()
watchEffect(() => {
  if (user.value) {
    navigateTo('/')
  }
})
const login = ()=>{
 auth.signInWithPassword({
   email: 'fonts-1@snapmail.cc',
   password: '123456789aA',
 })
}
</script>

<template>
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <h2 class="my-6 text-center text-3xl font-extrabold">
      Sign in to your account
    </h2>
    <button @click="login">login</button>
  </div>
</template>