import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from "recharts";

export default function Explainability() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shap' | 'lime' | 'reasons'>('shap');

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the last prediction input from localStorage
      const storedPayload = localStorage.getItem("lastPredictionInput");
      
      if (!storedPayload) {
        setError("No saved applicant data found. Please complete a prediction first from the Predict page.");
        setLoading(false);
        return;
      }

      const response = await fetch("https://be-project-xak5.onrender.com/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: storedPayload,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === "error") {
        throw new Error(data.error || "Unknown error occurred");
      }
      
      setResult(data);
    } catch (err: any) {
      console.error("Explainability Error:", err);
      setError(err.message || "Failed to load explainability report. Make sure the backend is running on port 10000.");
    }
    
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (status === "conditional") return <AlertCircle className="h-6 w-6 text-yellow-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-50 border-green-200";
    if (status === "conditional") return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getColor = (impact: string) =>
    impact === "positive" ? "#10b981" : "#ef4444";

  // Prepare data for impact distribution pie chart
  const getImpactDistribution = () => {
    if (!result?.shap_explanation) return [];
    
    const positive = result.shap_explanation.top_features.filter(
      (f: any) => f.impact === "positive"
    ).reduce((sum: number, f: any) => sum + f.magnitude, 0);
    
    const negative = result.shap_explanation.top_features.filter(
      (f: any) => f.impact === "negative"
    ).reduce((sum: number, f: any) => sum + f.magnitude, 0);

    return [
      { name: "Risk Reducing", value: positive, fill: "#10b981" },
      { name: "Risk Increasing", value: negative, fill: "#ef4444" }
    ];
  };

  // Prepare radar chart data
  const getRadarData = () => {
    if (!result?.shap_explanation) return [];
    
    return result.shap_explanation.top_features.slice(0, 6).map((f: any) => ({
      feature: f.feature.replace(/_/g, ' ').slice(0, 20),
      value: f.magnitude,
      fullMark: Math.max(...result.shap_explanation.top_features.map((x: any) => x.magnitude))
    }));
  };

  // Prepare cumulative impact data
  const getCumulativeImpact = () => {
    if (!result?.shap_explanation) return [];
    
    let cumulative = 0;
    return result.shap_explanation.top_features.map((f: any, idx: number) => {
      cumulative += f.shap_value;
      return {
        feature: f.feature.replace(/_/g, ' ').slice(0, 15),
        cumulative: cumulative,
        impact: f.shap_value
      };
    });
  };

  return (
    <div className="container max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Model Explainability Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Understand how your credit score was calculated using advanced AI explainability techniques
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-5 mb-8 bg-blue-50 border-blue-200">
        <div className="flex gap-4">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">How This Works</p>
            <p className="text-sm text-blue-800">
              <strong>SHAP</strong> (SHapley Additive exPlanations) shows which features pushed your score higher or lower globally.
              <br />
              <strong>LIME</strong> (Local Interpretable Model-agnostic Explanations) explains the model's reasoning for your specific case.
            </p>
          </div>
        </div>
      </Card>

      {/* Generate Button */}
      <Button 
        onClick={handleExplain} 
        disabled={loading} 
        size="lg"
        className="mb-8 text-base px-6"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Generating Report...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Explainability Report
          </>
        )}
      </Button>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* Summary Score Card */}
          <Card className={`p-8 ${getStatusColor(result.approval_status)} border-2`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Credit Risk Assessment</h2>
                <p className="text-lg font-medium">{result.approval_message}</p>
              </div>
              {getStatusIcon(result.approval_status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Credit Risk Score</p>
                <p className="text-5xl font-bold text-primary mb-2">
                  {result.predicted_credit_risk_score}
                </p>
                <p className="text-lg font-medium">{result.risk_level}</p>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Default Probability</p>
                <p className="text-5xl font-bold text-orange-600 mb-2">
                  {(result.probability_of_default * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Risk of default</p>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Features Analyzed</p>
                <p className="text-5xl font-bold text-blue-600 mb-2">
                  {result.total_features_used}
                </p>
                <p className="text-sm text-muted-foreground">Data points</p>
              </div>
            </div>
          </Card>

          {/* Explanation Summary */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600" />
              Plain English Explanation
            </h3>
            <p className="text-base leading-relaxed">
              {result.explanation_summary}
            </p>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b">
            <button
              onClick={() => setActiveTab('shap')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'shap'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              SHAP Analysis
            </button>
            <button
              onClick={() => setActiveTab('lime')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'lime'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              LIME Analysis
            </button>
            <button
              onClick={() => setActiveTab('reasons')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'reasons'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Detailed Reasons
            </button>
          </div>

          {/* SHAP Tab */}
          {activeTab === 'shap' && (
            <div className="space-y-8">
              {/* SHAP Bar Chart */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Key Factors Affecting Your Score (SHAP)
                </h2>
                <p className="text-muted-foreground mb-6">
                  These features had the strongest impact on your credit risk score
                </p>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={result.shap_explanation.top_features} layout="vertical" margin={{ left: 180, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="feature" 
                      tick={{ fontSize: 13 }}
                      width={170}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                      formatter={(value: any) => [value.toFixed(4), 'Impact']}
                    />
                    <Bar dataKey="magnitude" radius={[0, 8, 8, 0]}>
                      {result.shap_explanation.top_features.map((item: any, idx: number) => (
                        <Cell key={idx} fill={getColor(item.impact)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Risk Increasing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Risk Reducing</span>
                  </div>
                </div>
              </Card>

              {/* Impact Distribution & Radar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Impact Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getImpactDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getImpactDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Radar Chart */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Feature Impact Radar</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="feature" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis />
                      <Radar
                        name="Impact"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Cumulative Impact */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Cumulative Feature Impact</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getCumulativeImpact()} margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {/* LIME Tab */}
          {activeTab === 'lime' && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-2">
                Case-Specific Breakdown (LIME)
              </h2>
              <p className="text-muted-foreground mb-6">
                How each feature influenced the prediction for your specific application
              </p>

              <div className="space-y-3">
                {result.lime_explanation.contributions.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {item.impact === "positive" ? (
                        <TrendingUp className="text-red-500 h-5 w-5 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="text-green-500 h-5 w-5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.feature}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`text-lg font-semibold ${
                        item.impact === "positive" ? "text-red-600" : "text-green-600"
                      }`}>
                        {item.weight > 0 ? '+' : ''}{item.weight.toFixed(3)}
                      </span>
                      <p className="text-xs text-muted-foreground">weight</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Model Score</p>
                <p className="text-2xl font-bold text-blue-700">{result.lime_explanation.score.toFixed(4)}</p>
              </div>
            </Card>
          )}

          {/* Reasons Tab */}
          {activeTab === 'reasons' && (
            <div className="space-y-8">
              {/* Rejection/Conditional Reasons */}
              {result.rejection_reasons && result.rejection_reasons.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-red-700 flex items-center gap-2">
                    <XCircle className="h-6 w-6" />
                    Areas for Improvement
                  </h2>
                  <div className="space-y-4">
                    {result.rejection_reasons.map((reason: any, idx: number) => (
                      <div key={idx} className="p-5 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                        <h3 className="font-semibold text-lg mb-2">{reason.factor}</h3>
                        <p className="text-sm mb-2"><strong>Issue:</strong> {reason.issue}</p>
                        <p className="text-sm mb-2"><strong>How to Improve:</strong> {reason.improvement}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 bg-red-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(reason.impact_score * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">Impact: {reason.impact_score.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Approval Factors */}
              {result.approval_factors && result.approval_factors.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    Strengths in Your Application
                  </h2>
                  <div className="space-y-3">
                    {result.approval_factors.map((factor: any, idx: number) => (
                      <div key={idx} className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{factor.factor}</h3>
                          <span className="text-sm font-medium text-green-700">
                            +{factor.contribution.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}