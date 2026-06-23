import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function finishSignIn() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!data.session) {
          throw new Error('Google sign-in did not return a valid session. Please try again.');
        }

        navigate('/dashboard', { replace: true });
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Unable to complete Google sign-in.');
      }
    }

    finishSignIn();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center text-slate-950 shadow-2xl">
        {error ? (
          <>
            <h1 className="text-xl font-bold">Sign-in failed</h1>
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            <a href="/login" className="mt-5 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white">
              Back to login
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <h1 className="mt-4 text-xl font-bold">Completing Google sign-in</h1>
            <p className="mt-2 text-sm text-slate-500">Please wait while we prepare your POS workspace.</p>
          </>
        )}
      </div>
    </div>
  );
}
