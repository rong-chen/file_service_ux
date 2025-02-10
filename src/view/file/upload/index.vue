<script setup>
import {markRaw, reactive} from 'vue'
import {Delete} from '@element-plus/icons-vue'
import {nextTick, onMounted, ref} from "vue";
import SparkMD5 from "spark-md5"
import {ElLoading, ElMessage, ElMessageBox} from "element-plus";
import {
  collectionFile, deleteFile, downloadFileKey,
  findFile,
  findFileList,
  finishFileApi,
  finishFileUpload, shareFile,
  uploadChunkFile
} from "@/api/file.js";
import {formatISODate} from "@/utils/time.js";
import {useUserStore} from "@/store/user.js";
import {GetAllUserList} from "@/api/user.js";
import {useFileStore} from "@/store/file.js";

const maxWorkers = navigator.hardwareConcurrency || 4

const getTable = async (form) => {
  const res = await findFileList(form);
  if (res['code'] === 0) {
    tableData.value = res.data.list;
    tableTotal.value = res.data.total;
  }
}

// 等待优化成多线程切割文件
const cutFile = (file) => {
  const chunkSize = Math.ceil(file.size / maxWorkers)
  for (let i = 0; i < maxWorkers; i++) {
    // 每个线程开始的位置
    let start = i * chunkSize;
    let end = (i * chunkSize) + chunkSize;
    end > file.size && (end = file.size);
    const worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module',
    });
    worker.postMessage({
      start,
      end,
      file,
      DEFAULT_SLICK_SIZE
    })
    worker.onmessage = function (e) {
      console.log('Worker response:', e.data);  // 计算后的数据
    };
  }
}

let tableData = ref([])
onMounted(async () => {
  await getTable(form.value)
})

// let listData =computed(()=>{
//   return tableData.value.slice((form.page - 1) * form.pageSize,form.pageSize * form.page)
// })


const getIncompleteChunks = (list, name, md5) => {
  let chunksList = tableData.value?.filter((item) => {
    return item["file_md5"] === md5 && item["file_name"] === name
  })
  let itemList = []
  if (chunksList.length > 0) {
    itemList = chunksList[0]['chunk_list']
  }
  let idlist = []
  if (itemList?.length > 0) {
    // 存储已经上传的片段number
    idlist = itemList.map((item) => {
      return item['chunk_number']
    });
  }
  let list2 = []
  list.forEach((item, index) => {
    if (!idlist.includes(index)) {
      list2.push({
        index: index,
        file: item
      })
    }
  })
  return list2;
}

let files = ref([])
let loadingInstance1 = null;
let loadingUploadCounts = ref({})

