<script setup lang="ts">
import { findLastIndex, groupBy, sortBy, uniqBy, uniqueId } from "lodash-es";

import ChevronLeft from "~/components/icons/ChevronLeft.vue";
import ChevronRight from "~/components/icons/ChevronRight.vue";
import Xmark from "~/components/icons/Xmark.vue";
import Input from "~/components/Input.vue";

const modelValue = defineModel<{ id?: number; date: string; time: string }[]>({
  required: true,
});

// Calendar data
const daysNames = [
  { short: "L", long: "Lundi" },
  { short: "M", long: "Mardi" },
  { short: "M", long: "Mercredi" },
  { short: "J", long: "Jeudi" },
  { short: "V", long: "Vendredi" },
  { short: "S", long: "Samedi" },
  { short: "D", long: "Dimanche" },
];
const monthsNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const today = new Date();
const selectedYear = ref(
  modelValue.value.length
    ? new Date(modelValue.value[0].date).getFullYear()
    : today.getFullYear(),
);
const selectedMonth = ref(
  modelValue.value.length
    ? new Date(modelValue.value[0].date).getMonth()
    : today.getMonth(),
);

// Months navigation
function goToPreviousMonth() {
  selectedYear.value =
    selectedMonth.value === 0 ? selectedYear.value - 1 : selectedYear.value;

  selectedMonth.value =
    selectedMonth.value === 0 ? 11 : selectedMonth.value - 1;
}

function goToNextMonth() {
  selectedYear.value =
    selectedMonth.value === 11 ? selectedYear.value + 1 : selectedYear.value;

  selectedMonth.value =
    selectedMonth.value === 11 ? 0 : selectedMonth.value + 1;
}

// Build calendar days
const daysCountInMonth = computed(() => {
  return 32 - new Date(selectedYear.value, selectedMonth.value, 32).getDate();
});

/**
 * First day of the week it the month.
 * 1 = monday
 * 7 = sunday
 */
const firstDayOfMonth = computed(() => {
  const d = new Date(selectedYear.value, selectedMonth.value).getDay();
  // getDays returns 0-6 (0=sunday), we replace 0 with 7 for sunday
  return d === 0 ? 7 : d;
});

const monthDays = computed(() => {
  const result = [];

  let date = 1;

  // Loop on 6 week per month to be safe
  for (let i = 0; i < 6; i++) {
    const week = [];

    // Loop on every day of the week
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayOfMonth.value - 1) {
        week.push(null);
      } else if (date > daysCountInMonth.value) {
        break;
      } else {
        week.push(date);
        date++;
      }
    }
    if (week.length) {
      result.push(week);
    }
  }

  return result;
});

// // Handle selected dates
const choicesWithId = ref(
  modelValue.value.map((choice) => ({
    id: choice.id,
    date: choice.date,
    time: choice.time,
    // local unique identifier to handle deletion
    localId: uniqueId(),
  })),
);

watch(
  choicesWithId,
  () => {
    modelValue.value = choicesWithId.value.map((c) => ({
      id: c.id,
      date: c.date,
      time: c.time,
    }));
  },
  {
    deep: true,
  },
);

const sortedChoices = computed(() => sortBy(choicesWithId.value, "date"));

function toggleSelectedDay(day: number) {
  const date = `${selectedYear.value.toString().padStart(4, "0")}-${(selectedMonth.value + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}-00:00`;
  const selectedDate = date.substring(0, 10);
  const selectedTime = date.substring(11);

  // Check if date is already selected
  const duplicate = choicesWithId.value.find((d) => {
    return d.date === selectedDate;
  });

  if (duplicate) {
    choicesWithId.value = choicesWithId.value.filter((d) => {
      return d.date !== selectedDate;
    });
  } else {
    choicesWithId.value.push({
      id: undefined,
      date: selectedDate,
      time: selectedTime,
      localId: uniqueId(),
    });
  }
}

// Check if a date is selected
function dateIsSelected(day: number) {
  return choicesWithId.value.some((d) => {
    return (
      d.date &&
      +d.date.slice(0, 4) === selectedYear.value &&
      +d.date.slice(5, 7) === selectedMonth.value + 1 &&
      +d.date.slice(8, 10) === day
    );
  });
}

