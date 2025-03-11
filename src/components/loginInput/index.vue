<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  'modelValue': String,
})
defineEmits(['update:modelValue']);
</script>
<script>
export default {
  name: "LoginInput",
}
</script>
<template>
  <div class="loginInput">
    <div class="border">
      <input type="text" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" placeholder=""/>
      <div class="placeholder" >{{ props.title }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@property --anim {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

.loginInput {
  border-radius: 5px;
  width: auto;


  .border {
    padding: 3px;
    border-radius: 6px;
    min-height: 40px;
    min-width: 300px;
    height: 100%;
    position: relative;
    --anim: 0;
    transition: --anim 500ms ease;
    background: linear-gradient(to right,
        #475189 calc(clamp(0, (var(--anim) - 0.75) / 0.25, 1) * 33%),
        transparent calc(clamp(0, (var(--anim) - 0.75) / 0.25, 1) * 33%),
        transparent calc(100% - clamp(0, (var(--anim) - 0.75) / 0.25, 1) * 33%),
        #475189 calc(100% - clamp(0, (var(--anim) - 0.75) / 0.25, 1) * 33%)),
    linear-gradient(to top,
            transparent calc(15% + clamp(0, (var(--anim) - 0.65) / 0.1, 1) * 70%),
            #f2f4ff calc(15% + clamp(0, (var(--anim) - 0.65) / 0.1, 1) * 70%)),
    linear-gradient(to right,
            transparent calc(50% - clamp(0, var(--anim) / 0.65, 1) * 50%),
            #475189 calc(50% - clamp(0, var(--anim) / 0.65, 1) * 50%),
            #475189 calc(50% + clamp(0, var(--anim) / 0.65, 1) * 50%),
            transparent calc(50% + clamp(0, var(--anim) / 0.65, 1) * 50%)),
    linear-gradient(#f2f4ff, #f2f4ff);

    input {
      height: 40px;
      width: 100%;
      padding: 0 5px;
      background: #fff;
      cursor: pointer;
    }

    &:has(input:not(:placeholder-shown)) > .placeholder {
      top: 0;
      --anim: 1;
    }

    &:has(input:not(:placeholder-shown)) {
      --anim: 1;

    }

    &:has(input:focus) .placeholder {
      top: 0;
    }

    &:has(input:focus) {
      --anim: 1;
    }

    .placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: .1s;
      color: #4a4a4a;
      font-weight: bold;
      font-size: 20px;
      pointer-events: none;
    }
  }
}
</style>
