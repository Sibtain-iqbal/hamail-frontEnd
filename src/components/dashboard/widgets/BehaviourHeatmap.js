"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import BehaviourHeatmapDatePicker from "./BehaviourHeatmapDatePicker";
import CardIconTooltip from "./CardIconTooltip";

// Teal-based tile theme for heatmap
// Backend returns: "green" (disciplined 70+), "yellow" (mixed 40-69), "red" (emotional <40), "grey" (no trades)
const TILE_THEME = {
  grey: {
    bg: "rgba(0, 0, 0, 0.05)",
    border: "rgba(0, 0, 0, 0.10)",
  },
  red: {
    bg: "rgba(0, 191, 166, 0.30)",
    border: "rgba(0, 191, 166, 0.20)",
  },
  yellow: {
    bg: "rgba(0, 191, 166, 0.60)",
    border: "rgba(0, 191, 166, 0.20)",
  },
  green: {
    bg: "rgba(0, 191, 166, 0.90)",
    border: "rgba(0, 191, 166, 0.20)",
  },
};
// Teal-based tile theme for heatmap matching the design
const TILE_THEMEE = {
  grey: {
    bg: "#FFFFFF", // White for empty
    border: "transparent",
    text: "None",
  },
  red: {
    bg: "#A5F3E7", // Lightest teal (Low)
    border: "transparent",
    text: "Low",
  },
  yellow: {
    bg: "#2DD4BF", // Medium teal (Medium)
    border: "transparent",
    text: "Medium",
  },
  green: {
    bg: "#00BFA6", // Dark teal (High)
    border: "transparent",
    text: "High",
  },
};

// Get tile style for window - returns style object
const getTileStyle = (window) => {
  if (!window || window.score === null || window.score === undefined) {
    return TILE_THEME.grey;
  }

  // Determine color based on score if color not provided (for aggregated data)
  if (!window.color) {
    if (window.score >= 70) return TILE_THEME.green;
    if (window.score >= 40) return TILE_THEME.yellow;
    return TILE_THEME.red;
  }

  switch (window.color) {
    case "green":
      return TILE_THEME.green;
    case "yellow":
      return TILE_THEME.yellow;
    case "red":
      return TILE_THEME.red;
    case "grey":
    default:
      return TILE_THEME.grey;
  }
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper to get start of week (Monday)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Convert Sunday (0) to 7, then subtract 1 to get days to subtract
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.setDate(diff));
};

// Helper: Normalize date to midnight UTC
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Helper: Get ISO string for start/end of day/range
const getIsoString = (date, endOfDay = false) => {
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
};

// Helper to process windows data (normalize hours)
const processWindows = (windowsData) => {
  if (!windowsData || !Array.isArray(windowsData)) return [];

  return windowsData.map((window) => {
    if (window.startHour !== undefined && window.endHour !== undefined) {
      return window;
    }
    // Handle "09-12" id format
    if (window.id && window.id.includes("-")) {
      const [startHourStr, endHourStr] = window.id.split("-");
      const startHour = parseInt(startHourStr, 10);
      const endHour = parseInt(endHourStr, 10);
      return {
        ...window,
        startHour,
        endHour,
      };
    }
    return window;
  });
};

