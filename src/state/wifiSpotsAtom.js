import { atom } from 'recoil'

const wifiSpotsAtom = atom({
  key: 'wifiSpotsAtom', // unique ID (with respect to other atoms/selectors)
  default: [], // default value (aka initial value)
})

export default wifiSpotsAtom
