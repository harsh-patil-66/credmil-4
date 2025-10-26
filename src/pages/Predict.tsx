import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, AlertCircle } from "lucide-react";

const API_URL = 'https://be-project-xak5.onrender.com';

const Predict = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    // Step 1: Personal & Residential
    age: '',
    employment_status: '',
    employment_duration: '',
    industry_sector: '',
    education_level: '',
    marital_status: '',
    housing_status: '',
    years_at_residence: '',
    number_of_dependents: '',
    city_region: '',

    // Step 2: Financial
    annual_income: '',
    total_debt: '',
    credit_score: '',
    credit_history_length: '',
    number_of_existing_loans: '',
    total_credit_limit: '',
    credit_utilization_rate: '',
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
    bankruptcy_trigger_flag: false,

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
    dpd_trigger_count: '',
    cash_flow_volatility: '',
    seasonal_spending_pattern: '',
  });

  const [derivedMetrics, setDerivedMetrics] = useState({
    monthly_income: 0,
    debt_to_income_ratio: 0,
    loan_to_income_ratio: 0,
    payment_to_income_ratio: 0,
    net_worth: 0,
    credit_utilization_rate: 0,
  });

  const [prediction, setPrediction] = useState<any>(null);

  const stepLabels = [
    "Personal",
    "Financial",
    "Credit",
    "Loan",
    "Behavioral"
  ];

  // Check API connection on mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiConnected(data.model_loaded);
        if (data.model_loaded) {
          toast({
            title: "✅ API Connected",
            description: "Successfully connected to prediction API",
          });
        } else {
          toast({
            title: "⚠️ Model Not Loaded",
            description: "API is running but model is not loaded",
            variant: "destructive",
          });
        }
      } else {
        setApiConnected(false);
      }
    } catch (error) {
      console.error('API connection error:', error);
      setApiConnected(false);
      toast({
        title: "❌ API Connection Failed",
        description: "Cannot connect to Flask API. Make sure it's running on port 10000.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const annualIncome = Number(formData.annual_income) || 0;
    const totalDebt = Number(formData.total_debt) || 0;
    const loanAmount = Number(formData.loan_amount_requested) || 0;
    const loanTerm = Number(formData.loan_term) || 1;
    const totalAssets = Number(formData.total_assets) || 0;
    const totalCreditLimit = Number(formData.total_credit_limit) || 0;

    const monthlyIncome = annualIncome / 12;
    const estimatedMonthlyPayment = loanTerm > 0 ? loanAmount / loanTerm : 0;
    const creditUtilization = totalCreditLimit > 0 ? totalDebt / totalCreditLimit : 0;

    const newMetrics = {
      monthly_income: monthlyIncome,
      debt_to_income_ratio: monthlyIncome > 0 ? totalDebt / monthlyIncome : 0,
      loan_to_income_ratio: annualIncome > 0 ? loanAmount / annualIncome : 0,
      payment_to_income_ratio: monthlyIncome > 0 ? estimatedMonthlyPayment / monthlyIncome : 0,
      net_worth: totalAssets - totalDebt,
      credit_utilization_rate: creditUtilization,
    };

    setDerivedMetrics(newMetrics);

    // Update formData with calculated credit utilization
    setFormData(prev => ({
      ...prev,
      credit_utilization_rate: creditUtilization.toString()
    }));
  }, [formData.annual_income, formData.total_debt, formData.loan_amount_requested, formData.loan_term, formData.total_assets, formData.total_credit_limit]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    const requiredFields: { [key: number]: string[] } = {
      1: ['age', 'employment_status', 'employment_duration', 'industry_sector', 'education_level', 'marital_status', 'housing_status', 'years_at_residence', 'number_of_dependents'],
      2: ['annual_income', 'total_debt', 'credit_score', 'credit_history_length', 'number_of_existing_loans',
        'total_credit_limit', 'savings_account_balance', 'checking_account_balance', 'total_assets', 'number_of_open_credit_lines'],
      3: ['number_of_late_payments', 'worst_delinquency_status', 'months_since_last_delinquency',
        'number_of_credit_inquiries', 'number_of_derogatory_records', 'credit_mix'],
      4: ['loan_amount_requested', 'loan_term', 'loan_purpose', 'collateral_type', 'collateral_value',
        'transaction_amount', 'transaction_frequency', 'time_since_last_transaction'],
    };

    const fields = requiredFields[step] || [];
    const missingFields = fields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return value === '' || value === null || value === undefined;
    });

    if (missingFields.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
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
    // Check API connection before submitting
    if (apiConnected === false) {
      toast({
        title: "API Not Connected",
        description: "Please ensure Flask API is running on port 10000",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Map form data to API expected format (match exact field names from CSV)
      const apiPayload = {
        Age: Number(formData.age),
        Employment_Status: formData.employment_status,
        Employment_Duration: Number(formData.employment_duration),
        Industry_Sector: formData.industry_sector,
        Education_Level: formData.education_level,
        Marital_Status: formData.marital_status,
        Housing_Status: formData.housing_status,
        Years_at_Residence: Number(formData.years_at_residence),
        Number_of_Dependents: Number(formData.number_of_dependents),

        Annual_Income: Number(formData.annual_income),
        Total_Debt: Number(formData.total_debt),
        Debt_to_Income_Ratio: derivedMetrics.debt_to_income_ratio,
        Loan_to_Income_Ratio: derivedMetrics.loan_to_income_ratio,
        Credit_Score: Number(formData.credit_score),
        Credit_History_Length: Number(formData.credit_history_length),
        Number_of_Existing_Loans: Number(formData.number_of_existing_loans),
        Total_Credit_Limit: Number(formData.total_credit_limit),
        Credit_Utilization_Rate: derivedMetrics.credit_utilization_rate,
        Savings_Account_Balance: Number(formData.savings_account_balance),
        Checking_Account_Balance: Number(formData.checking_account_balance),
        Total_Assets: Number(formData.total_assets),
        Net_Worth: derivedMetrics.net_worth,

        Number_of_Late_Payments: Number(formData.number_of_late_payments),
        Worst_Delinquency_Status: Number(formData.worst_delinquency_status),
        Months_since_Last_Delinquency: Number(formData.months_since_last_delinquency),
        Number_of_Credit_Inquiries: Number(formData.number_of_credit_inquiries),
        Number_of_Open_Credit_Lines: Number(formData.number_of_open_credit_lines),
        Number_of_Derogatory_Records: Number(formData.number_of_derogatory_records),
        Bankruptcy_Flag: formData.bankruptcy_flag ? "TRUE" : "FALSE",
        Credit_Mix: formData.credit_mix,
        Bankruptcy_Trigger_Flag: formData.bankruptcy_trigger_flag ? "TRUE" : "FALSE",

        Loan_Amount_Requested: Number(formData.loan_amount_requested),
        Loan_Term_Months: Number(formData.loan_term),
        Loan_Purpose: formData.loan_purpose,
        Payment_to_Income_Ratio: derivedMetrics.payment_to_income_ratio,
        Collateral_Type: formData.collateral_type,
        Collateral_Value: Number(formData.collateral_value),

        Transaction_Amount: Number(formData.transaction_amount),
        Transaction_Frequency: Number(formData.transaction_frequency),
        Days_since_Last_Transaction: Number(formData.time_since_last_transaction),

        Avg_Probability_of_Default: Number(formData.average_pd) / 100,
        Avg_Risk_Weighted_Assets: Number(formData.average_rwa),
        DPD_Trigger_Count: Number(formData.dpd_trigger_count),
        Cash_Flow_Volatility: Number(formData.cash_flow_volatility),
        Seasonal_Spending_Pattern: formData.seasonal_spending_pattern,
      };
      localStorage.setItem("lastPredictionInput", JSON.stringify(apiPayload));


      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Prediction API request failed');
      }

      console.log('API Response:', data);

      // Transform API response to match expected format
      const transformedPrediction = {
        riskScore: data.predicted_credit_risk_score,
        riskLevel: data.risk_level || (
          data.predicted_credit_risk_score >= 750 ? '🟢 Excellent Credit' :
          data.predicted_credit_risk_score >= 700 ? '🟢 Good Credit' :
          data.predicted_credit_risk_score >= 650 ? '🟡 Fair Credit' :
          data.predicted_credit_risk_score >= 600 ? '🟠 Poor Credit' : '🔴 Very Poor Credit'
        ),
        probabilityOfDefault: data.probability_of_default || (
          data.predicted_credit_risk_score >= 700 ? 0.05 :
          data.predicted_credit_risk_score >= 650 ? 0.15 :
          data.predicted_credit_risk_score >= 600 ? 0.30 : 0.50
        ),
        modelVersion: 'XGBoost v2.0',
        totalFeaturesUsed: data.total_features_used,
        recommendation: data.predicted_credit_risk_score >= 700 ?
          'Excellent credit profile. Loan approval recommended with favorable terms.' :
          data.predicted_credit_risk_score >= 650 ?
            'Good credit profile. Loan approval recommended with standard terms.' :
            data.predicted_credit_risk_score >= 600 ?
              'Fair credit profile. Loan may be approved with higher interest rates or additional requirements.' :
              'Credit profile needs improvement. Consider debt reduction and timely payments before reapplying.',
      };

      setPrediction(transformedPrediction);
      setCurrentStep(7);
      toast({
        title: "✅ Assessment Complete",
        description: `Credit Risk Score: ${transformedPrediction.riskScore}`,
      });
    } catch (error: any) {
      console.error('Prediction error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate prediction. Please try again.",
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
                <p className="text-sm text-muted-foreground">Credit Risk Score</p>
                <p className="text-2xl font-bold">{prediction.riskScore}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Default Probability</p>
                <p className="text-2xl font-bold">{(prediction.probabilityOfDefault * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-bold">{prediction.riskLevel}</p>
              </div>
            </div>
          </Card>

          {prediction.recommendation && (
            <Card className="p-6 border-l-4 border-l-primary">
              <h2 className="text-2xl font-bold mb-2">Recommendation</h2>
              <p className="text-lg">{prediction.recommendation}</p>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                setCurrentStep(1);
                setPrediction(null);
              }}
              size="lg"
            >
              Start New Assessment
            </Button>
            <Button
              variant="outline"
              onClick={checkApiConnection}
              size="lg"
            >
              Check API Status
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
        
        {/* API Status Indicator */}
        {apiConnected === false && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">API Connection Failed</p>
              <p className="text-sm text-red-700">Make sure Flask API is running: python app.py</p>
            </div>
            <Button variant="outline" size="sm" onClick={checkApiConnection} className="ml-auto">
              Retry
            </Button>
          </div>
        )}
        
        {apiConnected === true && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm text-green-700">API Connected</p>
          </div>
        )}
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
          <Button onClick={handleSubmit} disabled={isSubmitting || apiConnected === false}>
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
