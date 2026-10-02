"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  MapPin,
  Building2,
  User as UserIcon,
  KeyRound,
  Zap,
  Shield,
  Globe,
  Mic,
} from "lucide-react";
import { DISTRICTS } from "@/lib/geofencing";

type AuthMode = "login" | "otp" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, sendOtp, loginWithOtp, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regPincode, setRegPincode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(email, password);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error ?? "Login failed");
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = sendOtp(otpEmail);
    if (result.success) {
      setOtpSent(true);
      setGeneratedOtp(result.otp ?? null);
    } else {
      setError(result.error ?? "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = loginWithOtp(otpEmail, otp);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error ?? "Invalid OTP");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!regName || !regEmail || !regPassword || !regCity || !regDistrict || !regAddress) {
      setError("All fields are required (name, email, password, address, city, district)");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = register({
      name: regName,
      email: regEmail,
      password: regPassword,
      address: regAddress,
      city: regCity,
      district: regDistrict,
      pincode: regPincode,
    });
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error ?? "Registration failed");
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 400));
    const result = login("kartik@locult.in", "demo123");
    if (result.success) router.push("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Left hero panel */}
      <div className="hidden lg:flex w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #a855f7 0%, #6d28d9 40%, #3b82f6 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -left-16 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="LoCult"
            width={200}
            height={60}
            className="mb-4"
            priority
          />
          <p className="text-indigo-100 text-lg max-w-md mt-4">
            Your community. Your information. One trusted place.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Location-Aware
            </h3>
            <p className="text-indigo-200 text-sm">
              Information attached to geography, not social graphs. See what matters near you.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Community Verified
            </h3>
            <p className="text-indigo-200 text-sm">
              Trust scores, verification, and community-driven resolution lifecycle.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              AI-Powered
            </h3>
            <p className="text-indigo-200 text-sm">
              Voice input, auto-categorization, toxicity guard, and smart routing.
            </p>
          </div>
        </div>

        <p className="text-indigo-300 text-xs relative z-10">
          © 2026 LoCult. Built for communities.
        </p>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src="/logo.png" alt="LoCult" width={160} height={48} priority />
          </div>

          {/* Auth mode tabs */}
          <div className="flex rounded-xl border mb-8 overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
            {(["login", "otp", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === m ? "text-white" : ""
                }`}
                style={
                  mode === m
                    ? { background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }
                    : { color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }
                }
              >
                {m === "login" ? "Password" : m === "otp" ? "OTP Login" : "Sign Up"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* PASSWORD LOGIN */}
          {mode === "login" && (
            <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Welcome back
              </h1>
              <p className="mb-8" style={{ color: "var(--text-muted)" }}>
                Sign in to your community account
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    <Mail className="w-4 h-4 inline mr-1 -mt-0.5" /> Email
                  </label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    <Lock className="w-4 h-4 inline mr-1 -mt-0.5" /> Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password" required
                      className="w-full px-4 py-3 rounded-xl border outline-none transition-all pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </button>
              </form>
            </>
          )}

          {/* OTP LOGIN */}
          {mode === "otp" && (
            <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                OTP Login
              </h1>
              <p className="mb-8" style={{ color: "var(--text-muted)" }}>
                We&apos;ll send a one-time code to your email
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    <Mail className="w-4 h-4 inline mr-1 -mt-0.5" /> Email Address
                  </label>
                  <input
                    type="email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                    disabled={otpSent}
                  />
                </div>

                {!otpSent ? (
                  <button onClick={handleSendOtp} disabled={loading || !otpEmail}
                    className="w-full py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg"
                    style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}>
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                ) : (
                  <>
                    {/* Show generated OTP in demo mode */}
                    {generatedOtp && (
                      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                          <KeyRound className="w-4 h-4 inline mr-1" />
                          Demo Mode — Your OTP: <span className="font-mono font-bold text-lg">{generatedOtp}</span>
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                          In production, this would be sent to your email via a service like Resend, SendGrid, or AWS SES.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        <KeyRound className="w-4 h-4 inline mr-1 -mt-0.5" /> Enter OTP
                      </label>
                      <input
                        type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP" maxLength={6}
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-all text-center text-2xl font-mono tracking-[0.5em]"
                      />
                    </div>

                    <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}
                      className="w-full py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg"
                      style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}>
                      {loading ? "Verifying..." : "Verify & Login"}
                    </button>

                    <button onClick={() => { setOtpSent(false); setOtp(""); setGeneratedOtp(null); }}
                      className="w-full py-2 text-sm" style={{ color: "var(--text-muted)" }}>
                      Resend OTP
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* REGISTRATION */}
          {mode === "register" && (
            <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Join Your Community
              </h1>
              <p className="mb-6" style={{ color: "var(--text-muted)" }}>
                Create an account to start sharing local information
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      <UserIcon className="w-3.5 h-3.5 inline mr-1" /> Full Name *
                    </label>
                    <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                      placeholder="Your name" required
                      className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      <Mail className="w-3.5 h-3.5 inline mr-1" /> Email *
                    </label>
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com" required
                      className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    <Lock className="w-3.5 h-3.5 inline mr-1" /> Password *
                  </label>
                  <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password" required
                    className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="w-3.5 h-3.5 inline mr-1" /> Address *
                  </label>
                  <input type="text" value={regAddress} onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g. 203, Sai Residency, Station Road" required
                    className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      <Building2 className="w-3.5 h-3.5 inline mr-1" /> City *
                    </label>
                    <input type="text" value={regCity} onChange={(e) => setRegCity(e.target.value)}
                      placeholder="City" required
                      className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      District *
                    </label>
                    <select value={regDistrict} onChange={(e) => setRegDistrict(e.target.value)} required
                      className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm">
                      <option value="">Select</option>
                      {DISTRICTS.map((d) => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Pincode
                    </label>
                    <input type="text" value={regPincode} onChange={(e) => setRegPincode(e.target.value)}
                      placeholder="400001" maxLength={6}
                      className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg mt-2"
                  style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: "var(--border-color)" }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-muted)" }}>
                or try a demo account
              </span>
            </div>
          </div>

          <button onClick={handleDemoLogin} disabled={loading}
            className="w-full mt-6 py-3 border font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}>
            <Zap className="w-4 h-4 text-amber-500" />
            Quick Demo Login (Kartik)
          </button>

          <div className="mt-6 rounded-xl p-4 text-xs" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
            <p className="font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Demo Accounts:</p>
            <div className="space-y-1">
              <p><Mail className="w-3 h-3 inline" /> kartik@locult.in · <Lock className="w-3 h-3 inline" /> demo123 (Trust: 85)</p>
              <p><Mail className="w-3 h-3 inline" /> priya@locult.in · <Lock className="w-3 h-3 inline" /> demo123 (Trust: 72)</p>
              <p><Mail className="w-3 h-3 inline" /> vikram@locult.in · <Lock className="w-3 h-3 inline" /> demo123 (Trust: 92)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
