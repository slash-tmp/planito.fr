<script setup lang="ts">
import { sortBy } from "lodash-es";
import { computed } from "vue";

import Star from "~/components/icons/Star.vue";
import {
  type Respondent,
  Response,
  type UpdatePollResponseFormData,
} from "~/types/poll";

import NeverAvailableRespondents from "../NeverAvailableRespondents.vue";
import UpdateResponseTooltip from "./UpdateResponseTooltip.vue";

const props = defineProps<{
  choices: { id: number; date: string }[];
  respondents: Respondent[];
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (e: "updateResponse", payload: UpdatePollResponseFormData): void;
}>();

const choicesWithRespondents = computed(() =>
  getAdminChoicesWithRespondents(props.choices, props.respondents),
);

// Return ids of responses with the most votes
const maxVotesResponseIds = computed((): number[] => {
  if (props.respondents.length === 0) {
    return [];
  }
  const responses = choicesWithRespondents.value
    .flatMap(({ times }) => times)
    .map((c) => {
      return {
        id: c.id,
        values: c.respondents.map((r) => r.value),
        YES: c.respondents.filter((r) => r.value === Response.YES).length,
        MAYBE: c.respondents.filter((r) => r.value === Response.MAYBE).length,
      };
    });
  const sortedResponses = sortBy(responses, [Response.YES, Response.MAYBE]);
  const firstBestResponse = sortedResponses.at(-1)!;
  const bestResponses = sortedResponses.filter((r) =>
    firstBestResponse["YES"] !== 0
      ? r["YES"] === firstBestResponse["YES"] &&
        r["MAYBE"] === firstBestResponse["MAYBE"]
      : r["MAYBE"] === firstBestResponse["MAYBE"],
  );
  return bestResponses.map((r) => r.id);
});

const neverAvailableRespondents = computed(() => {
  return props.respondents
    .filter((r) => {
      return r.responses.every((re) => {
        return re.value === Response.NO;
      });
    })
    .map((r) => r.name);
});

/**
 * TODO:
 * - plug api (if same value => do nothing, info toast?)
 * - live refresh data after api call (recompute best choice)
 * - success or error toast (+ locale strings)
 * - reposition focus if new value is "no" (element does not exist anymore)
 */
async function updateResponse(
  choiceId: number,
  respondentId: number,
  value?: string,
) {
  emit("updateResponse", { choiceId, respondentId, value });
}
</script>

<template>
  <h2>{{ $t("pages.poll.admin.id.responses.title") }}</h2>

  <ul class="dates">
    <li
      v-for="choice in choicesWithRespondents"
      :key="choice.date"
      class="date"
    >
      <time class="date-title">{{ choice.date }}</time>
      <ul class="times">
        <li v-for="time in choice.times" :key="time.id" class="time">
          <mark
            v-if="maxVotesResponseIds.includes(time.id)"
            class="best-choice"
          >
            <Star />
            {{ $t("pages.poll.admin.id.responses.bestChoice") }}
          </mark>
          <div class="time-header">
            <time>{{ time.time }}</time>
            <p v-if="time.respondents">
              {{ time.respondents.length }}
              {{
                $t(
                  "pages.poll.admin.id.responses.vote",
                  time.respondents.length,
                )
              }}
            </p>
          </div>
          <ul v-if="time.respondents?.length" class="respondents">
            <li
              v-for="(respondent, i) in time.respondents"
              :key="i"
              class="respondent"
              :class="{ maybe: respondent.value === Response.MAYBE }"
              :data-cy="
                respondent.value === Response.MAYBE
                  ? 'respondent-maybe'
                  : 'respondent-yes'
              "
            >
              {{ respondent.name }}
              <template v-if="respondent.value === Response.MAYBE">
                {{ $t("pages.poll.admin.id.responses.maybe") }}
              </template>

              <UpdateResponseTooltip
                v-if="isAdmin"
                :current-value="respondent.value"
                :name="respondent.name"
                :date="choice.date"
                :time="time.time"
                @submit="updateResponse(time.id, respondent.id, $event)"
              />
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>

  <NeverAvailableRespondents
    v-if="neverAvailableRespondents.length"
    :respondents="neverAvailableRespondents"
  />
</template>

<style scoped>
.dates {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (width < 30rem) {
    gap: 1rem;
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

.best-choice {
  align-items: center;
  background-color: var(--color-primary);
  color: var(--color-background);
  display: flex;
  gap: 0.25rem;
  font-size: var(--font-size-0);
  border-radius: var(--border-radius-base);
  padding: 0.125rem 0.5rem;
  position: absolute;
  inset-block-end: 100%;
  inset-inline-start: 1rem;
  transform: translateY(50%);

  @media (width < 30rem) {
    transform: translateY(40%);
  }

  svg {
    width: 1rem;
  }
}

.time-header {
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
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
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &.maybe {
    border-style: dashed;
    background-color: var(--color-background);
  }
}
</style>
