import {defineStore} from "pinia";
import {onMounted, ref} from "vue";
import {getRouters} from "@/api/menu.js";
import {router} from "@/router/index.js";
import {useRoute} from "vue-router";
import {useUserStore} from "@/store/user.js";

export const useRouterStore = defineStore("useRouterStore", () => {
    const routerList = ref([])
    const route = useRoute()
    const userStore = useUserStore()
    const routerFlag = ref(false)
    const loadRoutes = async () => {
        if(routerList.value.length > 0){
            return
        }
        const components = import.meta.glob('@/page/**/*.vue');
        const {code , data} = await getRouters();
        if(code === 0){
            let children = []
            const baseRouter = [
                {
                    path: '/layout',
                    name: 'layout',
                    component: components['/src/page/layout/index.vue'],
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
                    component: components[item.component],
                    parentId: item['parentId'],
                    id: item.ID,
                    children:[]
                };
                // 声明页面路由菜单
                let row = {
                    label: item.label,
                    children: [],
                    path: item.path,
                    parentId: item['parentId'],
                    name: item.name,
                    id: item.ID
                }
                // router.addRoute("layout", newRoute);
                if (item.children?.length > 0) {
                    item.children.forEach((child) => {
                        row.children.push({
                            label: child.label,
                            path: child.path,
                            parentId: child['parentId'],
                            name: child.name,
                            id: item.ID
                        })
                        const newChildRoute = {
                            path: child.path,
                            name: child.name,
                            parentId: item['parentId'],
                            component: components[child.component],
                            id: item.ID
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
        }else{
            routerFlag.value = false
        }
    }
    const filterRouterRow = (fullPath) => {
        const list = router.getRoutes()
        if (list?.length > 0) {
              return list?.filter((item) => item.path === fullPath)[0]?.name
        }
        return "";
    }


    return {
        routerList,
        loadRoutes,
        routerFlag,
    }
})
