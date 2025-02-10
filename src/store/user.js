import {defineStore} from "pinia";
import {ref} from "vue";
import {LoginApi, UserInfoApi} from "@/api/user.js";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {useRouterStore} from "@/store/router.js";


export const useUserStore = defineStore("useUserStore", () => {
    const UserInfo = ref({
        username: "",
        uuid: "",
        account_name: "",
        account: "",
        profile_picture: "",
        ID: 0,
        token: localStorage.getItem("token"),
        authority_id:88
    })
    const LoginStore = async (account, password) => {
        let res = await LoginApi({
            account, password,
        })
        if(res['code'] === 0){
            UserInfo.value.token = res.data.token;
            localStorage.setItem("token", res.data.token);
        }
        return res['code']
    }

    const GetUserInfo = async () => {
        let res = await UserInfoApi()
        if(res['code'] === 0){
            res.data['token'] = UserInfo.value.token
            UserInfo.value = res.data
        }
    }
    const exitApp = () => {
        localStorage.removeItem("token")
        UserInfo.value = {
            username: "",
            uuid: "",
            account_name: "",
            account: "",
            profile_picture: "",
            fileTotalSize: 0,
            ID: 0,
            authority_id:88,
            token:"",
            overSize:0
        }
        useRouterStore().routerFlag = false
    }
    return {
        LoginStore,
        GetUserInfo,
        UserInfo: UserInfo,
        exitApp
    }
})
