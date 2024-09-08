const VerticalDots = ({ className }) => (
  <svg
    className={className}
    width="28px"
    height="28px"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    stroke-width="1"
    stroke-linecap="round"
    stroke-linejoin="miter"
  >
    <line
      x1="11.99"
      y1="6"
      x2="12"
      y2="6"
      stroke-linecap="round"
      stroke-width="2.5"
    ></line>
    <line
      x1="11.99"
      y1="12"
      x2="12"
      y2="12"
      stroke-linecap="round"
      stroke-width="2.5"
    ></line>
    <line
      x1="11.99"
      y1="18"
      x2="12"
      y2="18"
      stroke-linecap="round"
      stroke-width="2.5"
    ></line>
  </svg>
)

export default VerticalDots
