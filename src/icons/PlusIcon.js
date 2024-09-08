const PlusIcon = ({ stroke }) => (
  <svg
    width="34px"
    height="34px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 6V18"
      stroke={stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M6 12H18"
      stroke={stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

export default PlusIcon
