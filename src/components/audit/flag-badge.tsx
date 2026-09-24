import React from "react";
import { Badge } from "@/components/ui/badge";
import { FlagRuleType, RULE_LABELS } from "@/types/audit";

export function RuleBadge({ ruleType }: { ruleType: string }) {
  const rule = RULE_LABELS[ruleType as FlagRuleType];
  const title = rule?.title || ruleType;

  if (ruleType === "RATE_EXCEEDS_CONTRACT") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-tight bg-[#fdf2f2] text-[#8f2020] border border-[#f1c2c2]">
        {title}
      </span>
    );
  }
  if (ruleType === "DUPLICATE_INVOICE_LINE") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-tight bg-[#F3F0E8] text-[#B8892D] border border-[#DCD5C8] font-semibold">
        {title}
      </span>
    );
  }
  if (ruleType === "UNCONTRACTED_FEE_CATEGORY") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-tight bg-[#F3F0E8] text-[#121210] border border-[#DCD5C8]">
        {title}
      </span>
    );
  }
  if (ruleType === "MOM_ANOMALOUS_SURGE") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-tight bg-[#F3F0E8] text-[#777268] border border-[#DCD5C8]">
        {title}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-tight bg-[#FBFAF6] text-[#777268] border border-[#DCD5C8]">
      {title}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === "CONFIRMED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-tight bg-[#fdf2f2] text-[#8f2020] border border-[#f1c2c2]">
        Confirmed Error
      </span>
    );
  }
  if (status === "DISMISSED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-tight bg-[#FBFAF6] text-[#777268] border border-[#DCD5C8]">
        Dismissed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-tight bg-[#F3F0E8] text-[#B8892D] border border-[#E0BC68]">
      Awaiting Clarification
    </span>
  );
}
