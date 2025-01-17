<script setup>
import {onMounted} from "vue";
import {useRouterStore} from "@/store/router.js";

const routerStore = useRouterStore()
onMounted(()=>{
  // routerStore
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
