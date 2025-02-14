<script setup>
import {ElMessage, ElMessageBox} from "element-plus";
import {nextTick, onMounted, ref} from "vue";
import {createGroupApi, getTableData, GetUserGroup, joinGroupUserApi} from "@/api/group.js";
import {formatISODate, formatTime} from "@/utils/time.js";
import {useRouterStore} from "@/store/router.js";
import {useUserStore} from "@/store/user.js";
import {useFileStore} from "@/store/file.js";
import {formatBytes} from "@/utils/formatSize.js";

let creatorTableData = ref([])
let joinTableData = ref([])
onMounted(async () => {
  const {data} = await getTableData()
  creatorTableData.value.push(...data)
  const list = await getUsersGroup();
  list.forEach((item) => {
    joinTableData.value.push({
      group_label: item['group_label'],
      group_id: item['group_id'],
      members_join_time: item['members_join_time'],
    })
  })
})

let centerDialogVisible = ref(false)
let joinDialogFormVisible = ref(false)
let form = ref({
  label: "",
  password: "",
  hasPwd: true
})
let joinForm = ref({
  id: "",
  password: "",
})
const createGroup = () => {
  centerDialogVisible.value = true
}
const joinGroup = () => {
  //
  joinDialogFormVisible.value = true
}
const joinSubmit = async () => {
  if (joinForm.value.id === "") {
    ElMessage.error("小组索引不能为空")
    return
  }
  const {code} = await joinGroupUserApi(joinForm.value);
  if (code === 0) {
    joinDialogFormVisible.value = false
    ElMessage.success("申请成功")
  }
}
const submit = () => {
  if (!form.value.label) {
    ElMessage.error("请填写小组名称")
    return
  }
  if (form.value.hasPwd && !form.value.password) {
    ElMessage.error("请填写密码")
    return
  }
  ElMessageBox.alert('是否执行此操作？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: "取消",
    callback: async () => {
      const res = await createGroupApi(form.value)
      if (res['code'] === 0) {
        ElMessage.success("新增成功")
        form.value = {
          label: "",
          password: "",
          hasPwd: true
        }
      }
    },
  })
}

const getUsersGroup = async () => {
  const res = await GetUserGroup({
    "members_id": useUserStore().UserInfo.ID
  })
  if (res['code'] !== 0) return []
  return res.data
}

let group = ref({})
let members = ref([])
let changeGroup = async (row) => {
  group.value = row
  setTimeout(() => {
    myScrollbar.value.update()
  }, 600)
  //
  const res = await GetUserGroup({
    "group_id": row["ID"]
  })
  members.value = res.data
}
let backgroundImage = ref({
  backgroundImage: 'url("")'
})
const myScrollbar = ref(null)
const openMenu = (e) => {
  console.log(e)
}
</script>

