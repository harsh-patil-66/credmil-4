import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RiskMeter } from "@/components/RiskMeter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StepIndicator } from "@/components/predict/StepIndicator";
import { Step1Personal } from "@/components/predict/Step1Personal";
import { Step2Financial } from "@/components/predict/Step2Financial";
import { Step3CreditHistory } from "@/components/predict/Step3CreditHistory";
import { Step4LoanDetails } from "@/components/predict/Step4LoanDetails";
import { Step5Behavioral } from "@/components/predict/Step5Behavioral";
import { SummaryStep } from "@/components/predict/SummaryStep";
import { Loader2 } from "lucide-react";

const Predict = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal & Residential
    age: '',
    employment_status: '',
    employment_duration: '',
    housing_status: '',
    years_at_residence: '',
    city_region: '',
    
    // Step 2: Financial
    annual_income: '',
    total_debt: '',
    credit_score: '',
    credit_history_length: '',
    number_of_existing_loans: '',
    total_credit_limit: '',
    savings_account_balance: '',
    checking_account_balance: '',
    total_assets: '',
    number_of_open_credit_lines: '',
    
    // Step 3: Credit History
    number_of_late_payments: '',
    worst_delinquency_status: '',
    months_since_last_delinquency: '',
    number_of_credit_inquiries: '',
    number_of_derogatory_records: '',
    bankruptcy_flag: false,
    time_since_bankruptcy: '',
    credit_mix: '',
    
    // Step 4: Loan Details
    loan_amount_requested: '',
    loan_term: '',
    loan_purpose: '',
    collateral_type: '',
    collateral_value: '',
    transaction_amount: '',
    transaction_frequency: '',
    time_since_last_transaction: '',
    
    // Step 5: Behavioral
    average_pd: '',
    average_lgd: '',
    average_rwa: '',
  });
  
  const [derivedMetrics, setDerivedMetrics] = useState({
    monthly_income: 0,
    debt_to_income_ratio: 0,
    loan_to_income_ratio: 0,
    payment_to_income_ratio: 0,
    net_worth: 0,
  });

  const [prediction, setPrediction] = useState<any>(null);

  const stepLabels = [
    "Personal",
    "Financial", 
    "Credit",
    "Loan",
    "Behavioral"
  ];

  useEffect(() => {
    const annualIncome = Number(formData.annual_income) || 0;
    const totalDebt = Number(formData.total_debt) || 0;
    const loanAmount = Number(formData.loan_amount_requested) || 0;
    const loanTerm = Number(formData.loan_term) || 1;
    const totalAssets = Number(formData.total_assets) || 0;

    const monthlyIncome = annualIncome / 12;
    const estimatedMonthlyPayment = loanTerm > 0 ? loanAmount / loanTerm : 0;

    setDerivedMetrics({
      monthly_income: monthlyIncome,
      debt_to_income_ratio: monthlyIncome > 0 ? totalDebt / monthlyIncome : 0,
      loan_to_income_ratio: annualIncome > 0 ? loanAmount / annualIncome : 0,
      payment_to_income_ratio: monthlyIncome > 0 ? estimatedMonthlyPayment / monthlyIncome : 0,
      net_worth: totalAssets - totalDebt,
    });
  }, [formData.annual_income, formData.total_debt, formData.loan_amount_requested, formData.loan_term, formData.total_assets]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    const requiredFields: { [key: number]: string[] } = {
      1: ['age', 'employment_status', 'employment_duration', 'housing_status', 'years_at_residence', 'city_region'],
      2: ['annual_income', 'total_debt', 'credit_score', 'credit_history_length', 'number_of_existing_loans', 
          'total_credit_limit', 'savings_account_balance', 'checking_account_balance', 'total_assets', 'number_of_open_credit_lines'],
      3: ['number_of_late_payments', 'worst_delinquency_status', 'months_since_last_delinquency', 
          'number_of_credit_inquiries', 'number_of_derogatory_records', 'credit_mix'],
      4: ['loan_amount_requested', 'loan_term', 'loan_purpose', 'collateral_type', 'collateral_value',
          'transaction_amount', 'transaction_frequency', 'time_since_last_transaction'],
      5: ['average_pd', 'average_lgd', 'average_rwa'],
    };

    const fields = requiredFields[step] || [];
    const missingFields = fields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return value === '' || value === null || value === undefined;
    });

    if (missingFields.length > 0) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
      return false;
    }

    // Additional validation for bankruptcy
    if (step === 3 && formData.bankruptcy_flag && !formData.time_since_bankruptcy) {
      toast({
        title: "Missing Information",
        description: "Please enter time since bankruptcy.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        ...derivedMetrics,
      };

      const { data, error } = await supabase.functions.invoke('credit-predict', {
        body: payload
      });

      if (error) throw error;

      setPrediction(data);
      setCurrentStep(7); // Move to results view
      toast({
        title: "✅ Assessment Complete",
        description: "Your credit profile has been successfully submitted for assessment.",
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Error",
        description: "Failed to generate prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Personal formData={formData} onChange={handleChange} />;
      case 2:
        return <Step2Financial formData={formData} onChange={handleChange} />;
      case 3:
        return <Step3CreditHistory formData={formData} onChange={handleChange} />;
      case 4:
        return <Step4LoanDetails formData={formData} onChange={handleChange} />;
      case 5:
        return <Step5Behavioral formData={formData} onChange={handleChange} />;
      case 6:
        return <SummaryStep formData={formData} derivedMetrics={derivedMetrics} />;
      case 7:
        return null; // Results view
      default:
        return null;
    }
  };

  if (currentStep === 7 && prediction) {
    // Results View
    const chartData = prediction.featureContributions?.map((item: any) => ({
      name: item.feature.replace(/_/g, ' '),
      impact: Math.abs(item.contribution),
      fill: item.contribution > 0 ? '#ef4444' : '#22c55e'
    })) || [];

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Risk Assessment Results</h1>
          <p className="text-muted-foreground">
            Based on your comprehensive credit profile
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <RiskMeter score={prediction.riskScore} riskLevel={prediction.riskLevel} />
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Summary Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Default Probability</p>
                <p className="text-2xl font-bold">{(prediction.probabilityOfDefault * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-bold">{prediction.riskLevel}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Model Version</p>
                <p className="text-2xl font-bold">{prediction.modelVersion}</p>
              </div>
            </div>
          </Card>

          {prediction.featureContributions && (
            <>
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Feature Contributions</h2>
                <div className="space-y-2">
                  {prediction.featureContributions.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <span className="font-medium">{item.feature.replace(/_/g, ' ')}</span>
                      <span className={`font-bold ${item.contribution > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {item.contribution > 0 ? '+' : ''}{item.contribution.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Feature Impact Visualization</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impact" name="Impact Magnitude" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}

          {prediction.recommendation && (
            <Card className="p-6 border-l-4 border-l-primary">
              <h2 className="text-2xl font-bold mb-2">Recommendation</h2>
              <p className="text-lg">{prediction.recommendation}</p>
            </Card>
          )}

          <div className="flex justify-center">
            <Button 
              onClick={() => {
                setCurrentStep(1);
                setPrediction(null);
              }}
              size="lg"
            >
              Start New Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">CredMill - Credit Risk Assessment</h1>
        <p className="text-muted-foreground">
          Complete the multi-step form for comprehensive credit risk evaluation
        </p>
      </div>

      <StepIndicator 
        currentStep={currentStep} 
        totalSteps={stepLabels.length} 
        stepLabels={stepLabels} 
      />

      <div className="my-8">
        {renderStep()}
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {currentStep < 5 && (
          <Button onClick={handleNext}>
            Next
          </Button>
        )}

        {currentStep === 5 && (
          <Button onClick={handleNext}>
            Review Summary
          </Button>
        )}

        {currentStep === 6 && (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit for Risk Assessment'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Predict;
