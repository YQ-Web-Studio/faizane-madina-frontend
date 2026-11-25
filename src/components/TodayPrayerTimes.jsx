import React, { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { FiSunset, FiSun } from "react-icons/fi";
import {
  formatTo24HourDisplay,
  getPrayerScheduleState,
} from "../utils/prayerSchedule";
import "./TodayPrayerTimes.css";

const TEXT = {
  islamicDateUnavailable: "Islamic date unavailable",
  unavailable: "Today's prayer times are unavailable. Please try again later.",
  tomorrow: " (Tomorrow)",
  inLabel: " in:",
  finished: "All prayers for today finished.",
  start: "Start",
  jamaat: "Jamaat"
};

function TodayPrayerTimes({ prayerData }) {
  const [now, setNow] = useState(new Date());
  const todayDate = now.getDate();
  const isFriday = now.getDay() === 5;
  const [islamicDate, setIslamicDate] = useState("");

  // 1. Create a fake "yesterday" date just for the Islamic API
  const adjustedDate = new Date(now);
  {/*adjustedDate.setDate(adjustedDate.getDate() - 1); */}

  // 2. Format that adjusted date for the API
  const apiDateString = `${adjustedDate.getDate()}-${adjustedDate.getMonth() + 1}-${adjustedDate.getFullYear()}`;

  useEffect(() => {
    async function fetchIslamicDate() {
      try {
        // 3. Fetch using the adjusted string (removed the buggy adjustment parameter)
        const islamicDateResponse = await fetch(
          `https://api.aladhan.com/v1/gToH?date=${apiDateString}`,
        );
        if (!islamicDateResponse.ok) {
          throw new Error(
            `Islamic Date HTTP error! status: ${islamicDateResponse.status}`,
          );
        }
        const islamicDateApiData = await islamicDateResponse.json();

        if (islamicDateApiData.code === 200 && islamicDateApiData.data?.hijri) {
          const hijri = islamicDateApiData.data.hijri;
          setIslamicDate(`${hijri.day} ${hijri.month.en} ${hijri.year}`);
        } else {
          console.warn("Could not retrieve Islamic date:", islamicDateApiData);
          setIslamicDate(TEXT.islamicDateUnavailable);
        }
      } catch (e) {
        console.error("Failed to fetch Islamic date:", e);
        setIslamicDate(TEXT.islamicDateUnavailable);
      }
    }
    fetchIslamicDate();
  }, [apiDateString]); // Now safely only runs once per day

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedGregorianDate = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todaysTimes = prayerData?.find((day) => day.date === todayDate);

  // We will build the bottom section conditionally based on if we have data
  let mainContent;

  if (!prayerData || !todaysTimes) {
    mainContent = (
      <div className="placeholder-message">
        <p>{TEXT.unavailable}</p>
      </div>
    );
  } else {
    // --- Calculate Current/Next Prayer and Countdown ---
    const { currentPrayer, nextPrayer, countdown } = getPrayerScheduleState(
      todaysTimes,
      now
    );

    const formatTime = (time) => time.toString().padStart(2, "0");

    const displayPrayers = [
      { name: "Fajr", icon: <FaMoon />, ...todaysTimes.fajr },
      {
        name: isFriday ? "Jummah" : "Dhuhar",
        icon: <FaSun />,
        ...todaysTimes.dhuhar,
        jamaat: todaysTimes.dhuhar?.jamaat,
      },
      { name: "Asr", icon: <FiSun />, ...todaysTimes.asr },
      {
        name: "Maghrib",
        icon: <FiSunset />,
        ...todaysTimes.maghrib,
        jamaat: todaysTimes.maghrib?.start,
      },
      { name: "Isha", icon: <FaMoon />, ...todaysTimes.isha },
    ];

    mainContent = (
      <>
        <div className="countdown-section">
          {nextPrayer?.dateTime && nextPrayer.dateTime - now > 0 ? (
            <>
              <p>
                {nextPrayer.name}{" "}
                {nextPrayer.type.replace("Start", "").replace("Event", "")}
                {nextPrayer.isTomorrow ? TEXT.tomorrow : ""}{TEXT.inLabel}
              </p>{" "}
              <div className="countdown-timer">
                <span>{formatTime(countdown.hours)}</span>:
                <span>{formatTime(countdown.minutes)}</span>:
                <span>{formatTime(countdown.seconds)}</span>
              </div>
            </>
          ) : (
            <p>{TEXT.finished}</p>
          )}
        </div>

        <div className="prayers-list">
          {displayPrayers.map((prayer) => (
            <div
              key={prayer.name}
              className={`prayer-row ${
                currentPrayer?.name === prayer.name ||
                (isFriday &&
                  currentPrayer?.name === "Jummah" &&
                  prayer.name === "Jummah")
                  ? "is-current"
                  : ""
              }`}
            >
              <div className="prayer-info">
                <span className="prayer-icon">{prayer.icon}</span>
                <span className="prayer-name">{prayer.name}</span>
              </div>
              <div className="prayer-times">
                <div className="time-block">
                  <span className="time-label">{TEXT.start}</span>
                  <span className="time-value">
                    {formatTo24HourDisplay(prayer.start, prayer.name)}
                  </span>
                </div>
                <div className="time-block">
                  <span className="time-label">{TEXT.jamaat}</span>
                  <span className="time-value">
                    {isFriday &&
                    prayer.name === "Jummah" &&
                    prayer.jamaat?.includes("/")
                      ? prayer.jamaat
                          .split("/")
                          .map((t) => formatTo24HourDisplay(t.trim(), "Jummah"))
                          .join(" / ")
                      : formatTo24HourDisplay(prayer.jamaat, prayer.name)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="today-times-container">
      {/* Dates are now outside the early return so they ALWAYS render */}
      <div className="current-date-section">
        <p>{formattedGregorianDate}</p>
        {islamicDate && <p className="islamic-date">{islamicDate}</p>}
      </div>

      {/* This renders either the placeholder or the times/countdown */}
      {mainContent}
    </div>
  );
}

export default TodayPrayerTimes;
