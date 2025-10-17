import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [training, setTraining] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setUploadComplete(false);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleProcessData = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-data');
      
      if (error) throw error;

      toast({
        title: "Data Processed",
        description: `${data.recordsProcessed} records analyzed, ${data.featuresAnalyzed} features computed`,
      });
      
      setUploadComplete(true);
    } catch (error: any) {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleTrainModel = async () => {
    setTraining(true);
    try {
      const { data, error } = await supabase.functions.invoke('train-model');
      
      if (error) throw error;

      setMetrics(data.metrics);
      toast({
        title: "Model Trained Successfully",
        description: `Accuracy: ${data.metrics.accuracy}%, AUC: ${data.metrics.auc}%`,
      });
    } catch (error: any) {
      toast({
        title: "Training Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Training Data</h1>
          <p className="text-muted-foreground">
            Upload your borrower dataset in CSV format to train and evaluate credit risk models
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <UploadIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CSV files only (Max 50MB)
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* File Info */}
            {file && (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {uploadComplete && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
            )}

            {/* Process Data Button */}
            <Button
              onClick={handleProcessData}
              disabled={processing}
              className="w-full"
              size="lg"
            >
              {processing ? "Processing Dataset..." : "Process Dataset"}
            </Button>

            {/* Train Model Button */}
            {uploadComplete && (
              <Button
                onClick={handleTrainModel}
                disabled={training}
                className="w-full"
                size="lg"
                variant="default"
              >
                {training ? "Training Model..." : "Train Model"}
              </Button>
            )}

            {/* Metrics Display */}
            {metrics && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3">Model Performance</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-xl font-bold">{metrics.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">AUC Score</p>
                        <p className="text-xl font-bold">{metrics.auc}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Precision</p>
                        <p className="text-xl font-bold">{metrics.precision}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">F1 Score</p>
                        <p className="text-xl font-bold">{metrics.f1Score}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Data Requirements */}
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold">Data Requirements</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>Include borrower financial data: income, debt, credit history, etc.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>Target variable should be named 'default' or 'loan_status' (0=paid, 1=default)</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>Optional: Include demographic data for fairness analysis (age, gender, race)</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p>Missing values will be handled automatically during preprocessing</p>
                </div>
              </div>
            </div>

            {/* Sample Data Format */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Sample Data Format</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">income</th>
                      <th className="px-4 py-2 text-left font-medium">debt_ratio</th>
                      <th className="px-4 py-2 text-left font-medium">credit_score</th>
                      <th className="px-4 py-2 text-left font-medium">age</th>
                      <th className="px-4 py-2 text-left font-medium">default</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">65000</td>
                      <td className="px-4 py-2">0.35</td>
                      <td className="px-4 py-2">720</td>
                      <td className="px-4 py-2">35</td>
                      <td className="px-4 py-2">0</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">42000</td>
                      <td className="px-4 py-2">0.62</td>
                      <td className="px-4 py-2">580</td>
                      <td className="px-4 py-2">28</td>
                      <td className="px-4 py-2">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
