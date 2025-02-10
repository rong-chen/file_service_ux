import {createRouter, createWebHashHistory, createWebHistory, useRoute} from 'vue-router'
import {useRouterStore} from "@/store/router.js";
import {useUserStore} from "@/store/user.js";
import {getRouters} from "@/api/menu.js";

const routes = [
    {path: '/', redirect: '/login'},
    {path: '/login', name: "Login", component: () => import('../view/login/index.vue')},
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

const whiteList = ['Login']

router.beforeEach(async (to, from) => {
    const routerStore = useRouterStore()
    const userStore = useUserStore()

    if (whiteList.indexOf(to.name) !== -1) {
        userStore.exitApp()
        return true
    }
    if (userStore.UserInfo.token) {
        if (!routerStore.routerFlag) {
            const userStore = useUserStore()
            // 获取用户信息
            await userStore.GetUserInfo();
            await routerStore.loadRoutes()
            return {...to, replace: true}
        }
    } else {
        if(to.path === '/layout') {
            to.fullPath = "/layout/my_files"
            to.path = "/layout/my_files"
            to.name="my_files"
            return {...to, replace: true}
        }
        if (to.path !== from.path && whiteList.indexOf(to.path) !== -1) {
            return {name: "Login"}
        }
    }

})


