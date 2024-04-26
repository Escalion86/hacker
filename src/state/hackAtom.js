import { atom } from 'recoil'

const hackAtom = atom({
  key: 'hackAtom', // unique ID (with respect to other atoms/selectors)
  default: false, // default value (aka initial value)
})

export default hackAtom
