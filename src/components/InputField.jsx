export default function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  helperText,
  onBlur,
  required = false,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-bold uppercase tracking-wide text-black"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
        )}
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className={`input-brutal ${
            Icon ? "pl-11" : ""
          } ${
            error
              ? "border-red-500 shadow-brutal-red focus:border-red-500"
              : "focus:border-black"
          }`}
        />
      </div>
      {error && (
        <p className="text-xs font-bold uppercase text-red-500">⚠ {error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs font-medium text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
