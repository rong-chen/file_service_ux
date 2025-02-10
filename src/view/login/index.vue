<template>
  <div class="login-container">
    <div class="dowebok">
      <div class="form sign-in">
        <h2>欢迎回来</h2>
        <div class="input-container" style="margin-top: 56px">
          <input type="text" id="input" v-model="form.account" required="">
          <label for="input" class="label">用户名</label>
          <div class="underline"></div>
        </div>

        <div class="input-container">
          <input type="password"  id="input" required=""  v-model="form.password">
          <label for="input" class="label" >密码</label>
          <div class="underline"></div>
        </div>
        <button type="button" style="margin-top: 65px" @click="dbSaveClick" class="submit">登 录</button>
      </div>
      <div class="sub-cont">
        <div class="img">
          <div class="img__text m--up">
            <h2>还未注册？</h2>
            <p>立即注册，体验管理系统！</p>
          </div>
          <div class="img__text m--in">
            <h2>已有帐号？</h2>
            <p>有帐号就登录吧，好久不见了！</p>
          </div>
          <div class="img__btn">
          </div>
        </div>
        <div class="form sign-up">
          <h2>立即注册</h2>
          <div class="input-container">
            <input type="text" id="input" v-model="registerForm.account_name" required="">
            <label for="input" class="label">昵称</label>
            <div class="underline"></div>
          </div>
          <div class="input-container">
            <input type="text" id="input" v-model="registerForm.account" required="">
            <label for="input" class="label"   >帐号</label>
            <div class="underline"></div>
          </div>

          <div class="input-container">
            <input type="text" id="input" v-model="registerForm.password" required="">
            <label for="input" class="label">密码</label>
            <div class="underline"></div>
          </div>
          <button type="button" @click="register" class="submit">注 册</button>
          <!--          <button type="button" class="fb-btn">使用 <span>facebook</span> 帐号注册</button>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue"
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {useUserStore} from "@/store/user.js";
import {RegisterApi} from "@/api/user.js";
import {useRouterStore} from "@/store/router.js";

const routerStore =useRouterStore()
onMounted(() => {
  localStorage.removeItem("token")
  document.querySelector('.img__btn').addEventListener('click', function () {
    document.querySelector('.dowebok').classList.toggle('s--signup')
  })
  routerStore.clearRouter()
})
const userStore = useUserStore();

let form = ref({
  account: '',
  password: '',
})
const router = useRouter()
const dbSaveClick = async () => {
  if(form.value.account === "" && form.value.account === ""){
    ElMessage.error("请填写完整")
    return
  }
  let id = await userStore.LoginStore(form.value.account, form.value.password);
  if(id === 0){
    await userStore.GetUserInfo();
    await routerStore.loadRoutes()
    await router.push({
      name: "my_files"
    })
  }
}
let registerForm=ref({
  account_name:"",
  password:"",
  account:""
})
const register = async ()=>{
  const res = await RegisterApi(registerForm.value)
  if(res['code'] === 0){
    let code = await userStore.LoginStore(registerForm.value.account, registerForm.value.password);
    if(code ===0 ){
      await router.push({
        path: "/layout"
      })
    }
  }else{
    ElMessage.error(res['msg'])
  }
}
const initialization =()=>{
  registerForm.value = {}
}
</script>


<style scoped>

.login-container {
  background-image: url("@/assets/bg.jpg");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 100vh;
}


.tip {
  font-size: 20px;
  margin: 40px auto 50px;
  text-align: center;
}

.dowebok {
  overflow: hidden;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
  background: #fff;
  border-radius: 30px;
  height: 400px;
}

.form {
  position: relative;
  width: 640px;
  height: 100%;
  transition: -webkit-transform 0.6s ease-in-out;
  transition: transform 0.6s ease-in-out, -webkit-transform 0.6s ease-in-out;
  padding: 30px 0px;
}

.sub-cont {
  overflow: hidden;
  position: absolute;
  left: 640px;
  top: 0;
  width: 900px;
  height: 100%;
  padding-left: 260px;
  background: #fff;
  transition: -webkit-transform 0.6s ease-in-out;
  transition: transform 0.6s ease-in-out;
  transition: transform 0.6s ease-in-out, -webkit-transform 0.6s ease-in-out;
}

.dowebok.s--signup .sub-cont {
  -webkit-transform: translate3d(-640px, 0, 0);
  transform: translate3d(-640px, 0, 0);
}

button {
  display: block;
  margin: 0 auto;
  width: 260px;
  height: 36px;
  border-radius: 30px;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}

.img {
  overflow: hidden;
  z-index: 2;
  position: absolute;
  left: 0;
  top: 0;
  width: 260px;
  height: 100%;
  border-radius: 30px;
}

