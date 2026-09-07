import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import {
  MapPin,
  PlusCircle,
  LogOut,
  LayoutDashboard,
  Compass,
  ChevronDown,
  X,
  Building,
  Check,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isOperator, isSecretary, isAdmin, isSuperAdmin } = useAuth();
  const { activeTenant, activeCities, setActiveTenant } = useTenant();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    if (isSuperAdmin || isAdmin) return '/dashboard/admin';
    if (isSecretary) return '/dashboard/secretary';
    if (isOperator) return '/dashboard/operator';
    return '/dashboard/citizen';
  };

  const getDashboardLabel = () => {
    if (isSuperAdmin || isAdmin) return 'Painel Gestão';
    if (isSecretary) return 'Painel Secretaria';
    if (isOperator) return 'Fila de Atendimento';
    return 'Minhas Solicitações';
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-3 sm:gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    APPonte
                  </span>
                  <span className="hidden sm:inline text-[9px] text-slate-400 font-bold -mt-1 tracking-wider uppercase">
                    Voz Cidadã
                  </span>
                </div>
              </Link>

              {/* City Selector Pill (Desktop Dropdown & Mobile Bottom Sheet Trigger) */}
              <div className="relative">
                {/* Desktop Trigger */}
                <button
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[140px]">{activeTenant ? `${activeTenant.city} - ${activeTenant.state}` : 'Todas as Cidades'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Mobile Pill Trigger */}
                <button
                  onClick={() => setCitySheetOpen(true)}
                  className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800"
                >
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[100px]">{activeTenant?.city || 'Cidade'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                </button>

                {/* Desktop Dropdown */}
                {cityDropdownOpen && (
                  <div className="hidden md:block absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Selecione a Prefeitura
                    </div>
                    {activeCities.map((city) => (
                      <button
                        key={city._id}
                        onClick={() => {
                          setActiveTenant(city);
                          setCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                          activeTenant?._id === city._id
                            ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {city.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                          {city.state}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive('/')
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Início
              </Link>
              <Link
                to="/feed"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive('/feed')
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Feed Cívico
              </Link>
              <Link
                to="/map"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive('/map')
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Mapa Urbano
              </Link>
            </nav>

            {/* Right Action & Profile Area */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Create Request Button */}
              <Link
                to="/new-request"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nova Solicitação</span>
              </Link>

              {/* User Dropdown / Auth Links */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-emerald-500/30 object-cover bg-slate-100"
                    />
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        {getDashboardLabel()}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Encerrar Sessão
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors hidden xs:inline-block"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile City Selector Bottom Sheet Modal */}
      {citySheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl max-h-[80vh] overflow-y-auto p-5 space-y-4 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Selecione sua Cidade
                </h3>
              </div>
              <button
                onClick={() => setCitySheetOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Escolha a prefeitura onde você deseja registrar e acompanhar ocorrências:
            </p>

            <div className="space-y-2 pt-1">
              {activeCities.map((city) => (
                <button
                  key={city._id}
                  onClick={() => {
                    setActiveTenant(city);
                    setCitySheetOpen(false);
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between border transition-all ${
                    activeTenant?._id === city._id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{city.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{city.state} • Prefeitura Conectada</p>
                    </div>
                  </div>
                  {activeTenant?._id === city._id && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
