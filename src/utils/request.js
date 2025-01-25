import axios from 'axios'
import {ElMessage} from "element-plus";

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
    Promise.reject(err)
    ElMessage.error("网络错误")
})

api.interceptors.response.use(res => {
    if (res['data']['code'] === 0) {
        return res.data
    }
    return res.data
}, err => {
    let {res} = err

    if (res) {
    } else {
        if (!window.navigator.onLine) {
            return
        }
    }
    ElMessage.error("网络错误")
    return Promise.reject(err)
})


export default api
