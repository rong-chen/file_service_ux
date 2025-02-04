

export const getFileEle =(className,file_type)=>{
    const iconMapping = {
        'image/png': document.createElement("img"),
        'image/jpeg': document.createElement("img"),
        'image/gif': document.createElement("img"),
        'image/svg+xml': document.createElement("img"),
        'audio/mpeg': document.createElement("video"),
        'audio/wav': document.createElement("video"),
        'audio/ogg': document.createElement("video"),
        'video/mp4': document.createElement("video"),
        'video/webm': document.createElement("video"),
        'application/pdf': 'https://via.placeholder.com/50?text=PDF',
        'application/msword': 'https://via.placeholder.com/50?text=DOC',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'https://via.placeholder.com/50?text=DOCX',
        'application/vnd.ms-excel': 'https://via.placeholder.com/50?text=XLS',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'https://via.placeholder.com/50?text=XLSX',
        'application/zip': "zip",
        'application/x-zip-compressed':"zip",
        'application/x-rar-compressed': 'https://via.placeholder.com/50?text=RAR',
        'application/json': 'https://via.placeholder.com/50?text=JSON',
        'text/plain': 'https://via.placeholder.com/50?text=TXT',
        'application/javascript': 'https://via.placeholder.com/50?text=JS'
    };
    if(typeof iconMapping[file_type] !=='string'){
        const el = document.querySelector(`.${className}`);
        // el.appendChild(iconMapping[file_type]);
    }
    return iconMapping[file_type];
}
