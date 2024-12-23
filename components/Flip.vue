<template>
  <Transition name="flip" mode="out-in">
    <slot name="front"></slot>
  </Transition>
  <Transition name="flip" mode="out-in">
    <slot name="back"></slot>
  </Transition>
</template>

<script setup></script>

<style lang="less" scoped>
.flip-enter-active,
.flip-leave-active {
  transition: transform 0.4s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.flip-enter-to,
.flip-leave-from {
  transform: rotateY(0deg);
}
.flip-enter-from,
.flip-leave-to {
  transform: rotateY(180deg);
}
</style>
