<script lang="ts" setup>
defineProps<{
  respondents: string[];
}>();
</script>

<template>
  <p v-if="respondents.length" class="never-available">
    {{ $t("pages.poll.admin.id.responses.neverAvailable", respondents.length) }}

    <template
      v-for="(part, index) in formatList(respondents, true)"
      :key="index"
    >
      <strong v-if="part.type === 'element'">
        {{ part.value }}
      </strong>
      <template v-else>
        {{ part.value }}
      </template> </template
    >.
  </p>
</template>

<style scoped>
.never-available {
  margin-block-start: 1rem;
}
</style>
