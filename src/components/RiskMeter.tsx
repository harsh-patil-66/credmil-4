import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number;
  riskLevel: string;
}

export function RiskMeter({ score, riskLevel }: RiskMeterProps) {
  // Calculate percentage for progress bar (300-900 range)
  const percentage = ((score - 300) / 600) * 100;

  // Determine color based on score
  const getColorClass = () => {
    if (score >= 760) return "text-green-600 dark:text-green-500";
    if (score >= 660) return "text-lime-600 dark:text-lime-500";
    if (score >= 540) return "text-yellow-600 dark:text-yellow-500";
    if (score >= 420) return "text-orange-600 dark:text-orange-500";
    return "text-red-600 dark:text-red-500";
  };

  const getBarColor = () => {
    if (score >= 760) return "bg-green-500";
    if (score >= 660) return "bg-lime-500";
    if (score >= 540) return "bg-yellow-500";
    if (score >= 420) return "bg-orange-500";
    return "bg-red-500";
  };

  // Risk ranges for display
  const riskRanges = [
    { min: 760, max: 900, label: "Very Low Risk", emoji: "🟢", color: "text-green-600 dark:text-green-500" },
    { min: 660, max: 759, label: "Low Risk", emoji: "🟩", color: "text-lime-600 dark:text-lime-500" },
    { min: 540, max: 659, label: "Medium Risk", emoji: "🟨", color: "text-yellow-600 dark:text-yellow-500" },
    { min: 420, max: 539, label: "High Risk", emoji: "🟧", color: "text-orange-600 dark:text-orange-500" },
    { min: 300, max: 419, label: "Very High Risk", emoji: "🔴", color: "text-red-600 dark:text-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Score Display */}
      <div className="text-center space-y-2">
        <div className={cn("text-6xl font-bold", getColorClass())}>
          {score}
        </div>
        <div className="text-lg font-semibold text-muted-foreground">
          Credit Risk Score
        </div>
        <div className={cn("text-2xl font-bold", getColorClass())}>
          {riskLevel}
        </div>
      </div>

      {/* Visual Meter */}
      <div className="space-y-2">
        <div className="relative h-6 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className={cn("absolute top-0 left-0 h-6 rounded-full transition-all", getBarColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>300</span>
          <span>600</span>
          <span>900</span>
        </div>
      </div>

      {/* Risk Range Legend */}
      <div className="space-y-2 pt-4 border-t">
        <h3 className="text-sm font-semibold mb-3">Risk Level Ranges</h3>
        {riskRanges.map((range) => (
          <div 
            key={range.min}
            className={cn(
              "flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
              score >= range.min && score <= range.max ? "bg-accent" : "bg-muted/30"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{range.emoji}</span>
              <span className={cn("font-medium", score >= range.min && score <= range.max ? range.color : "text-muted-foreground")}>
                {range.label}
              </span>
            </div>
            <span className="text-muted-foreground">
              {range.min} – {range.max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

