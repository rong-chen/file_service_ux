import SparkMD5 from "spark-md5"

onmessage = ({data}) => {
    const files = data.files;
    const CHUNK_SIZE = data.CHUNK_SIZE;
    const spark = new SparkMD5();
    let offset = 0;
    const fileReader = new FileReader();

    function loadNextChunk() {
        const file = files.slice(offset, offset + CHUNK_SIZE);
        fileReader.readAsArrayBuffer(file);
    }

    fileReader.onload = ({target}) => {
        spark.append(target.result);
        if (offset < files.size) {
            offset += CHUNK_SIZE;
            offset > files.size && (offset = files.size);
            loadNextChunk();
            postMessage({
                overProcess: Math.ceil(offset / files.size * 100), md5: ""
            })
        } else {
            const md5Hash = spark.end();
            postMessage({
                overProcess: Math.ceil(offset / files.size * 100), md5: md5Hash
            })
        }
    }
    loadNextChunk();
}
