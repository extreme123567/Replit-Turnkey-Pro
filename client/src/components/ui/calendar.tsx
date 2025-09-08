import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-xl shadow-sm border border-slate-200/60", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-base font-semibold text-slate-800 tracking-tight",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white border-slate-200 p-0 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:scale-105 transition-all duration-200 shadow-sm"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell:
          "text-slate-600 rounded-lg w-10 h-8 font-medium text-sm flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/50",
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-medium aria-selected:opacity-100 rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:scale-110 hover:shadow-md transition-all duration-200 ease-out"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 focus:from-blue-600 focus:to-indigo-700 shadow-lg transform scale-105 border-2 border-white ring-2 ring-blue-200",
        day_today: "bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold shadow-md ring-2 ring-orange-200 border-2 border-white",
        day_outside:
          "day-outside text-slate-400 aria-selected:bg-accent/50 aria-selected:text-muted-foreground hover:text-slate-500",
        day_disabled: "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent hover:scale-100",
        day_range_middle:
          "aria-selected:bg-gradient-to-r aria-selected:from-blue-100 aria-selected:to-indigo-100 aria-selected:text-blue-800",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
