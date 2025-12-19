import React, { useState, useMemo } from "react";
import DefaultLayout from "@/layouts/default";
import { compareTaxRegimes } from "@/lib/compareTaxRegimes";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Chip,
  Divider,
} from "@nextui-org/react";
const CustomInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <Input
    type="number"
    label={label}
    placeholder="0"
    labelPlacement="outside"
    startContent={
      <div className="pointer-events-none flex items-center">
        <span className="text-default-400 text-small">₹</span>
      </div>
    }
    value={value}
    onValueChange={onChange}
    isInvalid={parseFloat(value) < 0}
    errorMessage={parseFloat(value) < 0 ? "Value cannot be negative" : ""}
    classNames={{
      label: "font-semibold mb-2 text-sm",
      inputWrapper: "bg-default-100",
    }}
  />
);
export default function CompareRegimePage() {
  // Income State
  const [grossSalary, setGrossSalary] = useState("");
  const [exemptAllowances, setExemptAllowances] = useState("");
  const [reliefIncome, setReliefIncome] = useState("");
  const [deductions16, setDeductions16] = useState("");
  // Deductions State
  const [donationsPaid, setDonationsPaid] = useState("");
  const [scientificResearch, setScientificResearch] = useState("");
  const [deduction80GG, setDeduction80GG] = useState("");
  const [providentFund, setProvidentFund] = useState("");
  const [deduction80CCD2, setDeduction80CCD2] = useState("");
  const [medicalInsurance, setMedicalInsurance] = useState("");
  const [higherEducationLoan, setHigherEducationLoan] = useState("");
  const [savingsInterest, setSavingsInterest] = useState("");
  const [result, setResult] = useState<any>(null);
  // Aggregation Helpers
  const parseAmount = (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const currentTotalIncome =
    parseAmount(grossSalary) -
    (parseAmount(exemptAllowances) + parseAmount(reliefIncome));
  // Note: Deductions u/s 16 is usually subtracted for Net Salary, but for "Gross Total Income" as per typical ITR calc:
  // Gross Salary - Exemptions = Net Salary.
  // Net Salary - Std Deduction (u/s 16) - Professional Tax = Income from Salary.
  // For simplicity in this UI, we will just sum Gross Salary as the base for calculations,
  // but the displayed "Total" can be just Gross Salary or Net.
  // Let's display Gross Salary to be simple, or maybe "Net Salary" if we subtract exemptions.
  // Given the fields, let's just sum the logic used for tax calc: Gross Salary.

  // Actually, for better UX let's show what will be passed to calculation.
  const displayedGrossIncome = parseAmount(grossSalary);

  const displayedTotalDeductions =
    parseAmount(exemptAllowances) +
    parseAmount(reliefIncome) +
    parseAmount(deductions16) +
    parseAmount(donationsPaid) +
    parseAmount(scientificResearch) +
    parseAmount(deduction80GG) +
    parseAmount(providentFund) +
    parseAmount(deduction80CCD2) +
    parseAmount(medicalInsurance) +
    parseAmount(higherEducationLoan) +
    parseAmount(savingsInterest);

  // Validation
  const hasNegativeError = useMemo(() => {
    const inputs = [
      grossSalary,
      exemptAllowances,
      reliefIncome,
      deductions16,
      donationsPaid,
      scientificResearch,
      deduction80GG,
      providentFund,
      deduction80CCD2,
      medicalInsurance,
      higherEducationLoan,
      savingsInterest,
    ];
    return inputs.some((val) => parseFloat(val) < 0);
  }, [
    grossSalary,
    exemptAllowances,
    reliefIncome,
    deductions16,
    donationsPaid,
    scientificResearch,
    deduction80GG,
    providentFund,
    deduction80CCD2,
    medicalInsurance,
    higherEducationLoan,
    savingsInterest,
  ]);

  const handleCompare = () => {
    if (hasNegativeError) return;

    // Aggregation
    const totalGrossIncome = parseAmount(grossSalary);

    // Total Deductions = All deduction fields including u/s 16
    const totalDeductions = displayedTotalDeductions;

    const res = compareTaxRegimes({
      income: totalGrossIncome,
      deductions: totalDeductions,
    });
    setResult(res);
  };

  const columns = [
    { key: "item", label: "ITEM" },
    { key: "old", label: "OLD REGIME" },
    { key: "new", label: "NEW REGIME" },
  ];

  const rows = result
    ? [
        {
          key: "1",
          item: "Taxable Income",
          old: `₹${result.oldRegime.taxableIncome.toLocaleString()}`,
          new: `₹${result.newRegime.taxableIncome.toLocaleString()}`,
        },
        {
          key: "2",
          item: "Base Tax",
          old: `₹${result.oldRegime.tax.toLocaleString()}`,
          new: `₹${result.newRegime.tax.toLocaleString()}`,
        },
        {
          key: "3",
          item: "Cess (4%)",
          old: `₹${result.oldRegime.cess.toLocaleString()}`,
          new: `₹${result.newRegime.cess.toLocaleString()}`,
        },
        {
          key: "4",
          item: "Total Tax Payable",
          old: `₹${result.oldRegime.totalTax.toLocaleString()}`,
          new: `₹${result.newRegime.totalTax.toLocaleString()}`,
        },
      ]
    : [];

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto py-8 px-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-2">
            Tax Regime Comparator
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Compare Old vs New Tax Regime with detailed breakdowns
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Section */}
          <div className="flex-1 space-y-6">
            <Card className="p-4 shadow-md border-b-4 border-blue-500">
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-600">
                  Gross Total Income
                </h2>
                <Chip color="primary" variant="flat">
                  Total: ₹{displayedGrossIncome.toLocaleString()}
                </Chip>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4">
                <CustomInput
                  label="Gross Salary"
                  value={grossSalary}
                  onChange={setGrossSalary}
                />
                <CustomInput
                  label="Exempt Allowances"
                  value={exemptAllowances}
                  onChange={setExemptAllowances}
                />
                <CustomInput
                  label="Relief u/s 89A"
                  value={reliefIncome}
                  onChange={setReliefIncome}
                />
                <CustomInput
                  label="Deductions u/s 16 (Std Deduction)"
                  value={deductions16}
                  onChange={setDeductions16}
                />
              </CardBody>
            </Card>

            <Card className="p-4 shadow-md border-b-4 border-green-500">
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-600">
                  Total Deductions
                </h2>
                <Chip color="success" variant="flat">
                  Total: ₹{displayedTotalDeductions.toLocaleString()}
                </Chip>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <CustomInput
                  label="Donations Paid"
                  value={donationsPaid}
                  onChange={setDonationsPaid}
                />
                <CustomInput
                  label="Scientific Research"
                  value={scientificResearch}
                  onChange={setScientificResearch}
                />
                <CustomInput
                  label="Deduction u/s 80GG"
                  value={deduction80GG}
                  onChange={setDeduction80GG}
                />
                <CustomInput
                  label="Provident Fund"
                  value={providentFund}
                  onChange={setProvidentFund}
                />
                <CustomInput
                  label="Deduction u/s 80CCD(2)"
                  value={deduction80CCD2}
                  onChange={setDeduction80CCD2}
                />
                <CustomInput
                  label="Medical Insurance Premium"
                  value={medicalInsurance}
                  onChange={setMedicalInsurance}
                />
                <CustomInput
                  label="Higher Education Loan Interest"
                  value={higherEducationLoan}
                  onChange={setHigherEducationLoan}
                />
                <CustomInput
                  label="Savings Interest"
                  value={savingsInterest}
                  onChange={setSavingsInterest}
                />
              </CardBody>
            </Card>

            <Button
              size="lg"
              color={hasNegativeError ? "danger" : "primary"}
              isDisabled={hasNegativeError}
              className="w-full font-bold text-lg shadow-lg"
              onPress={handleCompare}
            >
              Compare Regimes
            </Button>
          </div>
          {/* Result Section */}
          {result && (
            <div className="flex-1 space-y-6 lg:min-w-[400px] animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Recommendation Card */}
              <Card
                className={`p-6 border-2 ${result.betterRegime === "old" ? "border-orange-400 bg-orange-50/10" : "border-green-400 bg-green-50/10"}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Recommended</h3>
                    <Chip
                      color={
                        result.betterRegime === "old" ? "warning" : "success"
                      }
                      variant="solid"
                    >
                      {result.betterRegime === "old"
                        ? "OLD REGIME"
                        : "NEW REGIME"}
                    </Chip>
                  </div>
                  <div className="text-center py-4 bg-default-50 rounded-lg">
                    <p className="text-sm text-default-500 uppercase font-bold tracking-wider">
                      Projected Savings
                    </p>
                    <p
                      className={`text-3xl font-black ${result.savings > 0 ? "text-green-600" : "text-default-400"}`}
                    >
                      ₹{result.savings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
              {/* Comparison Table */}
              <Card className="shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold px-2">
                    Detailed Breakdown
                  </h3>
                </CardHeader>
                <CardBody>
                  <Table
                    aria-label="Tax Comparison Table"
                    selectionMode="none"
                    removeWrapper
                    color="primary"
                  >
                    <TableHeader columns={columns}>
                      {(column) => (
                        <TableColumn
                          key={column.key}
                          className={column.key === "item" ? "w-1/3" : ""}
                        >
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody items={rows}>
                      {(item) => (
                        <TableRow key={item.key}>
                          {(columnKey) => (
                            <TableCell className="text-base font-medium">
                              {getKeyValue(item, columnKey)}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
