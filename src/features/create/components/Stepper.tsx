"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;
          
          // Kiểm tra step cuối cùng
          const isLastStep = index === steps.length - 1;

          return (
            <div 
              key={step.id} 
              className={cn(
                "flex items-start", 
                !isLastStep && "flex-1" // Bỏ flex-1 ở phần tử cuối để nó không tạo khoảng trống thừa
              )}
            >
              {/* Step Circle & Text */}
              <div className="flex flex-col items-center shrink-0 w-24 sm:w-32 text-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 relative z-10",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>
                
                <div className="mt-2 w-full">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      (isCompleted || isCurrent) && "text-primary",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLastStep && (
                <div
                  className={cn(
                    "h-[2px] flex-1 mx-2 sm:mx-4 transition-all duration-300 mt-5", // mt-5 (20px) đẩy thanh này đâm vào đúng giữa hình tròn (h-10 = 40px)
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}