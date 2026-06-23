import { Navigate, Outlet } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext.jsx';

export default function BusinessRequiredRoute() {
  const { loading, hasBusiness, error } = useBusiness();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-500">Loading business workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!hasBusiness) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
}
