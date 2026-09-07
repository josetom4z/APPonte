import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white tracking-tight">APPonte</span>
                <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase -mt-1">
                  by PixelLab
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma GovTech de participação comunitária, zeladoria urbana e gestão municipal inteligente.
              Conectando cidadãos a soluções transparentes para a cidade.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Desenvolvido por <strong>PixelLab</strong></span>
            </div>
          </div>

          {/* Navegação Cidadã */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Participação</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/feed" className="hover:text-emerald-400 transition-colors">
                  Feed Social de Demandas
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-emerald-400 transition-colors">
                  Mapa Interativo de Ocorrências
                </Link>
              </li>
              <li>
                <Link to="/new-request" className="hover:text-emerald-400 transition-colors">
                  Registrar Nova Solicitação
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Acompanhar Minhas Demandas
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Prefeituras / SaaS PixelLab */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">SaaS & Planos PixelLab</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#planos" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>Planos Free & Pagos</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Novo</span>
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Portal do Gestor Municipal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Acesso de Secretarias e Atuantes
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Integração Ouvidoria e SLA com IA</span>
              </li>
              <li>
                <span className="text-slate-400">Desenvolvido por PixelLab GovTech</span>
              </li>
            </ul>
          </div>

          {/* Transparência & Cidades */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Cidades Conectadas</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-base">🏛️</span>
                <span>Guaratinguetá - SP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🏛️</span>
                <span>Nova Esperança - SP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🏛️</span>
                <span>São Bento - MG</span>
              </div>
              <p className="pt-2 text-[11px] text-slate-500">
                100% em conformidade com a LGPD e Lei de Acesso à Informação.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} APPonte — Uma solução SaaS desenvolvida por <strong>PixelLab</strong>.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> por <strong>PixelLab</strong> para transformar cidades.
          </p>
        </div>
      </div>
    </footer>
  );
};
