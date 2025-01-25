import {defineStore} from "pinia";
import {ref} from "vue";
import {LoginApi, UserInfoApi} from "@/api/user.js";
import {useRouter} from "vue-router";


export const useUserStore = defineStore("useUserStore", () => {
    const UserInfo = ref({
        username: "",
        uuid: "",
        account_name: "",
        account: "",
        profile_picture: "",
        ID: 0,
        token: localStorage.getItem("token")
    })
    const router = useRouter();
    const LoginStore = async (account, password) => {
        let res = await LoginApi({
            account, password,
        })
        UserInfo.value.token = res.data.token;
        localStorage.setItem("token", res.data.token);
        return res['code']
    }

    const GetUserInfo = async () => {
        let res = await UserInfoApi()
        res.data['token'] = UserInfo.value.token
        UserInfo.value = res.data
    }

    return {
        LoginStore,
        GetUserInfo,
        UserInfo: UserInfo,
    }
})
