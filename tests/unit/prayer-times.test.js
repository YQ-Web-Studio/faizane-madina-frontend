import { describe, it, expect } from "vitest";

function calculateNextPrayer(events, currentTime) {
  const upcoming = events.filter(e => e.time > currentTime);
  return upcoming.length > 0 ? upcoming[0] : events[0];
}

function resolveNoonPrayer(isFriday, jummahTime, dhuhrTime) {
  return isFriday ? { name: "Jummah", time: jummahTime } : { name: "Zuhr", time: dhuhrTime };
}

describe("Prayer Time Calculation Logic", () => {
  const mockSchedule = [
    { name: "Fajr", time: "05:30" },
    { name: "Zuhr", time: "12:45" },
    { name: "Asr", time: "15:15" },
    { name: "Maghrib", time: "18:00" },
    { name: "Isha", time: "19:45" }
  ];

  it("determines the upcoming prayer before Asr", () => {
    const next = calculateNextPrayer(mockSchedule, "14:00");
    expect(next.name).toBe("Asr");
  });

  it("wraps around to Fajr after the final evening prayer (Isha)", () => {
    const next = calculateNextPrayer(mockSchedule, "22:00");
    expect(next.name).toBe("Fajr");
  });

  it("switches between Jummah on Friday and Zuhr on regular weekdays", () => {
    const fridayPrayer = resolveNoonPrayer(true, "13:15", "12:45");
    expect(fridayPrayer.name).toBe("Jummah");
    expect(fridayPrayer.time).toBe("13:15");

    const tuesdayPrayer = resolveNoonPrayer(false, "13:15", "12:45");
    expect(tuesdayPrayer.name).toBe("Zuhr");
    expect(tuesdayPrayer.time).toBe("12:45");
  });
});
