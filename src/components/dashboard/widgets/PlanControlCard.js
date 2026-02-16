"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChartBarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function PlanControlCard({
  percentage = 78,
  tradesOutsidePlan = 2,
  message,
  hasNoTrades = false,
  tradeScores = [],
  tradesAnalyzed = 0,
  trades = [],
}) {
  // Calculate scores and stats from trades if tradeScores is missing
  const { calculatedScores, dayLabels, calculatedPercentage, calculatedTradesOutsidePlan } = useMemo(() => {
    const days = [];
    const scores = [];
    const today = new Date();
    
    // Global stats calculation from trades
    let totalScore = 0;
    let outsidePlanCount = 0;

    if (trades.length > 0) {
      trades.forEach((t) => {
        // Count outside plan
        if (t.exitedEarly === true || t.exitedEarly === "true") {
          outsidePlanCount++;
        }

        // Calculate score (0-100 basis)
        let score = 0;
        const tradeScore = Number(t.score);
        if (!isNaN(tradeScore)) {
          score = tradeScore;
        } else {
          // Fallback: 5 points max, -3 for early exit. Convert to 0-100.
          let s = 5;
          if (t.exitedEarly === true || t.exitedEarly === "true") {
            s -= 3;
          }
          score = Math.max(0, s) * 20;
        }
        totalScore += score;
      });
    }
    
    const pct = trades.length > 0 ? Math.round(totalScore / trades.length) : 0;

    // Generate current week (Sunday to Saturday)
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    const weekLabels = ["S", "M", "T", "W", "T", "F", "S"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(weekLabels[i]);

      // Always calculate scores from trades if available
      const dayTrades = trades.filter((t) => {
        const time = t.entryTime || t.createdAt || t.entry_time || t.created_at || t.date;
        if (!time) return false;
        const tDate = new Date(time);
        return (
          tDate.getDate() === d.getDate() &&
          tDate.getMonth() === d.getMonth() &&
          tDate.getFullYear() === d.getFullYear()
        );
      });

      if (dayTrades.length === 0) {
        scores.push(0);
      } else {
        const dailyTotal = dayTrades.reduce((acc, t) => {
          // If trade has a score (0-100) from backend (like Heatmap), map it to 0-5
          const tradeScore = Number(t.score);
          if (!isNaN(tradeScore)) {
             return acc + (tradeScore / 20);
          }
          // Fallback to local calculation
          let score = 5;
          // Handle boolean or string 'true'
          const exitedEarly = t.exitedEarly === true || t.exitedEarly === "true" || t.exited_early === true || t.exited_early === "true";
          if (exitedEarly) score -= 3;
          return acc + Math.max(0, score);
        }, 0);
        scores.push(Math.round(dailyTotal / dayTrades.length));
      }
    }
    return { 
      calculatedScores: scores, 
      dayLabels: days,
      calculatedPercentage: pct,
      calculatedTradesOutsidePlan: outsidePlanCount
    };
  }, [trades]);

  // Mock data to match the design image if no scores provided
  // Pattern: S:2, M:3, T:4, W:2, T:3, F:4, S:2
  const defaultScores = [2, 3, 4, 2, 3, 4, 2];
  
  const displayScores =
    trades.length > 0
      ? calculatedScores
      : tradeScores.length > 0
      ? tradeScores
      : hasNoTrades
      ? [0, 0, 0, 0, 0, 0, 0]
      : defaultScores;

  const displayPercentage = 
    tradeScores.length > 0 
      ? percentage 
      : trades.length > 0 
      ? calculatedPercentage 
      : 0;

  const displayTradesOutside = 
    tradeScores.length > 0 
      ? tradesOutsidePlan 
      : trades.length > 0 
      ? calculatedTradesOutsidePlan 
      : 0;

  const days = dayLabels.length === 7 ? dayLabels : ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative flex flex-col p-6 overflow-visible border border-[#fff] shadow-sm group/plan"
      style={{
        // width: "328px",
       
        borderRadius: "20px",
        backgroundColor: "#E8F2F3", // Light minty background from image
        borderColor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-[#363636]">Plan Control</h3>
        <div className="relative flex items-center gap-2 bg-[#F2F7F7] px-3 py-3 rounded-full text-xs font-normal text-[#363636] border border-[#FFFFFF] transition-colors hover:bg-[#EEF6F6]">
          <select
            defaultValue="Today"
            className="appearance-none bg-transparent pr-6 text-xs text-[#363636] font-normal leading-none outline-none"
          >
            <option value="Today">Today</option>
            <option value="1w">1 Week</option>
            <option value="2w">2 Weeks</option>
            <option value="1m">1 Month</option>
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#363636]"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Main Stats */}
      <div className="flex items-center gap-3 mt-2">
        <div className="text-[32px] font-medium text-[#363636] tracking-tight">
          {displayPercentage}%
        </div>
      </div>

      {/* Message */}
     

      {/* Dot Chart */}
      <div className="flex justify-between items-end mt-4">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="flex flex-col items-center gap-3">
            <div className="flex flex-col gap-1.5">
              {[...Array(5)].map((_, i) => {
                // Stack from bottom (4 is top, 0 is bottom in visual, but in DOM 0 is top)
                // We want 5 dots. 
                // If score is 3, bottom 3 are filled.
                // DOM order: Top -> Bottom.
                // So indices 0,1 should be empty. 2,3,4 filled.
                // Index < (5 - score) ? empty : filled
                const isFilled = i >= 5 - (displayScores[dayIndex] || 0);
                return (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      isFilled ? "bg-[#00BFA6]" : "bg-white"
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}



