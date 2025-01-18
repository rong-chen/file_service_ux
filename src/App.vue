<script setup>
  import {onMounted} from "vue";
  onMounted(()=>{
    window.onerror = function (message, source, lineno, colno, error) {
      console.log(`Error: ${message}, Source: ${source}, Line: ${lineno}`);
    };
  })
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