<template>
  <div class="group-container">
    <div class="btn-group">
      <el-button style="margin-left: 20px" type="primary" icon="Plus" @click="createGroup">创建小组</el-button>
      <el-button style="margin-left: 20px" type="primary" icon="Plus" @click="joinGroup">加入小组</el-button>
    </div>
    <div class="content-container">
      <div style="width:200px;height: 100%;">
        <el-menu unique-opened class="el-menu-vertical-demo" @open="openMenu">
          <el-sub-menu index="1">
            <template #title>
              <el-icon>
                <User/>
              </el-icon>
              <span>我创建的小组</span>
            </template>
            <el-menu-item-group>
              <el-menu-item :index="item['group_id'] + 'item'" v-for="item in creatorTableData">
                {{ item['group_label'] }}
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <el-icon>
                <PieChart/>
              </el-icon>
              <span>我加入的小组</span>
            </template>
            <el-menu-item-group>
              <el-menu-item :index="item['group_id'] + 'item'" v-for="item in joinTableData">{{ item['group_label'] }}
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>


        <!--        <div style="height:160px;width: 100%;border-bottom: 1px solid #ededed;">-->
        <!--          <el-scrollbar ref="myScrollbar" height="150px" style="width: 100%">-->
        <!--            <div class="group-content">-->
        <!--              <div class="group-content-item" v-for="(item,index ) in tableData " @click="changeGroup(item)">-->
        <!--                <div class="cover" :class="{'isActive': item.ID === group.ID}"></div>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </el-scrollbar>-->
        <!--        </div>-->

      </div>
      <div style="height: 100%;width: 100%">
        <div class="content-item">
          <div class="share-file">
            <div style="font-size: 18px;">
              文件
            </div>
            <div>
              123123
            </div>
          </div>
          <div class="share-user">
            <div style="font-size: 18px;">
              成员
            </div>
            <div>
              <div style="height: calc(100% - 80px);">
                <!--                  <el-scrollbar>-->
                <!--                    <ul class="nav">-->
                <!--                      <li v-for="item in members" :key="item.id" style="position: relative">-->
                <!--                        <div style="display: flex;justify-content: space-between;align-items: center;height: 50px">-->
                <!--                          <div style="display: flex;width: 350px;align-items: center">-->
                <!--                            <el-icon>-->
                <!--                              <UserFilled/>-->
                <!--                            </el-icon>-->
                <!--                            <div class="file-name ellipsis">{{ item['members_name'] }}</div>-->
                <!--                          </div>-->
                <!--                          <div class="file-time">{{ formatISODate(item['members_join_time']) }}</div>-->
                <!--                        </div>-->
                <!--                      </li>-->
                <!--                    </ul>-->
                <!--                  </el-scrollbar>-->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="joinDialogFormVisible" title="Shipping address" width="500">
      <el-form :model="joinForm">
        <el-form-item label="房间索引">
          <el-input v-model="joinForm.id"/>
        </el-form-item>
        <el-form-item label="房间密码">
          <el-input v-model="joinForm.password"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="joinSubmit">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
        v-model="centerDialogVisible"
        title="新增小组"
        width="520"
        align-center
    >
      <div>
        <div class="header">
          <div>
            创建小组，指定文件共享
          </div>
          <br>
          当前小组模式为
          <select v-model="form.hasPwd">
            <option :value="true">加密</option>
            <option :value="false">公开</option>
          </select>
        </div>
        <hr style="margin-top: 20px">
        <div style="margin-top: 10px">
          <div>小组名称</div>
          <div style="margin-top: 10px">
            <el-input v-model="form.label"></el-input>
          </div>
        </div>
        <div style="margin-top: 10px" v-if="form.hasPwd">
          <div>小组密码</div>
          <div style="margin-top: 10px">
            <el-input v-model="form.password"></el-input>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="submit">
            新增
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.group-container {
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
  height: 100%;
}

.btn-group {
  height: 70px;
  width: 100%;
  display: flex;
  border-bottom: 1px solid #ededed;
  align-items: center;

}


.header {
  padding: 15px;
  background: #f5f7fa;
  color: #515151;
  border-radius: 10px;
}

select {
  background: transparent;
  border: none;
  color: #3477fa;
}

select:hover {
  background: #ededed;
  cursor: pointer;
  border: none;
}

.content-container {
  display: flex;
  height: calc(100% - 70px);
  width: 100%;
}

.group-container * {
  user-select: none;
}

.group-content {
  width: 100%;
  display: flex;
}

.group-content-item {
  margin-left: 15px;
}

.content-item {
  display: flex;
  height: 100%;
}

.content-item > div:first-child {
  border-right: 1px solid #ededed;
}

.cover {
  width: 80px;
  height: 150px;
  background-color: #8fa1c7;
  border-radius: 3px;
  overflow: hidden;
  transition: .5s;
  background-size: 300px, 100%;
  background-image: url("../../assets/groupBack.jpeg");
}

.isActive {
  width: 300px;
}

.file-name {
  margin-left: 10px;
  font-size: 14px;
}

.share-file {
  padding: 20px;
  width: 70%;
  box-sizing: border-box;
}

.share-user {
  padding: 20px;
  box-sizing: border-box;
  width: 30%;
}

.nav li div {
  cursor: pointer;
  padding: 0 10px;
  border-radius: 5px;
  overflow: hidden;
}

.nav li:hover > div {
  background: #ededed;
}

.file-time {
  font-size: 12px;
  width: 320px;
  color: #8e8e8e;
}

.el-menu-vertical-demo {
  height: 100%;
  padding: 20px 10px 0;
  box-sizing: border-box
}
</style>
<style lang="scss">
.group-container {
  .el-scrollbar__view {
    height: 100%;

  }

  /* 鼠标悬停样式 */
  .el-sub-menu__title {
    border-radius: 5px;
    overflow: hidden;
    height: 40px;
  }

  .el-sub-menu__title:hover {
    background-color: #f5f7fa; /* 自定义背景色 */
    border-radius: 5px;
  }

  .el-sub-menu .el-menu-item {
    height: 30px;
    overflow: hidden;
    border-radius: 5px;
  }

  .el-menu-item-group__title {
    display: none;

  }

  .el-menu-item {
    width: calc(100% - 30px);
    padding: 0;
    display: flex;
    justify-content: center;
  }

  .el-menu-item.is-active {
    color: #8fb0fd;
  }

  .el-menu-item-group > ul {
    display: flex;
    justify-content: center;
  }
}

</style>
