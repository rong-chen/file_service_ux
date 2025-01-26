

<template>
<div class="user-manager-container">
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="date" label="ID"  />
    <el-table-column prop="name" label="名称" width="180" />
    <el-table-column prop="address" label="用户姓名" />
    <el-table-column prop="address" label="帐号" />
    <el-table-column prop="address" label="帐号uid" />
  </el-table>
</div>
</template>
<script setup>
import {ref} from "vue";
let tableData =ref([])
</script>
<style scoped>
.user-manager-container{
  padding: 15px;
}
</style>
