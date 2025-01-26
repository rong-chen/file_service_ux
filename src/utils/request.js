import axios from 'axios'
import {ElMessage, ElMessageBox} from "element-plus";

const api = axios.create({
    baseURL: "/api",
    timeout: 99999,
    headers: {
        "Content-Type": "application/json"
    }
})
api.interceptors.request.use(config => {
    if(config['header']){
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

api.interceptors.response.use(res => {
    if (res['data']['code'] === 0) {
        return res.data
    }else{
        ElMessage.error(res['data']['msg'])
    }
    return res.data
}, err => {
    let {response} = err
    if(response.data.code){
        if(response.data.code === 8){
            ElMessageBox.confirm(
                '请耐心等待管理员审核',
                '提示',
                {
                    cancelButtonText: '关闭',
                    type: 'warning',
                    showConfirmButton:false,
                }
            ).then(r => {})
        }else{
            ElMessage.error("网络错误")
        }
    }

    return Promise.reject(err)
})


export default api
