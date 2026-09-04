<template>
  <div class="container">
    <h1>Import data from file</h1>
    <input type="file" name="file" @change="changeFile" />
    <p v-if="importedData">
      <textarea v-model="importedData" disabled></textarea>
      <button @click="importData()">Import!</button>
    </p>
    <p>
      <nuxt-link to="/">Return to app</nuxt-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, VueElement } from "vue";
import { usePeriodStore } from "~/stores/store";

const store = usePeriodStore();
const importedData = ref("");

const changeFile = (event: any) => {
  if (!event.target.files[0]) {
    return;
  }

  console.log("FILE", event, event.target.files[0]);

  const reader = new FileReader();
  reader.onload = (progressEvent: ProgressEvent<FileReader>) => {
    if (!progressEvent?.target?.result) {
      return;
    }

    console.log("result", progressEvent.target.result);
    importedData.value += progressEvent.target.result as string;
  };

  reader.onerror = (error) => console.log(error);
  reader.readAsText(event.target.files[0]);
};

const importData = () => {
  try {
    const data = JSON.parse(importedData.value);
    if (!data || !Array.isArray(data.periods)) {
      throw new Error("missing a `periods` array");
    }
    store.periods = data.periods;
  } catch (e) {
    alert("Could not import backup: " + (e as Error).message);
  }
};
</script>

<style lang="less"></style>
