'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { ChartBarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// -------------------- Date Helpers --------------------

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - ((day + 6) % 7);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// -------------------- Transform Real Data --------------------

const transformTradesToChartData = (trades, startDate, endDate) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const start = new Date(startDate);

  return days.map((dayLabel, idx) => {
    const currentDay = new Date(start);
    currentDay.setDate(start.getDate() + idx);

    const dayTrades = trades.filter((t) => {
      const tDate = new Date(
        t.entryTime || t.open_time || t.close_time || t.date || t.createdAt
      );
      return isSameDay(tDate, currentDay);
    });

    if (dayTrades.length === 0) {
      return {
        name: dayLabel,
        calm: null,
        focused: null,
        impulsive: null,
        emotional: null,
      };
    }

    const total = dayTrades.length;
    const wins = dayTrades.filter((t) => (Number(t.pnl) || 0) > 0).length;
    const losses = total - wins;
    const earlyExits = dayTrades.filter(
      (t) =>
        t.exitedEarly === true ||
        t.exitedEarly === 'true' ||
        t.exited_early === true ||
        t.exited_early === 'true'
    ).length;

    const impulsive = Math.min(100, Math.round((earlyExits / total) * 100));
    const focused = Math.round((wins / total) * 100);
    const emotional = Math.round((losses / total) * 100);
    const calm = Math.max(0, 100 - total * 8);

    return {
      name: dayLabel,
      calm,
      focused,
      impulsive,
      emotional,
    };
  });
};

// -------------------- Component --------------------

export default function PsychologicalStabilityTrend({ trades = [] }) {
  const [dateRange, setDateRange] = useState({
    start: getStartOfWeek(new Date()),
    end: getEndOfWeek(new Date()),
  });

  const chartData = useMemo(
    () => transformTradesToChartData(trades, dateRange.start, dateRange.end),
    [trades, dateRange]
  );

  const isEmptyWeek = chartData.every(
    (d) => d.calm === null && d.focused === null && d.impulsive === null && d.emotional === null
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-[20px] p-6 h-full flex flex-col bg-gradient-to-r from-[#E6F6F6] to-[#EAEFF1] border border-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-800">
          Psychological Stability Trend
        </h3>
        <button className="flex items-center gap-2 bg-[#F2F7F7] px-4 py-1.5 rounded-full text-xs font-normal text-[#363636] border border-[#FFFFFF] transition-colors">
          Today <ChevronDownIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[160px] relative">
        {isEmptyWeek && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <ChartBarIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No trend data available</p>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} stroke="#AAAAAA66" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              hide={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              ticks={[0, 33, 66, 100]}
              tickFormatter={(value) => {
                if (value >= 95) return '6AM';
                if (value >= 60) return '9AM';
                if (value >= 30) return '12PM';
                return '3PM';
              }}
            />
            <Tooltip
              cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg z-50">
                      <p className="text-sm font-medium text-gray-900 mb-1">{data.name}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          Calm: <span className="font-medium text-gray-700">{data.calm ?? '-'}</span>
                        </p>
                        <p className="text-xs text-[#7DD3FC]">
                          Focused: <span className="font-medium text-gray-700">{data.focused ?? '-'}</span>
                        </p>
                        <p className="text-xs text-[#2DD4BF]">
                          Impulsive: <span className="font-medium text-gray-700">{data.impulsive ?? '-'}</span>
                        </p>
                        <p className="text-xs text-[#0D9488]">
                          Emotional: <span className="font-medium text-gray-700">{data.emotional ?? '-'}</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Line type="natural" dataKey="calm" stroke="#FFFFFF" strokeWidth={3} dot={false} connectNulls />
            <Line type="natural" dataKey="focused" stroke="#A5F3FC" strokeWidth={3} dot={false} connectNulls />
            <Line type="natural" dataKey="impulsive" stroke="#2DD4BF" strokeWidth={3} dot={false} connectNulls />
            <Line type="natural" dataKey="emotional" stroke="#0D9488" strokeWidth={3} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-200"></div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">Calm</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#A5F3FC]"></div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">Focused</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]"></div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">Impulsive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"></div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">Emotional</span>
        </div>
      </div>
    </motion.div>
  );
}