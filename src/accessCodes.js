import {
  ConnectionsPage as ConnectionsPage1,
  GeneralPage as GeneralPage1,
  WiFiPage as WiFiPage1,
} from './pages/escalion'
import {
  ConnectionsPage as ConnectionsPage2,
  GeneralPage as GeneralPage2,
  WiFiPage as WiFiPage2,
} from './pages/denjoker'
import {
  GeneralPage as GeneralPage3,
  WiFiPage as WiFiPage3,
} from './pages/enkD83Js'

const accessCodes = {
  escalion: {
    name: 'Алексей Белинский',
    index: 1,
    pages: {
      general: GeneralPage1,
      connections: ConnectionsPage1,
      wifi: WiFiPage1,
    },
  },
  denjoker: {
    name: 'Денис Паршиков',
    index: 2,
    pages: {
      general: GeneralPage2,
      connections: ConnectionsPage2,
      wifi: WiFiPage2,
    },
  },
  enkD83Js: {
    name: 'Владислав',
    index: 3,
    pages: {
      general: GeneralPage3,
      wifi: WiFiPage3,
    },
  },
}

export default accessCodes
