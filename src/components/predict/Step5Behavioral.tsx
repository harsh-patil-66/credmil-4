import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, HelpCircle } from "lucide-react";

interface Step5BehavioralProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Step5Behavioral = ({ formData, onChange }: Step5BehavioralProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Behavioral & Temporal Features</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="average_pd" className="flex items-center gap-2">
            Average Probability of Default - Last 6 Months (%) *
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Historical average likelihood of default</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="average_pd"
            type="number"
            value={formData.average_pd || ''}
            onChange={(e) => onChange('average_pd', e.target.value)}
            required
            min="0"
            max="100"
            step="0.01"
          />
        </div>

        <div>
          <Label htmlFor="average_lgd" className="flex items-center gap-2">
            Average Loss Given Default - Last 6 Months (%) *
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average percentage of loss if default occurs</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="average_lgd"
            type="number"
            value={formData.average_lgd || ''}
            onChange={(e) => onChange('average_lgd', e.target.value)}
            required
            min="0"
            max="100"
            step="0.01"
          />
        </div>

        <div>
          <Label htmlFor="average_rwa" className="flex items-center gap-2">
            Average Risk-Weighted Assets - Last 6 Months (₹) *
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assets weighted by their risk levels</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="average_rwa"
            type="number"
            value={formData.average_rwa || ''}
            onChange={(e) => onChange('average_rwa', e.target.value)}
            required
            min="0"
          />
        </div>
      </div>
    </Card>
  );
};
