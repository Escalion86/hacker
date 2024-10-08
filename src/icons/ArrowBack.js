const ArrowBack = ({ className, width = '24', height = '24' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 -2 24 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.48881 12L16.6306 4.26667C16.8358 4.04444 17 3.68889 17 3.33333C17 2.57778 16.4664 2 15.7687 2C15.4403 2 15.1119 2.13333 14.9067 2.4L6 12L14.8657 21.6C15.0709 21.8222 15.3993 22 15.7276 22C16.4254 22 16.959 21.4222 16.959 20.6667C16.959 20.3111 16.8358 19.9556 16.5896 19.7333L9.48881 12Z"
      // fill={fill}
      className={className}
    />
  </svg>
)

export default ArrowBack
