

export function formatISODate(isoDate) {
    const date = new Date(isoDate);
    // 获取年份、月份、日期、小时、分钟和秒
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始，需要加1
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    // 格式化成所需的形式
    return `${year}年${month}月${day}日${hours}时${minutes}分${seconds}秒`;
}

export const formatTime = (beforeUpdate ,afterUpdate) => {
    const date = new Date(beforeUpdate).getTime();
    const date2 = new Date(afterUpdate).getTime();
    const diffInMs = date2 - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(((diffInMs % (1000 * 60 * 60 * 24)) % (1000 * 60 * 60)) / (1000 * 60));
    const diffInSeconds = Math.floor((((diffInMs % (1000 * 60 * 60 * 24)) % (1000 * 60 * 60)) % (1000 * 60)) / 1000);

    if(diffInDays){
        return  `更新于${diffInDays}天前`
    }
    if(diffInHours){
        return  `更新于${diffInHours}小时前`
    }
    if(diffInMinutes){
        return  `更新于${diffInMinutes}分钟前`
    }
    if(diffInSeconds){
        return  `更新于${diffInSeconds}秒钟前`
    }
}
