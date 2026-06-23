import { Card } from "./ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function SummaryCard({
  label,
  value,
  change,
  up,
  icon: Icon,
  color,
}) {
  return (
    <Card className="p-5 flex items-center gap-5">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${color}`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wider">
          {label}
        </div>
        <div className="font-title text-2xl font-bold mt-1 font-mono">
          {value}
        </div>
        {change != null && (
          <div
            className={`flex items-center gap-1 mt-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-rose-500"}`}
          >
            {up ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change}
          </div>
        )}
      </div>
    </Card>
  );
}