.img:before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 900px;
  height: 100%;
  background-image: url("@/assets/bg.jpg");
  background-size: cover;
  transition: -webkit-transform 0.6s ease-in-out;
  transition: transform 0.6s ease-in-out, -webkit-transform 0.6s ease-in-out;
}

.img:after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}

.dowebok.s--signup .img:before {
  -webkit-transform: translate3d(640px, 0, 0);
  transform: translate3d(640px, 0, 0);
}

.img__text {
  z-index: 2;
  position: absolute;
  left: 0;
  top: 50px;
  width: 100%;
  padding: 0 20px;
  text-align: center;
  color: #fff;
  transition: -webkit-transform 0.6s ease-in-out;
  transition: transform 0.6s ease-in-out;
  transition: transform 0.6s ease-in-out, -webkit-transform 0.6s ease-in-out;
}

.img__text h2 {
  margin-bottom: 10px;
  font-weight: normal;
}

.img__text p {
  font-size: 14px;
  line-height: 1.5;
}

.dowebok.s--signup .img__text.m--up {
  -webkit-transform: translateX(520px);
  transform: translateX(520px);
}

.img__text.m--in {
  -webkit-transform: translateX(-520px);
  transform: translateX(-520px);
}

.dowebok.s--signup .img__text.m--in {
  -webkit-transform: translateX(0);
  transform: translateX(0);
}

.img__btn {
  overflow: hidden;
  z-index: 2;
  margin: 0 auto;
  background: transparent;
  color: #fff;
  text-transform: uppercase;
  font-size: 15px;
  cursor: pointer;
}

.img__btn:after {
  content: '';
  z-index: 2;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

.img__btn span {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  transition: -webkit-transform 0.6s;
  transition: transform 0.6s, -webkit-transform 0.6s;
}

.img__btn span.m--in {
  -webkit-transform: translateY(-72px);
  transform: translateY(-72px);
}

.dowebok.s--signup .img__btn span.m--in {
  -webkit-transform: translateY(0);
  transform: translateY(0);
}

.dowebok.s--signup .img__btn span.m--up {
  -webkit-transform: translateY(72px);
  transform: translateY(72px);
}

h2 {
  width: 100%;
  font-size: 26px;
  text-align: center;
}


input {
  display: block;
  width: 100%;
  margin-top: 5px;
  padding-bottom: 5px;
  font-size: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.4);
  text-align: center;
}

.forgot-pass {
  text-align: center;
  font-size: 12px;
  color: #cfcfcf;
}

.forgot-pass a {
  color: #cfcfcf;
}

.submit {
  margin-top: 40px;
  margin-bottom: 20px;
  background: #d4af7a;
  text-transform: uppercase;
  width: 300px;
}

.fb-btn {
  border: 2px solid #d3dae9;
  color: #8fa1c7;
}

.fb-btn span {
  font-weight: bold;
  color: #455a81;
}

.sign-in {
  transition-timing-function: ease-out;
}

.dowebok.s--signup .sign-in {
  transition-timing-function: ease-in-out;
  transition-duration: 0.6s;
  -webkit-transform: translate3d(640px, 0, 0);
  transform: translate3d(640px, 0, 0);
}

.sign-up {
  -webkit-transform: translate3d(-900px, 0, 0);
  transform: translate3d(-900px, 0, 0);
}

.dowebok.s--signup .sign-up {
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

/* From Uiverse.io by Satwinder04 */
.input-container {
  position: relative;
  margin: 30px auto;
  width: 300px;
}

.input-container input[type="text"] {
  font-size: 20px;
  width: 100%;
  border: none;
  border-bottom: 2px solid #ccc;
  padding: 5px 0;
  background-color: transparent;
  outline: none;
}

.input-container input[type="password"] {
  font-size: 20px;
  width: 100%;
  border: none;
  border-bottom: 2px solid #ccc;
  padding: 5px 0;
  background-color: transparent;
  outline: none;
}
.input-container .label {
  position: absolute;
  top: 0;
  left: 0;
  color: #ccc;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-container input[type="text"]:focus ~ .label,
.input-container input[type="text"]:valid ~ .label ,
.input-container input[type="password"]:focus ~ .label,
.input-container input[type="password"]:valid ~ .label
{
  top: -20px;
  font-size: 16px;
  color: #333;
}

.input-container .underline {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background-color: #333;
  transform: scaleX(0);
  transition: all 0.3s ease;
}

.input-container input[type="text"]:focus ~ .underline,
.input-container input[type="text"]:valid ~ .underline {
  transform: scaleX(1);
}

</style>
