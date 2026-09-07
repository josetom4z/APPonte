import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';
import { tenantService } from '../services/tenant.service';

interface TenantContextType {
  activeTenant: Tenant | null;
  activeCities: Tenant[];
  isLoadingCities: boolean;
  setActiveTenant: (tenant: Tenant | null) => void;
  selectCityBySlug: (slug: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCities, setActiveCities] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenantState] = useState<Tenant | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(true);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await tenantService.getActiveCities();
        setActiveCities(cities);

        const savedTenantId = localStorage.getItem('apponte_active_tenant_id');
        if (savedTenantId) {
          const matched = cities.find((c) => c._id === savedTenantId);
          if (matched) {
            setActiveTenantState(matched);
            return;
          }
        }

        // Default to first active city if none saved
        if (cities.length > 0) {
          setActiveTenantState(cities[0]);
          localStorage.setItem('apponte_active_tenant_id', cities[0]._id);
        }
      } catch (err) {
        console.error('Failed to load active cities:', err);
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  const setActiveTenant = (tenant: Tenant | null) => {
    setActiveTenantState(tenant);
    if (tenant) {
      localStorage.setItem('apponte_active_tenant_id', tenant._id);
    } else {
      localStorage.removeItem('apponte_active_tenant_id');
    }
  };

  const selectCityBySlug = async (slug: string) => {
    try {
      const tenant = await tenantService.getBySlug(slug);
      setActiveTenant(tenant);
    } catch (err) {
      console.error('Failed to load tenant by slug:', err);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        activeTenant,
        activeCities,
        isLoadingCities,
        setActiveTenant,
        selectCityBySlug,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
