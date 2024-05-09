import { atom } from 'recoil'

const logsAtom = atom({
  key: 'logsAtom', // unique ID (with respect to other atoms/selectors)
  default: [], // default value (aka initial value)
})

export default logsAtom
