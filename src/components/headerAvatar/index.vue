<template>
  <div class="header">
    数安文件管理平台
    <div
        style="width: 40px; height: 40px;border-radius: 50%;background: #fff;display: flex;justify-content: center;align-items: center;">
      <el-popover
          title=""
          :width="200"
          trigger="hover"
          content="this is content, this is content, this is content"
      >
        <template #default>
          <el-form label-width="auto">
            <div> 昵称：{{ userStore.UserInfo.account_name }}</div>
            <div> 账号：{{ userStore.UserInfo.account }}</div>
            <div> 名称：{{ userStore.UserInfo.user_name ? userStore.UserInfo.user_name : "未知" }}</div>
            <div style="display: flex;align-items: center"> 操作：<el-button link type="primary" @click="gotoLogin">切换用户</el-button></div>
          </el-form>
        </template>
        <template #reference>
          <el-image>
            <template #error>
              <div style="width: 35px; height: 35px;">
                <img v-if="!userStore.UserInfo.profile_picture" style="width: 100%; height: 100%"
                     src="@/assets/img/fox.png" alt=""/>
              </div>
            </template>
          </el-image>
        </template>
      </el-popover>
    </div>
  </div>
</template>
<script setup>
import {useUserStore} from "@/store/user.js";
import {onMounted} from "vue";
import {useRouter} from "vue-router";

const userStore = useUserStore()
onMounted(() => {
})
const router = useRouter()
const  gotoLogin =()=>{
  router.push({
    name: "Login",
  })
}
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
  padding-left: 20px;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: white
}
</style>