// Check if date is in the past (allowing today, hence the +1)
function dateHasPassed(day: number) {
  const date = new Date(selectedYear.value, selectedMonth.value, day + 1);
  return date < today;
}

const timeInputRefs = ref<InstanceType<typeof Input>[]>([]);

// Add a time to an existing date (=== add new date)
async function addTime(d: string) {
  const date = new Date(d);

  choicesWithId.value.push({
    id: undefined,
    date: date.toISOString().substring(0, 10),
    time: "00:00",
    localId: uniqueId(),
  });

  const index = findLastIndex(sortedChoices.value, (c) => {
    return c.date === d;
  });

  await nextTick();

  const inputToFocus = sortBy(
    timeInputRefs.value,
    (inputRef) => inputRef.id,
  ).at(index);

  inputToFocus?.focus();
}

async function deleteTime(dateStr: string, choiceId: string) {
  // list only choices in date group
  const choicesInGroup = sortedChoices.value.filter((c) => c.date === dateStr);
  // find index of deleted time in date group
  const groupIndex = choicesInGroup.findIndex((c) => c.localId === choiceId);
  // remove time from choices
  choicesWithId.value = choicesWithId.value.filter(
    (c) => c.localId !== choiceId,
  );

  // wait for UI to update
  await nextTick();

  // list only inputs in date group
  const inputsInGroup = sortBy(
    timeInputRefs.value.filter((ref) => ref.id.includes(dateStr)),
    "id",
  );
  // focus previous time in the group or the first one
  inputsInGroup.at(Math.max(groupIndex - 1, 0))?.focus();
}

// Previous and next dates
const prevDatesCount = computed((): string => {
  if (choicesWithId.value.length) {
    const length = uniqBy(choicesWithId.value, "date").filter((c) => {
      if (c.date) {
        const dateMonth = new Date(c.date).getMonth();
        const dateYear = new Date(c.date).getFullYear();

        if (dateYear === selectedYear.value) {
          return dateMonth < selectedMonth.value;
        } else {
          return dateYear < selectedYear.value;
        }
      }
    }).length;

    if (length) {
      return `+${length}`;
    }
  }

  return "";
});

const nextDatesCount = computed((): string => {
  if (choicesWithId.value.length) {
    const length = uniqBy(choicesWithId.value, "date").filter((c) => {
      if (c.date) {
        const dateMonth = new Date(c.date).getMonth();
        const dateYear = new Date(c.date).getFullYear();

        if (dateYear === selectedYear.value) {
          return dateMonth > selectedMonth.value;
        } else {
          return dateYear > selectedYear.value;
        }
      }
    }).length;

    if (length) {
      return `+${length}`;
    }
  }

  return "";
});
</script>

