"use client"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

export function EstateDayPicker({
  day,
  onChange,
}: {
  day: string
  onChange: (day: string) => void
}) {
  const date = new Date(`${day}T12:00:00`)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Choose appointment date"
        >
          <CalendarIcon />
          {date.toLocaleDateString("en-GB", { dateStyle: "medium" })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(next) => {
            if (next)
              onChange(
                `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`
              )
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
