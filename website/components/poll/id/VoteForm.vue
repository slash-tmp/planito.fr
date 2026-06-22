<script setup lang="ts">
import Button from "~/components/Button.vue";
import Check from "~/components/icons/Check.vue";
import QuestionMark from "~/components/icons/QuestionMark.vue";
import Xmark from "~/components/icons/Xmark.vue";
import Input from "~/components/Input.vue";
import Radio from "~/components/Radio.vue";
import type { Respondent, VotePollFormData } from "~/types/poll";
import { Response } from "~/types/poll";

import NeverAvailableRespondents from "../NeverAvailableRespondents.vue";

const responseIcon = {
  [Response.YES]: Check,
  [Response.MAYBE]: QuestionMark,
  [Response.NO]: Xmark,
};

const props = defineProps<{
  choices: { id: number; date: string }[];
  respondents?: Respondent[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", payload: VotePollFormData): void;
}>();

const name = ref("");
const attendances = ref(
  props.choices.map((c) => {
    return {
      id: c.id,
      attendance: undefined,
    };
  }),
);

const choicesWithRespondents = computed(() =>
  getPublicChoicesWithRespondents(props.choices, props.respondents),
);

const neverAvailableRespondents = computed(() => {
  return props.respondents
    ?.filter((r) => {
      return r.responses.every((re) => {
        return re.value === Response.NO;
      });
    })
    .map((r) => r.name);
});

function getAttendanceForDate(id: number) {
  return attendances.value.find((a) => a.id === id)!.attendance;
}

function submitVote() {
  emit("submit", {
    respondentName: name.value,
    responses: attendances.value.map((a) => ({
      choiceId: a.id,
      value: a.attendance ?? Response.NO,
    })),
  });
}
</script>

<template>
  <form @submit.prevent="submitVote">
    <Input
      id="name"
      v-model="name"
      :label="$t('pages.poll.id.form.name')"
      type="text"
      required
      class="name-input"
    />

    <ul class="dates">
      <li
        v-for="(choice, i) in choicesWithRespondents"
        :key="choice.date"
        class="date"
      >
        <time class="date-title">{{ choice.date }}</time>
        <ul class="times">
          <li v-for="(time, j) in choice.times" :key="j" class="time">
            <fieldset>
              <legend class="time-header">
                <time>
                  <span class="visually-hidden">{{ choice.date }}</span>
                  {{ time.time }}
                </time>
              </legend>
              <div class="radios">
                <Radio
                  v-for="option in [Response.YES, Response.MAYBE, Response.NO]"
                  :id="`choice-${i}-${j}-${option}`"
                  :key="`${option}-${time.time}`"
                  v-model="
                    attendances.find((a) => a.id === time.id)!.attendance
                  "
                  :value="option"
                  type="radio"
                  :name="`choice-${i}-${j}`"
                  required
                  :label="
                    $t(`pages.poll.id.form.choices.${option.toLowerCase()}`)
                  "
                >
                  <template #icon>
                    <component :is="responseIcon[option]" class="radio-icon" />
                  </template>
                </Radio>
              </div>
            </fieldset>
            <ul v-if="time.respondents" class="respondents">
              <li
                v-for="(respondent, k) in time.respondents"
                :key="k"
                class="respondent"
                :class="{
                  maybe: respondent.value === Response.MAYBE,
                }"
              >
                {{ respondent.name }}
                <span v-if="respondent.value === Response.MAYBE">
                  {{ $t("pages.poll.id.form.maybe") }}
                </span>
              </li>

              <li
                v-if="
                  getAttendanceForDate(time.id) &&
                  getAttendanceForDate(time.id) !== Response.NO
                "
                class="respondent"
                :class="{
                  maybe: getAttendanceForDate(time.id) === Response.MAYBE,
                }"
              >
                <template v-if="name">
                  <template
                    v-if="getAttendanceForDate(time.id) === Response.MAYBE"
                  >
                    {{ $t("pages.poll.id.form.withName.maybe", { name }) }}
                  </template>
                  <template v-else>
                    {{ $t("pages.poll.id.form.withName.yes", { name }) }}
                  </template>
                </template>
                <template v-else>
                  <template
                    v-if="getAttendanceForDate(time.id) === Response.MAYBE"
                  >
                    {{ $t("pages.poll.id.form.withoutName.maybe") }}
                  </template>
                  <template v-else>
                    {{ $t("pages.poll.id.form.withoutName.yes") }}
                  </template>
                </template>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>

    <NeverAvailableRespondents
      v-if="neverAvailableRespondents?.length"
      :respondents="neverAvailableRespondents"
    />

    <Button type="submit" class="submit-button" :is-loading="isLoading">
      {{ $t("pages.poll.id.form.submit") }}
    </Button>
  </form>
</template>

<style scoped>
.name-input {
  max-width: 22rem;
  margin-block-end: 2rem;
}

.dates {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-block-end: 1rem;

  @media (width < 30rem) {
    gap: 1rem;
    margin-block-end: 1rem;
  }
}

.date {
  border-radius: var(--border-radius-base);
  border: 1px solid var(--color-grey-3);
  background-color: var(--color-primary-lighter);
  padding: 1rem;

  @media (width < 30rem) {
    padding: 0.5rem;
  }
}

.date-title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-2);
  display: block;
  margin-block-end: 1rem;
}

.times {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

fieldset {
  border: none;
  padding: 0;
}

.time {
  border-radius: var(--border-radius-base);
  border: 1px solid var(--color-grey-3);
  background-color: var(--color-background);
  padding: 1rem;
  position: relative;

  @media (width < 30rem) {
    padding: 0.5rem;
  }
}

.radios {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.radio-icon {
  width: 1.5rem;
}

.time-header {
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-block-end: 0.5rem;
}

.respondents {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block-start: 0.5rem;
}

.respondent {
  border-radius: var(--border-radius-base);
  border: 1px solid var(--color-success);
  background-color: var(--color-success-light);
  padding: 0.25rem 0.5rem;

  &.maybe {
    border-style: dashed;
    background-color: var(--color-background);
  }
}

.submit-button {
  display: flex;
  margin-inline-start: auto;
  margin-block-start: 1rem;
}
</style>
