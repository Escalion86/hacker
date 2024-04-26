import { atom } from 'recoil'

const wifiNameAtom = atom({
  key: 'wifiNameAtom', // unique ID (with respect to other atoms/selectors)
  default: '', // default value (aka initial value)
})

export default wifiNameAtom
