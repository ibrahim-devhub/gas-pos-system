import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext.jsx';

const BusinessContext = createContext(null);

const starterStock = [
  ['6kg Gas Cylinder', '6kg', 0, 1800, 2600, 5],
  ['13kg Gas Cylinder', '13kg', 0, 3600, 5200, 5],
  ['50kg Gas Cylinder', '50kg', 0, 13200, 18500, 2],
  ['Gas Regulator', 'Accessory', 0, 850, 1400, 5],
  ['Gas Burner', 'Accessory', 0, 600, 1100, 5]
];

export function BusinessProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [business, setBusiness] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBusiness = async () => {
    if (authLoading) return;
    if (!user) {
      setBusiness(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      setProfile(profileData || null);
      if (!profileData?.business_id) {
        setBusiness(null);
        return;
      }

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', profileData.business_id)
        .maybeSingle();

      if (businessError) throw businessError;
      setBusiness(businessData || null);
    } catch (err) {
      setError(err.message || 'Unable to load business profile.');
      setBusiness(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusiness();
  }, [user?.id, authLoading]);

  const setupBusiness = async ({ business_name, currency, receipt_footer, seed_stock }) => {
    if (!user) throw new Error('You must be signed in to create a business.');

    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        business_name,
        currency,
        receipt_footer
      })
      .select()
      .single();

    if (businessError) throw businessError;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        business_id: businessData.id,
        name: user.name,
        email: user.email,
        role: 'admin'
      })
      .select()
      .single();

    if (profileError) throw profileError;

    if (seed_stock) {
      const rows = starterStock.map(([product_name, cylinder_size, quantity, buying_price, selling_price, low_stock_limit]) => ({
        business_id: businessData.id,
        product_name,
        cylinder_size,
        quantity,
        buying_price,
        selling_price,
        low_stock_limit
      }));
      const { error: stockError } = await supabase.from('stock').insert(rows);
      if (stockError) throw stockError;
    }

    setBusiness(businessData);
    setProfile(profileData);
    return businessData;
  };

  const value = useMemo(
    () => ({
      business,
      profile,
      loading,
      error,
      hasBusiness: Boolean(business?.id),
      setupBusiness,
      refreshBusiness: loadBusiness
    }),
    [business, profile, loading, error]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  return useContext(BusinessContext);
}
