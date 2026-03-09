import React, { useEffect, useState } from "react"
import { View } from "react-native"

import { FormSelect } from "@/components/ui/form-select"
import { Spinner } from "@/components/ui/spinner"
import { fetchWithAuth } from "@/utils/api"

type Currency = {
  code: string
  name: string
  symbol: string
}

type CurrenciesSelectProps = {
  value?: string | Currency | null
  onChange?: (value: Currency) => void
  placeholder?: string
  className?: string
  label?: string
  required?: boolean
  error?: string
  containerClassName?: string
}

export const CurrenciesSelect: React.FC<CurrenciesSelectProps> = ({
  value,
  onChange,
  placeholder = "Select currency...",
  label = "Currency",
  required,
  error,
  containerClassName,
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchWithAuth("/currencies")
      .then((res) => res.json())
      .then((data) => {
        const arr = (data.currencies || []).map((c: { iso_code: string; name: string; symbol: string }) => ({
          code: c.iso_code,
          name: c.name,
          symbol: c.symbol,
        }))
        setCurrencies(arr)
      })
      .finally(() => setLoading(false))
  }, [])

  const selectedValue = value
    ? typeof value === "string"
      ? value
      : value.code
    : null

  const handleValueChange = (code: string | number | null) => {
    if (!onChange) return
    const selected = currencies.find((c) => c.code === code)
    if (selected) {
      onChange(selected)
    }
  }

  if (loading) {
    return (
      <View className="py-4 items-center justify-center">
        <Spinner />
      </View>
    )
  }

  const options = currencies.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name} (${c.symbol})`,
  }))

  return (
    <FormSelect
      label={label}
      options={options}
      value={selectedValue}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      required={required}
      error={error}
      containerClassName={containerClassName}
    />
  )
}

export default CurrenciesSelect
