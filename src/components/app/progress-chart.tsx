"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ProgressChart({ data }: { data: Array<{ name: string; score: number; accuracy: number }> }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">Complete a session to start an improvement trend.</div>;
  }

  return (
    <div className="h-64 min-h-64 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -24, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="accuracy" stroke="var(--accent)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="score" stroke="var(--foreground)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
