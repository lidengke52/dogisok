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
    
    // 至少需要填写症状
    if (!petInfo.symptoms.trim()) {
      alert("请填写宠物症状");
      return;
    }

    setStep("chat");
  };

  if (step === "chat") {
    return <DrMaxChat petInfo={petInfo} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 上部装饰区域 */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <span>🐕</span>
              Dr. Max
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              与 Dr. Max 咨询您的宠物健康问题
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              请先告诉我们关于您的宠物的基本信息，这样能帮助 Dr. Max 更好地理解您的情况。
            </p>
          </div>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <Card className="p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl mb-6">
            宠物基本信息
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  宠物名字 <span className="text-muted-foreground">(可选)</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例：小白"
                  value={petInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="breed" className="text-sm font-medium">
                  宠物品种 <span className="text-muted-foreground">(可选)</span>
                </Label>
                <Input
                  id="breed"
                  placeholder="例：金毛犬"
                  value={petInfo.breed}
                  onChange={(e) => handleInputChange("breed", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  年龄 <span className="text-muted-foreground">(可选)</span>
                </Label>
                <Input
                  id="age"
                  placeholder="例：3 岁"
                  value={petInfo.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="symptoms" className="text-sm font-medium">
                宠物症状或健康问题 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="symptoms"
                placeholder="请详细描述您的宠物现在的症状或您想咨询的健康问题..."
                value={petInfo.symptoms}
                onChange={(e) => handleInputChange("symptoms", e.target.value)}
                className="mt-2"
                rows={5}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                提供越多细节，Dr. Max 的回答会越准确。
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full">
              开始咨询
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Dr. Max 是一个 AI 助手，不能替代真实的兽医诊断。如有紧急情况，请立即就医。
          </p>
        </Card>
      </div>
    </div>
  );
}
