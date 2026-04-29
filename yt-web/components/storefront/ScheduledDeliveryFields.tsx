"use client";

import { DELIVERY_TIME_SLOTS, getDeliveryDateOptions } from "@/lib/deliverySlots";

interface ScheduledDeliveryFieldsProps {
  address: string;
  onAddressChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  timeSlot: string;
  onTimeSlotChange: (v: string) => void;
  showAddress?: boolean;
  title?: string;
  note?: string;
}

const fieldClass =
  "mt-1 w-full rounded-lg border border-[var(--border-pink)] bg-[var(--surface-input)] px-3 py-2.5 font-jost text-sm text-brand-text outline-none transition focus:border-brand-pink/60 focus:ring-2 focus:ring-brand-pink/15 placeholder:text-brand-dimmed";

export function ScheduledDeliveryFields({
  address,
  onAddressChange,
  date,
  onDateChange,
  timeSlot,
  onTimeSlotChange,
  showAddress = true,
  title = "SCHEDULED DELIVERY",
  note = "Choose a date and time range for delivery. We will confirm the slot.",
}: ScheduledDeliveryFieldsProps) {
  const dates = getDeliveryDateOptions();

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border-pink)] bg-[var(--surface-tint-deep)] p-5">
      <p className="font-bebas text-sm tracking-wide text-brand-pink">{title}</p>
      <p className="font-jost text-xs text-brand-muted">{note}</p>
      {showAddress ? (
        <label className="block">
          <span className="font-jost text-xs text-brand-dimmed">Delivery address *</span>
          <textarea
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            rows={3}
            placeholder="House number, street, landmark, city"
            className={`${fieldClass} resize-y`}
          />
        </label>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-jost text-xs text-brand-dimmed">Day *</span>
          <select
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={fieldClass}
          >
            <option value="">Select a day</option>
            {dates.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-jost text-xs text-brand-dimmed">Time window *</span>
          <select
            value={timeSlot}
            onChange={(e) => onTimeSlotChange(e.target.value)}
            className={fieldClass}
          >
            <option value="">Select time</option>
            {DELIVERY_TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
