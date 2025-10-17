import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

export default function Explainability() {
  // Global SHAP feature importance
  const globalShapData = [
    { feature: "Credit Score", importance: 0.28, direction: "positive" },
    { feature: "Debt-to-Income Ratio", importance: 0.22, direction: "negative" },
    { feature: "Income", importance: 0.18, direction: "positive" },
    { feature: "Employment Length", importance: 0.12, direction: "positive" },
    { feature: "Age", importance: 0.08, direction: "positive" },
    { feature: "Number of Credit Lines", importance: 0.07, direction: "negative" },
    { feature: "Recent Inquiries", importance: 0.05, direction: "negative" },
  ];

  // Local explanation for a sample applicant
  const localExplanation = [
    { feature: "Credit Score (720)", impact: 0.15, direction: "positive" },
    { feature: "Debt Ratio (0.35)", impact: -0.08, direction: "negative" },
    { feature: "Income ($65,000)", impact: 0.12, direction: "positive" },
    { feature: "Employment (5 years)", impact: 0.06, direction: "positive" },
    { feature: "Age (35)", impact: 0.04, direction: "positive" },
  ];

  const sampleApplicant = {
    name: "Sample Applicant #1234",
    prediction: "Low Risk",
    probability: 0.12,
    risk_score: 88,
  };

  const getBarColor = (direction: string) => {
    return direction === "positive" ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))";
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Model Explainability</h1>
        <p className="text-muted-foreground">
          Understand how the model makes predictions using SHAP and LIME
        </p>
      </div>

      {/* Info Banner */}
      <Card className="p-4 mb-8 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">About Explainability</h3>
            <p className="text-sm text-muted-foreground">
              SHAP (SHapley Additive exPlanations) values show how much each feature contributes to pushing the model output from the base value to the final prediction. Positive values increase default risk, negative values decrease it.
            </p>
          </div>
        </div>
      </Card>

      {/* Global Feature Importance */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Global Feature Importance (SHAP)</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Average impact of each feature across all predictions
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={globalShapData} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" className="text-xs" />
            <YAxis type="category" dataKey="feature" className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {globalShapData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.direction)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            <span className="text-muted-foreground">Reduces Default Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: "hsl(var(--chart-5))" }} />
            <span className="text-muted-foreground">Increases Default Risk</span>
          </div>
        </div>
      </Card>

      {/* Local Explanation */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Local Explanation (LIME)</h2>
            <p className="text-sm text-muted-foreground">
              Individual prediction breakdown for {sampleApplicant.name}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {sampleApplicant.prediction}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              Default Probability: {(sampleApplicant.probability * 100).toFixed(1)}%
            </p>
            <p className="text-sm font-semibold mt-1">
              Risk Score: {sampleApplicant.risk_score}/100
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {localExplanation.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.direction === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{item.feature}</span>
                </div>
                <span className={`font-semibold ${item.impact > 0 ? "text-green-600" : "text-red-600"}`}>
                  {item.impact > 0 ? "+" : ""}{item.impact.toFixed(3)}
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute h-full ${item.impact > 0 ? "bg-green-500" : "bg-red-500"}`}
                  style={{
                    width: `${Math.abs(item.impact) * 100}%`,
                    left: item.impact < 0 ? `${50 - Math.abs(item.impact) * 100}%` : "50%",
                  }}
                />
                <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Interpretation</h3>
          <p className="text-sm text-muted-foreground">
            This applicant has a <strong className="text-foreground">low default risk</strong> primarily due to a good credit score (720) and stable income ($65,000). The debt-to-income ratio of 0.35 slightly increases risk but is offset by positive factors. The model predicts only a {(sampleApplicant.probability * 100).toFixed(1)}% probability of default.
          </p>
        </div>
      </Card>
    </div>
  );
}
