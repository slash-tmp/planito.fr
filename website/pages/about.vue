<template>
  <PageMeta :title="$t('pages.about.meta.title')" />

  <h1>{{ $t("pages.about.title") }}</h1>

  <i18n-t tag="p" keypath="pages.about.intro.1">
    <template #doodleLike>
      <strong>
        {{ $t("pages.about.intro.doodleLike") }}
      </strong>
    </template>
  </i18n-t>

  <ol>
    <li>
      <i18n-t keypath="pages.about.intro.list.ethics.content">
        <template #title>
          <strong>{{ $t("pages.about.intro.list.ethics.title") }}</strong>
        </template>
      </i18n-t>
    </li>

    <li>
      <i18n-t keypath="pages.about.intro.list.easy.content">
        <template #title>
          <strong>{{ $t("pages.about.intro.list.easy.title") }}</strong>
        </template>
        <template #ia>
          <abbr :title="$t('pages.about.intro.list.easy.iaDef')">
            {{ $t("pages.about.intro.list.easy.ia") }}
          </abbr>
        </template>
      </i18n-t>
    </li>

    <li>
      <i18n-t keypath="pages.about.intro.list.accessible.content">
        <template #title>
          <strong>{{ $t("pages.about.intro.list.accessible.title") }}</strong>
        </template>
        <template #rgaa>
          <abbr :title="$t('pages.about.intro.list.accessible.rgaaDef')">
            {{ $t("pages.about.intro.list.accessible.rgaa") }}
          </abbr>
        </template>
      </i18n-t>
    </li>
  </ol>

  <i18n-t tag="p" keypath="pages.about.intro.2">
    <template #webProject>
      <strong>
        {{ $t("pages.about.intro.webProject") }}
      </strong>
    </template>
  </i18n-t>

  <i18n-t tag="p" keypath="pages.about.intro.3">
    <template #slashTmp>
      <a href="https://slash-tmp.dev" target="_blank">
        {{ $t("pages.about.intro.slashTmp") }}
      </a>
    </template>
  </i18n-t>

  <h2>{{ $t("pages.about.privacy.title") }}</h2>

  <i18n-t tag="p" keypath="pages.about.privacy.1">
    <template #o2switch>
      <strong>{{ $t("pages.about.privacy.o2switch") }}</strong>
    </template>
  </i18n-t>

  <i18n-t tag="p" keypath="pages.about.privacy.2">
    <template #contactEmail>
      <a :href="`mailto:${$t('email')}`">
        {{ $t("email") }}
      </a>
    </template>
  </i18n-t>

  <h2 id="contact">{{ $t("pages.about.contact.title") }}</h2>

  <i18n-t tag="p" keypath="pages.about.contact.1">
    <template #gitHub>
      <a href="https://github.com/slash-tmp/date-poll">
        {{ $t("pages.about.contact.gitHub") }}
      </a>
    </template>

    <template #contactEmail>
      <a :href="`mailto:${$t('email')}`">
        {{ $t("email") }}
      </a>
    </template>
  </i18n-t>

  <i18n-t tag="p" keypath="pages.about.contact.2">
    <template #changelog>
      <a href="https://github.com/slash-tmp/planito.fr/blob/main/CHANGELOG.md">
        {{ $t("pages.about.contact.changelog") }}
      </a>
    </template>
  </i18n-t>

  <p>{{ $t("pages.about.contact.3") }}</p>
</template>

<style scoped>
p:not(:last-child) {
  margin-block-end: 1rem;
}

ol li + li {
  margin-block-start: 1rem;
}
</style>
