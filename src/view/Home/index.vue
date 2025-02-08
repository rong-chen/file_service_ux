<template>
  <div class="home-container fullscreen">
    <div class="btn-group">
      <el-button type="primary" icon="Promotion" @click="useFileStore().selectFile()">上传</el-button>
    </div>
    <div style="display: flex;height: calc(100% - 70px);">
      <div style="padding: 30px;width: 70%;min-width:750px;border-right: 1px solid #ededed;height: 100%">
        <div class="header">
          我的文件
        </div>
        <ul class="nav">
          <li v-for="item in useFileStore().tableData">
            <div v-if="item['file_state']"
                 style="display: flex;justify-content: space-between;align-items: center;height: 50px"
                 @click="changeRow = item">
              <div style="display: flex;width: 350px;align-items: center">
                <img style="width: 25px;height: 25px" src="@/assets/img/fileStyle/unknown_file.png" alt="">
                <div class="file-name ellipsis">{{ item['file_name'] }}</div>
              </div>
              <div class="file-size">{{ formatBytes(item['file_size']) }}</div>
              <div class="file-time">{{ formatISODate(item['UpdatedAt']) }}</div>
            </div>
          </li>
        </ul>
      </div>
      <div class="fileInfo">
        <el-form :model="changeRow" label-width="auto" style="max-width: 600px" v-if="changeRow.ID">
          <div style="margin-bottom: 20px">
            {{ changeRow.file_name }}
          </div>
          <el-form-item label="文件指纹">
            {{ changeRow.file_md5 }}
          </el-form-item>
          <el-form-item label="文件类型">
            {{ changeRow.file_type }}
          </el-form-item>
          <el-form-item label="文件来源">
            {{ changeRow.is_share ? "他人分享" : "上传" }}
          </el-form-item>
          <el-form-item label="文件大小">
            {{ formatBytes(changeRow.file_size) }}
          </el-form-item>
          <el-form-item style="margin-top: 20px">
            <div>
              <el-button type="primary" @click="download(changeRow)">
                <el-icon size="16px">
                  <Download></Download>
                </el-icon>
                <span style="margin-left: 5px">下载文件</span>
              </el-button>
              <el-button type="danger">
                <el-icon size="16px">
                  <Delete></Delete>
                </el-icon>
                <span style="margin-left: 5px" @click="del(changeRow)">删除文件</span>
              </el-button>
              <el-button type="info">
                <el-icon size="16px">
                  <Share></Share>
                </el-icon>
                <span style="margin-left: 5px">分享文件</span>
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup>
import {useFileStore} from "@/store/file.js";
import {formatISODate} from "../../utils/time.js";
import {formatBytes} from "../../utils/formatSize.js";
import {markRaw, ref} from "vue";
import {Delete, Download} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {deleteFile, downloadFileKey} from "@/api/file.js";

let changeRow = ref({
  CreatedAt: "",
  ID: 0,
  UpdatedAt: "",
  chunk_list: [],
  file_md5: "",
  file_name: "",
  file_path: "",
  file_path_name: "",
  file_size: 0,
  file_state: false,
  file_total: 0,
  file_type: "",
  is_share: false,
  share_account_name: "",
  share_user_id: 0,
  user_id: 0,
  weight: 0,
})

const download = async ({ID}) => {
  // 生成下载秘钥
  const res = await downloadFileKey(ID)
  if(res['code'] === 0){
    await ElMessageBox.alert(`请复制好秘钥，前往下载器下载文件！<br /><a  href="javascript:void(0);">${res.data.key}</a>`, '标题', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    })
  }
  console.log(res)
  // const worker = new Worker(new URL('./worker.js', import.meta.url), {
  //   type: 'module',
  // });
  // worker.onmessage = (e) => {
  //   console.log(e)
  // }
  // worker.postMessage({
  //   data: "123123"
  // })
}

const del = ({ID}) => {
  ElMessageBox.confirm(
      '你确定要删除它吗？物理删除不可逆！',
      '提示',
      {
        type: 'warning',
        icon: markRaw(Delete),
        confirmButtonText: "删除",
        cancelButtonText: "取消"
      }
  ).then(async () => {
    const {code} = await deleteFile(ID)
    if (code === 0) {
      await useFileStore().getTable()
      ElMessage.success("删除成功")
    }
  }).catch((e) => {
    console.log(e);
  })
}

</script>
<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  background: white;
}

.btn-group {
  border-bottom: 1px solid #ededed;
  padding: 20px 25px;
  height: 70px;
}

.header {
  font-size: 20px;
  font-weight: bold;
}

.file-name {
  margin-left: 10px;
  font-size: 14px;
}

.file-size {
  color: #858585;
  font-size: 14px;
}

.file-time {
  color: #858585;
  font-size: 14px;
}

.nav {
  margin-top: 30px;
}

.nav li div {
  cursor: pointer;
  padding: 0 10px;
  border-radius: 5px;
}

.nav li:hover div {
  background: #ededed;
}

.fileInfo {
  padding: 20px;
}
</style>
<style>
.home-container .el-form-item {
  margin-bottom: 0 !important;
}
</style>
