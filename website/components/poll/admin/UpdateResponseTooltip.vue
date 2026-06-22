<script setup lang="ts">
import { useId } from "vue";

import Check from "~/components/icons/Check.vue";
import Pen from "~/components/icons/Pen.vue";
import { Response } from "~/types/poll";

const props = defineProps<{
  currentValue?: string;
  name: string;
  date: string;
  time: string;
}>();

const emit = defineEmits<{
  (e: "submit", payload?: string): void;
}>();

const uniqueId = useId();

const options = [
  { value: Response.YES, key: "yes" },
  { value: Response.MAYBE, key: "maybe" },
  { value: Response.NO, key: "no" },
];

const showTooltip = ref(false);
function toggleTooltip() {
  showTooltip.value = !showTooltip.value;
}

const toggleButtonRef = useTemplateRef("toggleButtonRef");

function handleOnEscape() {
  showTooltip.value = false;
  toggleButtonRef.value?.focus();
}

const vote = ref(props.currentValue);

function editVote() {
  emit("submit", vote.value);
  showTooltip.value = false;
}

// Handle click outside of the tooltip to close it
const wrapperRef = useTemplateRef("wrapperRef");

function handleClickOutside(e: PointerEvent) {
  if (showTooltip.value) {
    const target = e.target as Node;

    if (!wrapperRef.value?.contains(target)) {
      showTooltip.value = false;
    }
  }
}
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div ref="wrapperRef" class="wrapper" @keydown.esc="handleOnEscape">
    <button ref="toggleButtonRef" class="toggle-button" @click="toggleTooltip">
      <Pen class="toggle-icon" />
      <span class="visually-hidden">
        {{
          $t("pages.poll.admin.id.responses.updateResponse.button", {
            name,
            date,
            time,
          })
        }}
      </span>
    </button>

    <form v-if="showTooltip" class="tooltip" @submit.prevent="editVote">
      <label :for="`edit-vote-${uniqueId}`" class="visually-hidden">
        {{
          $t("pages.poll.admin.id.responses.updateResponse.label", {
            name,
            date,
            time,
          })
        }}
      </label>
      <select
        :id="`edit-vote-${uniqueId}`"
        v-model="vote"
        required
        class="vote-select"
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="currentValue === option.value"
        >
          {{
            $t(
              `pages.poll.admin.id.responses.updateResponse.choices.${option.key}`,
            )
          }}
        </option>
      </select>
      <button type="submit" class="submit-button">
        <Check />
        <span class="visually-hidden">
          {{ $t("pages.poll.admin.id.responses.updateResponse.submit") }}
        </span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.wrapper {
  display: inline-block;
  position: relative;
}

.toggle-button {
  background: none;
  border: none;
  border-radius: var(--border-radius-base);
  color: var(--color-foreground);
  padding: 0;
  width: 1rem;
  display: flex;
}

.tooltip {
  position: absolute;
  inset-block-start: calc(100% + 0.5rem);
  inset-inline-start: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-grey-3);
  border-radius: var(--border-radius-base);
  z-index: 1;

  &::after {
    --arrow-size: 0.5rem;

    content: "";
    width: var(--arrow-size);
    height: var(--arrow-size);
    border-block-start: 1px solid var(--color-grey-3);
    border-inline-start: 1px solid var(--color-grey-3);
    background: var(--color-background);
    position: absolute;
    transform: rotate(45deg);
    inset-block-start: calc((var(--arrow-size) / 2) * -1);
    inset-inline-start: calc(50% - (var(--arrow-size) / 2));
  }
}

.vote-select {
  background-color: var(--color-background);
  color: var(--color-foreground);
  box-shadow: var(--shadow-small);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--color-grey-3);
}

.submit-button {
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-small);
  background-color: var(--color-primary);
  color: var(--color-background);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: var(--color-primary-darker);
    border-color: var(--color-primary-darker);
  }

  svg {
    width: 1rem;
  }
}
</style>
