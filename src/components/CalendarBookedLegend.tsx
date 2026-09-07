import clsx from "clsx"

type Props = {
  className?: string
  audience: "guest" | "manager"
}

// Colour key for DayPicker booked/blocked nights — pairs with .holidaze-day-booked
export function CalendarBookedLegend({ className, audience }: Props) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3 rounded-xl border border-stone-200/90 bg-stone-50/80 p-4 text-sm text-brand-800",
        className,
      )}
      role="note"
    >
      <p className="font-medium text-brand-950">Explanation</p>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-red-400/70 bg-red-100 text-[0.65rem] font-semibold text-red-950/90"
            aria-hidden
          />
          <span>
            <strong className="text-brand-950">
              Unavailable (booked or blocked by the venue owner).
            </strong>{" "}
            {audience === "guest" ? (
              <>
                Someone already has these nights covered from check-in through
                check-out (those days are included). Pick other dates instead.
              </>
            ) : (
              <>
                These nights overlap an existing reservation or one of your own
                date blocks, so you cannot add another block on top.
              </>
            )}
          </span>
        </span>
      </div>
    </div>
  )
}
