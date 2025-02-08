import {defineStore} from "pinia";
import {ref} from "vue";
import {getRouters} from "@/api/menu.js";
import {router} from "@/router/index.js";
import {useUserStore} from "@/store/user.js";
import {useRoute} from "vue-router";

export const useRouterStore = defineStore("useRouterStore", () => {
    const routerList = ref([])
    const routerFlag = ref(false)
    const route = useRoute()

    const loadRoutes = async () => {
        if (routerList.value.length > 0) {
            return
        }
        const components = import.meta.glob('@/view/**/*.vue');
        const {code, data} = await getRouters();
        if (code === 0) {
            let children = []
            const baseRouter = [
                {
                    path: '/layout',
                    name: 'layout',
                    component: components['/src/view/layout/index.vue'],
                    meta: {
                        title: '底层layout'
                    },
                    children: []
                }
            ]

            data?.forEach((item) => {
                const newRoute = {
                    path: item.path,
                    name: item.name,
                    component: components["/src/" + item.component],
                    parentId: item['parentId'],
                    comPath: item['component'],
                    id: item.ID,
                    icon: item.icon,

                    children: []
                };
                // 声明页面路由菜单
                let row = {
                    label: item.label,
                    children: [],
                    path: item.path,
                    parentId: item['parentId'],
                    name: item.name,
                    id: item.ID,
                    icon: item.icon,
                }
                if (item.children?.length > 0) {
                    item.children.forEach((child) => {
                        row.children.push({
                            label: child.label,
                            comPath: child['component'],
                            path: child.path,
                            parentId: child['parentId'],
                            name: child.name,
                            id: item.ID,
                            icon: item.icon,
                        })
                        const newChildRoute = {
                            path: child.path,
                            name: child.name,
                            comPath: child['component'],
                            parentId: item['parentId'],
                            component: components["/src/" + child.component],
                            id: item.ID,
                            icon: item.icon,
                        };
                        newRoute.children.push(newChildRoute);
                    });
                }
                children.push(newRoute)
                // 给页面路由的菜单添加元素
                routerList.value.push(row);
            });
            baseRouter[0].children = children;
            baseRouter.forEach((asyncRouter) => {
                router.addRoute(asyncRouter)
            })
            routerFlag.value = true
        } else {
            routerFlag.value = true
        }
    }
    const filterRouterRow = (fullPath) => {
        const list = router.getRoutes()
        if (list?.length > 0) {
            return list?.filter((item) => item.path === fullPath)[0]?.name
        }
        return "";
    }
    const clearRouter = () => {
        routerFlag.value = false;
        routerList.value = []
    }


    return {
        routerList,
        loadRoutes,
        routerFlag,
        clearRouter
    }
})
