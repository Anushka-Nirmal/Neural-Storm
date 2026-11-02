import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedtext hover:text-govblue-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-govborder shadow-sm space-y-5">
          <h1 className="text-xl font-extrabold text-navy-800">Password Recovery</h1>
          <p className="text-xs text-mutedtext">Enter your registered email address to receive password reset instructions.</p>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recovery Instructions Sent</span>
              </div>
              <p>If an account exists for {email}, a recovery link has been delivered to your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-800">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-govborder focus:outline-none focus:ring-2 focus:ring-govblue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-govblue-600 hover:bg-govblue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                Send Reset Link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
