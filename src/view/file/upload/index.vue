<script setup>

import axios from "axios";
import {onMounted, ref} from "vue";
import SparkMD5 from "spark-md5"
import {ElMessage} from "element-plus";
import {findFile, findFileList, finishFileApi, finishFileUpload, uploadChunkFile} from "@/api/file.js";
import {ElLoading} from 'element-plus'

const getTable = async () => {
  const res = await findFileList();
  return res.data
}
let tableData = ref([])
onMounted(async () => {
  tableData.value = await getTable()
})

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

const uploads = async (e) => {
  loadingInstance1 = ElLoading.service({fullscreen: true})
  const list = [...e.target.files]
  let apiCount = list.length;
  list.forEach((item) => {
    const val = item
    const chunks = sliceFile(val);
    const fileR = new FileReader() // 创建一个reader用来读取文件流
    fileR.readAsArrayBuffer(val);
    loadingUploadCounts.value = [];
    fileR.onload = async (e) => {
      const blob = e.target.result
      const spark = new SparkMD5.ArrayBuffer()
      spark.append(blob)
      const fileMd5 = spark.end()
      await findFile({
        "file_total": chunks.length,
        "file_name": val.name,
        "file_type": item.type,
        "file_md5": fileMd5,
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
        tableData.value = await getTable()
      }
    }
  })
}

const req_queue = async (list, count) => {
  let index = 0;
  total.value = list.length;
  const sendApi = async () => {
    const req_list = list.slice(index, count + index);
    const promises = req_list.map(async (request) => {
      const res = await uploadChunkFile(request);
      if (res['code'] === 0) {
        loadingUploadCounts.value[request.get("fileMd5")]--;
        if (loadingUploadCounts.value[request.get("fileMd5")] === 0) {
          await finishFileUpload({
            fileMd5: request.get("fileMd5"),
            fileName: request.get("fileName"),
          });
        }
        let num = total.value --
        loadingInstance1.setText(`${num}/${list.length}`);
      }
    }); // 发送所有请求
    await Promise.all(promises);
  }
  while (index < list.length) {
    await sendApi();
    index += count
  }
}
let total = ref(0);

const upload = async () => {
  loadingInstance1 = ElLoading.service({fullscreen: true})
  let requestList = await splitBlob();

  await req_queue(requestList, 10).then(async () => {
    tableData.value = await getTable()
    loadingInstance1.close();
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


function sliceFile(file, chunkSize = 1024 * 1024) { // 默认 1MB
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
    tableData.value = await getTable()
    ElMessage.success("操作成功")
  }
}

const finishBtnDisabled = (row) => {
  if (!row['chunk_list']?.length) {
    return true;
  }
  if (row['chunk_list']?.length !== row['file_total']) {
    return true;
  }
  return row['file_state'];
}

function formatISODate(isoDate) {
  const date = new Date(isoDate);
  // 获取年份、月份、日期、小时、分钟和秒
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，需要加1
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  // 格式化成所需的形式
  return `${year}年${month}月${day}日${hours}时${minutes}分${seconds}秒`;
}

const downloadBtnDisabled = (row) => {
  return !row['file_state'];
}
const download = async (row) => {
  let result = "http://chenrong.vip:8888" + row['file_path'].replace(/^\.\/(.*)/, "/$1");
  const a = document.createElement('a');
  a.href = result;
  a.target = "_blank";
  a.click();
  tableData.value = await getTable()
}

const share = (row) => {
  let result = "http://chenrong.vip:8888" + row['file_path'].replace(/^\.\/(.*)/, "/$1");
  navigator.clipboard.writeText(result).then(() => {
    ElMessage.success("复制成功")
  }).catch(() => {
    ElMessage.error("复制失败")
  });
}
</script>

<template>
  <div class="upload-container">
    <el-button @click="upload">上传</el-button>
    <label for="file-input" class="file-label el-button el-button--primary">选择文件</label>
    <input id="file-input" style="display:none;margin: 0 20px" multiple @change="uploads" type="file">
    <el-table
        style="margin-top: 20px"
        :data="tableData" row-key="ID"
        border
    >
      <el-table-column label="ID" prop="ID" width="100px"></el-table-column>

      <!--  <el-table-column label="文件md5" prop="file_md5"></el-table-column>-->
      <el-table-column label="文件名称" prop="file_name"></el-table-column>
      <!--      <el-table-column label="片段顺序" prop="chunk_number">-->
      <!--        <template #default="{row}">-->
      <!--          {{-->
      <!--            row['chunk_number'] != null && row['chunk_number'] !== undefined ? row['chunk_number'] : ""-->
      <!--          }}-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="上传状态" prop="file_state" width="100px">
        <template #default="scope">
          <el-tag type="danger" v-if="!scope.row.file_state && tableData.indexOf(scope.row) !== -1">
            文件残缺
          </el-tag>
          <el-tag v-else type="success">
            已上传
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总片段" prop="file_total" width="100px"></el-table-column>
      <el-table-column label="已上传片段" prop="chunk_list.length" width="100px"></el-table-column>
      <el-table-column label="创建时间" prop="CreatedAt">
        <template #default="{row}">
          {{
            formatISODate(row['CreatedAt'])
          }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="UpdatedAt">
        <template #default="{row}">
          {{ formatISODate(row['UpdatedAt']) }}
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template #default="scope">
          <el-button :disabled="finishBtnDisabled(scope.row)" @click="finishFile(scope.row)">
            合并
          </el-button>
          <el-button :disabled="downloadBtnDisabled(scope.row)" @click="download(scope.row)">
            {{ scope.row['file_type'] === "video/mp4" ? '播放' : '下载' }}
          </el-button>
          <el-button @click="share(scope.row)">
            分享
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

</template>

<style scoped>
.upload-container {
  width: 100%;
  background-color: white;
  box-sizing: border-box;
  padding: 20px;
}

</style>
