import {defineStore} from "pinia";
import {ref} from "vue";
import {LoginApi, UserInfoApi} from "@/api/user.js";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";


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
        }else{
           // ElMessage.error(res['msg'])
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

    return {
        LoginStore,
        GetUserInfo,
        UserInfo: UserInfo,
    }
})
