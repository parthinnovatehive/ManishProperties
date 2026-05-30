"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import type { Property } from "@/types";

export function EmiCalculator({ property }: { property: Property }) {
  const [loanAmount, setLoanAmount] = useState(Math.round(((property.priceNum || 2000000) * 0.8) / 100000));
  const [rate, setRate] = useState(85);
  const [tenure, setTenure] = useState(20);

  const { emi, totalAmount, totalInterest } = useMemo(() => {
    const principal = loanAmount * 100000;
    const monthlyRate = rate / 10 / 12 / 100;
    const months = tenure * 12;
    const payment =
      monthlyRate > 0
        ? Math.round((principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1))
        : Math.round(principal / months);
    const total = Math.round(payment * months);
    return { emi: payment, totalAmount: total, totalInterest: Math.round(total - principal) };
  }, [loanAmount, rate, tenure]);

  const sliders = [
    { label: "Loan Amount", value: `₹${loanAmount}L`, state: loanAmount, setState: setLoanAmount, min: 5, max: 500, step: 5 },
    { label: "Interest Rate", value: `${(rate / 10).toFixed(1)}%`, state: rate, setState: setRate, min: 60, max: 140, step: 1 },
    { label: "Tenure", value: `${tenure} Years`, state: tenure, setState: setTenure, min: 1, max: 30, step: 1 },
  ];

  return (
    <div className="mb-5 rounded-[20px] border border-estate-border bg-white p-8 shadow-estate">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-estate-blue-pale text-estate-navy">
          <Calculator size={20} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-[17px] font-bold text-estate-navy">EMI Calculator</h3>
          <div className="text-[13px] text-estate-muted">Estimate your monthly home loan payment</div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          {sliders.map(({ label, value, state, setState, min, max, step }) => (
            <label key={label} className="mb-5 block">
              <span className="mb-2 flex justify-between text-[13px] font-semibold text-estate-text">
                <span>{label}</span>
                <span className="text-estate-blue">{value}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={state}
                className="w-full cursor-pointer"
                onChange={(event) => setState(Number(event.target.value))}
              />
            </label>
          ))}
        </div>

        <div className="flex min-h-[230px] flex-col justify-around rounded-[14px] bg-estate-navy p-5 text-white">
          <div>
            <div className="mb-1 text-xs font-semibold text-white/60">MONTHLY EMI</div>
            <div className="text-[28px] font-extrabold">₹{emi.toLocaleString("en-IN")}</div>
          </div>
          <div className="h-px bg-white/15" />
          <div className="flex justify-between">
            <div>
              <div className="mb-0.5 text-[11px] text-white/55">Principal</div>
              <div className="text-sm font-bold">₹{loanAmount}L</div>
            </div>
            <div className="text-right">
              <div className="mb-0.5 text-[11px] text-white/55">Total Interest</div>
              <div className="text-sm font-bold">₹{Math.round(totalInterest / 100000)}L</div>
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-[11px] text-white/55">Total Payment</div>
            <div className="text-base font-bold text-estate-amber">₹{Math.round(totalAmount / 100000)}L</div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-estate-bg px-3.5 py-2.5 text-xs text-estate-muted">
        * EMI calculation is indicative only. Actual rates may vary based on credit score, bank policies, and market conditions.
      </div>
    </div>
  );
}
