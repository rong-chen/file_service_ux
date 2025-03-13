<template>
  <div class="user-manager-container">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column show-overflow-tooltip prop="ID" label="ID" width="80"/>
      <el-table-column show-overflow-tooltip prop="account_name" label="账号名称" width="180"/>
      <el-table-column show-overflow-tooltip prop="user_name" label="用户姓名"/>
      <el-table-column show-overflow-tooltip prop="mount_path" label="挂载路径"/>
      <el-table-column show-overflow-tooltip prop="account" label="帐号"/>
      <el-table-column show-overflow-tooltip prop="uuid" label="帐号uid"/>
      <el-table-column show-overflow-tooltip label="账号状态">
        <template #default="{row}">
          <el-icon color="green" size="20" v-if='row["isExamine"]'>
            <CircleCheck/>
          </el-icon>
          <el-icon color="red" size="20" v-else>
            <CircleClose/>
          </el-icon>
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
          <el-button type="primary" icon="edit" @click="edit(row)">编辑</el-button>

        </template>
      </el-table-column>
    </el-table>
    <el-drawer
        v-model="userEditDrawer"
        title="用户编辑"
        @closed="closeDrawer"
    >
      <span>
        <el-form label-width="150" label-position="left">
          <el-form-item label="挂载目录">
            <el-input v-model="currentChangeRow.mount_path"></el-input>
          </el-form-item>
          <el-form-item label="硬盘空间">
            <el-input v-model="currentChangeRow.disk_size"></el-input>
          </el-form-item>
          <el-form-item label="用户审核">
              <el-select v-model="currentChangeRow.isExamine">
                <el-option :key="1" label="通过" :value="true"/>
                <el-option :key="2" label="取消" :value="false"/>
              </el-select>
          </el-form-item>
        </el-form>
      </span>
    </el-drawer>
  </div>
</template>
<script setup>
import {ref, onMounted} from "vue";
import {ConsentUserRegister, GetAllUserList, settingUser} from "@/api/user.js";
import {formatISODate} from "@/utils/time.js";
import {useUserStore} from "@/store/user.js";
import {ElMessage, ElMessageBox} from "element-plus";

let userEditDrawer = ref(false)
let tableData = ref([])

onMounted(() => {
  getTable()
})
const currentChangeRow = ref({
  disk_size: 0
})
const edit = async (row) => {
  userEditDrawer.value = true
  currentChangeRow.value = {...row}
}
const getTable = async () => {
  const {code, data} = await GetAllUserList()
  if (code === 0) {
    tableData.value = data.list;
  }
}

const closeDrawer = async ()=>{
  currentChangeRow.value.disk_size = Number(currentChangeRow.value.disk_size)
  const res = await settingUser(currentChangeRow.value)
  if(res['code'] === 0){
   await getTable()
  }
}

</script>
<style scoped>
.user-manager-container {
  padding: 15px;
}
</style>
