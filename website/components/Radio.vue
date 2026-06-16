<script setup lang="ts">
defineProps<{
  id: string;
  name: string;
  label: string;
  value?: string;
  required?: boolean;
}>();

const model = defineModel<string>();
</script>

<template>
  <label :for="id" class="wrapper">
    <input
      :id="id"
      v-model="model"
      :value="value"
      class="input"
      type="radio"
      :name="name"
      :required="required"
    />
    <span class="label">{{ label }}</span>
    <span class="icon">
      <span class="visually-hidden">{{ label }}</span>
      <slot name="icon" />
    </span>
  </label>
</template>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: 1rem auto;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--color-grey-3);
  border-radius: var(--border-radius-base);
  cursor: pointer;
  box-shadow: var(--shadow-small);
  font-weight: var(--font-weight-semibold);
  transition: background-color 0.2s ease;

  @media (width < 30rem) {
    padding: 0.25rem 0.5rem;
  }

  &:hover {
    background-color: var(--color-primary-lighter);
  }

  &:focus-within {
    outline: 2px solid var(--color-outline);
    outline-offset: 2px;
  }

  &:has([type="radio"]:checked) {
    background-color: var(--color-primary-lighter);
  }

  .input {
    accent-color: var(--color-primary);
    border: 1px solid var(--color-grey-3);
    box-shadow: var(--shadow-small);
    border-radius: var(--border-radius-base);
    margin: 0;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;

    &:focus-visible {
      outline: none;
    }

    &:checked {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  .label {
    @media (width < 30rem) {
      display: none;
    }
  }

  .icon {
    display: none;

    @media (width < 30rem) {
      display: flex;
    }
  }
}
</style>
