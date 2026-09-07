import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, Lock, Mail, ArrowRight, Sparkles, AlertCircle, ChevronDown } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      if (!err.response) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está acessível.');
      } else {
        setError(
          err.response?.data?.message || 'E-mail ou senha inválidos. Verifique suas credenciais.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setIsLoading(true);

    try {
      await login(demoEmail, demoPass);
      navigate('/');
    } catch (err: any) {
      if (!err.response) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está acessível.');
      } else {
        setError(
          err.response?.data?.message || 'E-mail ou senha inválidos. Verifique suas credenciais.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-md w-full space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              APPonte
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Acesse sua conta</h2>
          <p className="text-xs text-slate-500">
            Conecte-se para registrar ocorrências e participar da gestão municipal.
          </p>
        </div>

        {/* Collapsible Demo Fast Login Accordion */}
        <div className="bg-emerald-50/70 dark:bg-slate-800/80 rounded-2xl border border-emerald-100 dark:border-slate-700 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setDemoOpen(!demoOpen)}
            className="w-full p-3 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Contas de Demonstração (1 Clique)</span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${demoOpen ? 'rotate-180' : ''}`} />
          </button>

          {demoOpen && (
            <div className="p-3 pt-0 space-y-2 animate-in fade-in">
              <div className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
                📍 Prefeitura de Guaratinguetá - SP
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin.guara@guaratingueta.sp.gov.br', 'admin123')}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 border border-slate-200/60 dark:border-slate-700"
                >
                  🏛️ Gestor Guará
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('secretario.obras@guaratingueta.sp.gov.br', 'admin123')}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 border border-slate-200/60 dark:border-slate-700"
                >
                  👔 Secretário Guará
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('operador.obras@guaratingueta.sp.gov.br', 'admin123')}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 border border-slate-200/60 dark:border-slate-700"
                >
                  👷 Operador Guará
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('cidadao.guara@apponte.com', 'cidadao123')}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 border border-slate-200/60 dark:border-slate-700"
                >
                  👥 Cidadão Guará
                </button>
              </div>

              <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider pt-1">
                🌐 Outros Perfis & Super Admin PixelLab
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('superadmin@apponte.com', 'admin123')}
                  className="px-2.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-left text-[11px] font-bold text-purple-800 dark:text-purple-300 hover:bg-purple-100 border border-purple-200/60 dark:border-purple-800"
                >
                  👑 Super Admin PixelLab
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('cidadao@apponte.com', 'cidadao123')}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 border border-slate-200/60 dark:border-slate-700"
                >
                  👥 Cidadão Geral
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clean Login Form Card */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Senha
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <span>{isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:underline">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
