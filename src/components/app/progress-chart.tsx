"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ProgressChart({ data }: { data: Array<{ name: string; score: number; accuracy: number }> }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-[#dfe3d7] text-sm text-[#6f7468]">Complete a session to start an improvement trend.</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -24, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid stroke="#edf0e8" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="accuracy" stroke="#0f7a5f" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="score" stroke="#1f2937" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
