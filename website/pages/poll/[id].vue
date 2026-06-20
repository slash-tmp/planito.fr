<script setup lang="ts">
import Alert from "~/components/Alert.vue";
import PageMeta from "~/components/PageMeta.vue";
import Responses from "~/components/poll/admin/Responses.vue";
import VoteForm from "~/components/poll/id/VoteForm.vue";
import { type PollApiResponse, type VotePollFormData } from "~/types/poll";

const { t } = useI18n();

const route = useRoute();
const id = route.params.id;

// Fetch poll
const { data: poll, refresh: refreshVotes } = await useFetch<PollApiResponse>(
  `/api/polls/${id}`,
);

if (!poll.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t("pages.poll.id.error.404.title"),
    message: t("pages.poll.id.error.404.description"),
  });
}

// Handle expired poll
const isExpired = computed(() => {
  if (!poll.value?.endDate) {
    return false;
  }

  return new Date(poll.value.endDate) < new Date();
});

// Vote submission
const showConfirmation = ref(false);
const confirmationRef = ref<HTMLParagraphElement>();

const { setToast } = useToast();

const isLoading = ref(false);
async function submitVote(payload: VotePollFormData) {
  isLoading.value = true;

  try {
    if (poll.value) {
      await votePoll(poll.value.publicUid, payload);
      await refreshVotes();
      showConfirmation.value = true;
      await nextTick();
      confirmationRef.value?.focus();

      saveVoteToLocalStorage();
    }
  } catch (e) {
    setToast({
      title: t("pages.poll.id.errorAlert"),
      type: "error",
      isClosable: true,
    });
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

// Load and save votes to localStorage
const LOCAL_STORAGE_KEY = "planito:votes";

function loadLocalStorageVotes(): string[] {
  if (import.meta.server) {
    return [];
  }

  const rawVotes = localStorage.getItem(LOCAL_STORAGE_KEY);
  return rawVotes ? JSON.parse(rawVotes) : [];
}

const hasAlreadyVoted = computed(() => {
  const currentVotes = loadLocalStorageVotes();
  return poll.value?.publicUid && currentVotes.includes(poll.value?.publicUid);
});

function saveVoteToLocalStorage() {
  const currentVotes = loadLocalStorageVotes();

  if (!hasAlreadyVoted.value) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...currentVotes, poll.value?.publicUid]),
    );
  }
}
</script>

<template>
  <template v-if="poll">
    <PageMeta
      :title="
        $t('pages.poll.id.meta.title', {
          pollName: poll.title,
        })
      "
      :description="poll.description ?? undefined"
    />

    <h1>{{ poll.title }}</h1>

    <p
      v-if="poll.description"
      class="description"
      v-html="$sanitizeHtml(replaceUrlToHtmlAnchor(poll.description))"
    />

    <Alert v-if="isExpired" type="error">
      <p>
        {{ $t("pages.poll.id.isExpired") }}
      </p>
    </Alert>

    <template v-if="!isExpired && !showConfirmation">
      <Alert type="info" class="invitation-alert">
        <p>
          <template v-if="poll.adminName">
            {{ $t("pages.poll.id.invitedBy", { adminName: poll.adminName }) }}
          </template>
          <template v-else>{{ $t("pages.poll.id.invited") }}</template>
          <i18n-t v-if="poll.endDate" keypath="pages.poll.id.expireOn">
            <template #endDate>
              <time :datetime="poll.endDate">
                <strong>
                  {{ formatDate(poll.endDate) }}
                </strong>
              </time>
            </template>
          </i18n-t>
        </p>
      </Alert>

      <ClientOnly>
        <Alert
          v-if="hasAlreadyVoted"
          type="warning"
          class="already-voted-alert"
        >
          <p>
            {{ $t("pages.poll.id.alreadyVotedAlert.intro") }}
            <template v-if="poll.hideVotes">
              {{
                $t("pages.poll.id.alreadyVotedAlert.contactAdmin", {
                  admin: poll.adminName || "l’administrateur du sondage",
                })
              }}
            </template>
            <template v-else>
              {{
                $t(
                  "pages.poll.id.alreadyVotedAlert.checkVotesAndContactAdmin",
                  {
                    admin: poll.adminName || "l’administrateur du sondage",
                  },
                )
              }}
            </template>
          </p>
        </Alert>
      </ClientOnly>

      <VoteForm
        v-if="!showConfirmation"
        :choices="poll.choices"
        :respondents="poll.respondents"
        :is-loading="isLoading"
        @submit="submitVote"
      />
    </template>

    <Alert
      v-if="showConfirmation"
      ref="confirmationRef"
      tabindex="-1"
      type="success"
      :class="{ 'confirmation-alert': poll.respondents }"
    >
      {{ $t("pages.poll.id.confirmation") }}
    </Alert>

    <Responses
      v-if="showConfirmation && poll.respondents"
      :choices="poll.choices"
      :respondents="poll.respondents"
    />
  </template>
</template>

<style scoped>
.description {
  margin-block-end: 1rem;
  white-space: pre-wrap;
}

.invitation-alert,
.already-voted-alert,
.confirmation-alert {
  margin-block-end: 2rem;
}
</style>
