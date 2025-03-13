import api from "@/utils/request.js";

export const LoginApi = (data) => {
    return api(
        {
            url: '/user/login',
            method: 'POST',
            data
        }
    )
}
export const RegisterApi = (data) => {
    return api(
        {
            url: '/user/register',
            method: 'POST',
            data
        }
    )
}
export const UserInfoApi = () => {
    return api(
        {
            url: '/user/info',
            method: 'GET'
        }
    )
}
export const GetAllUserList = () => {
    return api(
        {
            url: '/user_v2/list',
            method: 'GET'
        }
    )
}

export const ConsentUserRegister = (data) => {
    return api(
      {
          url:"/user_v2/consent",
          method: 'POST',
          data
    }
    )
}

export const settingUser = (data) => {
    return api(
        {
            url:"/user_v2/setting_user",
            method: 'POST',
            data
        }
    )
}
