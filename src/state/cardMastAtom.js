import { atom } from 'recoil'

const cardMastAtom = atom({
  key: 'cardMastAtom', // unique ID (with respect to other atoms/selectors)
  default: 0, // default value (aka initial value)
})

export default cardMastAtom
