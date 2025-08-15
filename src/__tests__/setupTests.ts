import { config } from '@vue/test-utils'
import vuetify from '../plugins/vuetify'

// Provide Vuetify globally for all tests
config.global.plugins = [vuetify]

// Mock ResizeObserver to avoid errors in tests
global.ResizeObserver = require('resize-observer-polyfill')
