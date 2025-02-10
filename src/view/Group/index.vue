<script setup>
  const createGroup = () => {
    console.log('createGroup')
  }
</script>

<template>
  <div class="group-container">
    <div class="btn-group">
      <el-button type="primary" icon="Plus" @click="createGroup">创建成员组</el-button>
    </div>
    <div class="content">内容</div>
  </div>
</template>

<style scoped>
.group-container{
  display: flex;
  background: #fff;
  width: 100%;
  height: 100%;
}

.btn-group {
  border-bottom: 1px solid #ededed;
  padding: 20px 25px;
  height: 70px;
  width: 100%;
}
</style>