import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Supports both Supabase flows:
    // 1. ?token_hash=...&type=recovery (your custom template) -> verifyOtp
    // 2. ?code=... (PKCE) -> exchangeCodeForSession
    // 3. #access_token=... legacy implicit -> getSession / PASSWORD_RECOVERY
    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenHash = params.get('token_hash');
        const type = params.get('type');
        const code = params.get('code');

        if (tokenHash && type === 'recovery') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });
          if (error) {
            setError(
              'This password reset link is invalid or has expired. Please request a new one from the sign-in page.'
            );
            setLoading(false);
            return undefined;
          }
          if (data.session) {
            setSessionReady(true);
            setLoading(false);
            return undefined;
          }
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setError(
              'This password reset link is invalid or has expired. Please request a new one from the sign-in page.'
            );
            setLoading(false);
            return undefined;
          }
          setSessionReady(true);
          setLoading(false);
          return undefined;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionReady(true);
          setLoading(false);
          return undefined;
        }
      } catch {
        setError(
          'This password reset link is invalid or has expired. Please request a new one from the sign-in page.'
        );
        setLoading(false);
        return undefined;
      }

      // Listen for the recovery event (fires when Supabase processes the link)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setSessionReady(true);
            setLoading(false);
          } else if (event === 'SIGNED_IN' && session) {
            // PKCE code exchange can also land here
            setSessionReady(true);
            setLoading(false);
          }
        }
      );

      // Fallback: if after 5s there's still no session, the link is
      // likely expired/invalid or was already used.
      const timeout = setTimeout(async () => {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!s) {
          setError(
            'This password reset link is invalid or has expired. Please request a new one from the sign-in page.'
          );
          setLoading(false);
        }
      }, 5000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((cb) => {
      if (typeof cb === 'function') cleanup = cb;
    });
    return () => cleanup?.();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const hasLowercase = /[a-z]/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`]/.test(newPassword);

    if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
      setError(
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      );
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully! Redirecting to sign in...');
        await supabase.auth.signOut();
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img
              src={`${(import.meta as any).env?.BASE_URL || '/'}atlas-logo.png`}
              alt="Atlas Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Verifying reset link...</p>
        ) : !sessionReady && error ? (
          <div className="text-center space-y-4">
            <p className="text-red-600 text-sm">{error}</p>
            <a href="/" className="inline-block text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Sign In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            {message && (
              <div className="text-green-600 text-sm text-center">{message}</div>
            )}

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
