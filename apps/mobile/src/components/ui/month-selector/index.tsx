import { GestureHandlerRootView, Directions } from "react-native-gesture-handler"
import "moment/min/locales"
import React, { useEffect, useState, useCallback } from "react"
import {
  TouchableOpacity,
} from "react-native"
import moment from "moment"

import { Text } from "@/components/ui/text"
import { View } from "react-native"

const DATE_FORMAT = "DD-MM-YYYY"
const MONTH_YEAR_FORMAT = "MMYYYY"

const getMonthListFirstDayDate = (date: moment.Moment) => {
  const monthList = []
  const year = date.format("YYYY")
  for (let i = 1; i <= 12; i++) {
    monthList.push(moment(`01-${i}-${year}`, DATE_FORMAT))
  }
  return monthList
}

const MonthSelector = ({
  selectedDate = moment(),
  currentDate = moment(),
  maxDate = moment(),
  minDate = moment("01-01-2000", DATE_FORMAT),
  selectedBackgroundColor = "hsl(var(--primary))",
  selectedMonthTextStyle = { color: "hsl(var(--primary-foreground))" },
  seperatorHeight = 1,
  seperatorColor = "hsl(var(--border))",
  nextIcon = null,
  prevIcon = null,
  nextText = "Next",
  prevText = "Prev",
  containerStyle = {},
  yearTextStyle = {},
  monthTextStyle = { color: "hsl(var(--foreground))" },
  currentMonthTextStyle = { color: "hsl(var(--primary))" },
  monthFormat = "MMM",
  initialView = moment(),
  onMonthTapped = () => {},
  onYearChanged = () => {},
  monthDisabledStyle = { color: "hsl(var(--muted-foreground))" },
  localeLanguage = "en",
  localeSettings = {},
  swipable = false,
  velocityThreshold = 0.3,
  directionalOffsetThreshold = 80,
  gestureIsClickThreshold = 5,
}: MonthSelectorProps) => {
  const [viewDate, setViewDate] = useState(initialView)

  useEffect(() => {
    moment.updateLocale(localeLanguage, localeSettings)
  }, [localeLanguage, localeSettings])

  const isMonthEnabled = (month: moment.Moment) => {
    const min = minDate.format("YYYYMM")
    const max = maxDate.format("YYYYMM")
    const current = month.format("YYYYMM")
    return current >= min && current <= max
  }

  const isYearEnabled = (isNext: boolean) => {
    const minYear = minDate.year()
    const maxYear = maxDate.year()
    const currentYear = viewDate.year()
    return isNext ? currentYear < maxYear : currentYear > minYear
  }

  const handleMonthTaps = (month: moment.Moment) => {
    onMonthTapped(month)
  }

  const handleNextPrev = (isNext: boolean) => {
    if (isYearEnabled(isNext)) {
      const newView = viewDate.clone().add(isNext ? 1 : -1, "year")
      setViewDate(newView)
      onYearChanged(newView)
    }
  }

  const getMonthComponent = (month: moment.Moment) => {
    const isSelected = month.format(MONTH_YEAR_FORMAT) === selectedDate.format(MONTH_YEAR_FORMAT)
    const isCurrent = month.format(MONTH_YEAR_FORMAT) === currentDate.format(MONTH_YEAR_FORMAT)
    const isDisabled = !isMonthEnabled(month)

    const textStyle = isDisabled
      ? monthDisabledStyle
      : isSelected
        ? selectedMonthTextStyle
        : isCurrent
          ? currentMonthTextStyle
          : monthTextStyle

    const bgStyle = isSelected ? { backgroundColor: selectedBackgroundColor } : {}

    const content = (
      <View className="h-10 w-10 rounded-full justify-center items-center overflow-hidden" style={bgStyle}>
        <Text style={textStyle}>{month.format(monthFormat)}</Text>
      </View>
    )

    if (isDisabled) return <View className="flex-1 items-center">{content}</View>

    return (
      <TouchableOpacity
        onPress={() => handleMonthTaps(month)}
        className="flex-1 items-center"
      >
        {content}
      </TouchableOpacity>
    )
  }

  const renderRow = (months: moment.Moment[], qNo: number) => {
    const start = qNo * 3
    return (
      <View className="flex-row items-center p-2">
        {getMonthComponent(months[start])}
        {getMonthComponent(months[start + 1])}
        {getMonthComponent(months[start + 2])}
      </View>
    )
  }

  const renderHeader = () => (
    <View
      className="flex-row items-center self-center"
      style={{
        borderBottomColor: seperatorColor,
        borderBottomWidth: seperatorHeight,
        height: 64,
      }}
    >
      <TouchableOpacity onPress={() => handleNextPrev(false)}>
        {prevIcon || <Text>{prevText}</Text>}
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center self-center">
        <Text style={yearTextStyle}>{viewDate.format("YYYY")}</Text>
      </View>

      <TouchableOpacity onPress={() => handleNextPrev(true)}>
        {nextIcon || <Text>{nextText}</Text>}
      </TouchableOpacity>
    </View>
  )

  const handleSwipe = (gestureName: number) => {
    const { LEFT, RIGHT } = Directions
    if (gestureName === LEFT) handleNextPrev(true)
    if (gestureName === RIGHT) handleNextPrev(false)
  }

  const months = getMonthListFirstDayDate(viewDate)

  return (
    <GestureHandlerRootView
      style={[{ alignItems: "center" }, containerStyle]}
    >
      {renderHeader()}
      {renderRow(months, 0)}
      {renderRow(months, 1)}
      {renderRow(months, 2)}
      {renderRow(months, 3)}
    </GestureHandlerRootView>
  )
}

type MonthSelectorProps = {
  selectedDate?: moment.Moment
  currentDate?: moment.Moment
  maxDate?: moment.Moment
  minDate?: moment.Moment
  selectedBackgroundColor?: string
  selectedMonthTextStyle?: object
  seperatorColor?: string
  seperatorHeight?: number
  nextIcon?: React.ReactNode
  prevIcon?: React.ReactNode
  nextText?: string
  prevText?: string
  containerStyle?: object
  yearTextStyle?: object
  monthTextStyle?: object
  currentMonthTextStyle?: object
  monthFormat?: string
  initialView?: moment.Moment
  onMonthTapped?: (month: moment.Moment) => void
  onYearChanged?: (year: moment.Moment) => void
  monthDisabledStyle?: object
  localeLanguage?: string
  localeSettings?: object
  swipable?: boolean
  velocityThreshold?: number
  directionalOffsetThreshold?: number
  gestureIsClickThreshold?: number
}

export default MonthSelector
