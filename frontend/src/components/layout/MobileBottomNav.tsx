import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  MapPin,
  Plus,
  LayoutDashboard,
  User,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { user, isAuthenticated, isSuperAdmin, isAdmin, isSecretary, isOperator } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    if (isSuperAdmin || isAdmin) return '/dashboard/admin';
    if (isSecretary) return '/dashboard/secretary';
    if (isOperator) return '/dashboard/operator';
    return '/dashboard/citizen';
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Feed / Home */}
        <Link
          to="/feed"
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            isActive('/feed') || isActive('/')
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Compass className={`w-5 h-5 ${isActive('/feed') || isActive('/') ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Feed</span>
        </Link>

        {/* 2. Map */}
        <Link
          to="/map"
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            isActive('/map')
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <MapPin className={`w-5 h-5 ${isActive('/map') ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Mapa</span>
        </Link>

        {/* 3. Center Elevated FAB: New Request */}
        <div className="flex flex-col items-center -mt-5">
          <Link
            to="/new-request"
            aria-label="Abrir Nova Solicitação"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 active:scale-95 transition-transform ring-4 ring-white dark:ring-slate-900"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </Link>
          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Criar</span>
        </div>

        {/* 4. Dashboard */}
        {isAuthenticated ? (
          <Link
            to={getDashboardPath()}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
              location.pathname.startsWith('/dashboard')
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${location.pathname.startsWith('/dashboard') ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">Painel</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
              isActive('/login')
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">Painel</span>
          </Link>
        )}

        {/* 5. Profile / Auth */}
        {isAuthenticated && user ? (
          <Link
            to={getDashboardPath()}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
              isActive('/profile')
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500/50"
            />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[50px]">{user.name.split(' ')[0]}</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
              isActive('/login')
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">Entrar</span>
          </Link>
        )}

      </div>
    </div>
  );
};
