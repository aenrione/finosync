import React, { ReactNode } from "react"

type SelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  renderInput?: (props: any) => ReactNode;
  children: ReactNode;
};

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  renderInput,
  children,
}) => {
  // Basic select state
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) onChange(e.target.value)
  }

  return (
    <div>
      {renderInput && renderInput({ disabled })}
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{ width: "100%", padding: 8, marginTop: 8 }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    </div>
  )
}

export default Select