<template>
  <div class="choices-wrapper">
    <div class="choices-dates">
      <!-- Calendar navigation -->
      <div class="header">
        <p class="header-current">
          {{ monthsNames[selectedMonth] }}
          {{ selectedYear }}
        </p>
        <div class="header-nav">
          <Button
            v-if="
              selectedMonth !== today.getMonth() ||
              selectedYear !== today.getFullYear()
            "
            variant="secondary"
            type="button"
            :badge="prevDatesCount"
            class="header-nav-button"
            @click="goToPreviousMonth"
          >
            <ChevronLeft />
            <span class="visually-hidden">
              {{ $t("pages.poll.new.choices.previous") }}
            </span>
          </Button>

          <Button
            variant="secondary"
            type="button"
            :badge="nextDatesCount"
            class="header-nav-button"
            @click="goToNextMonth"
          >
            <ChevronRight />
            <span class="visually-hidden">
              {{ $t("pages.poll.new.choices.next") }}
            </span>
          </Button>
        </div>
      </div>

      <!-- Calendar -->
      <table class="calendar">
        <caption class="visually-hidden" aria-live="polite">
          {{
            `${monthsNames[selectedMonth]} ${selectedYear}`
          }}
        </caption>
        <thead>
          <tr>
            <th v-for="(d, i) in daysNames" :key="i" scope="col">
              <span :aria-label="d.long">{{ d.short }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(days, i) in monthDays" :key="i">
            <td v-for="(d, j) in days" :key="j">
              <button
                v-if="d"
                :aria-pressed="dateIsSelected(d)"
                :disabled="dateHasPassed(d)"
                class="calendar-day-button"
                type="button"
                @click="toggleSelectedDay(d)"
              >
                <span class="visually-hidden">{{ daysNames[j].long }}</span>
                {{ d }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Times -->
    <ul class="choices-times">
      <li
        v-for="(dateChoices, date) in groupBy(sortedChoices, 'date')"
        :key="date"
        class="time-container"
      >
        <fieldset>
          <legend>{{ formatDate(date as string) }}</legend>
          <div
            v-for="(choice, j) in dateChoices"
            :key="choice.localId"
            class="time-input-wrapper"
          >
            <Input
              :id="`time-${date}-${j.toString().padStart(2, '0')}`"
              ref="timeInputRefs"
              v-model="choice.time"
              type="time"
              :label="
                $t('pages.poll.new.choices.choice.timeLabel', {
                  index: j + 1,
                })
              "
              :readonly="!!choice.id"
            />
            <Button
              v-if="dateChoices.length > 1"
              variant="secondary"
              class="time-delete-button"
              @click="deleteTime(date as string, choice.localId)"
            >
              <Xmark />
              <span class="visually-hidden">Supprimer</span>
            </Button>
          </div>
          <Button
            type="button"
            variant="tertiary"
            @click="addTime(date as string)"
          >
            {{ $t("pages.poll.new.choices.choice.addTime") }}
            <span class="visually-hidden">
              {{
                $t("pages.poll.new.choices.choice.forTheDate", {
                  date: formatDate(date as string),
                })
              }}
            </span>
          </Button>
        </fieldset>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.choices-wrapper {
  align-items: start;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1rem;
  position: relative;

  @media (width <= 37.5rem) {
    grid-template-columns: 1fr;
  }
}

.choices-dates {
  position: sticky;
  top: 1rem;

  @media (width <= 37.5rem) {
    position: initial;
  }

  .header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    margin-block-end: 1rem;

    .header-current {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-xl);
      margin: 0;
    }

    .header-nav {
      display: flex;
      gap: 1rem;

      .header-nav-button {
        --header-nav-button-size: 2.5rem;

        padding: 0.5rem;
        width: var(--header-nav-button-size);
        height: var(--header-nav-button-size);

        @media (width <= 22rem) {
          --header-nav-button-size: 2rem;
        }
      }
    }
  }

  .calendar {
    width: 100%;

    th {
      font-size: var(--font-size-lg);
      padding: 0.25rem;
    }

    td {
      text-align: center;
    }

    .calendar-day-button {
      --calendar-day-button-size: 3rem;

      background: none;
      color: var(--color-foreground);
      border: 1px solid transparent;
      border-radius: 0.25rem;
      width: var(--calendar-day-button-size);
      height: var(--calendar-day-button-size);
      position: relative;

      @media (width <= 50rem) {
        --calendar-day-button-size: 2rem;
      }

      @media (width <= 22rem) {
        --calendar-day-button-size: 1.5rem;

        font-size: var(--font-size-0);
      }

      &:hover:not([disabled]) {
        border-color: var(--color-grey-4);
        cursor: pointer;
      }

      &[aria-pressed="true"] {
        background-color: var(--color-primary);
        color: var(--color-background);

        &:hover {
          background-color: var(--color-primary-dark);
          border-color: var(--color-primary-dark);
        }
      }

      &[disabled] {
        color: var(--color-grey-3);

        &::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 2px;
          height: 2em;
          background: currentcolor;
        }
      }
    }
  }
}

.choices-times {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;

  .time-container {
    padding: 1rem;
    border: 1px solid var(--color-grey-3);
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;

    fieldset {
      border: none;
      display: flex;
      flex-direction: column;
      align-items: start;
      gap: 1rem;
    }

    legend {
      font-size: var(--font-size-2);
      font-weight: var(--font-weight-semibold);
    }

    .time-input-wrapper {
      display: flex;
      align-items: end;
      gap: 0.5rem;

      .time-delete-button {
        --delete-button-size: 2.5rem;

        padding: 0.5rem;
        width: var(--delete-button-size);
        height: var(--delete-button-size);
      }
    }
  }
}
</style>
