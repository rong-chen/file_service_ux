import api from "@/utils/request.js";

export const createGroupApi = (data) => {
    return api(
        {
            method: "POST",
            url: "/group/add",
            data
        }
    )
}
export const getTableData = () => {
    return api(
        {
            method: "GET",
            url: "/group/list",
        }
    )
}
export const joinGroupUserApi = (data) => {
    return api(
        {
            method: "POST",
            url: "/group-user/join",
            data
        }
    )
}

export const GetUserGroup = (params) => {
    return api(
        {
            method: "GET",
            url: "/group-user/list",
            params
        }
    )
}

export const addGroupFile=(data)=>{
    return api(
        {
            method: "POST",
            url: "/group-file/add",
            data
        }
    )
}


export const getGroupFile = (params) => {
    return api(
        {
            method: "GET",
            url: "/group-file/list",
            params
        }
    )
}
