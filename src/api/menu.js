import {createWebHistory} from "vue-router";
import api from "@/utils/request.js";


export const getRouters = ()=>{
    return api({
        url:"/menu/list",
        method:"GET",
    })
}
