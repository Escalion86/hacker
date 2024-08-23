const Switch = ({ id, label, checked, onChange }) => (
  <div className="flex items-center px-5 flex-nowrap gap-x-3">
    <label className="leading-4" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type="checkbox"
      className="switch_1"
      checked={checked}
      onChange={onChange}
    />
  </div>
)

export default Switch
