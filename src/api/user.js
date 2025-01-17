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
