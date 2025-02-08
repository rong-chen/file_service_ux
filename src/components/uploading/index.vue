<script setup>

import {useFileStore} from "@/store/file.js";
import {formatBytes} from "@/utils/formatSize.js";
</script>

<template>
  <div class="upload-container">
    <div class="header">
      <div style="display: flex; align-items: center; justify-content: center;height: 35px;box-sizing: border-box">
        <el-icon size="18">
          <Refresh/>
        </el-icon>
        <div style="margin-top: 3px;margin-left: 5px">
          任务列表
        </div>
      </div>
      <!--      <div style="font-size: 12px">全部暂停</div>-->
    </div>
    <div style="height:calc(100% - 35px);">
      <el-scrollbar v-if="useFileStore().currentUploadFile.length">
        <ul style="cursor: pointer;">
          <li style="padding: 10px;border-bottom: 1px solid #ededed" v-for="item in useFileStore().currentUploadFile">
            <div class="item-group">
              <div class="file-name ellipsis">
                <span class="iconfont icon-wenjianyisong" style="color: #578dfd"></span>
                <el-tooltip :content=" item.name" placement="bottom" effect="light">
                  &nbsp;{{
                    item.name
                  }}
                </el-tooltip>

              </div>
              <div class="file-size">
                {{ formatBytes(item.overSize) }} / {{ formatBytes(item.fileTotalSize) }}
              </div>
              <div class="btn">
                <el-icon>
                  <Close></Close>
                </el-icon>
              </div>
            </div>
            <div class="progress" :style="{
            color: item.status ? '#8fa1c7' : 'red',
          }">
              {{ item.msg }}&nbsp;{{
                item.overProcess
              }}
            </div>
          </li>
        </ul>
      </el-scrollbar>
      <div v-else style="display: flex;justify-content: center;margin-top: 15%;height: 100%;color: #8fa1c7">暂无任务
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "uploading",
}
</script>
<style scoped>
.upload-container {
  width: 100%;
  height: 100%;
}

.upload-container .header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  border-bottom: 1px solid #ededed;
  padding: 0 10px;
  box-sizing: border-box;
}

.item-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress {
  color: #8fa1c7;
  font-size: 12px;
}

.file-name {
  font-size: 14px;
  width: 180px;
}

.file-size {
  color: #989898;
  font-size: 12px;
}
</style>
