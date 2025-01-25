<template>
  <div class="home-container">
<!--<canvas class="home-canvas" id="homeCanvas" ></canvas>-->
<!--    <div class="windows-container">-->
<!--      <div class="container">-->
<!--        <ul style="color: white;">-->
<!--          <li v-for="item in tableData" style="display: flex;flex-wrap: wrap;flex-direction: column;margin:0 10px ">-->
<!--             <img style="height: 40px;width: 40px" :src="item.fileImage" alt="">-->
<!--             <div class="single-line">-->
<!--               {{item['file_name']}}-->
<!--             </div>-->
<!--          </li>-->
<!--        </ul>-->
<!--      </div>-->
<!--      <div class="footer">-->
<!--        foother-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>
<script setup>

import {onMounted, ref} from "vue";
// 压缩文件
import CompressionFile from "@/assets/img/fileStyle/compression_file.png"
// 文件夹
import Dir from "@/assets/img/fileStyle/dir.png"
// 文件盘
import fileTray from "@/assets/img/fileStyle/file_tray.png"
// 音乐文件
import musicFile from "@/assets/img/fileStyle/music_file.png"
// 未知文件
import unknown from "@/assets/img/fileStyle/unknown_file.png"
import bg from "../../assets/img/home_bg.png"
import {findFileList} from "@/api/file.js";

let tableData =ref([

])

onMounted( async ()=>{
  if(tableData.value && tableData.value?.length){
    tableData.value.forEach((row) => {
      row['fileImage'] = Dir;
    })
  }
})
const getTable = async () => {
  const res = await findFileList();
  return res.data
}

</script>
<style scoped>
  .home-container{
    width: 100%;
    height: 100%;
    padding:15px;
  }


  .windows-container{
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    box-shadow: 0 0 0 10px #0a5bf8;
    border: 5px solid #74a0f4;
    outline: 5px solid #3477fa; /* 轮廓可以与边框颜色不同 */
    background-color: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    /* 第三层边框，使用轮廓 */
  }
  .windows-container .container{
    width: 100%;
    height: 100%;
    background-color: #8fa1c7;
    background-image: url("../../assets/bg.jpg");
  }
  .windows-container .footer{
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    height: 50px;
    width: 100%;
    position: absolute;
    bottom: 0;
  }
  .windows-container ul{
    display: flex;
    flex-wrap: wrap;
  }
  .windows-container li {
    height: 80px;
    width: 5%;
    font-size: 12px;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }
  .single-line {
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
  }
</style>
