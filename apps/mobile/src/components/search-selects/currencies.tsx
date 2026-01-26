import { ChevronDownIcon } from "lucide-react-native"
import React, { useEffect, useState } from "react" 
import { View } from "react-native"

import { 
  Select, 
  SelectTrigger, 
  SelectInput, 
  SelectIcon, 
  SelectPortal, 
  SelectBackdrop, 
  SelectContent, 
  SelectDragIndicatorWrapper, 
  SelectDragIndicator, 
  SelectItem 
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { fetchWithAuth } from "@/utils/api"
import { fetchApi } from "@/utils/api"

// Match backend response
type Currency = {
    code: string;
    name: string;
    symbol: string;
};

type CurrenciesSelectProps = {
    value?: any;
    onChange?: (value: any) => void;
    placeholder?: string;
    className?: string;
};

export const CurrenciesSelect: React.FC<CurrenciesSelectProps> = ({
  value,
  onChange,
  placeholder = "Select currency...",
  className,
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filtered, setFiltered] = useState<Currency[]>([])

  useEffect(() => {
    setLoading(true)
    fetchWithAuth("/currencies")
      .then((res) => res.json())
      .then((data) => {
        const arr = (data.currencies || []).map((c: any) => ({
          code: c.iso_code,
          name: c.name,
          symbol: c.symbol,
        }))
        setCurrencies(arr)
        setFiltered(arr)
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter currencies directly since we can't use the search input
  useEffect(() => {
    setFiltered(currencies)
  }, [currencies])

  // Find the selected currency object from code (either direct value or value.code)
  const selectedValue = value ? 
    (typeof value === "string" ? value : value.code) : 
    ""
    
  // Handle selection of a currency
  const handleValueChange = (code: string) => {
    if (!onChange) return
    const selected = currencies.find(c => c.code === code)
    if (selected) {
      onChange(selected)
    }
  }
    
  return (
    <Select 
      defaultValue={selectedValue}
      onValueChange={handleValueChange}
      className={className}
    >
      <SelectTrigger variant="outline" size="md">
        <SelectInput placeholder={placeholder} />
        <SelectIcon className="mr-3" as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {loading ? (
            <View className="p-4 items-center justify-center">
              <Spinner />
            </View>
          ) : (
            filtered.map((currency) => (
              <SelectItem
                key={currency.code}
                value={currency.code}
                label={`${currency.code} - ${currency.name} ${currency.symbol}`}
              />
            ))
          )}
        </SelectContent>
      </SelectPortal>
    </Select>
  )
}

export default CurrenciesSelect