<script setup lang="ts">
const fontSizes = [
  "--font-size-0",
  "--font-size-1",
  "--font-size-2",
  "--font-size-3",
  "--font-size-4",
  "--font-size-5",
  "--font-size-6",
];

const fontWeights = [
  { name: "--font-weight-normal", value: 400 },
  { name: "--font-weight-semibold", value: 600 },
  { name: "--font-weight-bold", value: 700 },
];

const lineHeights = [
  { title: "Heading", name: "--line-height-heading", value: 1.2 },
  { title: "Body", name: "--line-height-body", value: 1.5 },
];

const greyScaleSwatch = [
  "--color-background",
  "--color-grey-1",
  "--color-grey-2",
  "--color-grey-3",
  "--color-foreground",
];

const brandSwatch = [
  {
    name: "Primary",
    colors: [
      "--color-primary-lighter",
      "--color-primary-light",
      "--color-primary",
      "--color-primary-dark",
      "--color-primary-darker",
    ],
  },
];

const stateSwatch = [
  {
    name: "Info",
    colors: ["--color-info", "--color-info-light"],
  },
  {
    name: "Success",
    colors: ["--color-success", "--color-success-light"],
  },
  {
    name: "Error",
    colors: ["--color-error", "--color-error-light"],
  },
  {
    name: "Warning",
    colors: ["--color-warning", "--color-warning-light"],
  },
];

const utilitySwatch = ["--color-outline"];

const borderRadiuses = [
  { name: "--border-radius-base", value: "0.25rem" },
  { name: "--border-radius-round", value: "50%" },
];

const boxShadows = ["--shadow-small"];

const breakpoints = [{ name: "--breakpoint-medium", value: "50 rem / 800px" }];
</script>

<template>
  <NuxtLink :to="{ name: 'design' }">Retour</NuxtLink>

  <h1>Tokens</h1>

  <ul>
    <li><a href="#fs">Font sizes</a></li>
    <li><a href="#fw">Font weights</a></li>
    <li><a href="#lh">Line heights</a></li>
    <li><a href="#colors">Colors</a></li>
    <li><a href="#misc">Miscellaneous</a></li>
  </ul>

  <hr />

  <h2 id="fs">Font sizes</h2>

  <ul>
    <li v-for="(size, i) in fontSizes" :key="size">
      <p :style="`font-size: var(${size})`">
        Step {{ i }}: <code>{{ size }}</code>
      </p>
    </li>
  </ul>

  <h2 id="fw">Font weights</h2>

  <ul>
    <li v-for="weight in fontWeights" :key="weight.value">
      <span :style="`font-weight: var(${weight.name})`">
        Normal ({{ weight.value }}):
      </span>
      <code>{{ weight.name }}</code>
    </li>
  </ul>

  <h2 id="lh">Line heights</h2>

  <ul>
    <li v-for="lh in lineHeights" :key="lh.value">
      <span :style="`line-height: var(${lh.name})`">
        {{ lh.title }} line-height ({{ lh.value }}):
      </span>
      <code>{{ lh.name }}</code>
    </li>
  </ul>

  <h2 id="colors">Colors</h2>

  <h3>Grey scale colors</h3>

  <ul class="swatch">
    <li v-for="color in greyScaleSwatch" :key="color">
      <span :style="`background-color: var(${color})`" />
      <code>{{ color }}</code>
    </li>
  </ul>

  <h3>Brand colors</h3>

  <template v-for="brand in brandSwatch" :key="brand.name">
    <h4>{{ brand.name }}</h4>
    <ul class="swatch">
      <li v-for="color in brand.colors" :key="color">
        <span :style="`background-color: var(${color})`" />
        <code>{{ color }}</code>
      </li>
    </ul>
  </template>

  <h3>State colors</h3>

  <template v-for="state in stateSwatch" :key="state.name">
    <h4>{{ state.name }}</h4>
    <ul class="swatch">
      <li v-for="color in state.colors" :key="color">
        <span :style="`background-color: var(${color})`" />
        <code>{{ color }}</code>
      </li>
    </ul>
  </template>

  <h3>Utility colors</h3>

  <ul class="swatch">
    <li v-for="color in utilitySwatch" :key="color">
      <span :style="`background-color: var(${color})`" />
      <code>{{ color }}</code>
    </li>
  </ul>

  <h2 id="misc">Miscellaneous</h2>

  <h3>Box shadows</h3>

  <ul class="box-shadows">
    <li v-for="shadow in boxShadows" :key="shadow">
      <span :style="`box-shadow: var(${shadow})`" />
      <code>{{ shadow }} </code>
    </li>
  </ul>

  <h3>Border radiuses</h3>

  <ul class="radiuses">
    <li v-for="radius in borderRadiuses" :key="radius.value">
      <span :style="`border-radius: var(${radius.name})`" />
      <span>
        <code>{{ radius.name }} </code> ({{ radius.value }})
      </span>
    </li>
  </ul>

  <h3>Breakpoints</h3>

  <ul>
    <li v-for="bp in breakpoints" :key="bp.value">
      {{ bp.value }}: <code>{{ bp.name }}</code>
    </li>
  </ul>
</template>

<style scoped>
code {
  border-radius: var(--border-radius-base);
  background-color: var(--color-primary-lighter);
  font-size: 0.9em;
  padding: 0.1rem;
}

.swatch {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  li {
    display: flex;
    gap: 2rem;
    align-items: center;

    span {
      border: 1px solid var(--color-foreground);
      border-radius: var(--border-radius-base);
      width: 2rem;
      height: 2rem;
    }
  }
}

.radiuses {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  li {
    display: flex;
    gap: 2rem;
    align-items: center;

    span:first-child {
      background-color: var(--color-background);
      border: 1px solid var(--color-foreground);
      width: 2rem;
      height: 2rem;
    }
  }
}

.box-shadows {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  li {
    display: flex;
    gap: 2rem;
    align-items: center;

    span:first-child {
      background-color: var(--color-background);
      border-radius: var(--border-radius-base);
      width: 8rem;
      height: 2rem;
    }
  }
}
</style>
