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
            url: '/user/list',
            method: 'GET'
        }
    )
}

export const ConsentUserRegister = (data) => {
    return api(
      {
          url:"/user/consent",
          method: 'POST',
          data
    }
    )
}