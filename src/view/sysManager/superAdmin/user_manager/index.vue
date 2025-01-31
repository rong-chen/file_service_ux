

<template>
<div class="user-manager-container">
  <el-table :data="tableData" style="width: 100%">
    <el-table-column show-overflow-tooltip prop="ID" label="ID" width="80"  />
    <el-table-column show-overflow-tooltip prop="account_name" label="账号名称" width="180" />
    <el-table-column show-overflow-tooltip prop="user_name" label="用户姓名" />
    <el-table-column show-overflow-tooltip prop="account" label="帐号" />
    <el-table-column show-overflow-tooltip prop="uuid" label="帐号uid" />
    <el-table-column show-overflow-tooltip label="账号状态" >
      <template #default="{row}">
        <el-icon color="green"  size="20" v-if='row["isExamine"]'><CircleCheck /></el-icon>
        <el-icon  color="red"  size="20"  v-else ><CircleClose /></el-icon>
      </template>
    </el-table-column>
    <el-table-column show-overflow-tooltip label="更新时间" prop="UpdatedAt">
      <template #default="{row}">
        {{ formatISODate(row['UpdatedAt']) }}
      </template>
    </el-table-column>
    <el-table-column show-overflow-tooltip label="创建时间" prop="CreatedAt">
      <template #default="{row}">
        {{ formatISODate(row['CreatedAt']) }}
      </template>
    </el-table-column>
    <el-table-column show-overflow-tooltip label="操作" prop="UpdatedAt">
      <template #default="{row}">
        <el-button  :type = 'row["isExamine"] ? "info":"primary"'  :disabled="userStore.UserInfo.ID === row['ID']" @click="agree(!row['isExamine'],row['ID'])">

          {{ row["isExamine"] ? '取消审核':'通过审核'}}

        </el-button>
      </template>
    </el-table-column>
  </el-table>
</div>
</template>
<script setup>
import {ref,onMounted} from "vue";
import {ConsentUserRegister, GetAllUserList} from "@/api/user.js";
import {formatISODate} from "@/utils/time.js";
import {useUserStore} from "@/store/user.js";
import {ElMessage} from "element-plus";
let tableData =ref([])
onMounted(  ()=>{
 getTable()
})
const getTable= async()=>{
  const {code ,data } = await GetAllUserList()
  if(code === 0){
    tableData.value=data.list;
  }
}
const userStore = useUserStore()
const agree = async (isExamine,id)=>{
  // if()
  const res = await ConsentUserRegister({
    id,
    isExamine
  })
  if(res['code'] === 0){
    await getTable()
    ElMessage.success("操作成功")
  }else{
    ElMessage.success("操作失败")
  }
}
</script>
<style scoped>
.user-manager-container{
  padding: 15px;
}
</style>
