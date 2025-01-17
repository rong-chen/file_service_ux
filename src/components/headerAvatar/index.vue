<template>
    <div style="width: 40px; height: 40px;border-radius: 50%;background: #fff;display: flex;justify-content: center;align-items: center;" >
      <el-popover
          title=""
          :width="200"
          trigger="hover"
          content="this is content, this is content, this is content"
      >
        <template #default>
          <el-form label-width="auto" >
            <div> 昵称：{{userStore.UserInfo.account_name}}</div>
            <div> 账号：{{userStore.UserInfo.account}}</div>
            <div> 名称：{{userStore.UserInfo.user_name ? userStore.UserInfo.user_name:"未知"}}</div>
          </el-form>
        </template>
        <template #reference>
          <el-image>
            <template #error>
              <div style="width: 35px; height: 35px;" >
                <img v-if="!userStore.UserInfo.profile_picture" style="width: 100%; height: 100%" src="@/assets/img/fox.png" alt=""/>
              </div>
            </template>
          </el-image>
        </template>
      </el-popover>
    </div>
</template>
<script setup>
import {useUserStore} from "@/store/user.js";
import {onMounted} from "vue";

const userStore = useUserStore()
onMounted(() => {
  console.log(userStore.UserInfo)
})
</script>
<script>
export default {
  name: "HeaderAvatar",
}
</script>
<style scoped>

</style>
