import './apps.css'

import type { AppId } from '../types'
import { appDefinitions } from './AppSuite'

export { appDefinitions }

export function getAppDefinition(appId: AppId) {
  const definition = appDefinitions.find((app) => app.id === appId)
  if (!definition) throw new Error(`Unknown app: ${appId}`)
  return definition
}

