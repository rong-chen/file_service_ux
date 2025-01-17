import {defineStore} from "pinia";
import {onMounted, ref} from "vue";
import {getRouters} from "@/api/menu.js";
import {router} from "@/router/index.js";
import {useRoute} from "vue-router";

export const useRouterStore = defineStore("useRouterStore", () => {
    const routerList = ref([])
    const route = useRoute()
    const loadRoutes = async () => {
        const components = import.meta.glob('@/page/**/*.vue');
        const {data} = await getRouters();
        data.forEach((item) => {
            const newRoute = {
                path: item.path,
                name: item.name,
                component: components[item.component],
                parentId: item['parentId'],
                id: item.ID
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
            router.addRoute("Layout", newRoute);
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
                        path: item.name + "/" + child.path,
                        name: child.name,
                        parentId: item['parent_id'],
                        component: components[child.component],
                        id: item.ID
                    };
                    router.addRoute("Layout", newChildRoute);
                });
            }
            // 给页面路由的菜单添加元素
            routerList.value.push(row);
        });
        const name = filterRouterRow(route.fullPath)
        await router.push({
            name:name
        })
    }
    const filterRouterRow = (fullPath) => {
        const list = router.getRoutes()
        if (list.length > 0) {
              return   list.filter((item) => item.path === fullPath)[0].name
        }
        return "";
    }
    onMounted(async () => {
       await loadRoutes();
    })

    return {
        routerList
    }
})
