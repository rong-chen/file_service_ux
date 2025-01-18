import api from "@/utils/request.js";

export const uploadChunkFile = (data) => {
    return api(
        {
            url: '/file/upload-chunk-file',
            method: 'POST',
            data,
            headers: {
                "Content-Type": "multipart/form-data",
            }
        }
    )
}

export const finishFileUpload = (params) => {
    return api(
        {
            url: '/file/finish',
            method:"GET",
            params,

        }
    )
}
export const findFileList = () => {
    return api(
        {
            url: '/file/find-file-list',
            method: 'GET',
        }
    )
}

export const findFile = (data) => {
    return api(
        {
            url: '/file/findFile',
            method: 'POST',
            data
        }
    )
}
export const finishFileApi=(params)=>{
    return api(
        {
            url: '/file/finish',
            method: 'GET',
            params
        }
    )

}
