import { atom } from 'recoil'

const cardSuitAtom = atom({
  key: 'cardSuitAtom', // unique ID (with respect to other atoms/selectors)
  default: 0, // default value (aka initial value)
})

export default cardSuitAtom
