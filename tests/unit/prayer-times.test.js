import { describe, it, expect } from "vitest";
import {
  buildPrayerEvents,
  formatTo24HourDisplay,
  getPrayerScheduleState,
} from "../../src/utils/prayerSchedule";

describe("Production Prayer Schedule Logic", () => {
  const sampleDayTimes = {
    date: 20,
    fajr: { start: "5.30", jamaat: "6.00" },
    sunrise: "7.15",
    dhuhar: { start: "12.15", jamaat: "1.15 / 2.15" },
    asr: { start: "3.15", jamaat: "3.45" },
    maghrib: { start: "6.00" },
    isha: { start: "7.45", jamaat: "8.15" },
  };

  it("determines the upcoming prayer before Asr on a weekday", () => {
    // Tuesday 2026-11-24 at 14:30
    const tuesdayAfternoon = new Date(2026, 10, 24, 14, 30, 0);
    const weekdayTimes = {
      ...sampleDayTimes,
      dhuhar: { start: "12.15", jamaat: "1.00" },
    };

    const { currentPrayer, nextPrayer, countdown } = getPrayerScheduleState(
      weekdayTimes,
      tuesdayAfternoon
    );

    expect(currentPrayer?.name).toBe("Dhuhar");
    expect(nextPrayer?.name).toBe("Asr");
    expect(nextPrayer?.type).toBe("Start");
    expect(nextPrayer?.isTomorrow).toBeUndefined();
    expect(countdown).toEqual({ hours: 0, minutes: 45, seconds: 0 });
  });

  it("wraps around to tomorrow's Fajr after the final evening prayer (Isha)", () => {
    // Tuesday 2026-11-24 at 22:00
    const lateEvening = new Date(2026, 10, 24, 22, 0, 0);
    const weekdayTimes = {
      ...sampleDayTimes,
      dhuhar: { start: "12.15", jamaat: "1.00" },
    };

    const { currentPrayer, nextPrayer } = getPrayerScheduleState(
      weekdayTimes,
      lateEvening
    );

    expect(currentPrayer?.name).toBe("Isha");
    expect(nextPrayer?.name).toBe("Fajr");
    expect(nextPrayer?.isTomorrow).toBe(true);
    expect(nextPrayer?.dateTime.getDate()).toBe(25);
  });

  it("switches between Jummah Jamaats on Friday and Dhuhar on regular weekdays", () => {
    // Friday 2026-11-27
    const fridayMorning = new Date(2026, 10, 27, 12, 30, 0);
    const fridayEvents = buildPrayerEvents(sampleDayTimes, true, fridayMorning);
    const jummahEvents = fridayEvents.filter((e) => e.name === "Jummah");

    expect(jummahEvents).toHaveLength(2);
    expect(jummahEvents[0].type).toBe("1st Jamaat");
    expect(jummahEvents[1].type).toBe("2nd Jamaat");

    const { nextPrayer: fridayNext } = getPrayerScheduleState(
      sampleDayTimes,
      fridayMorning
    );
    expect(fridayNext?.name).toBe("Jummah");
    expect(fridayNext?.type).toBe("1st Jamaat");

    // Tuesday 2026-11-24
    const tuesdayMorning = new Date(2026, 10, 24, 12, 30, 0);
    const weekdayTimes = {
      ...sampleDayTimes,
      dhuhar: { start: "12.15", jamaat: "1.00" },
    };
    const { nextPrayer: tuesdayNext } = getPrayerScheduleState(
      weekdayTimes,
      tuesdayMorning
    );
    expect(tuesdayNext?.name).toBe("Dhuhar");
    expect(tuesdayNext?.type).toBe("Jamaat");
  });

  it("formats 12-hour timetable strings into 24-hour display format", () => {
    expect(formatTo24HourDisplay("5.30", "Fajr")).toBe("05:30");
    expect(formatTo24HourDisplay("1.15", "Jummah")).toBe("13:15");
    expect(formatTo24HourDisplay("3.45", "Asr")).toBe("15:45");
    expect(formatTo24HourDisplay("7.45", "Isha")).toBe("19:45");
    expect(formatTo24HourDisplay("", "Fajr")).toBe("---");
    expect(formatTo24HourDisplay(null, "Fajr")).toBe("---");
  });
});
