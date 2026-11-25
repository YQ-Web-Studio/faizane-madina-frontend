export const createDateFromTimeString = (
  timeString,
  prayerName,
  referenceDate = new Date()
) => {
  if (!timeString || typeof timeString !== "string" || timeString.trim() === "")
    return null;
  let [hours, minutes] = timeString.split(".").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  if (
    (["Asr", "Maghrib", "Isha"].includes(prayerName) && hours < 12) ||
    (["Jummah", "Dhuhar"].includes(prayerName) && hours < 11)
  ) {
    hours += 12;
  }

  const date = new Date(referenceDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatTo24HourDisplay = (timeString, prayerName) => {
  if (!timeString || typeof timeString !== "string" || timeString.trim() === "")
    return "---";
  let [hours, minutes] = timeString.split(".").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return "---";

  if (
    (["Asr", "Maghrib", "Isha"].includes(prayerName) && hours < 12) ||
    (["Jummah", "Dhuhar"].includes(prayerName) && hours < 11)
  ) {
    hours += 12;
  }

  const fHours = String(hours).padStart(2, "0");
  const fMinutes = String(minutes).padStart(2, "0");
  return `${fHours}:${fMinutes}`;
};

export const buildPrayerEvents = (
  todaysTimes,
  isFriday,
  referenceDate = new Date()
) => {
  if (!todaysTimes) return [];

  const events = [
    { name: "Fajr", type: "Start", time: todaysTimes.fajr?.start },
    { name: "Fajr", type: "Jamaat", time: todaysTimes.fajr?.jamaat },
    { name: "Sunrise", type: "Event", time: todaysTimes.sunrise },
    { name: "Dhuhar", type: "Start", time: todaysTimes.dhuhar?.start },
    ...(isFriday && todaysTimes.dhuhar?.jamaat?.includes("/")
      ? todaysTimes.dhuhar.jamaat.split("/").map((t, i) => ({
          name: "Jummah",
          type: `${i + 1}${i === 0 ? "st" : "nd"} Jamaat`,
          time: t?.trim(),
        }))
      : [
          {
            name: "Dhuhar",
            type: "Jamaat",
            time: todaysTimes.dhuhar?.jamaat,
          },
        ]),
    { name: "Asr", type: "Start", time: todaysTimes.asr?.start },
    { name: "Asr", type: "Keep", time: todaysTimes.asr?.jamaat },
    { name: "Maghrib", type: "Start", time: todaysTimes.maghrib?.start },
    { name: "Isha", type: "Start", time: todaysTimes.isha?.start },
    { name: "Isha", type: "Jamaat", time: todaysTimes.isha?.jamaat },
  ];

  return events
    .map((event) => ({
      ...event,
      dateTime: createDateFromTimeString(event.time, event.name, referenceDate),
    }))
    .filter((event) => event.dateTime instanceof Date && !isNaN(event.dateTime))
    .sort((a, b) => a.dateTime - b.dateTime);
};

export const getPrayerScheduleState = (todaysTimes, now = new Date()) => {
  const isFriday = now.getDay() === 5;
  const prayerEvents = buildPrayerEvents(todaysTimes, isFriday, now);
  let currentPrayer = null;
  let nextPrayer = null;

  for (const event of prayerEvents) {
    if (event.dateTime <= now) {
      currentPrayer = event;
    }
    if (event.dateTime > now && !nextPrayer) {
      nextPrayer = event;
    }
  }

  if (!nextPrayer && prayerEvents.length > 0) {
    nextPrayer = { ...prayerEvents[0], isTomorrow: true };
    if (nextPrayer.dateTime) {
      const tomorrowDateTime = new Date(nextPrayer.dateTime);
      tomorrowDateTime.setDate(tomorrowDateTime.getDate() + 1);
      nextPrayer.dateTime = tomorrowDateTime;
    }
  }

  let countdown = { hours: 0, minutes: 0, seconds: 0 };
  if (nextPrayer?.dateTime) {
    const diff = nextPrayer.dateTime - now;
    if (diff > 0) {
      countdown = {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    }
  }

  return { prayerEvents, currentPrayer, nextPrayer, countdown };
};