const getFileMd5 = (file, defaultSize = DEFAULT_SLICK_SIZE) => {
  return new Promise((resolve, reject) => {
    let blobSlice = File.prototype.slice
    // 总片段
    let chunks = Math.ceil(file.size / defaultSize)
    let fileReader = new FileReader()
    let speakMd5 = new SparkMD5()
    let currentChunksNum = 0
    const time = new Date().getTime();
    fileReader.onload = (e) => {
      speakMd5.append(e.target.result)
      if (currentChunksNum < chunks) {
        currentChunksNum++;
        loadNextFileChunk();
      } else {
        const fileMd5 = speakMd5.end();
        resolve({
          fileMd5,
          timestamp: (new Date().getTime() - time) / 1000,
        })
      }
    }

    function loadNextFileChunk() {
      let start = currentChunksNum * defaultSize;
      let end = start + defaultSize;
      end > file.size && (end = file.size);
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNextFileChunk();
  })
}
const DEFAULT_SLICK_SIZE = 1024 * 1024;

const uploads2 =async (e)=>{
  const fileStore = useFileStore()
  await fileStore.upload(e.target.files[0])
}


const uploads = async (e) => {
  files.value = [];
  loadingInstance1 = ElLoading.service({fullscreen: true})
  const list = [...e.target.files]
  let apiCount = list.length;
  for (const item of list) {
    const val = item;
    const {fileMd5} = await getFileMd5(val);
    const chunks = sliceFile(val);
    loadingUploadCounts.value = [];
    await findFile({
      "file_total": chunks.length,
      "file_name": val.name,
      "file_type": item.type || "unknown",
      "file_md5": fileMd5,
      "file_size": item.size,
      "path": ""
    }).then(res => {
      const list = getIncompleteChunks(chunks, val.name, fileMd5)
      files.value.push({
        blob: list,
        type: item.type,
        name: val.name,
        md5: fileMd5,
        wait_num: list.length,
        file_total: chunks.length,
      })
      loadingUploadCounts.value[fileMd5] = list.length;
      apiCount--;
    })
    if (apiCount === 0) {
      loadingInstance1.close();
      await getTable(form.value)
    }
  }
}

const req_queue = async (list, count) => {
  return new Promise(async (resolve, reject) => {
    let index = 0;
    total.value = list.length;
    const sendApi = async () => {
      const req_list = list.slice(index, count + index);
      const promises = req_list.map(async (request) => {
        const res = await uploadChunkFile(request)
        if (res['code'] === 0) {
          loadingUploadCounts.value[request.get("fileMd5")]--;
          if (loadingUploadCounts.value[request.get("fileMd5")] === 0) {
            await finishFileUpload({
              fileMd5: request.get("fileMd5"),
              fileName: request.get("fileName"),
            });
          }
          let num = total.value--
          loadingInstance1.setText(`${num}/${list.length}`);
        }
      }); // 发送所有请求
      await Promise.allSettled(promises);
    }
    while (index < list.length) {
      await sendApi();
      index += count
    }
    resolve()
  })
}
let tableTotal = ref(0);

const upload = async () => {
  loadingInstance1 = ElLoading.service({fullscreen: true})
  let requestList = await splitBlob();
  await req_queue(requestList, 5).then(async () => {
    await getTable(form.value)
    loadingInstance1.close();
    files.value = []
  })
}




const splitBlob = async () => {
  let requestList = [];
  // 创建一个临时数组来存储所有的Promise
  const promises = [];
  for (const item1 of files.value) {
    item1['blob']?.forEach((item, index) => {
      const formData = new FormData();
      const fileR = new FileReader(); // 文件读取器
      const promise = new Promise((resolve) => {
        fileR.readAsArrayBuffer(item['file']);
        fileR.onload = async (e) => {
          const blob = e.target.result;
          const spark = new SparkMD5.ArrayBuffer();
          spark.append(blob);
          let md5 = spark.end();
          formData.append("file", item["file"]);
          formData.append("fileMd5", item1['md5']);
          formData.append("chunkMd5", md5);
          formData.append("fileName", item1['name']);
          formData.append("fileType", item1['type']);
          formData.append("chunkNumber", item['index']);
          formData.append("chunkTotal", item1['file_total']);
          requestList.push(formData);
          resolve(); // 当onload完成时，resolve当前Promise
        };
      });
      promises.push(promise); // 将这个Promise添加到 promises 数组中
    });
  }
  await Promise.all(promises);
  return requestList; // 返回填充完成的requestList
};


function sliceFile(file, chunkSize = DEFAULT_SLICK_SIZE) { // 默认 1MB
  const chunks = [];
  let start = 0;
  while (start < file.size) {
    const end = Math.min(file.size, start + chunkSize);
    const chunk = file.slice(start, end); // 使用 slice 方法切割
    chunks.push(chunk);
    start = end;
  }

  return chunks;
}

const finishFile = async (row) => {
  const res = await finishFileApi({
    fileMd5: row['file_md5'],
    fileName: row['file_name'],
  })
  if (res['code'] === 0) {
    await getTable(form.value)
    ElMessage.success("操作成功")
  }
}

const combined = async () => {
  let success = 1;
  const list = tableData.value?.filter((item) => {
    return !finishBtnDisabled(item);
  })
  for (const item of list) {
    const {code} = await finishFileApi({
      fileMd5: item['file_md5'],
      fileName: item['file_name'],
    })
    if (code !== 0) {
      success = 0;
    }
  }
  if (list.length === 0) {
    ElMessage.warning("暂无满足合并条件")
    return
  }
  await getTable(form.value)
  if (success === 1) {
    ElMessage.success("操作成功")
  } else if (success === 0) {
    ElMessage.warning("部分任务失败")
  }
}

const finishBtnDisabled = (row) => {
  if (!row['chunk_list']?.length) {
    return true;
  }
  if (row['is_share']) {
    return true
  }
  if (row['chunk_list']?.length !== row['file_total']) {
    return true;
  }
  return row['file_state'];
}


const downloadBtnDisabled = (row) => {
  return !row['file_state'];
}

const download = async (row) => {
  // await downloadFileKey(row.ID)
  const ele = document.createElement('a');
  ele.download = row['file_name'];
  ele.href = row['file_path'].replace('./', '/api/');
  document.body.appendChild(ele);
  ele.click()
  document.body.removeChild(ele);

  //
  //
  //
  // loadingInstance1 = ElLoading.service({fullscreen: true})
  // await downloadFile(row['ID'], ({progress}) => {
  //   loadingInstance1.setText(`已下载${Math.floor(progress * 100)}%`);
  // })
  // loadingInstance1.close();
  // loadingInstance1 = null;
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
      ElMessage.success("删除成功")
      await getTable(form.value)
    }
  }).catch((e) => {
    console.log(e);
  })
}


function copyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // 防止页面滚动
  textarea.style.opacity = "0"; // 隐藏元素
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const successful = document.execCommand("copy");
    if (successful) {
      ElMessage.success("复制成功");
    } else {
      ElMessage.error("复制失败");
    }
  } catch (err) {
    ElMessage.error("复制失败");
  }
  document.body.removeChild(textarea);
}

const paginationChange = async (val) => {
  form.page = val;
  await getTable(form.value)
}

let total = ref(0)
let form = ref({
  fileType: "",
  fileName: "",
  page: 1,
  pageSize: 10,
  isSort: ""
})

const select = async () => {
  await getTable(form.value)
}
const clear = async () => {
  form.value = {
    fileType: "",
    fileName: "",
    page: 1,
    pageSize: 10,
  }
  await getTable(form.value)
}

const collection = async (row) => {
  let data = {
    id: row['ID'],
    weight: 1
  }
  if (row['weight'] === 1) {
    data.weight = 2
  } else {
    data.weight = 1
  }
  const {code} = await collectionFile(data)
  if (code === 0) {
    ElMessage.success("变更成功")
    await getTable(form.value)
  }
}
const userTableData = ref([])

let shareFormData = reactive({
  from_user: "",
  to_user: "",
  file_id: ""
})

const share = async (row) => {
  shareFormData["file_id"] = row.ID;
  dialogTableVisible.value = true
  const {code, data} = await GetAllUserList()
  if (code === 0) {
    userTableData.value = data.list.filter((item) => {
      return item.ID !== useUserStore().UserInfo.ID
    })
  }
}

const handleCurrentChange = (row) => {
  shareFormData["from_user"] = useUserStore().UserInfo.ID
  shareFormData["to_user"] = row.ID
}

const close = () => {
  dialogTableVisible.value = false
  shareFormData = {
    from_user: "",
    to_user: "",
    file_id: ""
  }
}

const submit = async () => {
  if (shareFormData["from_user"] && shareFormData["to_user"] && shareFormData["file_id"]) {
    dialogTableVisible.value = false
    const {code} = await shareFile(shareFormData);
    if (code === 0) {
      ElMessage.success("操作成功")
    }
  } else {
    ElMessage.error("请选择用户")
  }

}

const shareBtnDisabled =(row)=>{
  if(row['is_share']) {
    return true
  }
  if(!row['file_state']) {
    return true
  }
}

let dialogTableVisible = ref(false)
</script>

