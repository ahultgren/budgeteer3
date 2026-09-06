<template>
  <div>
    <Toast position="bottom-left" group="undo" class="toast">
      <template #message="{ message }">
        <div class="p-toast-message-text">
          <span class="p-toast-summary">
            {{ message.summary }}
          </span>
        </div>
        <Button
          class="toast-button"
          label="Undo"
          severity="primary"
          size="small"
          @click="store.undo() || toast.removeGroup('undo')"
        ></Button>
        <div class="progressbar">
          <Transition name="progress" appear>
            <div class="progress"></div>
          </Transition>
        </div>
      </template>
    </Toast>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { usePeriodStore } from "~/stores/store";

const store = usePeriodStore();
const toast = useToast();
const ttl = 5000;

store.$onAction(({ name, after }) => {
  if (name !== "deleteLedger") {
    return;
  }

  // Disallow more than one message at a time
  toast.removeGroup("undo");

  after(() => {
    toast.add({
      summary: "Budget deleted.",
      life: ttl,
      severity: "info",
      group: "undo",
    });
  });
});
</script>

<style>
.toast {
  --p-toast-width: auto;
  right: 20px;
}
.toast-button {
  margin-top: -5px;
}
.progressbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 5px;
}
.progress {
  background-color: var(--p-primary-500);
  width: 100%;
  height: 5px;
  transform: scaleX(0);
}
.progress-enter-active {
  transition: transform 5s linear;
}
.progress-enter-from {
  transform: scaleX(1);
}
</style>