const HeatmapTile = ({
  window,
  tileStyle,
  isCurrentTimeBlock,
  hasNoTrades,
  isLoadingHistory,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex-1 min-w-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-full h-9 rounded-full cursor-pointer transition-all hover:opacity-80
          ${hasNoTrades ? "opacity-30" : ""}
          ${isLoadingHistory ? "opacity-50" : ""}
        `}
        style={{
          backgroundColor: tileStyle.bg,
          border: `1px solid ${tileStyle.border}`,
          boxShadow: isCurrentTimeBlock
            ? "0 0 0 2px rgba(0, 191, 166, 0.3), 0 0 8px rgba(0, 191, 166, 0.4)"
            : "none",
        }}
      />
      <AnimatePresence>
        {isHovered && window && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-1/2 -translate-x-1/2 mb-2 z-[100] pointer-events-none whitespace-normal min-w-[200px]"
          >
            <div className="bg-[#1A1A1A] bg-gradient-to-br  from-[#262626] to-[#1A1A1A] border border-white/10 rounded-xl p-3 shadow-2xl">
              <div className="text-white text-sm font-semibold mb-1">
                Score: {window.score}{" "}
                <span className="text-xs font-normal text-gray-400">
                  ({window.tradeCount} trades)
                </span>
              </div>
              <div className="text-gray-300 text-xs leading-relaxed">
                {window.message ||
                  (window.count > 1
                    ? `Average of ${window.count} sessions`
                    : "No specific insight")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function BehaviourHeatmap({
  hasNoTrades = false,
  fetchHistory = null,
}) {
  // Date range state
  const [dateRange, setDateRange] = useState(() => {
    // Default to current week (Mon-Sun)
    const today = new Date();
    const start = getStartOfWeek(today);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  });

  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch data when dateRange changes
  const fetchData = useCallback(async () => {
    if (!fetchHistory) return;

    setIsLoadingHistory(true);
    try {
      const startIso = getIsoString(dateRange.start);
      const endIso = getIsoString(dateRange.end, true);

      console.log("Fetching heatmap data for range:", startIso, endIso);
      const result = await fetchHistory(startIso, endIso);

      if (result) {
        // If result has a 'history' array, use it. Otherwise wrap single result if applicable.
        // Based on API snippet, result.history is the array.
        const history = result.history || (result.windows ? [result] : []);
        setHistoryData(history);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
      setHistoryData([]); // Reset on error
    } finally {
      setIsLoadingHistory(false);
    }
  }, [dateRange, fetchHistory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateChange = (newRange) => {
    // BehaviourHeatmapDatePicker returns { start, end } in range mode
    // If it returns a single date (old mode), handle it gracefully just in case
    if (newRange instanceof Date) {
      // Should not happen with mode="range", but fallback:
      const start = getStartOfWeek(newRange);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setDateRange({ start, end });
    } else {
      setDateRange(newRange);
    }
  };

  // Aggregation Logic
  // We want to aggregate data by (DayOfWeek, TimeSlot).
  // DayOfWeek: 0 (Mon) - 6 (Sun). Note: JS getDay() is 0=Sun. We want Mon=0.
  const aggregatedData = useMemo(() => {
    const map = new Map(); // Key: "dayIndex-startTime", Value: { totalScore, totalTrades, count, message, color }

    historyData.forEach((dayEntry) => {
      if (!dayEntry.date || !dayEntry.windows) return;

      const date = new Date(dayEntry.date);
      // Adjust JS getDay (0=Sun) to our 0=Mon system
      let dayIndex = date.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6; // Sunday

      const normalizedWindows = processWindows(dayEntry.windows);

      normalizedWindows.forEach((window) => {
        if (window.startHour === undefined) return;

        const timeKey = `${window.startHour.toString().padStart(2, "0")}:00`;
        const key = `${dayIndex}-${timeKey}`; // e.g., "0-09:00" for Mon 9am

        if (!map.has(key)) {
          map.set(key, {
            totalScore: 0,
            totalTrades: 0,
            count: 0,
            startHour: window.startHour,
            endHour: window.endHour,
            messages: [],
            colors: [],
          });
        }

        const agg = map.get(key);
        agg.totalScore += window.score || 0;
        agg.totalTrades += window.tradeCount || 0;
        agg.count += 1;
        // Store raw data to determine dominant color/message later if needed
        if (window.message) agg.messages.push(window.message);
        if (window.color) agg.colors.push(window.color);
      });
    });

    return map;
  }, [historyData]);

  // Helper to retrieve aggregated window for render
  const getAggregatedWindow = (dayIndex, timeSlotStart) => {
    // timeSlotStart format "HH:00"
    const key = `${dayIndex}-${timeSlotStart}`;
    const agg = aggregatedData.get(key);

    if (!agg) return null;

    const avgScore = Math.round(agg.totalScore / agg.count);

    // Determine color based on average score
    // Logic: >= 70 green, >= 40 yellow, < 40 red
    let color = "grey";
    if (avgScore >= 70) color = "green";
    else if (avgScore >= 40) color = "yellow";
    else color = "red";

    // Construct a window-like object
    return {
      score: avgScore,
      tradeCount: agg.totalTrades,
      color: color,
      count: agg.count, // Number of data points aggregated
      message:
        agg.count > 1
          ? `Avg. Score: ${avgScore}% over ${agg.count} sessions`
          : agg.messages[0] || "No Data",
      // preserve dimensions
      startHour: agg.startHour,
      endHour: agg.endHour,
    };
  };

  // Generate TIME_SLOTS (Standard 3h blocks)
  const TIME_SLOTS_LABELS = [
    "00:00-03:00",
    "03:00-06:00",
    "06:00-09:00",
    "09:00-12:00",
    "12:00-15:00",
    "15:00-18:00",
    "18:00-21:00",
    "21:00-00:00",
  ];

  // Helper to get current time block
  const getCurrentTimeBlock = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const blockStart = Math.floor(currentHour / 3) * 3;
    const blockEnd = blockStart + 3 === 24 ? 0 : blockStart + 3;
    const startStr = blockStart.toString().padStart(2, "0");
    const endStr = blockEnd === 0 ? "00" : blockEnd.toString().padStart(2, "0");
    return `${startStr}:00-${endStr}:00`;
  };

  const currentTimeBlock = getCurrentTimeBlock();
  const today = new Date();
  const currentDayIndex = today.getDay() - 1 === -1 ? 6 : today.getDay() - 1;

  // Render variables
  // If range is > 7 days, we still show Mon-Sun columns.
  // The 'date' for the header isn't a single date anymore.
  // We can just show "Mon", "Tue"...
  // Or, if range is < 7 days, show the specific dates?
  // Let's stick to Mon-Sun headers. If detailed view is needed, we could add dates back.
  // For arbitrary range, "Mon" means "Every Monday in range".

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#E8F2F3] rounded-[20px] p-4 sm:p-5  border border-[#FFFFFF] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-between gap-3 w-full ">
          <h3
            className={`text-[18px] font-semibold ${
              hasNoTrades ? "text-[#363636]" : "text-[#363636]"
            }`}
          >
            Behaviour Heatmap
          </h3>
          <CardIconTooltip
            title="Behaviour Heatmap"
            tooltipText="Maps your trading behaviour across days and time blocks, highlighting periods of high activity, hesitation, overtrading, or emotional triggers. Useful for spotting when you're most likely to excel or fall into patterns."
            position="bottom"
          >
            <div
              className={`w-10 h-10 rounded-full text-[#363636] flex items-center justify-center border border-[#FFFFFF] ${
                hasNoTrades ? "bg-[#F2F7F7]" : "bg-[#F2F7F7]"
              }`}
            >
              {/* <Squares2X2Icon
                className={`w-5 h-5 ${
                  hasNoTrades ? "text-gray-400" : "text-teal-600"
                }`}
              /> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                color="#363636"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </div>
          </CardIconTooltip>
        </div>
        {/* {!hasNoTrades && (
          <BehaviourHeatmapDatePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            mode="range"
            onDateChange={handleDateChange}
          />
        )} */}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Weekly Grid View */}
        <div className="w-full flex-1 flex flex-col pb-2 min-[1930px]:items-center">
          {/* Header row with days */}
          <div className="flex gap-15 mb-2 w-full">
            <div className="w-[70px] "></div>
            <div className="flex gap-1 sm:gap-1 flex-1 min-w-0">
              {DAYS.map((dayName, index) => (
                <div
                  key={dayName}
                  className={`flex-1 min-w-0 text-center text-[10px] text-[#636363]`}
                >
                  {dayName}
                </div>
              ))}
            </div>
          </div>

          {/* Time slots with heatmap cells */}
          <div className="flex- flex flex-col justify-between  w-full">
            {TIME_SLOTS_LABELS.map((timeRange) => {
              const startTime = timeRange.split("-")[0]; // e.g. "09:00"
              const shortLabel = timeRange.replace(/:00/g, ""); // "00-03"

              return (
                <div
                  key={timeRange}
                  className="flex items-center  gap-1 sm:gap-2 h- w-full"
                >
                  <div
                    className={`w-16 flex-shrink-0 text-[10px] sm:text-xs whitespace-nowrap`}
                  >
                    <span className="flex-1 min-w-0  text-center text-[10px] py-1 text-[#636363]">
                      {timeRange}
                    </span>
                  </div>
                  <div className="flex gap-1 sm:gap-1 flex-1 min-w-0 h-full">
                    {DAYS.map((_, dayIndex) => {
                      const window = getAggregatedWindow(dayIndex, startTime);
                      const isCurrentDay = dayIndex === currentDayIndex;
                      const isCurrent =
                        isCurrentDay && timeRange === currentTimeBlock;
                      const tileStyle = getTileStyle(window);
                      const cellKey = `${dayIndex}-${timeRange}`;

                      return (
                        <HeatmapTile
                          key={cellKey}
                          window={window}
                          tileStyle={tileStyle}
                          isCurrentTimeBlock={isCurrent}
                          hasNoTrades={hasNoTrades}
                          isLoadingHistory={isLoadingHistory}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border mt-2 border-[#FFFFFF]"></div>
      </div>
      {/* {hasNoTrades && ( */}
        <div className="mt-4 flex items-center justify-between px-2">
          {Object.entries(TILE_THEMEE).map(([key, style]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: style.bg,
                  border:
                    style.border !== "transparent"
                      ? `1px solid ${style.border}`
                      : "none",
                }}
              />
              <span className="text-sm font-medium text-gray-600">
                {style.text}
              </span>
            </div>
          ))}
        </div>
      {/* )} */}
    </motion.div>
  );
}
