<script setup>
import {useRoute, useRouter} from "vue-router";
import HeaderAvatar from "@/components/headerAvatar/index.vue";
import {useUserStore} from "@/store/user.js";
import {useRouterStore} from "@/store/router.js";
import {formatBytes} from "../../utils/formatSize.js";
import { ref} from "vue";

const route = useRoute()
const router = useRouter()
const routerStore = useRouterStore()

const FindExpandedList = () => {
  const path = returnResult(routerStore.routerList, route.name)
  let list = []
  if (path) {
    list.push(path)
  }
  return list;
}

const returnResult = (list, val) => {
  for (let i = 0; i < list?.length; i++) {
    if (list[i].children?.length > 0) {
      const res = returnResult(list[i]?.children, val)
      if (res) {
        return res
      } else {
        continue
      }
    }
    if (list[i].name === val) {
      return list[i]?.name
    }
  }
}
let lastTreeItem = ref("home")
let elTrees = ref()
const nodeClickFunc = (row) => {
  if (!row.children?.length) {
    lastTreeItem.value = row['name']
    router.push({
      name: row.name
    })
  }
}


const userStore = useUserStore()

</script>

<template>
  <div class="layout-container">
    <el-container>
      <el-header>
        <template #default>
          <div
              style="background-color: #ffffff;height: 100%;width: 100%;padding-right: 20px;display: flex;align-items: center;justify-content: right;border-bottom: 1px solid #ededed">
            <HeaderAvatar v-if="userStore.UserInfo.ID"/>
          </div>
        </template>
      </el-header>
      <el-container>
        <el-aside width="250px"
                  style="height:calc(100vh - 60px);background-color:#ffffff;border-right: 1px solid #ededed">
          <div class="menu-container">
            <img style="width: 50px;height: 50px" src="@/assets/img/fox.png" alt="">
            <div style="flex: 1;margin-left: 10px">
              <div class="userInfo">
                {{userStore.UserInfo.account_name}}
              </div>
              <div>
                <el-progress :show-text="false"  :percentage=" useUserStore().UserInfo['use_disk_size'] / useUserStore().UserInfo['disk_size'] *100"/>
              </div>
              <div class="userInfo">
                {{ formatBytes(useUserStore().UserInfo['use_disk_size']) }}/
                {{ formatBytes(useUserStore().UserInfo['disk_size']) }}
              </div>
            </div>
          </div>
          <el-tree
              style="max-width: 600px"
              :data="routerStore.routerList"
              ref="elTrees"
              node-key="name"
              :current-node-key="route['name']"
              highlight-current
              :default-expanded-keys="FindExpandedList()"
              @node-click="nodeClickFunc"
              class="node-tree"
          >
            <template #default="{ data }">
              <div class="custom-tree-node">
                <span class="iconfont " :class='"icon-"+data["icon"]'></span>
                <span style="margin-left: 10px">{{ data.label }}</span>
              </div>
            </template>
          </el-tree>
        </el-aside>
        <el-main>
          <el-scrollbar style="height:calc(100vh - 60px);box-sizing: border-box">
            <router-view style="height:calc(100vh - 60px);box-sizing: border-box"></router-view>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'Layout',
}
</script>

<style>
.layout-container .el-header {
  padding: 0 !important;
}

.layout-container .el-tree-node__content {
  width: 100%;
  height: 40px !important;
}

.layout-container .custom-tree-node {
  width: 100%;
}

.layout-container .el-main {
  box-sizing: border-box !important;
  padding: 0 !important;
}

.layout-container .is-current {
  border-radius: 5px;
  color: #578dfd;
}

.layout-container .el-tree-node {
  overflow: hidden;
}
</style>
<style scoped>
.node-tree {
  padding: 15px;
}

.menu-container {
  padding: 15px;
  box-sizing: border-box;
  height: 70px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ededed;
}

.userInfo {
  font-size: 12px;
  margin: 3px 0;
  color: #3a3a3a;
}
</style>
