<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { VIcon } from 'vuetify/components'
import type { Diagnostics } from './App.types'
import BuildInfoTable from './BuildInfoTable.vue'
import ExtensionItem from './ExtensionItem.vue'
import type { ExtensionInfo } from './ExtensionItems.types'
import ExtensionItems from './ExtensionItems.vue'
import ServerInfoTable from './ServerInfoTable.vue'
import { isExtensionInfo } from './utils'
import type { KeyedNavLink } from './types'

type Environment =
  | 'https://hosting.portal.azure.net/api/diagnostics'
  | 'https://hosting.azureportal.usgovcloudapi.net/api/diagnostics'
  | 'https://hosting.azureportal.chinacloudapi.cn/api/diagnostics'

const Environments = {
  Public: 'https://hosting.portal.azure.net/api/diagnostics' as Environment,
  Fairfax: 'https://hosting.azureportal.usgovcloudapi.net/api/diagnostics' as Environment,
  Mooncake: 'https://hosting.azureportal.chinacloudapi.cn/api/diagnostics' as Environment,
} as const

const diagnostics = ref<Diagnostics | undefined>(undefined)
const extension = ref<ExtensionInfo | undefined>(undefined)
const environment = ref<Environment>(Environments.Public)
const selectedTab = ref('extensions')
const menuOpen = ref(false)

const environmentName = computed(() => {
  switch (environment.value) {
    case Environments.Public:
      return 'Public Cloud'
    case Environments.Fairfax:
      return 'Fairfax'
    case Environments.Mooncake:
      return 'Mooncake'
    default:
      return 'Select environment'
  }
})

const showPaasServerless = computed(() =>
  isExtensionInfo(diagnostics.value?.extensions?.['paasserverless'])
)

const environments = [
  {
    key: 'public',
    text: 'Public Cloud',
    value: Environments.Public,
  },
  {
    key: 'fairfax',
    text: 'Fairfax',
    value: Environments.Fairfax,
  },
  {
    key: 'mooncake',
    text: 'Mooncake',
    value: Environments.Mooncake,
  },
]

const fetchDiagnostics = async () => {
  const response = await fetch(environment.value)
  diagnostics.value = await response.json()
}

watch(environment, () => {
  extension.value = undefined
  fetchDiagnostics()
})

onMounted(fetchDiagnostics)

const handleLinkClick = (_: KeyboardEvent | MouseEvent, link: KeyedNavLink) => {
  if (link) {
    const ext = diagnostics.value?.extensions?.[link.key]
    if (isExtensionInfo(ext)) {
      extension.value = ext
    }
  }
}

const selectExtension = (key: string) => {
  const ext = diagnostics.value?.extensions?.[key]
  if (isExtensionInfo(ext)) {
    extension.value = ext
  }
}
</script>

<template>
  <v-app>
    <v-toolbar>
      <v-menu v-model="menuOpen">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text">
            {{ environmentName }}
            <v-icon>{{ menuOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="env in environments"
            :key="env.key"
            @click="
              () => {
                environment = env.value
                extension = undefined
              }
            "
            :aria-checked="environment === env.value"
            role="menuitemradio"
          >
            {{ env.text }}
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        v-if="showPaasServerless"
        variant="text"
        @click="() => selectExtension('paasserverless')"
      >
        paasserverless
      </v-btn>
      <v-btn variant="text" @click="() => selectExtension('websites')"> websites </v-btn>
    </v-toolbar>
    <v-tabs v-model="selectedTab">
      <v-tab value="extensions">Extensions</v-tab>
      <v-tab value="build">Build Information</v-tab>
      <v-tab value="server">Server Information</v-tab>
    </v-tabs>
    <v-window v-model="selectedTab">
      <v-window-item value="extensions">
        <div>
          <div class="stack">
            <div>
              <ExtensionItems
                v-if="diagnostics?.extensions"
                :extensions="diagnostics.extensions"
                :onLinkClick="handleLinkClick"
              />
            </div>
            <div class="grow">
              <ExtensionItem v-if="extension" v-bind="extension" />
            </div>
          </div>
        </div>
      </v-window-item>
      <v-window-item value="build">
        <div>
          <BuildInfoTable v-if="diagnostics?.buildInfo" v-bind="diagnostics.buildInfo" />
        </div>
      </v-window-item>
      <v-window-item value="server">
        <div>
          <ServerInfoTable v-if="diagnostics?.serverInfo" v-bind="diagnostics.serverInfo" />
        </div>
      </v-window-item>
    </v-window>
  </v-app>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.grow {
  flex-grow: 1;
}

.extension-root-common {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 124px);
  overflow-y: auto;
}
</style>
