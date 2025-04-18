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
import {
  GeneralPage as GeneralPage4,
  WiFiPage as WiFiPage4,
} from './pages/fertVlad'
import {
  GeneralPage as GeneralPage5,
  WiFiPage as WiFiPage5,
} from './pages/mihRogin'
import {
  ConnectionsPage as ConnectionsPage6,
  GeneralPage as GeneralPage6,
  WiFiPage as WiFiPage6,
} from './pages/ShmidtVL'

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
  fertVlad: {
    name: 'Владимир Ферт',
    index: 4,
    pages: {
      general: GeneralPage4,
      wifi: WiFiPage4,
    },
  },
  mihRogin: {
    name: 'Михаил Рожин',
    index: 5,
    pages: {
      general: GeneralPage5,
      wifi: WiFiPage5,
    },
  },
  ShmidtVL: {
    name: 'Владимир Шмидт',
    index: 6,
    pages: {
      general: GeneralPage6,
      connections: ConnectionsPage6,
      wifi: WiFiPage6,
    },
  },
}

export default accessCodes
