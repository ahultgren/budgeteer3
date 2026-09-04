<template>
  <div>
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
      <Undo />
    </NuxtLayout>
  </div>
</template>

<style>
html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

/* TODO Implement modular/scoped css */
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page {
  position: relative;
  background-color: #fff;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.page-enter-active {
  position: absolute;
  width: 100%;
  top: 0;
}

.slideInOut {
  position: relative;
}

.slideInOut-enter-active {
  transition: transform 0.4s cubic-bezier(0, 0, 0, 0.98);
}
.slideInOut-leave-active {
  transition: transform 0.3s cubic-bezier(0.35, 0.01, 0.43, 0.99);
}

.slideInOut-enter-from,
.slideInOut-leave-to {
  transform: translateX(100%);
}

.slideInOut-enter-active {
  position: absolute;
  width: 100%;
  top: 0;
}
</style>
