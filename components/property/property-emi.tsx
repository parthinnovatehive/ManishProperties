"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator } from "lucide-react";

type PropertyEMIProps = {
  price?: string | null;
};

function parsePriceToRupees(price?: string | null) {
  if (!price) return 0;

  const value = String(price);
  const crore = value.match(/([\d.]+)\s*cr/i);
  const lakh = value.match(/([\d.]+)\s*l/i);

  if (crore) return Number.parseFloat(crore[1]) * 10000000;
  if (lakh) return Number.parseFloat(lakh[1]) * 100000;

  return Number.parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
}

function formatINR(value: number) {
  if (!Number.isFinite(value)) return "\u2014";
  if (value >= 10000000) return `\u20b9${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `\u20b9${(value / 100000).toFixed(1)}L`;
  return `\u20b9${Math.round(value).toLocaleString("en-IN")}`;
}

function sliderGradient(value: number, min: number, max: number) {
  const percentage = ((value - min) / (max - min)) * 100;
  return `linear-gradient(to right,#164A34 0%,#164A34 ${percentage}%,#DDE8DD ${percentage}%,#DDE8DD 100%)`;
}

export function PropertyEMI({ price }: PropertyEMIProps) {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  useEffect(() => {
    const rupees = parsePriceToRupees(price);
    if (rupees > 0) {
      setLoanAmount(Math.round(rupees * 0.8));
    }
  }, [price]);

  const { emiMonthly, totalInterest, totalPayment } = useMemo(() => {
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;
    const payment =
      monthlyRate === 0
        ? loanAmount / months
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

    const total = payment * months;

    return {
      emiMonthly: payment,
      totalPayment: total,
      totalInterest: total - loanAmount,
    };
  }, [interestRate, loanAmount, tenure]);

  return (
    <div className="rounded-[20px] border border-estate-border/80 bg-white p-8 shadow-estate">
      <div className="flex items-center gap-4 mb-7">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] border border-estate-border bg-estate-blue-pale">
          <Calculator className="w-5 h-5 text-estate-navy" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-estate-text">EMI Calculator</h3>
          <p className="mt-0.5 text-xs text-estate-muted">Estimate your monthly home loan payment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-7">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-estate-muted">Loan Amount</label>
              <span className="text-sm font-bold text-estate-navy">{formatINR(loanAmount)}</span>
            </div>
            <input
              type="range"
              min={500000}
              max={100000000}
              step={100000}
              value={loanAmount}
              onChange={(event) => setLoanAmount(Number(event.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
              style={{ background: sliderGradient(loanAmount, 500000, 100000000) }}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">{"\u20b9"}5L</span>
              <span className="text-[10px] text-gray-400">{"\u20b9"}10 Cr</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-estate-muted">Interest Rate</label>
              <span className="text-sm font-bold text-estate-navy">{interestRate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={6}
              max={15}
              step={0.1}
              value={interestRate}
              onChange={(event) => setInterestRate(Number(event.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
              style={{ background: sliderGradient(interestRate, 6, 15) }}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">6%</span>
              <span className="text-[10px] text-gray-400">15%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-estate-muted">Tenure</label>
              <span className="text-sm font-bold text-estate-navy">{tenure} Years</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenure}
              onChange={(event) => setTenure(Number(event.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
              style={{ background: sliderGradient(tenure, 5, 30) }}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">5 yrs</span>
              <span className="text-[10px] text-gray-400">30 yrs</span>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] bg-estate-navy p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50 mb-2">Monthly EMI</p>
          <p className="text-4xl font-light tracking-tight text-white mb-7 leading-none">
            {"\u20b9"}
            {Number.isFinite(emiMonthly) ? Math.round(emiMonthly).toLocaleString("en-IN") : "\u2014"}
          </p>
          <div className="space-y-0">
            {[
              { label: "Principal", value: formatINR(loanAmount), highlight: false },
              { label: "Total Interest", value: formatINR(Math.round(totalInterest)), highlight: false },
              { label: "Total Payment", value: formatINR(Math.round(totalPayment)), highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex items-center justify-between py-3 border-t border-white/10 first:border-t-0">
                <span className="text-xs text-white/50 font-light">{label}</span>
                <span className={`text-sm font-semibold ${highlight ? "text-[#BFE6BF] text-base" : "text-white"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-6 font-light leading-relaxed">
        * EMI calculation is indicative only. Actual rates may vary based on credit score, bank policies, and market conditions.
      </p>
    </div>
  );
}
