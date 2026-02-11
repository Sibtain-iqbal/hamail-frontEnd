"use client";
import { motion } from "framer-motion";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import CardIconTooltip from "./CardIconTooltip";

const DEFAULT_CATEGORIES = [
  "Impulsiveness",
  "Consistency",
  "Discipline",
  "Aggression",
  "Hesitation",
];

const TRAIT_COLORS = {
  Impulsiveness: "#F59E0B",
  Consistency: "#00BFA6",
  Discipline: "#2563EB",
  Aggression: "#EF4444",
  Hesitation: "#6B7280",
};

const KEY_MAPPING = {
  impulseControl: "Impulsiveness",
  emotionalVolatility: "Emotional Volatility",
  aggression: "Aggression",
  hesitation: "Hesitation",
  discipline: "Discipline",
  consistency: "Consistency",
  Impulsiveness: "Impulsiveness",
  Consistency: "Consistency",
  Discipline: "Discipline",
  Aggression: "Aggression",
  Hesitation: "Hesitation",
};

// Mock data for initial render or fallback
const getMockData = () => {
  return {
    Impulsiveness: 20,
    Consistency: 30,
    Discipline: 10,
    Aggression: 20,
    Hesitation: 20,
  };
};

export default function PsychologicalStateDistribution({
  data = null,
  hasNoTrades = false,
}) {
  const sourceData = data || (hasNoTrades ? null : getMockData());

  let categories = DEFAULT_CATEGORIES;

  if (sourceData && Object.keys(sourceData).length > 0) {
    categories = Object.keys(sourceData)
      // ❌ emotionalVolatility ko completely ignore
      .filter((key) => key !== "emotionalVolatility")
      .sort((a, b) => {
        const labelA = KEY_MAPPING[a] || a;
        const labelB = KEY_MAPPING[b] || b;
        const indexA = DEFAULT_CATEGORIES.indexOf(labelA);
        const indexB = DEFAULT_CATEGORIES.indexOf(labelB);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
  }

  const formatLabel = (key) => {
    if (KEY_MAPPING[key]) return KEY_MAPPING[key];

    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-[#E8F2F3] border border-[#FFFFFF] rounded-[20px] p-[20px] h-full flex flex-col relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative">
        <h3 className="text-[18px] font-[500] text-[#363636]">
          Psychological Traits
        </h3>

        <CardIconTooltip
          title="Psychological Traits"
          tooltipText="Breaks down your real-time psychological profile across traits. Gives a clear snapshot of which tendencies are currently driving your decisions."
        >
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F2F7F7] border border-[#FFFFFF] transition-colors ">
            <EllipsisHorizontalIcon className="w-6 h-6 text-gray-500 rotate-90" />
          </button>
        </CardIconTooltip>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-2 flex-1 justify-center relative z-10">
        {categories.map((category, index) => {
          const rawValue = hasNoTrades
            ? 0
            : sourceData?.[category] || 0;

          const value = Math.min(100, Math.max(0, rawValue));

          return (
            <div key={category} className="flex items-center gap-3">
              <span className="w-28 text-[12px] font-medium text-gray-600">
                {formatLabel(category)}
              </span>

              <div className="flex-1 h-5 bg-[#F2F7F7] border border-white rounded-full overflow-hidden shadow-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.2 + index * 0.1,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: TRAIT_COLORS[formatLabel(category)] || "#9CA3AF",
                  }}
                />
              </div>

              <span className="w-12 text-right text-[12px] font-[500] text-[#636363]">
                {value}%
              </span>
            </div>
          );
        })}
      </div>

      {/* No Trades Overlay */}
      {hasNoTrades && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] z-20 rounded-[24px]">
          <div className="text-center bg-white/80 px-6 py-4 rounded-xl shadow-sm border border-white/50">
            <p className="text-sm font-medium text-gray-500">
              Complete trades to see your profile
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
