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
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">APPonte</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma cívica de participação comunitária e gestão municipal inteligente.
              Conectando cidadãos a soluções transparentes para a cidade.
            </p>
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

          {/* Para Prefeituras / SaaS */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Governo & SaaS</h4>
            <ul className="space-y-2 text-xs">
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
                <span className="text-slate-500">Planos de Assinatura Municipal</span>
              </li>
              <li>
                <span className="text-slate-500">Integração Ouvidoria e SLA</span>
              </li>
            </ul>
          </div>

          {/* Transparência & Segurança */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Transparência</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Dados Abertos & Auditoria</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Geolocalização Precisa</span>
              </div>
              <p className="pt-2 text-[11px] text-slate-500">
                Respeito à LGPD e proteção da privacidade de dados do cidadão.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} APPonte — Plataforma Cidadã & SaaS. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para transformar cidades.
          </p>
        </div>
      </div>
    </footer>
  );
};
