<template>
  <div class="header headerAvatar-container">
    <div style="display: flex;align-items: center">
      <div style="width: 250px;display: flex;align-items: center;padding-left: 20px;">
        <img src="@/assets/icon.png" alt="">
        清淤云盘
      </div>
      <div class="search" style="padding-right: 20px">
        <div style="width: 40px;display: flex;justify-content: center;align-items: center;">
          <el-icon size="18">
            <Search/>
          </el-icon>
        </div>
        <el-select
            filterable
            v-model="fileName"
            placeholder="搜索文件名称(默认搜索前十条数据)"
            style="width: 240px;font-weight: normal"
            class="selectInput"
            remote
            :remote-method="inputHandler"
            @change="inputChangeHandler"
            clearable
        >
          <el-option
              v-for="item in file_list"
              :key="item.ID"
              :label="item.Name"
              :value="item.Name"
              @click="goHome(item.ID)"
          />
        </el-select>
      </div>
    </div>
    <div
        style="display: flex;justify-content: center;align-items: center;box-sizing: border-box;padding-right: 100px">
      <el-popover popper-class="popoverClass" placement="left-start" :width="600" trigger="click" @show="showPopover">
        <template #reference>
          <el-button style="margin-left: 20px" icon="Sort" circle></el-button>
        </template>
        <div class="popover-content">
          <div class="left">
            <div>传输列表</div>
            <ul>
              <li @click="active =1" :class="active === 1 ?'is-active' : ''">文件上传</li>
              <!--              <li @click="active =2" :class="active === 2 ?'is-active' :''">文件下载</li>-->
            </ul>
          </div>
          <div class="right">
            <uploading v-if="active === 1"></uploading>
            <downloading v-else></downloading>
          </div>
        </div>
      </el-popover>
      <button style="margin-left: 20px;display: flex;align-items: center" class="uploadBtn" @click="useFileStore().selectFile()">
        <el-icon>
          <Promotion/>
        </el-icon>
        <span style="margin-left: 5px">文件上传</span>
      </button>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {Search} from "@element-plus/icons-vue";
import Downloading from "@/components/downloading/index.vue";
import Uploading from "@/components/uploading/index.vue";
import {useFileStore} from "@/store/file.js";

const router = useRouter()
const fileStore = useFileStore()
const fileName = ref("")

let file_list = ref([])
const inputHandler = async (e) => {
  fileStore.queryParams.name = e
  file_list.value=[]
  await fileStore.getTableData()
  await fileStore.tableData.forEach(row => {
    file_list.value.push({
      ID: row.ID,
      Name: row.file_name,
    })
  })
}
const inputChangeHandler = async ()=>{
  file_list.value=[]
  fileStore.queryParams.name = fileName.value
  await fileStore.getTableData()
  await fileStore.tableData.forEach(row => {
    file_list.value.push({
      ID: row.ID,
      Name: row.file_name,
    })
  })
}
const goHome =(id)=>{
  router.push({
    name: "my_files",
  })
}

const active = ref(1)
</script>
<script>

export default {
  name: "HeaderAvatar",
}

</script>
<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  font-size: 20px;
  box-sizing: border-box;
  font-weight: bold;
}

.uploadList {
  background: #409eff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.uploadBtn {
  width: 100px;
  height: 30px;
  border-radius: 15px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  background: #409eff;
}

.uploadBtn:hover, .uploadList:hover {
  background: #79bbff;
  color: #ffffff;
}

.popover-content {
  display: flex;
}

.popoverClass .left, .popoverClass .right {
  height: 300px;
  width: 100%;
}

.popoverClass .left {
  width: 20%;
  border-right: 1px solid #ededed;
  padding: 8px;
}

.popover-content .left > div {
  color: #8e8e8e;
  font-size: 12px;
}

.popover-content .left ul {
  font-size: 12px;
  margin-top: 5px;
}

.popover-content .left li {
  height: 25px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  cursor: pointer;
  border-radius: 5px;
}


.popover-content .left li.is-active {
  background: #dfe9ff;
  color: #3477fa;
}

.selectInput {
  background: transparent;
}
</style>
<style>
.popoverClass {
  padding: 0 !important;
}

.headerAvatar-container .el-select__wrapper {
  background: transparent;
  box-shadow: none;
  padding: 0 !important;
}

.headerAvatar-container .el-select__wrapper:hover {
  border: none;
  box-shadow: none;
}
</style>
