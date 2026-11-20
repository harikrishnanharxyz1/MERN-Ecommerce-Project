import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import { useShop } from '../context/use-shop.js';

export default function Login() {
  const { user, login, loginAdmin, register, logout } = useShop();
  const navigate = useNavigate();

  const [mode, setMode] = useState('sign-in');
  const [accountType, setAccountType] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCreatingAccount = mode === 'create-account';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    try {
      if (isCreatingAccount) {
        await register({ name, email, password });
        setMessage('Account created successfully! Welcome to Fastbuy.');
        setTimeout(() => navigate('/collection'), 1200);
      } else if (accountType === 'admin') {
        await loginAdmin({ email, password });
        setMessage('Administrator signed in successfully.');
        setTimeout(() => navigate('/admin'), 800);
      } else {
        await login({ email, password });
        setMessage('Signed in successfully! Welcome back.');
        setTimeout(() => navigate('/collection'), 1000);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setMessage('');
    setIsError(false);
    setShowPassword(false);
  };

  // If user is already logged in, show active account profile
  if (user) {
    return (
      <section className="mx-auto max-w-xl py-14 sm:py-20 text-center">
        <div className="rounded-3xl border border-[#D49A9A] bg-white/80 p-8 sm:p-12 shadow-lg backdrop-blur-sm">
          <span className="inline-block bg-[#AA5E7A]/20 text-[#7C0E44] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em]">
            Your Account
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#381E29]">
            Hello, {user.name}
          </h2>
          <p className="mt-2 text-sm font-medium text-[#5E2F44]">{user.email}</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="bg-[#AA5E7A] text-white px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#7C0E44] shadow-sm hover:shadow-md transition-all"
              >
                ⚙️ Admin Dashboard
              </Link>
            )}
            <Link
              to="/orders"
              className="bg-[#7C0E44] text-white px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#630A36] shadow-sm hover:shadow-md transition-all"
            >
              View your orders
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-[#D49A9A] bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#7C0E44] hover:bg-[#D49A9A]/30 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl py-6 sm:py-12">
      <div className="grid overflow-hidden rounded-3xl border border-[#D49A9A] bg-white/85 shadow-xl lg:grid-cols-2">
        {/* Visual Brand Aside */}
        <aside className="relative min-h-[340px] overflow-hidden bg-gradient-to-br from-[#DFABA5] to-[#D49A9A] p-8 sm:min-h-[420px] sm:p-10 lg:min-h-[580px]">
          <img
            src={assets.decoration2}
            alt=""
            className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#381E29]/80 via-transparent to-transparent" />
          <div className="relative flex h-full min-h-[276px] flex-col justify-end p-6 text-white sm:min-h-[340px] sm:p-8 lg:min-h-[500px]">
            <span className="mb-3 inline-block bg-[#AA5E7A] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] w-fit">
              A little more personal
            </span>
            <h1 className="max-w-sm text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-white">
              Good things are better when they feel like yours.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/90">
              Keep your favorite finds close and pick up where you left off.
            </p>
          </div>
        </aside>

        {/* Form Container */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#AA5E7A]">
            Welcome to Fastbuy
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#381E29]">
            {isCreatingAccount ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5E2F44]">
            {isCreatingAccount
              ? 'Set up an account to make checkout feel a little easier.'
              : 'Good to have you back. Enter your details below.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[#F2DACE]/60 p-1.5 border border-[#D49A9A]/40" role="tablist">
            {[
              ['sign-in', 'Sign in'],
              ['create-account', 'Create account'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => changeMode(value)}
                className={`rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  mode === value
                    ? 'bg-[#AA5E7A] text-white shadow-xs'
                    : 'text-[#4A2033] hover:text-[#7C0E44]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!isCreatingAccount && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E2F44]">
                Sign in as
              </p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
                {[
                  ['user', 'User'],
                  ['admin', 'Admin'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={accountType === value}
                    onClick={() => setAccountType(value)}
                    className={`rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                      accountType === value
                        ? 'border-[#7C0E44] bg-[#7C0E44] text-white'
                        : 'border-[#D49A9A] bg-white/60 text-[#5E2F44] hover:bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isCreatingAccount && (
              <label className="field-label" htmlFor="account-name">
                Full name
                <input
                  id="account-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="field-input"
                  placeholder="Your full name"
                />
              </label>
            )}
            <label className="field-label" htmlFor="account-email">
              {accountType === 'admin' && !isCreatingAccount
                ? 'Administrator email or username'
                : 'Email address'}
              <input
                id="account-email"
                name="email"
                type="text"
                autoComplete="username"
                required
                className="field-input"
                placeholder={
                  accountType === 'admin' && !isCreatingAccount
                    ? 'admin'
                    : 'you@example.com'
                }
              />
            </label>
            <label className="field-label" htmlFor="account-password">
              Password
              <span className="relative block">
                <input
                  id="account-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isCreatingAccount ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                  className="field-input pr-16"
                  placeholder={isCreatingAccount ? 'At least 8 characters' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-3 text-xs font-bold text-[#AA5E7A] hover:text-[#7C0E44] transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#7C0E44] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:bg-[#630A36] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:bg-[#AA5E7A]/40"
            >
              {loading
                ? isCreatingAccount
                  ? 'Creating account...'
                  : accountType === 'admin'
                  ? 'Signing in as admin...'
                  : 'Signing in...'
                : isCreatingAccount
                ? 'Create account'
                : accountType === 'admin'
                ? 'Sign in as admin'
                : 'Sign in'}
            </button>

            {message && (
              <p
                role="status"
                className={`rounded-xl border p-3.5 text-sm font-semibold leading-5 ${
                  isError
                    ? 'border-red-300 bg-red-50 text-red-800'
                    : 'border-green-300 bg-green-50 text-green-800'
                }`}
              >
                {message}
              </p>
            )}
          </form>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#D49A9A]/30 pt-5 text-xs font-semibold uppercase tracking-wider">
            <Link
              to="/collection"
              className="text-[#7C0E44] hover:underline"
            >
              Continue as guest →
            </Link>
            <Link
              to="/orders"
              className="text-[#AA5E7A] hover:text-[#7C0E44] transition-colors"
            >
              View order history
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
