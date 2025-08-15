<script setup lang="ts">
import ConfigurationTable from './ConfigurationTable.vue'
import type { ExtensionInfo } from './ExtensionItems.types'
import StageDefinitionTable from './StageDefinitionTable.vue'

defineProps<ExtensionInfo>()
</script>

<template>
  <div class="extension-root-common gap-y-1rem">
    <h1 class="text-h3">
      {{ extensionName }}
    </h1>
    <ConfigurationTable v-if="config" :config="config" />
    <StageDefinitionTable v-if="stageDefinition" :stageDefinition="stageDefinition" />
  </div>
</template>
