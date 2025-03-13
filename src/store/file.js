import {defineStore} from "pinia";
import {ref, watchEffect} from "vue";
import SparkMD5 from "spark-md5";
import {
    checkFile,
    combinedFileApi, fileList,
    findFile,
    findFileList,
    finishFileUpload,
    upload_file_chunk,
    uploadChunkFile
} from "@/api/file.js";
import {ElMessage} from "element-plus";
import {useUserStore} from "@/store/user.js";

export const useFileStore = defineStore('useFileStore', () => {
    let currentUploadFile = ref([])
    let tableData = ref([])
    const DEFAULT_SLICK_SIZE = 1024 * 1024;
    const userStore = useUserStore()
    let form = ref({
        isSort: "否", fileName: "",
    })
    let queryParams = ref({
        pageSize: 10,
        page: 1,
        isOver: true,
        name: ""
    })
    const getTableData = async () => {
        const {data, code} = await fileList(queryParams.value)
        if (code === 0) {
            tableData.value = data
        }
    }
    // const getTable = async () => {
    //      const res = await findFileList(form.value);
    //     if (res['code'] === 0) {
    //         tableData.value = [];
    //         currentUploadFile.value = [];
    //         if (res.data.list && res.data.list.length > 0) {
    //             for (const item of res.data.list) {
    //                 if (item['file_state']) {
    //                     tableData.value.push(item)
    //                 }
    //                 if (!item['file_state'] && (item['chunk_list'].length !== item['file_total'])) {
    //                     let baseInfo = ref({
    //                         name: item.file_name,
    //                         size: item.file_size,
    //                         overProcess: Math.ceil((item['chunk_list'].length ?? 0) / item['file_total'] * 100) + "%",
    //                         fileMd5: item['file_md5'],
    //                         msg: "暂停上传",
    //                         fileTotalSize: item.file_size,
    //                         overSize: (item['chunk_list'].length ?? 0) * DEFAULT_SLICK_SIZE,
    //                         type: item.file_type,
    //                         status: false
    //                     })
    //                     currentUploadFile.value.push(baseInfo.value)
    //                 }
    //                 if (!item['file_state'] && item['chunk_list'].length === item['file_total']) {
    //                     await finishFileUpload({
    //                         fileMd5: item['file_md5'], fileName: item.file_name,
    //                     });
    //                     await getTable();
    //                 }
    //             }
    //         }
    //     }
    // }
    const selectFile = async () => {
        try {
            let [fileHandle] = await window.showOpenFilePicker(undefined);
            const files = await fileHandle.getFile()
            let baseInfo = ref({
                name: files.name,
                size: files.size,
                overProcess: "",
                fileMd5: "",
                msg: "正在生成文件指纹",
                fileTotalSize: files.size,
                overSize: 0,
                type: files.type,
                status: true
            })
            currentUploadFile.value.push(baseInfo.value)
            //开启线程，后台处理文件md5
            const worker = new Worker(new URL('../worker/file_worker.js', import.meta.url), {type: 'module'});
            worker.postMessage({
                files: files, CHUNK_SIZE: DEFAULT_SLICK_SIZE,
            })
            worker.onmessage = async (e) => {
                baseInfo.value.overProcess = e.data.overProcess + "%";
                if (e.data.md5) {
                    await filterFile(e.data.md5)
                    baseInfo.value.fileMd5 = e.data.md5;
                    worker.terminate()
                    baseInfo.value.msg = "正在准备上传"
                    baseInfo.value.overProcess = ""
                    const chunks = getFileChunkList(files);
                    console.log(chunks);
                    if (chunks.length > 0) {
                        baseInfo.value.msg = "正在生成副本信息"
                        await uploadFile(baseInfo.value, chunks)
                    }
                }
            }
            // 监听 Worker 错误
            worker.onerror = function (error) {
                worker.terminate()
            };
        } catch (e) {
            if (e.name !== 'AbortError') {
                ElMessage.error(e.message)
            }
        }
    }
    const filterFile = async (md5) => {
        let index = currentUploadFile.value.slice().reverse().findIndex(item => item['fileMd5'] === md5);
        if (index !== -1) {
            // 计算实际索引
            index = currentUploadFile.value.length - 1 - index;
            currentUploadFile.value.splice(index, 1);
        }
    }

    const getFileChunkList = (file) => {
        let chunkList = [];
        let start = 0;
        let end = DEFAULT_SLICK_SIZE;
        function loadNextFileChunk() {
            try {
                if (start < file.size) {
                    const chunk = file.slice(start, end + start);
                    chunkList.push(chunk);
                    start = start + DEFAULT_SLICK_SIZE;
                    start > file.size && (end = file.size);
                    loadNextFileChunk();
                }
            } catch (e) {
                console.error(e);
            }
        }

        loadNextFileChunk();
        return chunkList;
    }


    const uploadFile = async (file_info, chunk_list) => {
        let list = file_info.name.split(".")
        let file_suffix = ""
        if (list.length > 1) {
            file_suffix = `.${list[list.length - 1]}`
        }

        let obj = {
            file_name: file_info.name,
            file_size: file_info.fileTotalSize,
            file_md5: file_info.fileMd5,
            file_path: userStore.UserInfo.mount_path,
            file_suffix,
            file_chunk_total: chunk_list.length,
        }

        const res = await checkFile(obj)
        if (res['code'] === 0) {
            userStore.UserInfo.use_disk_size += file_info.fileTotalSize
            file_info.status = true;
            file_info.msg = "正在上传中";
            file_info['id'] = res.data.ID
            file_info['chunk_path'] = res.data['chunk_path']
            // 筛选未传递的list集合
            let chunks;
            if (res.data['chunk_list'] && res.data['chunk_list'].length > 0) {
                chunks = res.data['chunk_list'];
            } else {
                chunks = []
            }
            const lists = getIncompleteChunks(chunk_list, chunks)
            let requestList = await splitBlob(lists, file_info)
            await req_queue(requestList, 5, file_info, chunk_list.length)
        }
    }

    const req_queue = async (req_lists, count, base_info, chunkCount) => {
        //当前索引
        let index = 0;
        // 未上传切片数组总数量
        let total = req_lists.length;
        let uploadSuccessTotal = 0;
        return new Promise(async (resolve, reject) => {
            const sendApi = async () => {
                const req_list = req_lists.slice(index, count + index);
                const promises = req_list.map(async (request) => {
                    const res = await upload_file_chunk(request)
                    if (res['code'] === 0) {
                        total--;
                        uploadSuccessTotal++;
                        base_info['overProcess'] = Math.ceil((uploadSuccessTotal + (chunkCount - req_lists.length)) / chunkCount * 100) + "%";
                        base_info['overSize'] = (uploadSuccessTotal + (chunkCount - req_lists.length)) / chunkCount * base_info['size']
                        if (base_info['overSize'] >= base_info['size']) {
                            currentUploadFile.value = currentUploadFile.value.filter(item=>{
                                return item['id'] !== base_info['id']
                            })
                            // 上传完毕，执行合并方法
                            await combinedFileApi({
                                id: base_info['id']
                            })
                            await getTableData()
                        }
                    }
                }); // 发送所有请求
                await Promise.allSettled(promises);
            }
            while (index < req_lists.length) {
                await sendApi();
                index += count
            }
            resolve()
        })
    }


    // 过滤已上传的片段，通过index字段过滤
    const getIncompleteChunks = (list, olist) => {
        let itemList = []
        if (olist && olist.length > 0) {
            itemList = olist
        }
        let idlist = []
        if (itemList?.length > 0) {
            // 存储已经上传的片段number
            idlist = itemList.map((item) => {
                return Number(item['index'])
            });
        }
        let list2 = []
        list.forEach((item, index) => {
            if (!idlist.includes(index)) {
                list2.push({
                    index: index, file: item
                })
            }
        })

        return list2;
    }


    const splitBlob = async (list, file_info) => {
        let requestList = [];
        // 创建一个临时数组来存储所有的Promise
        const promises = [];
        for (const item1 of list) {
            const formData = new FormData();
            const fileR = new FileReader(); // 文件读取器
            const promise = new Promise((resolve) => {
                fileR.readAsArrayBuffer(item1['file']);
                fileR.onload = async (e) => {
                    const blob = e.target.result;
                    const spark = new SparkMD5.ArrayBuffer();
                    spark.append(blob);
                    let md5 = spark.end();
                    formData.append("file", item1['file']);
                    formData.append("file_md5", file_info['fileMd5']);
                    formData.append("chunk_path", file_info['chunk_path']);
                    formData.append("chunk_md5", md5);
                    formData.append("index", item1['index']);
                    formData.append("file_id", file_info['id']);
                    requestList.push(formData);
                    resolve(); // 当onload完成时，resolve当前Promise
                };
            });
            promises.push(promise); // 将这个Promise添加到 promises 数组中
        }
        await Promise.all(promises);
        return requestList; // 返回填充完成的requestList
    }

    const filterRowById = (id) => {
        if (tableData.value && tableData.value.length > 0) {
            return tableData.value.filter((item) => {
                return item['ID'] === id;
            })
        }
        return [];
    }
    const getUploadFileList = async () => {
        const {data, code} = await fileList({
            pageSize: 9999999,
            page: 1,
            isOver: false,
            name: ""
        })
        if (code === 0) {
            data && data.length && data.forEach(item => {
                currentUploadFile.value.push({
                    name:item['file_name'],
                    size:item['file_size'],
                    overProcess: Math.ceil((item['chunk_list']?.length ?? 0) / item['file_chunk_total'] * 100) + "%",
                    fileMd5: item['file_md5'],
                    msg:"暂停上传",
                    fileTotalSize:item['file_size'],
                    overSize:(item['chunk_list']?.length ?? 0) * DEFAULT_SLICK_SIZE,
                    type:item['file_type'],
                    status:false
                });
            })
        }
    }
    getUploadFileList()
    getTableData()
    return {
        selectFile, currentUploadFile, tableData, filterRowById, form,getUploadFileList,queryParams,getTableData
    }
})
