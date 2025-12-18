type TaxInput = {
  income: number;          // total income
  deductions: number;      // total deductions
  regime: "old" | "new";
};

export function calculateTax({ income, deductions, regime }: TaxInput) {
  let taxableIncome = 0;

  if (regime === "old") {
    taxableIncome = Math.max(income - deductions, 0);
  } else {
    taxableIncome = Math.max(income - 75000, 0);
  }

  let tax = 0;

  const slabs = [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
  ];

  let previousLimit = 0;

  for (const slab of slabs) {
    if (taxableIncome > previousLimit) {
      const amountInSlab =
        Math.min(taxableIncome, slab.limit) - previousLimit;
      tax += amountInSlab * slab.rate;
      previousLimit = slab.limit;
    }
  }

  const cess = tax * 0.04;
  const totalTax = tax + cess;

  return {
    taxableIncome,
    tax,
    cess,
    totalTax
  };
}
