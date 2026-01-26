import React from "react"

type SelectOptionProps = {
  value: string;
  children: React.ReactNode;
};

export const SelectOption: React.FC<SelectOptionProps> = ({ value, children }) => <option value={value}>{children}</option>

export default SelectOption
