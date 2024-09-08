const VerticalDots = ({ className }) => (
  <svg
    className={className}
    width="28px"
    height="28px"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="miter"
  >
    <line
      x1="11.99"
      y1="6"
      x2="12"
      y2="6"
      strokeLinecap="round"
      strokeWidth="2.5"
    ></line>
    <line
      x1="11.99"
      y1="12"
      x2="12"
      y2="12"
      strokeLinecap="round"
      strokeWidth="2.5"
    ></line>
    <line
      x1="11.99"
      y1="18"
      x2="12"
      y2="18"
      strokeLinecap="round"
      strokeWidth="2.5"
    ></line>
  </svg>
)

export default VerticalDots
