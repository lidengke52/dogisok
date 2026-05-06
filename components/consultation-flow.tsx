"use client";

import { useState } from "react";
import { DrMaxChat } from "@/components/dr-max-chat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PetInfo {
  name: string;
  breed: string;
  age: string;
  symptoms: string;
}

export function ConsultationFlow() {
  const [step, setStep] = useState<"form" | "chat">("form");
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: "",
    breed: "",
    age: "",
    symptoms: "",
  });

  const handleInputChange = (field: keyof PetInfo, value: string) => {
    setPetInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // At least need to fill in symptoms
    if (!petInfo.symptoms.trim()) {
      alert("Please describe your pet's symptoms");
      return;
    }

    setStep("chat");
  };

  if (step === "chat") {
    return <DrMaxChat petInfo={petInfo} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top decorative area */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <span>🐕</span>
              Dr. Max
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Consult with Dr. Max about your pet's health
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Please tell us basic information about your pet first, so Dr. Max can better understand your situation.
            </p>
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <Card className="p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl mb-6">
            Pet Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Pet Name <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Buddy"
                  value={petInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="breed" className="text-sm font-medium">
                  Pet Breed <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="breed"
                  placeholder="e.g., Golden Retriever"
                  value={petInfo.breed}
                  onChange={(e) => handleInputChange("breed", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Age <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="age"
                  placeholder="e.g., 3 years old"
                  value={petInfo.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="symptoms" className="text-sm font-medium">
                Pet Symptoms or Health Concerns <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="symptoms"
                placeholder="Please describe your pet's symptoms or health questions in detail..."
                value={petInfo.symptoms}
                onChange={(e) => handleInputChange("symptoms", e.target.value)}
                className="mt-2"
                rows={5}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                The more details you provide, the more accurate Dr. Max's answer will be.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Start Consultation
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Dr. Max is an AI assistant and cannot replace a real veterinary diagnosis. In case of emergency, please seek medical attention immediately.
          </p>
        </Card>
      </div>
    </div>
  );
}
