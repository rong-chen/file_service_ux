import {createRouter, createWebHistory, useRoute} from 'vue-router'
const routes = [
    { path: '/', component: ()=>import('../page/Login/index.vue') },
    { path: '/layout',name:"Layout", component:  ()=>import('../page/Layout/index.vue') },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})


