import {createRouter, createWebHashHistory, createWebHistory, useRoute} from 'vue-router'
import {useRouterStore} from "@/store/router.js";
import {useUserStore} from "@/store/user.js";
import {getRouters} from "@/api/menu.js";
const routes = [
    { path: '/' ,redirect: '/login'  },
    { path: '/login', name:"Login", component: ()=>import('../page/Login/index.vue') },
   // { path: '/layout',name:"Layout", component:  ()=>import('../page/Layout/index.vue') },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

const whiteList = ['Login']

router.beforeEach( async (to, from) => {
    const routerStore = useRouterStore()
    const userStore = useUserStore()
    console.log(to)
    if(whiteList.indexOf(to.name) !== -1 ){
        return true
    }
    const route = useRoute()
    if(userStore.UserInfo.token) {
        if(!routerStore.routerFlag){
           await routerStore.loadRoutes()
            console.log(12312312)
           return { ...to, replace: true }
        }
    }else{
        if(to.path !== from.path && whiteList.indexOf(to.path) !== -1){
            return { name : "Login" }
        }
    }
})


