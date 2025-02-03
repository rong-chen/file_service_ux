import axios from 'axios'
import {ElMessage, ElMessageBox} from "element-plus";

const api = axios.create({
    baseURL: "/api", timeout: 99999, headers: {
        "Content-Type": "application/json"
    }
})
api.interceptors.request.use(config => {
    if (config['header']) {
        config.headers = config['header']
    }

    if (config.url !== '/user/login') {
        config.headers['q-token'] = localStorage.getItem('token')
    }
    return config
}, err => {
    console.log(err)
    // if(res.data.code === 8){}
    ElMessage.error("网络错误")
    Promise.reject(err)
})
export const download = (res) => {
    let fileName = res.headers['content-disposition']
    const blob = new Blob([res.data])
    const downloadLink = document.createElement('a')
    fileName = fileName.split("UTF-8''")[1]
    downloadLink.download = decodeURIComponent(fileName)
    downloadLink.style.display = 'none'
    downloadLink.href = URL.createObjectURL(blob)
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
}

api.interceptors.response.use(res => {
    if (res['data']['code'] === 0) {
        return res.data
    } else {
        if (res.data instanceof Blob) {
            if (res.headers['content-type'] === 'application/octet-stream') {
                download(res)
                return
            } else {
                res.data.text().then(jsonData  => {
                    const data = JSON.parse(jsonData)
                    ElMessage.error(data['msg'])
                });
            }
        } else {
            ElMessage.error(res['data']['msg'])
        }

    }
    return res.data
}, err => {
    let {response} = err
    if (response.data.code) {
        if (response.data.code === 8) {
            ElMessageBox.confirm('请耐心等待管理员审核', '提示', {
                cancelButtonText: '关闭', type: 'warning', showConfirmButton: false,
            }).then(r => {
            })
        } else {
            ElMessage.error("网络错误")
        }
    }
    return Promise.reject(err)
})


export default api
