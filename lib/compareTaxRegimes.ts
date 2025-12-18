import { calculateTax } from "./taxCalculator";

type CompareInput = {
  income: number;
  deductions: number;
};

export function compareTaxRegimes({ income, deductions }: CompareInput) {
  const oldRegime = calculateTax({
    income,
    deductions,
    regime: "old"
  });

  const newRegime = calculateTax({
    income,
    deductions,
    regime: "new"
  });

  let betterRegime: "old" | "new";
  let savings: number;

  if (oldRegime.totalTax < newRegime.totalTax) {
    betterRegime = "old";
    savings = newRegime.totalTax - oldRegime.totalTax;
  } else {
    betterRegime = "new";
    savings = oldRegime.totalTax - newRegime.totalTax;
  }

  return {
    oldRegime,
    newRegime,
    betterRegime,
    savings
  };
}
