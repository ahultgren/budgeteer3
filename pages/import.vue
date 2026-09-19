<template>
  <div class="container gap-4 p-4">
    <h1 class="text-3xl font-bold">Import data from file</h1>
    <input
      type="file"
      name="file"
      @change="changeFile"
      class="text-muted file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:font-semibold file:text-accent"
    />
    <p v-if="importedData" class="flex flex-col gap-3">
      <textarea
        v-model="importedData"
        disabled
        class="h-48 w-full resize-none rounded-2xl bg-card p-3 text-sm text-muted outline-none"
      ></textarea>
      <button
        @click="importData()"
        class="self-start rounded-full bg-accent px-5 py-2 font-semibold text-white active:brightness-90"
      >
        Import!
      </button>
    </p>
    <p>
      <router-link to="/" class="font-semibold text-accent">Return to app</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePeriodStore } from "~/stores/store";

const store = usePeriodStore();
const importedData = ref("");

const changeFile = (event: any) => {
  if (!event.target.files[0]) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (progressEvent: ProgressEvent<FileReader>) => {
    if (!progressEvent?.target?.result) {
      return;
    }
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
