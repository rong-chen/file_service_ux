<script setup>
import {getRouters} from "@/api/menu.js";
import {useRoute, useRouter} from "vue-router";
import {onMounted} from "vue";
import HeaderAvatar from "@/components/headerAvatar/index.vue";
import {useUserStore} from "@/store/user.js";
import {useRouterStore} from "@/store/router.js";

const route = useRoute()
const router = useRouter()
const routerStore = useRouterStore()

const FindExpandedList =()=>{
  const path = returnResult(routerStore.routerList,route.name)
  let list = []
  if(path){
    list.push(path)
  }
  return list;
}

const returnResult=(list,val)=>{
  for (let i = 0; i < list?.length; i++) {
    if(list[i].children?.length > 0) {
      return returnResult(list[i]?.children, val)
    }
    if(list[i].name === val){
      return list[i]?.path
    }
  }
}

const nodeClickFunc =(row)=>{
  if(!row.children?.length){
    router.push({
      name:row.name
    })
  }
}

const userStore = useUserStore()
onMounted(async()=>{
   // await useRouterStore().loadRoutes()
})
</script>

<template>
  <div class="layout-container">
    <el-container>
      <el-header>
        <template #default>
          <div style="background-color: #8fa1c7;height: 100%;width: 100%;padding-right: 20px;display: flex;align-items: center;justify-content: right">
            <HeaderAvatar v-if="userStore.UserInfo.ID" />
          </div>
        </template>
      </el-header>
      <el-container>
        <el-aside width="200px"  style="height:calc(100vh - 60px);background-color:#ffffff;">
          <el-tree
              style="max-width: 600px"
              :data="routerStore.routerList"
              node-key="name"
              :current-node-key="route['name']"
              highlight-current
              :default-expanded-keys="FindExpandedList()"
              @node-click="nodeClickFunc"
          >
            <template #default="{ data }">
              <div class="custom-tree-node">
                <span>{{ data.label }}</span>
              </div>
            </template>
          </el-tree>
        </el-aside>
        <el-main>
            <el-scrollbar style="height:calc(100vh - 60px);box-sizing: border-box" >
              <router-view style="height:calc(100vh - 60px);box-sizing: border-box" ></router-view>
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
.layout-container .custom-tree-node{
  width: 100%;
}
.layout-container .el-main{
  box-sizing: border-box !important;
  padding: 0 !important;
}
</style>
<style scoped>

</style>
