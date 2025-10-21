"use client";

import { useState } from "react";
import { Eye, Mail, KeyRound, EyeClosed, MoveRight } from "lucide-react";
import Link from "next/link";
import { UserIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

type CountryOption = {
  code: string;
  dialCode: string;
};

const countries: CountryOption[] = [
  { code: "US", dialCode: "+1" },
  { code: "DK", dialCode: "+45" },
  { code: "NPL", dialCode: "+977" },
  { code: "GB", dialCode: "+44" },
];

export default function Signup() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    countries[0]
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const res = await fetch(
        "https://sandbox.timroticket.com/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            phone: `${selectedCountry.dialCode}${phone}`,
            first_name : firstName,
            last_name: lastName,
          }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Registration failed");
        return;
      }

      setSuccess("Account created successfully! Please verify your email.");
      
      setTimeout(() => {
        router.push(`/auth/pages/verifyotp?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      console.error("Error registering:", err);
      setError("Server error -please try again later.");
    }

  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Register{" "}
          <span className="text-blue-600 text-sm font-normal">
            as Organizer
          </span>
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

    {/* First Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="first_name"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            First Name
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="first_name"
              type="text"
              placeholder="Enter First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
            {/* Last Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="last_name"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Last Name
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="last_name"
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        {/* Phone Input */}
        <div>
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Contact Number
          </label>
          <div className="flex mt-1">
            <select
              value={selectedCountry.code}
              onChange={(e) =>
                setSelectedCountry(
                  countries.find((c) => c.code === e.target.value) ||
                    countries[0]
                )
              }
              className="rounded-l-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code} {country.dialCode}
                </option>
              ))}
            </select>
            <input
              id="phone"
              type="text"
              inputMode="numeric"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="flex-1 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        {/* Submit Button */}
        <button
          type="submit"
          className="relative w-full flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Get Started
          <MoveRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/auth/pages/login"
          className="text-blue-600 hover:underline"
        >
          Sign in as Organizer.
        </Link>
      </p>

      <div className="my-4 border-t border-gray-300 dark:border-gray-700" />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        By continuing, you consent to the fact that you have read and understood
        our{" "}
        <Link
          href="/termsandconditions"
          className="text-blue-600 hover:underline"
        >
          terms and conditions{" "}
        </Link>
        and{" "}
        <Link href="/policy" className="text-blue-600 hover:underline">
          privacy policy{" "}
        </Link>
      </p>
    </div>
    // </main>
  );
}
