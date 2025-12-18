// @ts-nocheck
import { useState, useEffect, useContext } from 'react';
import DefaultLayout from '@/layouts/default';
import { Card } from '@nextui-org/react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { SessionContext } from "@/lib/usercontext";

export default function GetUserInfo() {
  const router = useRouter();
  const session = useContext(SessionContext);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    grossSalary: "",
    fdIncome: { has: "no", amount: "" },
    tds: { has: "no", amount: "" },
    investments: { has: "no", amount: "" },
    healthInsurance: { has: "no", amount: "" },
    educationLoan: { has: "no", amount: "" },
    homeLoanInterest: { has: "no", amount: "" },
    hraLta: { has: "no", amount: "" },
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (session === undefined) return; // Still loading
    
    if (!session || !session.user?.id) {
      router.push('/login');
      return;
    }
    
    console.log('Session user ID:', session.user.id);
    setIsLoading(false);
  }, [router, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check session before submitting
    if (!session || !session.user?.id) {
      alert('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    
    console.log('Form data:', formData);
    console.log('User ID:', session.user.id);
    
    // Save the data to the database
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: session.user.id,
            gross_salary: formData.grossSalary,
            income_from_fd:
              formData.fdIncome.has === "yes" ? formData.fdIncome.amount : null,
            tds: formData.tds.has === "yes" ? formData.tds.amount : null,
            investments:
              formData.investments.has === "yes" ? formData.investments.amount : null,
            health_insurance:
              formData.healthInsurance.has === "yes" ? formData.healthInsurance.amount : null,
            education_loan:
              formData.educationLoan.has === "yes" ? formData.educationLoan.amount : null,
            home_loan_interest:
              formData.homeLoanInterest.has === "yes" ? formData.homeLoanInterest.amount : null,
            hra_lta: formData.hraLta.has === "yes" ? formData.hraLta.amount : null,
          },
          { onConflict: 'id' }
        );
      if (error) {
        console.error('Supabase error:', error);
        alert(`An error occurred while saving the data: ${error.message}`);
      } else {
        console.log('Data saved successfully:', data);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Catch error:', err);
      alert(`An error occurred while saving the data: ${err.message}`);
    }
  };

  const handleRadioChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-content1 w-full max-w-2xl rounded-3xl shadow-2xl p-10">
          <h2 className="text-center text-4xl font-extrabold text-green-700 dark:text-green-400 mb-6">
            HELP US TO KNOW YOU !!
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Gross Salary
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-md focus:ring-2 focus:ring-green-500"
                value={formData.grossSalary}
                onChange={(e) =>
                  setFormData({ ...formData, grossSalary: e.target.value })
                }
              />
            </div>

            {[
              { label: "Income from FDs", name: "fdIncome" },
              { label: "TDS (Tax Deducted at Source)", name: "tds" },
              { label: "Total Investments in PF PPF LIC", name: "investments" },
              { label: "Health Insurance Premium", name: "healthInsurance" },
              { label: "Education Loan", name: "educationLoan" },
              { label: "Home Loan Interest", name: "homeLoanInterest" },
              { label: "HRA LTA (Leave Travel Allowance)", name: "hraLta" },
            ].map(({ label, name }) => (
              <div key={name} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl shadow-lg">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  {label}
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="yes"
                      checked={formData[name].has === "yes"}
                      onChange={() =>
                        handleRadioChange(name, { has: "yes", amount: formData[name].amount })
                      }
                      className="w-5 h-5 text-green-500 focus:ring-green-400"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="no"
                      checked={formData[name].has === "no"}
                      onChange={() =>
                        handleRadioChange(name, { has: "no", amount: "" })
                      }
                      className="w-5 h-5 text-green-500 focus:ring-green-400"
                    />
                    <span className="text-gray-700 dark:text-gray-300">No</span>
                  </label>
                </div>
                {formData[name].has === "yes" && (
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={formData[name].amount}
                    onChange={(e) =>
                      handleRadioChange(name, { has: "yes", amount: e.target.value })
                    }
                    className="w-full mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-md focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full p-4 text-white font-bold bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-xl shadow-lg text-lg transition-all duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
}