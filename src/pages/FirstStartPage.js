import { useState } from 'react'
import accessCodes from '../accessCodes'
import Button from '../components/Button'
import PageWrapper from './PageWrapper'

const FirstStartPage = ({ size, setPage, setAccessCode }) => {
  const [accessCodeInput, setAccessCodeInput] = useState(
    localStorage.accessCode || ''
  )
  const [wrongCode, setWrongCode] = useState(false)
  return (
    <PageWrapper size={size} title="Первый запуск" noSearchIcon>
      <div className="flex flex-wrap items-center px-5 gap-x-1">
        <label htmlFor="accessCode">Введите Ваш код доступа</label>
        <input
          id="accessCode"
          className="px-2 py-1 text-white bg-dark"
          defaultValue={accessCodeInput}
          onChange={(e) => {
            setAccessCodeInput(e.target.value)
            if (wrongCode) setWrongCode(false)
          }}
        />
      </div>
      <Button
        onClick={() => {
          if (accessCodes[accessCodeInput]) {
            localStorage.accessCode = accessCodeInput
            setAccessCode(accessCodeInput)
            setPage('general')
          } else setWrongCode(true)
        }}
      >
        Ввести код
      </Button>
      {wrongCode && <div className="font-bold text-red-500">Код не верен</div>}
    </PageWrapper>
  )
}

export default FirstStartPage
