

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