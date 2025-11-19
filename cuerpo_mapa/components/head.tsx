"use client";

import { format, parseISO } from "date-fns";

type EventItem = {
  date: string;
  title: string;
  description: string;
};

type TimelineGroup = {
  label: string;
  color: string;
  events: EventItem[];
};

const generateMonthlyTicks = (start: Date, end: Date) => {
  const ticks: Date[] = [];
  const totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  for (let i = 0; i <= totalMonths; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    ticks.push(d);
  }
  return ticks;
};

const startDate = new Date("2020-01-01");
const endDate = new Date("2025-12-31");
const ticks = generateMonthlyTicks(startDate, endDate);

const TIMELINE_WIDTH_PER_MONTH = 120;

const getMonthIndex = (date: string) => {
  const d = parseISO(date);
  return (
    (d.getFullYear() - startDate.getFullYear()) * 12 +
    (d.getMonth() - startDate.getMonth())
  );
};

const getPixelPositionFromIndex = (monthIndex: number) =>
  monthIndex * TIMELINE_WIDTH_PER_MONTH;

const timelineGroups: TimelineGroup[] = [
  {
    label: "1",
    color: "bg-blue-600",
    events: [
      { date: "2020-03-15", title: "Founded", description: "Our company was established." },
      { date: "2021-11-12", title: "Funding Round", description: "Secured Series A investment." },
      { date: "2023-09-18", title: "Rebrand", description: "Launched new identity." },
    ],
  },
  {
    label: "2",
    color: "bg-red-600",
    events: [
      { date: "2020-09-10", title: "Beta Launch", description: "Invited first users." },
      { date: "2022-01-10", title: "Major Update", description: "Improved UX and features." },
      { date: "2025-03-01", title: "Global Rollout", description: "Product available worldwide." },
    ],
  },
  {
    label: "3",
    color: "bg-purple-600",
    events: [
      { date: "2021-03-09", title: "1K Users", description: "Steady organic growth." },
      { date: "2023-07-21", title: "100K Users", description: "Huge adoption milestone." },
      { date: "2025-09-15", title: "1M Users", description: "Global milestone reached." },
    ],
  },
];

export default function HeadSketch() {
  const timelineWidth = ticks.length * TIMELINE_WIDTH_PER_MONTH;

  return (
    <div className="w-full h-full overflow-hidden p-6">
      <div className="flex w-full h-full">

        {/* LEFT LABELS */}
        <div className="flex flex-col h-full pr-4 text-white">
          {timelineGroups.map((group, idx) => (
            <div key={idx} className="flex-1 flex items-center justify-end">
              <span className="font-semibold text-sm">{group.label}</span>
            </div>
          ))}
        </div>

        {/* SCROLL AREA */}
        <div className="relative flex-1 overflow-x-auto no-scrollbar pb-20">
          <div className="relative" style={{ width: timelineWidth, height: "100%" }}>

            {/* PRIMARY TIMELINE LINE */}
            <div className="absolute top-0 left-0 right-0 h-[5px] bg-blue-300 rounded-full" />

            {/* MONTH + YEAR TICKS */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {ticks.map((d, idx) => {
                const x = getPixelPositionFromIndex(idx);
                const isJan = d.getMonth() === 0;
                return (
                  <div
                    key={idx}
                    className="absolute flex flex-col items-center text-black"
                    style={{
                      left: x,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {/* year ABOVE big line */}
                    {isJan && (
                      <span className="text-xs font-bold">{format(d, "yyyy")}</span>
                    )}

                    {/* vertical tick */}
                    <div className="w-[2px] h-4 bg-blue-400" />

                    {/* month BELOW */}
                    <span
                      className={`text-[13px] mt-1 ${
                        isJan ? "font-semibold text-gray-700" : "text-blue-500"
                      }`}
                    >
                      {format(d, "MMM")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ROWS + EVENTS */}
            <div className="flex flex-col h-full pt-10">
              {timelineGroups.map((group, rowIdx) => (
                <div key={rowIdx} className="relative flex-1 flex items-center">

                  {/* ROW LINE */}
                  <div className="absolute left-0 right-0 h-[2px] bg-gray-700 rounded-full" />

                  {group.events.map((evt, idx) => {
                    const x = getPixelPositionFromIndex(getMonthIndex(evt.date));

                    return (
                      <div
                        key={idx}
                        className="absolute -translate-x-1/2"
                        style={{ left: x }}
                      >
                        {/* HOVER GROUP */}
                        <div className="relative flex flex-col items-center group cursor-pointer z-20">

                          {/* Dot */}
                          <div className={`w-3 h-3 rounded-full ${group.color} mb-2`} />

                          {/* Card ABOVE LINE */}
                          <div
                            className={`
                              bg-white text-black rounded-lg shadow-md border p-3 w-60 text-center
                              transition-all duration-300
                              pointer-events-auto
                            `}
                            style={{ transform: "translateY(-8px)" }}
                          >
                            <h3 className="text-m font-semibold mb-1">{evt.title}</h3>
                            <p className="text-gray-800 text-[14px]">{evt.date}</p>

                            {/* EXPANDING DESCRIPTION ONLY */}
                            <div
                              className={`
                                overflow-hidden max-h-0 opacity-0 
                                group-hover:max-h-[400px] group-hover:opacity-100
                                transition-all duration-500
                              `}
                            >
                              <div className="mt-2 pt-2 border-t text-[14px] leading-tight">
                                {evt.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
