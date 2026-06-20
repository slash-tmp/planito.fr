<script setup lang="ts">
import CheckCircle from "./icons/CheckCircle.vue";
import Info from "./icons/Info.vue";
import Warning from "./icons/Warning.vue";
import Xmark from "./icons/Xmark.vue";

defineProps<{
  type: "success" | "info" | "error" | "warning";
  isClosable?: boolean;
}>();

defineEmits<{
  (e: "close"): void;
}>();

defineExpose({
  focus: focusAlert,
});

const alertRef = ref<HTMLDivElement>();
function focusAlert() {
  alertRef.value?.focus();
}

const iconComponent = {
  success: CheckCircle,
  info: Info,
  error: Warning,
  warning: Warning,
};
</script>

<template>
  <div
    ref="alertRef"
    :class="`alert alert-${type}`"
    tabindex="-1"
    aria-live="polite"
    role="alert"
  >
    <component :is="iconComponent[type]" class="icon" aria-hidden="true" />
    <div>
      <slot />
    </div>
    <button v-if="isClosable" class="close" @click="$emit('close')">
      <Xmark aria-hidden="true" />
      <span class="visually-hidden">Fermer</span>
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: grid;
  grid-template-columns: auto 1fr auto;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-base);
  padding: 1rem;
  gap: 1rem;

  @media (width < 50rem) {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  &.alert-success {
    --bg-color: var(--color-success-light);
    --border-color: var(--color-success);
  }

  &.alert-info {
    --bg-color: var(--color-info-light);
    --border-color: var(--color-info);
  }

  &.alert-error {
    --bg-color: var(--color-error-light);
    --border-color: var(--color-error);
  }

  &.alert-warning {
    --bg-color: var(--color-warning-light);
    --border-color: var(--color-warning);
  }

  .icon {
    height: 1.5rem;
    width: 1.5rem;
  }

  .close {
    appearance: none;
    border: none;
    background: none;
    color: var(--color-foreground);
    padding: 0;
    height: 1.5rem;
    width: 1.5rem;
  }
}
</style>
