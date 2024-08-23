const Button = ({ onClick, children }) => (
  <button
    className="w-full px-2 py-1 font-bold leading-4 bg-gray-200 border border-gray-400 rounded text-dark dark:text-white dark:bg-dark"
    onClick={onClick}
  >
    {children}
  </button>
)

export default Button
