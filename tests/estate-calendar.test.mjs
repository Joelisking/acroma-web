import test from "node:test"
import assert from "node:assert/strict"
import {
  appointmentsOnDay,
  calendarRange,
  currentAppointment,
  dayLabel,
  daySegment,
  navigateDate,
  resolveCalendarView,
  timelineLayout,
} from "../lib/estate-calendar.ts"
const a = (id, startsAt, endsAt) => ({
  id,
  startsAt,
  endsAt,
  status: "CONFIRMED",
})

test("agencies without a saved view initially open Week", () => {
  for (const missing of [undefined, null, "", "unexpected"])
    assert.equal(resolveCalendarView(undefined, missing), "week")
})
test("fresh entries and invalid URL views use the agency default", () => {
  for (const [saved, expected] of [
    ["WEEK", "week"],
    ["DAY", "day"],
    ["MONTH", "month"],
  ]) {
    for (const invalid of [undefined, null, "", "agenda", ["day", "month"]])
      assert.equal(resolveCalendarView(invalid, saved), expected)
  }
})
test("every explicit URL view overrides every saved default and preserves its date range", () => {
  for (const saved of ["WEEK", "DAY", "MONTH"]) {
    for (const explicit of ["week", "day", "month"]) {
      const view = resolveCalendarView(explicit, saved)
      assert.equal(view, explicit)
      assert.deepEqual(
        calendarRange("2026-09-29", view),
        calendarRange("2026-09-29", explicit)
      )
    }
  }
})

test("month range includes all visible boundary days across the year", () => {
  const range = calendarRange("2026-12-31", "month")
  assert.equal(range.days.length, 42)
  assert.equal(range.from, "2026-11-30T00:00:00Z")
  assert.equal(range.to, "2027-01-11T00:00:00Z")
})
test("week and day ranges use Ghana midnight and Monday weeks", () => {
  assert.equal(calendarRange("2026-10-04", "week").from, "2026-09-28T00:00:00Z")
  assert.equal(calendarRange("2026-10-04", "day").to, "2026-10-05T00:00:00Z")
})
test("month navigation clamps the day in February and leap years", () => {
  assert.equal(navigateDate("2026-01-31", "month", 1), "2026-02-28")
  assert.equal(navigateDate("2028-01-31", "month", 1), "2028-02-29")
})
test("overnight appointments appear on both days without midnight duplicates", () => {
  const rows = [
    a("overnight", "2026-10-01T23:30:00Z", "2026-10-02T00:30:00Z"),
    a("midnight-end", "2026-10-01T23:00:00Z", "2026-10-02T00:00:00Z"),
  ]
  assert.equal(appointmentsOnDay(rows, "2026-10-01").length, 2)
  assert.deepEqual(
    appointmentsOnDay(rows, "2026-10-02").map((a) => a.id),
    ["overnight"]
  )
  assert.deepEqual(daySegment(rows[0], "2026-10-02"), { start: 0, end: 30 })
})
test("overlapping historical appointments occupy distinct lanes; adjacent appointments reuse one", () => {
  const rows = [
    a("a", "2026-10-01T09:00:00Z", "2026-10-01T10:00:00Z"),
    a("b", "2026-10-01T09:30:00Z", "2026-10-01T10:30:00Z"),
    a("c", "2026-10-01T10:30:00Z", "2026-10-01T11:00:00Z"),
  ]
  assert.deepEqual(
    timelineLayout(rows, "2026-10-01").map((a) => [a.lane, a.lanes]),
    [
      [0, 2],
      [1, 2],
      [0, 1],
    ]
  )
})
test("holds expire visually at their exact deadline without changing confirmed bookings", () => {
  const held = {
    ...a("h", "2026-10-01T09:00:00Z", "2026-10-01T10:00:00Z"),
    status: "HOLD",
    holdExpiresAt: "2026-09-29T12:00:00Z",
    paymentUrl: "https://example.invalid",
  }
  assert.equal(
    currentAppointment(held, Date.parse(held.holdExpiresAt)).status,
    "EXPIRED"
  )
  assert.equal(
    currentAppointment(held, Date.parse(held.holdExpiresAt)).paymentUrl,
    null
  )
  assert.equal(
    currentAppointment(
      { ...held, status: "CONFIRMED" },
      Date.parse(held.holdExpiresAt)
    ).status,
    "CONFIRMED"
  )
})
test("labels do not shift when the browser is outside Ghana", () => {
  process.env.TZ = "America/Los_Angeles"
  assert.match(dayLabel("2026-10-01"), /Thursday, 1 October 2026/)
})
