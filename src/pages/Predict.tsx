import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { RiskMeter } from "@/components/RiskMeter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export default function Predict() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const [formData, setFormData] = useState({
    income: "65000",
    debtRatio: "0.35",
    creditScore: "720",
    age: "35",
    employmentLength: "5",
    creditLines: "3",
    recentInquiries: "1",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePredict = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('credit-predict', {
        body: { applicantData: formData }
      });

      if (error) throw error;

      setPrediction(data);
      toast({
        title: "Prediction Complete",
        description: `Risk Level: ${data.riskLevel} | Model: ${data.modelInfo.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to generate prediction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Credit Risk Prediction</h1>
        <p className="text-muted-foreground">
          Enter applicant information to get an AI-powered credit risk assessment
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Applicant Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="income">Annual Income ($)</Label>
              <Input
                id="income"
                name="income"
                type="number"
                value={formData.income}
                onChange={handleInputChange}
                placeholder="65000"
              />
            </div>

            <div>
              <Label htmlFor="debtRatio">Debt-to-Income Ratio</Label>
              <Input
                id="debtRatio"
                name="debtRatio"
                type="number"
                step="0.01"
                value={formData.debtRatio}
                onChange={handleInputChange}
                placeholder="0.35"
              />
            </div>

            <div>
              <Label htmlFor="creditScore">Credit Score</Label>
              <Input
                id="creditScore"
                name="creditScore"
                type="number"
                value={formData.creditScore}
                onChange={handleInputChange}
                placeholder="720"
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="35"
              />
            </div>

            <div>
              <Label htmlFor="employmentLength">Employment Length (years)</Label>
              <Input
                id="employmentLength"
                name="employmentLength"
                type="number"
                value={formData.employmentLength}
                onChange={handleInputChange}
                placeholder="5"
              />
            </div>

            <div>
              <Label htmlFor="creditLines">Number of Credit Lines</Label>
              <Input
                id="creditLines"
                name="creditLines"
                type="number"
                value={formData.creditLines}
                onChange={handleInputChange}
                placeholder="3"
              />
            </div>

            <div>
              <Label htmlFor="recentInquiries">Recent Credit Inquiries</Label>
              <Input
                id="recentInquiries"
                name="recentInquiries"
                type="number"
                value={formData.recentInquiries}
                onChange={handleInputChange}
                placeholder="1"
              />
            </div>

            <Button onClick={handlePredict} disabled={loading} className="w-full" size="lg">
              {loading ? "Analyzing..." : "Generate Prediction"}
            </Button>
          </div>
        </Card>

        {/* Prediction Results */}
        {prediction && (
          <div className="space-y-6">
            {/* Risk Meter */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Risk Assessment</h2>
              <RiskMeter score={prediction.riskScore} riskLevel={prediction.riskLevel} />
            </Card>

            {/* Summary Stats */}
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Default Probability</p>
                  <p className="text-2xl font-bold">{(prediction.defaultProbability * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Model Version</p>
                  <p className="text-lg font-semibold">{prediction.modelInfo.version}</p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Recommendation</p>
                    <p className="text-sm">{prediction.recommendation}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature Contributions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Feature Contributions</h2>
              <p className="text-sm text-muted-foreground mb-4">
                How each factor influences the prediction
              </p>

              <div className="space-y-4">
                {prediction.features.map((feature: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {feature.direction === "positive" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">{feature.name}</span>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          feature.impact > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {feature.impact > 0 ? "+" : ""}
                        {feature.impact.toFixed(3)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full ${
                          feature.impact > 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.abs(feature.impact) * 100}%`,
                          left: feature.impact < 0 ? `${50 - Math.abs(feature.impact) * 100}%` : "50%",
                        }}
                      />
                      <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Visual Chart */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Impact Visualization</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prediction.features} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" domain={[-0.1, 0.2]} />
                  <YAxis type="category" dataKey="name" className="text-xs" width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                    {prediction.features.map((entry: any, index: number) => (
                      <Cell
                        key={index}
                        fill={entry.impact > 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-5))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {!prediction && (
          <Card className="p-6">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-semibold mb-2">Risk Meter Preview</h2>
              <p className="text-sm text-muted-foreground">
                This is how your risk assessment will be displayed
              </p>
            </div>
            <RiskMeter score={650} riskLevel="Low Risk" />
          </Card>
        )}
      </div>
    </div>
  );
}