<template>
  <div class="upload-container"  v-if="false">
    <div class="search" style="background: white;padding: 15px" >
      <el-select
          v-model="form.isSort"
          placeholder="权重"
          style="width: 80px;"
          @change="select"
      >
        <el-option
            key="打开"
            label="打开"
            value="是"
        />
        <el-option
            key="关闭"
            label="关闭"
            value="否"
        />
      </el-select>
      <!--      <el-select-->
      <!--          v-model="form.fileType"-->
      <!--          placeholder="文件格式"-->
      <!--          style="width: 100px;margin-left: 10px"-->
      <!--          @change="select"-->
      <!--      >-->
      <!--        <el-option-->
      <!--            v-for="item in fileType"-->
      <!--            :key="item.value"-->
      <!--            :label="item.label"-->
      <!--            :value="item.value"-->
      <!--        />-->
      <!--      </el-select>-->
      <el-input v-model="form.fileName" @input="select" style="width: 200px;margin-left: 10px"
                placeholder="名称"></el-input>
      <el-button style="margin-left: 10px" @click="clear">清空</el-button>
      <el-button style="margin-left: 10px" type="primary" @click="select">搜索</el-button>
    </div>
    <div style="background: white;padding: 15px;margin-top: 10px">
      <label for="file-input" class="file-label el-button el-button--primary">
        <el-icon>
          <FolderAdd/>
        </el-icon>&nbsp;选择文件({{ files.length }})</label>
      <input id="file-input" style="display:none;" multiple @change="uploads" type="file">
      <el-button style="margin-left: 10px" @click="upload" :disabled="!files.length">
        <el-icon>
          <Upload/>
        </el-icon>&nbsp;文件上传
      </el-button>
      <el-button style="margin-left: 10px" @click="combined">
        <el-icon>
          <Connection/>
        </el-icon>&nbsp;一键合并
      </el-button>

      <label for="file-input2" class="file-label el-button el-button--primary">
        <el-icon>
          <FolderAdd/>
        </el-icon>&nbsp;选择文件2</label>
      <input id="file-input2" style="display:none;" multiple @change="uploads2" type="file">
      <el-popover :width="400" trigger="hover"  >
        <template #reference>
          <el-button icon="MoreFilled" style="margin-left: 10px">更多操作</el-button>
        </template>
        <el-button icon="CopyDocument">&nbsp;文件备份</el-button>
        <el-button style="margin-left: 10px" icon="Refresh">&nbsp;文件恢复</el-button>
        <el-button style="margin-left: 10px" icon="Refresh" @click="useFileStore().selectFile()">&nbsp;测试</el-button>
      </el-popover>
      <el-table
          style="margin-top: 20px"
          :data="tableData" row-key="ID"
          border
      >
        <el-table-column type="expand">
          <template #default="{row}">
            <div style="padding: 15px;box-sizing: border-box">
              <el-card v-if="row['file_type'].includes('image')">
                <template #header>
                  <div class="card-header">
                    <span>文件内容</span>
                  </div>
                </template>
                <img :src="row['file_path'].replace('./',`/api/`)" alt=""/>
              </el-card>
              <el-card v-else-if="row['file_type'].includes('video')">
                <template #header>
                  <div class="card-header">
                    <span>文件内容</span>
                  </div>
                </template>
                <video :src="row['file_path'].replace('./','/api/')" controls></video>
              </el-card>
              <el-card v-else>
                <template #header>
                  <div class="card-header">
                    <span>文件内容</span>
                  </div>
                </template>
                <img src="@/assets/img/fileStyle/unknown_file.png" alt=""/>
              </el-card>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="ID" prop="ID" width="50px"></el-table-column>
        <el-table-column show-overflow-tooltip label="文件名称" prop="file_name"></el-table-column>
        <el-table-column show-overflow-tooltip label="上传状态" prop="file_state" width="100px">
          <template #default="scope">
            <el-tag type="danger" v-if="!scope.row.file_state && tableData.indexOf(scope.row) !== -1">
              文件残缺
            </el-tag>
            <el-tag v-else type="success">
              已上传
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="总片段" prop="file_total" width="100px"></el-table-column>
        <el-table-column show-overflow-tooltip label="已上传片段" prop="chunk_list.length"
                         width="100px"></el-table-column>
        <el-table-column show-overflow-tooltip label="分享人" width="150px">
          <template #default="{row}">
            {{
              row['is_share'] ? row['share_account_name'] : ""
            }}
          </template>
        </el-table-column>
                <el-table-column label="上传时间" show-overflow-tooltip prop="UpdatedAt">
                  <template #default="{row}">
                    {{ formatISODate(row['UpdatedAt']) }}
                  </template>
                </el-table-column>
        <el-table-column label="权重" width="100px" show-overflow-tooltip>
          <template #default="{row}">
            <img @click="collection(row)" v-if="row['weight'] > 1" src="../../../assets/img/collection.png" alt="收藏"
                 style="cursor:pointer;"/>
            <img @click="collection(row)" v-else src="../../../assets/img/unCollection.png" alt="不收藏"
                 style="cursor:pointer;"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="400">
          <template #default="scope">
            <el-button icon="Connection" :disabled="finishBtnDisabled(scope.row)" @click="finishFile(scope.row)">
              合并
            </el-button>
            <el-button type="primary" icon="download" :disabled="downloadBtnDisabled(scope.row)"
                       @click="download(scope.row)">
              下载
            </el-button>
            <el-button type="info" :disabled="shareBtnDisabled(scope.row)" v-if="useUserStore().UserInfo['authority_id'] === 888" icon="share"
                       @click="share(scope.row)">
              分享
            </el-button>
            <el-button type="danger" icon="delete" @click="del(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 10px;width: 100%;display: flex;justify-content: center">
        <el-pagination @change="paginationChange" v-model:current-page="form.page" background layout="prev, pager, next"
                       :total="tableTotal"/>
      </div>
    </div>

    <el-dialog destroy-on-close v-model="dialogTableVisible" @close="close" title="用户列表" width="800">
      <el-table :data="userTableData" highlight-current-row @current-change="handleCurrentChange">
        <el-table-column property="account" label="帐号" width="150"/>
        <el-table-column property="account_name" label="帐号昵称" width="200"/>
        <el-table-column property="user_name" label="用户名称"/>
      </el-table>
      <div style="display: flex;justify-content: right">
        <el-button style="margin-top: 20px" type="info" @click="dialogTableVisible = false">取消</el-button>
        <el-button style="margin-top: 20px" type="primary" @click="submit">提交</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<style scoped>
.upload-container {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
}

</style>
