<template>
  <div class="home-container fullscreen">
    <div class="btn-group">
      <el-button type="primary" icon="Promotion" @click="useFileStore().selectFile()">上传</el-button>
    </div>
    <div style="display: flex;height: calc(100% - 70px);">
      <div
          style="padding: 0 30px;width: 70%;min-width:750px;border-right: 1px solid #ededed;height: 100%;box-sizing: border-box">
        <div style="display: flex;align-items: center;height: 50px">
          <div>
            我的文件
          </div>
          <div class="filter">
            <!--            <div style="display: flex;align-items: center">订阅-->
            <!--              <div class="iconfont icon-shangxiajiantou text" @click="filterFile" :class="{-->
            <!--               'active-1' : currentFilter ===1,-->
            <!--               'active-2' : currentFilter ===2,-->
            <!--              }"></div>-->
            <!--            </div>-->
          </div>
        </div>
        <div style="height: calc(100% - 50px);">
          <el-scrollbar>
            <ul class="nav">
              <li v-for="item in useFileStore().tableData" style="position: relative">
                <div :class="{'isActive':changeRow['ID'] === item['ID']}"
                     style="display: flex;justify-content: space-between;align-items: center;height: 50px"
                     @click="changeRow = item">
                  <div style="display: flex;width: 350px;align-items: center">
                    <img style="width: 25px;height: 25px" src="@/assets/img/fileStyle/unknown_file.png" alt="">
                    <div class="file-name ellipsis">{{ item['file_name'] }}</div>
                  </div>
                  <div class="file-size">{{ formatBytes(item['file_size']) }}</div>
                  <div class="file-time">{{ formatISODate(item['UpdatedAt']) }}</div>
                </div>
                <!--                <img src="@/assets/img/dingyue.png" v-if="item['weight'] !==1" class="yidingyue" alt="">-->
              </li>
            </ul>
          </el-scrollbar>
        </div>

      </div>
      <div class="fileInfo">
        <el-form :model="changeRow" label-width="auto" style="max-width: 600px" v-if="changeRow.ID">
          <div style="margin-bottom: 20px;display: flex;align-items: center;justify-content: space-between">
            {{ changeRow.file_name }}
            <div class="file-title">
              <!--              <div class="iconfont icon-kongxinwujiaoxing" v-if="changeRow.weight === 1" style="font-size: 25px"-->
              <!--                   @click="collect(changeRow)"></div>-->
              <!--              <div class="iconfont icon-shixinwujiaoxing" v-else style="color: #3477fa;font-size: 25px"-->
              <!--                   @click="collect(changeRow)"></div>-->
            </div>
          </div>
          <el-form-item label="文件指纹">
            {{ changeRow.file_md5 }}
          </el-form-item>
          <el-form-item label="文件类型">
            {{ changeRow.file_suffix }}
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
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-dialog
        v-model="shareFileDialog"
        title="分享"
        width="500"
        destroy-on-close
        align-center
        @closed="shareFileDialogCloseHandler"
    >
    <span>
      <el-select
          v-model="shareFileForm.group_id"
          placeholder="小组ID"
      >
      <el-option
          v-for="item in groupSelect"
          :key="item.ID"
          :label="item.label"
          :value="item.ID"
      />
    </el-select>
    </span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="shareFileDialog = false">取消</el-button>
          <el-button type="primary" @click="submit">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {useFileStore} from "@/store/file.js";
import {formatISODate} from "@/utils/time.js";
import {formatBytes} from "@/utils/formatSize.js";
import {markRaw, onMounted, ref} from "vue";
import {Delete, Download} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {collectionFile, deleteFile, fileList} from "@/api/file.js";
import {addGroupFile, getTableData} from "@/api/group.js";

let changeRow = ref({
  CreatedAt: "",
  ID: 0,
  UpdatedAt: "",
  chunk_list: [],
  file_md5: "",
  file_name: "",
  file_path: "",
  file_size: 0,
  file_chunk_total: 0,
  file_suffix: ""
})
let shareFileDialog = ref(false)
let shareFileForm = ref({
  group_id: null,
  file_id: null,
})


let groupSelect = ref([])

const shareFileDialogCloseHandler = () => {
  shareFileForm.value.group_id = null
  shareFileForm.value.file_id = changeRow.value['ID']
}

const submit = async () => {
  const res = await addGroupFile({...shareFileForm.value})
  if (res['code'] === 0) {
    shareFileForm.value.group_id = null
    shareFileForm.value.file_id = changeRow.value['ID']
    shareFileDialog.value = false
    ElMessage.success("添加成功")
  }
}

const download = async (row) => {
  // 生成下载秘钥
  let file_url = import.meta.env.VITE_BASE_API + row.file_path.replace(".", "").replace(/\\/g, '/');
  const ele = document.createElement('a');
  ele.download = row['file_name'];
  ele.href = file_url;
  document.body.appendChild(ele);
  ele.click()
  document.body.removeChild(ele);
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
      await getTable()
      changeRow.value = {}
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
  display: flex;
  width: 100%;
  height: 50px;

}

.file-name {
  margin-left: 10px;
  font-size: 14px;
}

.file-size {
  font-size: 14px;
}

.file-time {
  font-size: 14px;
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

.fileInfo {
  padding: 20px;
}


.filter {
  flex: 1;
  padding-right: 20px;
  box-sizing: border-box;
  justify-content: right;
  display: flex;
  font-size: 14px;
}

.text {
  -webkit-background-clip: text;
  background-image: linear-gradient(to bottom, black 50%, black 50%);
  color: transparent;
  margin-left: 5px;
  cursor: pointer;
}

.active-1 {
  background-image: linear-gradient(to bottom, red 50%, black 50%);

}

.active-2 {
  background-image: linear-gradient(to top, red 50%, black 50%);

}

.file-title {
  font-weight: bold;
  cursor: pointer;
}

.yidingyue {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 50px;
  background: transparent;
}
</style>
<style>
.home-container .el-form-item {
  margin-bottom: 0 !important;
}
</style>
