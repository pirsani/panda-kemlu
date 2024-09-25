"use client";
import { useState } from "react";
import BarChart from "./bar-chart";

export const ChartContainer = () => {
  const [chartData, setChartData] = useState({
    labels: ["Pagu", "Pembayaran", "Belum dibayar", "Sisa"],
    values: [30, 50, 70, 40],
  });
  return (
    <div className="rounded-t-sm w-full h-5/6">
      <h1 className="text-lg bg-green-600 p-2 rounded-t-sm text-white">
        Realisasi
      </h1>
      <div className="h-[300px]">
        <BarChart
          labels={chartData.labels}
          values={chartData.values}
          label="Realisasi"
        />
      </div>
    </div>
  );
};

export default ChartContainer;
