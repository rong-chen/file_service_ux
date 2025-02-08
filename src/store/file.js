import {defineStore} from "pinia";
import {ref, watch, watchEffect} from "vue";
import SparkMD5 from "spark-md5";
import {findFile, findFileList, finishFileUpload, uploadChunkFile} from "@/api/file.js";

export const useFileStore = defineStore('useFileStore', () => {
    let fileTable = ref([])
    let currentUploadFile = ref([])
    let tableData = ref([])
    const DEFAULT_SLICK_SIZE = 1024 * 1024;
    let ChunkList = ref([])
    const getTable = async (form) => {
        const res = await findFileList(form);
        if (res['code'] === 0) {
            if (res.data.list && res.data.list.length > 0) {
                tableData.value = res.data.list;
                for (const item of res.data.list) {
                    if (!item['file_state'] && (item['chunk_list'].length !== item['file_total'])) {
                        let baseInfo = ref({
                            name: item.file_name,
                            size: item.file_size,
                            overProcess: Math.ceil((item['chunk_list'].length ?? 0) / item['file_total'] * 100) + "%",
                            fileMd5: item['file_md5'],
                            msg: "暂停上传",
                            fileTotalSize: item.file_size,
                            overSize: (item['chunk_list'].length ?? 0) * DEFAULT_SLICK_SIZE,
                            type: item.file_type,
                            status: false
                        })
                        currentUploadFile.value.push(baseInfo.value)
                    }
                    if (!item['file_state'] && item['chunk_list'].length === item['file_total']) {
                        await finishFileUpload({
                            fileMd5: item['file_md5'], fileName: item.file_name,
                        });
                    }
                }
            }
        }
    }
    getTable()
    const selectFile = async () => {
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
                const chunk = file.slice(start, end + start);
                chunkList.push(chunk);
                if (start < file.size) {
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
        const res = await findFile({
            "file_total": chunk_list.length,
            "file_name": file_info.name,
            "file_type": file_info.type || "unknown",
            "file_md5": file_info.fileMd5,
            "file_size": file_info.fileTotalSize,
            "path": ""
        })
        if (res['code'] === 0) {
            file_info.status = true;
            file_info.msg = "正在上传中";
            // 筛选未传递的list集合
            let chunks;
            if (res.data.data['chunk_list'] && res.data.data['chunk_list'].length > 0) {
                chunks = res.data.data['chunk_list'];
                console.log("res.data.data['chunk_list']")
                console.log(res.data.data['chunk_list']);
            } else {
                chunks = []
            }
            const lists = getIncompleteChunks(chunk_list, chunks)
            console.log(lists)
            // 转化成format格式参数
            let requestList = await splitBlob(lists, file_info);
            // console.log(chunk_list)
            console.log(requestList)
            await req_queue(requestList, 5, file_info, chunk_list.length)
        } else {
            file_info.status = false;
            file_info.msg = res['msg'];
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
                    const res = await uploadChunkFile(request)
                    if (res['code'] === 0) {
                        total--;
                        uploadSuccessTotal++;
                        console.log(chunkCount - req_lists.length)
                        base_info['overProcess'] = Math.ceil((uploadSuccessTotal + (chunkCount - req_lists.length)) / chunkCount * 100) + "%";
                        base_info['overSize'] = (uploadSuccessTotal + (chunkCount - req_lists.length)) / chunkCount * base_info['size']
                        if (base_info['overSize'] > base_info['size']) {
                            base_info['overSize'] = base_info['size']
                        }
                        if (total === 0) {
                            base_info.msg = "上传成功";
                            await finishFileUpload({
                                fileMd5: base_info.fileMd5, fileName: base_info.name,
                            });
                            getTable()
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

    watchEffect(() => {
        console.log(ChunkList.value)
    })


    const getIncompleteChunks = (list, olist) => {
        let itemList = []
        if (olist && olist.length > 0) {
            itemList = olist
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
                    formData.append("fileMd5", file_info['fileMd5']);
                    formData.append("chunkMd5", md5);
                    formData.append("fileName", file_info['name']);
                    formData.append("fileType", file_info['type']);
                    formData.append("chunkNumber", item1['index']);
                    formData.append("chunkTotal", "0");
                    requestList.push(formData);
                    resolve(); // 当onload完成时，resolve当前Promise
                };
            });
            promises.push(promise); // 将这个Promise添加到 promises 数组中
        }
        await Promise.all(promises);
        return requestList; // 返回填充完成的requestList
    };


    return {
        selectFile, currentUploadFile,tableData, getTable
    }
})
