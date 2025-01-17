import axios from 'axios'

const api = axios.create({
    baseURL: "/api",
    timeout: 3600000,
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
    return Promise.reject(err)
})


export default api
