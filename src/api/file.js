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
            method: "GET",
            params,

        }
    )
}
export const findFileList = (params) => {
    return api(
        {
            url: '/file/find-file-list',
            method: 'GET',
            params
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

export const collectionFile = (data) => {
    return api(
        {
            url: '/file/collection',
            method: 'POST',
            data
        }
    )
}
export const finishFileApi = (params) => {
    return api(
        {
            url: '/file/finish',
            method: 'GET',
            params
        }
    )

}
export const downloadFile = (key,start,end) => {
    return api(
        {
            url: `/file/download/${key}`,
            method: 'GET',
            headers: { 'Range': `bytes=${start}-${end}` },
        }
    )
}

export const downloadFileKey = (fileId) => {
    return api(
        {
            url: `/file/download-key/${fileId}`,
            method: 'GET',
        }
    )
}
export  const deleteFile = (id) => {
    return api(
        {
            url: `/file/delete?id=${id}`,
            method: 'DELETE',
        }
    )
}
export  const shareFile = (data) => {
    return api(
        {
            url: `/file/share`,
            method: 'POST',
            data
        }
    )
}
