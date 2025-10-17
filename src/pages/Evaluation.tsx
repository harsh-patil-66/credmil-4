import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp, Award, Target, Zap } from "lucide-react";

export default function Evaluation() {
  const modelMetrics = [
    { model: "LightGBM", auc: 0.89, precision: 0.84, recall: 0.87, f1: 0.855, brierScore: 0.12 },
    { model: "XGBoost", auc: 0.88, precision: 0.83, recall: 0.86, f1: 0.845, brierScore: 0.13 },
    { model: "Logistic Regression", auc: 0.82, precision: 0.78, recall: 0.81, f1: 0.795, brierScore: 0.18 },
  ];

  const rocData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.1, tpr: 0.65 },
    { fpr: 0.2, tpr: 0.78 },
    { fpr: 0.3, tpr: 0.85 },
    { fpr: 0.4, tpr: 0.89 },
    { fpr: 0.5, tpr: 0.91 },
    { fpr: 0.6, tpr: 0.94 },
    { fpr: 0.7, tpr: 0.96 },
    { fpr: 0.8, tpr: 0.98 },
    { fpr: 0.9, tpr: 0.99 },
    { fpr: 1, tpr: 1 },
  ];

  const radarData = [
    { metric: "AUC", LightGBM: 0.89, XGBoost: 0.88, LogReg: 0.82 },
    { metric: "Precision", LightGBM: 0.84, XGBoost: 0.83, LogReg: 0.78 },
    { metric: "Recall", LightGBM: 0.87, XGBoost: 0.86, LogReg: 0.81 },
    { metric: "F1-Score", LightGBM: 0.855, XGBoost: 0.845, LogReg: 0.795 },
  ];

  const highlights = [
    {
      icon: Award,
      label: "Best Model",
      value: "LightGBM",
      color: "text-green-500",
    },
    {
      icon: Target,
      label: "Best AUC",
      value: "0.89",
      color: "text-primary",
    },
    {
      icon: TrendingUp,
      label: "Avg F1-Score",
      value: "0.832",
      color: "text-accent",
    },
    {
      icon: Zap,
      label: "Training Time",
      value: "12.3s",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Model Evaluation</h1>
        <p className="text-muted-foreground">
          Performance comparison of trained credit risk models
        </p>
      </div>

      {/* Key Highlights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {highlights.map((item, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-muted p-2 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Model Comparison Table */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Model Performance Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Model</th>
                <th className="text-left py-3 px-4 font-semibold">AUC</th>
                <th className="text-left py-3 px-4 font-semibold">Precision</th>
                <th className="text-left py-3 px-4 font-semibold">Recall</th>
                <th className="text-left py-3 px-4 font-semibold">F1-Score</th>
                <th className="text-left py-3 px-4 font-semibold">Brier Score</th>
              </tr>
            </thead>
            <tbody>
              {modelMetrics.map((model, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">
                    {model.model}
                    {index === 0 && (
                      <Badge className="ml-2" variant="default">Best</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">{model.auc.toFixed(3)}</td>
                  <td className="py-3 px-4">{model.precision.toFixed(3)}</td>
                  <td className="py-3 px-4">{model.recall.toFixed(3)}</td>
                  <td className="py-3 px-4">{model.f1.toFixed(3)}</td>
                  <td className="py-3 px-4">{model.brierScore.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* ROC Curve */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">ROC Curve</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="fpr" 
                label={{ value: "False Positive Rate", position: "insideBottom", offset: -5 }}
                className="text-xs"
              />
              <YAxis 
                label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
                className="text-xs"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem"
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="tpr" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="LightGBM (AUC = 0.89)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="fpr" 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                name="Random Classifier"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar Chart Comparison */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Metric Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelMetrics}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="model" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 1]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem"
                }}
              />
              <Legend />
              <Bar dataKey="auc" fill="hsl(var(--chart-1))" name="AUC" />
              <Bar dataKey="f1" fill="hsl(var(--chart-2))" name="F1-Score" />
              <Bar dataKey="recall" fill="hsl(var(--chart-3))" name="Recall" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar Chart */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Multi-Model Performance Radar</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="metric" className="text-sm" />
              <PolarRadiusAxis angle={90} domain={[0, 1]} className="text-xs" />
              <Radar 
                name="LightGBM" 
                dataKey="LightGBM" 
                stroke="hsl(var(--chart-1))" 
                fill="hsl(var(--chart-1))" 
                fillOpacity={0.3} 
              />
              <Radar 
                name="XGBoost" 
                dataKey="XGBoost" 
                stroke="hsl(var(--chart-2))" 
                fill="hsl(var(--chart-2))" 
                fillOpacity={0.3} 
              />
              <Radar 
                name="Logistic Regression" 
                dataKey="LogReg" 
                stroke="hsl(var(--chart-3))" 
                fill="hsl(var(--chart-3))" 
                fillOpacity={0.3} 
              />
              <Legend />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem"
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
