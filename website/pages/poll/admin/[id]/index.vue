<script setup lang="ts">
import Alert from "~/components/Alert.vue";
import PageMeta from "~/components/PageMeta.vue";
import Actions from "~/components/poll/admin/Actions.vue";
import Intro from "~/components/poll/admin/Intro.vue";
import Responses from "~/components/poll/admin/Responses.vue";
import Share from "~/components/poll/admin/Share.vue";
import useToast from "~/composables/useToast";
import type {
  AdminPollApiResponse,
  UpdatePollResponseFormData,
} from "~/types/poll";

const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const id = route.params.id;

// Display poll update confirmation alert
const updatedPollAlertRef = ref<InstanceType<typeof Alert>>();
const updatedPoll = ref(false);

onMounted(async () => {
  if (history.state.updatedPoll) {
    updatedPoll.value = history.state.updatedPoll;
    await nextTick();
    updatedPollAlertRef.value?.focus();

    // update "poll" value
    refresh();
  }
});

const headingRef = ref<HTMLHeadingElement>();
async function hideUpdatedPollAlert() {
  updatedPoll.value = false;
  await nextTick();
  headingRef.value?.focus();
}

// Fetch poll
const { data: poll, refresh } = await useFetch<AdminPollApiResponse>(
  `/api/polls/admin/${id}`,
);

if (!poll.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t("pages.poll.admin.id.error.404.title"),
    message: t("pages.poll.admin.id.error.404.description"),
  });
}

// Delete poll
const { setToast } = useToast();

async function confirmDelete() {
  try {
    if (poll.value) {
      await deletePoll(poll.value.adminUid);
      await router.push({
        name: "index",
        state: { deletedPoll: poll.value.title },
      });
    }
  } catch (e) {
    setToast({
      title: t("pages.poll.admin.id.actions.deleteModal.errorAlert"),
      type: "error",
      isClosable: true,
    });
    console.error(e);
  }
}

/**
 * TODO:
 * - live refresh data after api call (use useFetch 'refresh'?)
 * - reposition focus:
 *  - more precise: on `.respondent` item at correct id (and previous if doesnt exist anymore and `.time` if none)
 *  - easier: on `.time` (always here)
 */
async function updateResponse(formData: UpdatePollResponseFormData) {
  console.log(
    `update vote of respondent ${formData.respondentId} to ${formData.value} for choice ${formData.choiceId}`,
  );
  try {
    if (poll.value) {
      await updatePollResponse(poll.value.adminUid, formData);
      setToast({
        title: t("pages.poll.admin.id.responses.updateResponse.successAlert"),
        type: "success",
        isClosable: true,
      });
    }
  } catch (e) {
    setToast({
      title: t("pages.poll.admin.id.responses.updateResponse.errorAlert"),
      type: "error",
      isClosable: true,
    });
    console.error(e);
  }
}
</script>

<template>
  <template v-if="poll">
    <PageMeta
      :title="
        $t('pages.poll.admin.id.meta.title', {
          pollName: poll.title,
        })
      "
    />

    <h1 ref="headingRef" tabindex="-1">{{ poll.title }}</h1>

    <Alert
      v-if="updatedPoll"
      ref="updatedPollAlertRef"
      type="success"
      is-closable
      @close="hideUpdatedPollAlert"
    >
      {{
        $t("pages.poll.admin.edit.updatedPollAlert.description", {
          title: poll.title,
        })
      }}
    </Alert>

    <Actions :title="poll.title" @delete="confirmDelete" />

    <div class="grid">
      <Intro
        :admin-name="poll.adminName"
        :description="poll.description"
        :created-at="poll.createdAt"
      />

      <Share :public-uid="poll.publicUid" />
    </div>

    <Responses
      is-admin
      :choices="poll.choices"
      :respondents="poll.respondents"
      @update-response="updateResponse"
    />
  </template>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-block-end: 4rem;
  align-items: start;

  @media (width < 50rem) {
    grid-template-columns: 1fr;
    margin-block-end: 2rem;
  }
}
</style>
