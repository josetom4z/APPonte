import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../../../.env') });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/apponte';

// Enums
enum Role {
  PUBLIC = 'PUBLIC',
  CITIZEN = 'CITIZEN',
  OPERATOR = 'OPERATOR',
  SECRETARY = 'SECRETARY',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

enum RequestStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

enum RequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

enum AdPlacement {
  FEED = 'FEED',
  SIDEBAR = 'SIDEBAR',
  HOME_HERO = 'HOME_HERO',
  MAP_BANNER = 'MAP_BANNER',
  DASHBOARD = 'DASHBOARD',
}

enum AdStatus {
  ACTIVE = 'ACTIVE',
}

async function runSeed() {
  console.log('🔄 Conectando ao MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Conexão estabelecida com sucesso.');

  const db = mongoose.connection.db;
  if (!db) throw new Error('Falha ao obter database handle');

  console.log('🧹 Limpando coleções antigas...');
  const collections = [
    'users',
    'tenants',
    'departments',
    'requestcategories',
    'requests',
    'requeststatushistories',
    'requestcomments',
    'requestsupports',
    'advertisements',
    'plans',
    'subscriptions',
    'notifications',
    'auditlogs',
  ];

  for (const col of collections) {
    try {
      await db.collection(col).drop();
    } catch (e) {
      // Ignora se não existir
    }
  }

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const citizenPasswordHash = await bcrypt.hash('cidadao123', salt);

  console.log('📦 1. Criando Modelos de Planos SaaS (PixelLab GovTech)...');
  const planFreeId = new Types.ObjectId();
  const planProId = new Types.ObjectId();
  const planEnterpriseId = new Types.ObjectId();

  await db.collection('plans').insertMany([
    {
      _id: planFreeId,
      name: 'Plano Gratuito / Cidadão Livre',
      slug: 'gratuito',
      tier: 'FREE',
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        'Acesso Completo ao Feed Cívico e Mapa Urbano',
        'Até 50 solicitações por mês',
        'Exibição de anúncios de parceiros locais',
        '1 Atuante/Operador de campo',
        'Suporte comunitário via PixelLab Docs',
      ],
      limits: { maxRequestsPerMonth: 50, maxStorageMb: 500, customDomain: false, removeAds: false, advancedAnalytics: false, operatorsLimit: 1 },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: planProId,
      name: 'Prefeitura Pro / Município Conectado',
      slug: 'prefeitura-pro',
      tier: 'PRO',
      priceMonthly: 990,
      priceYearly: 9900,
      features: [
        'Solicitações Cidadãs Ilimitadas',
        '100% Sem anúncios externos',
        'Até 15 Atuantes e Secretarias',
        'Dashboard Analítico com Indicadores de SLA',
        'Exportação de Relatórios Gerenciais em PDF/Excel',
        'Gestão de Prioridades e Notificações por E-mail',
        'Suporte Técnico PixelLab com SLA em até 12h',
      ],
      limits: { maxRequestsPerMonth: 5000, maxStorageMb: 20480, customDomain: true, removeAds: true, advancedAnalytics: true, operatorsLimit: 15 },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: planEnterpriseId,
      name: 'Prefeitura Enterprise / Gestão Inteligente',
      slug: 'prefeitura-enterprise',
      tier: 'ENTERPRISE',
      priceMonthly: 2490,
      priceYearly: 24900,
      features: [
        'Tudo incluso no Plano Pro',
        'Atuantes e Secretarias Ilimitados',
        'API REST Governamental para Integração com Sistemas Próprios',
        'Domínio Customizado (ex: apponte.guaratingueta.sp.gov.br)',
        'SLA Garantido de 99.9% com Alta Disponibilidade',
        'Roteirização Inteligente de Equipes de Campo com IA',
        'Consultoria e Suporte Dedicado 24/7 pela Equipe PixelLab',
      ],
      limits: { maxRequestsPerMonth: 999999, maxStorageMb: 102400, customDomain: true, removeAds: true, advancedAnalytics: true, operatorsLimit: 100 },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('🏛️ 2. Criando Prefeituras (Tenants)...');
  const tenantGuaratinguetaId = new Types.ObjectId();
  const tenantNovaEsperancaId = new Types.ObjectId();
  const tenantSaoBentoId = new Types.ObjectId();

  await db.collection('tenants').insertMany([
    {
      _id: tenantGuaratinguetaId,
      name: 'Prefeitura Municipal da Estância Turística de Guaratinguetá',
      slug: 'guaratingueta',
      cnpj: '46.680.508/0001-40',
      city: 'Guaratinguetá',
      state: 'SP',
      logoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1200&auto=format&fit=crop&q=80',
      contactEmail: 'ouvidoria@guaratingueta.sp.gov.br',
      contactPhone: '(12) 3128-2800',
      domain: 'guaratingueta.apponte.com.br',
      settings: {
        primaryColor: '#0284c7',
        accentColor: '#10b981',
        autoAssignOperator: false,
        allowPublicComments: true,
        requireEvidenceOnResolution: true,
      },
      status: 'ACTIVE',
      planId: planEnterpriseId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: tenantNovaEsperancaId,
      name: 'Prefeitura Municipal de Nova Esperança',
      slug: 'nova-esperanca',
      cnpj: '12.345.678/0001-90',
      city: 'Nova Esperança',
      state: 'SP',
      logoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1200&auto=format&fit=crop&q=80',
      contactEmail: 'ouvidoria@novaesperanca.sp.gov.br',
      contactPhone: '(11) 3456-7890',
      domain: 'novaesperanca.apponte.com.br',
      settings: {
        primaryColor: '#10b981',
        accentColor: '#06b6d4',
        autoAssignOperator: false,
        allowPublicComments: true,
        requireEvidenceOnResolution: true,
      },
      status: 'ACTIVE',
      planId: planProId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: tenantSaoBentoId,
      name: 'Prefeitura Municipal de São Bento',
      slug: 'sao-bento',
      cnpj: '98.765.432/0001-10',
      city: 'São Bento',
      state: 'MG',
      logoUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&auto=format&fit=crop&q=80',
      contactEmail: 'cidadao@saobento.mg.gov.br',
      contactPhone: '(35) 3333-1234',
      domain: 'saobento.apponte.com.br',
      settings: {
        primaryColor: '#3b82f6',
        accentColor: '#f59e0b',
        autoAssignOperator: true,
        allowPublicComments: true,
        requireEvidenceOnResolution: true,
      },
      status: 'ACTIVE',
      planId: planFreeId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('🏢 3. Criando Secretarias Municipais...');
  // Secretarias Guaratinguetá
  const deptGuaraObrasId = new Types.ObjectId();
  const deptGuaraIluminacaoId = new Types.ObjectId();
  const deptGuaraMeioAmbienteId = new Types.ObjectId();
  const deptGuaraTransitoId = new Types.ObjectId();

  // Secretarias Nova Esperança
  const deptObrasId = new Types.ObjectId();
  const deptIluminacaoId = new Types.ObjectId();
  const deptMeioAmbienteId = new Types.ObjectId();
  const deptTransitoId = new Types.ObjectId();

  await db.collection('departments').insertMany([
    // Guaratinguetá
    {
      _id: deptGuaraObrasId,
      tenantId: tenantGuaratinguetaId,
      name: 'Secretaria Municipal de Obras e Serviços',
      slug: 'obras-servicos-guara',
      description: 'Responsável por pavimentação, conservação de vias, tapa-buracos, drenagem e pontes.',
      icon: 'hammer',
      contactEmail: 'obras@guaratingueta.sp.gov.br',
      contactPhone: '(12) 3128-2810',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: deptGuaraIluminacaoId,
      tenantId: tenantGuaratinguetaId,
      name: 'Secretaria de Serviços Urbanos e Iluminação',
      slug: 'iluminacao-urbana-guara',
      description: 'Manutenção de lâmpadas de LED, postes, praças públicas e monumentos da Estância.',
      icon: 'lightbulb',
      contactEmail: 'iluminacao@guaratingueta.sp.gov.br',
      contactPhone: '(12) 3128-2820',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: deptGuaraMeioAmbienteId,
      tenantId: tenantGuaratinguetaId,
      name: 'Secretaria de Meio Ambiente e Agricultura',
      slug: 'meio-ambiente-guara',
      description: 'Poda de árvores, conservação de parques, controle de descarte irregular e limpeza urbana.',
      icon: 'trees',
      contactEmail: 'meioambiente@guaratingueta.sp.gov.br',
      contactPhone: '(12) 3128-2830',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: deptGuaraTransitoId,
      tenantId: tenantGuaratinguetaId,
      name: 'Secretaria de Mobilidade Urbana e Segurança',
      slug: 'mobilidade-seguranca-guara',
      description: 'Sinalização viária, semáforos, fiscalização de trânsito e ciclofaixas.',
      icon: 'traffic-cone',
      contactEmail: 'transito@guaratingueta.sp.gov.br',
      contactPhone: '(12) 3128-2840',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Nova Esperança
    {
      _id: deptObrasId,
      tenantId: tenantNovaEsperancaId,
      name: 'Secretaria de Obras e Infraestrutura',
      slug: 'obras-infraestrutura',
      description: 'Responsável por pavimentação, galerias de águas pluviais, tapa-buracos e pontes.',
      icon: 'hammer',
      contactEmail: 'obras@novaesperanca.sp.gov.br',
      contactPhone: '(11) 3456-7891',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: deptIluminacaoId,
      tenantId: tenantNovaEsperancaId,
      name: 'Secretaria de Serviços Urbanos e Iluminação',
      slug: 'servicos-urbanos-iluminacao',
      description: 'Manutenção de postes de luz, praças públicas e monumentos.',
      icon: 'lightbulb',
      contactEmail: 'iluminacao@novaesperanca.sp.gov.br',
      contactPhone: '(11) 3456-7892',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: deptMeioAmbienteId,
      tenantId: tenantNovaEsperancaId,
      name: 'Secretaria de Meio Ambiente e Limpeza',
      slug: 'meio-ambiente-limpeza',
      description: 'Poda de árvores, coleta de lixo, entulho e limpeza de terrenos baldios.',
      icon: 'trees',
      contactEmail: 'meioambiente@novaesperanca.sp.gov.br',
      contactPhone: '(11) 3456-7893',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: deptTransitoId,
      tenantId: tenantNovaEsperancaId,
      name: 'Secretaria de Mobilidade e Trânsito',
      slug: 'mobilidade-transito',
      description: 'Sinalização viária, semáforos, faixas de pedestres e fiscalização de trânsito.',
      icon: 'traffic-cone',
      contactEmail: 'transito@novaesperanca.sp.gov.br',
      contactPhone: '(11) 3456-7894',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('🏷️ 4. Criando Categorias de Serviços Públicos...');
  // Categorias Guaratinguetá
  const catGuaraBuracoId = new Types.ObjectId();
  const catGuaraIluminacaoId = new Types.ObjectId();
  const catGuaraPodaId = new Types.ObjectId();
  const catGuaraSemaforoId = new Types.ObjectId();

  // Categorias Nova Esperança
  const catBuracoId = new Types.ObjectId();
  const catIluminacaoId = new Types.ObjectId();
  const catPodaId = new Types.ObjectId();
  const catSemaforoId = new Types.ObjectId();

  await db.collection('requestcategories').insertMany([
    // Guaratinguetá
    {
      _id: catGuaraBuracoId,
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraObrasId,
      name: 'Vias Públicas e Asfalto',
      slug: 'vias-publicas-asfalto-guara',
      description: 'Buracos, calçadas danificadas, desnível de asfalto e bueiros entupidos em Guaratinguetá.',
      icon: 'wrench',
      color: '#ef4444',
      defaultPriority: RequestPriority.HIGH,
      slaHours: 72,
      subcategories: [
        { name: 'Buraco no Asfalto', slug: 'buraco-asfalto', active: true },
        { name: 'Calçada Quebrada', slug: 'calcada-quebrada', active: true },
        { name: 'Bueiro Entupido ou Sem Tampa', slug: 'bueiro-problema', active: true },
        { name: 'Lombada Danificada', slug: 'lombada-danificada', active: true },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: catGuaraIluminacaoId,
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraIluminacaoId,
      name: 'Iluminação Pública',
      slug: 'iluminacao-publica-guara',
      description: 'Lâmpadas apagadas, postes danificados ou iluminação intermitente.',
      icon: 'zap',
      color: '#f59e0b',
      defaultPriority: RequestPriority.MEDIUM,
      slaHours: 48,
      subcategories: [
        { name: 'Lâmpada de Poste Queimada', slug: 'lampada-queimada', active: true },
        { name: 'Lâmpada Acesa Durante o Dia', slug: 'lampada-acesa-dia', active: true },
        { name: 'Poste Abalroado ou com Risco de Queda', slug: 'poste-risco', active: true },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: catGuaraPodaId,
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraMeioAmbienteId,
      name: 'Limpeza e Arborização',
      slug: 'limpeza-arborizacao-guara',
      description: 'Poda preventiva de árvores, descarte irregular de entulho e limpeza de praças.',
      icon: 'trees',
      color: '#10b981',
      defaultPriority: RequestPriority.MEDIUM,
      slaHours: 96,
      subcategories: [
        { name: 'Poda de Galhos em Risco', slug: 'poda-arvore', active: true },
        { name: 'Descarte Irregular de Entulho', slug: 'descarte-entulho', active: true },
        { name: 'Mato Alto em Terreno Público', slug: 'mato-alto', active: true },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: catGuaraSemaforoId,
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraTransitoId,
      name: 'Trânsito e Mobilidade',
      slug: 'transito-mobilidade-guara',
      description: 'Semáforos com defeito, placas caídas e pintura de faixas apagadas.',
      icon: 'traffic-cone',
      color: '#0284c7',
      defaultPriority: RequestPriority.HIGH,
      slaHours: 24,
      subcategories: [
        { name: 'Semáforo Desligado ou Intermitente', slug: 'semaforo-defeito', active: true },
        { name: 'Placa de Trânsito Danificada', slug: 'placa-danificada', active: true },
        { name: 'Pintura de Faixa de Pedestre Apagada', slug: 'faixa-pedestre-apagada', active: true },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Nova Esperança
    {
      _id: catBuracoId,
      tenantId: tenantNovaEsperancaId,
      departmentId: deptObrasId,
      name: 'Vias Públicas e Asfalto',
      slug: 'vias-publicas-asfalto',
      description: 'Buracos na pista, calçadas danificadas, desnível de asfalto e bueiros entupidos.',
      icon: 'wrench',
      color: '#ef4444',
      defaultPriority: RequestPriority.HIGH,
      slaHours: 72,
      subcategories: [
        { name: 'Buraco no Asfalto', slug: 'buraco-asfalto', active: true },
        { name: 'Calçada Quebrada', slug: 'calcada-quebrada', active: true },
        { name: 'Bueiro Entupido ou Sem Tampa', slug: 'bueiro-problema', active: true },
        { name: 'Lombada Danificada', slug: 'lombada-danificada', active: true },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: catIluminacaoId,
      tenantId: tenantNovaEsperancaId,
      departmentId: deptIluminacaoId,
      name: 'Iluminação Pública',
      slug: 'iluminacao-publica',
      description: 'Lâmpadas apagadas, postes danificados ou luz acesa durante o dia.',
      icon: 'zap',
      color: '#f59e0b',
      defaultPriority: RequestPriority.MEDIUM,
      slaHours: 48,
      subcategories: [
        { name: 'Lâmpada de Poste Queimada', slug: 'lampada-queimada', active: true },
        { name: 'Lâmpada Acesa Durante o Dia', slug: 'lampada-acesa-dia', active: true },
        { name: 'Poste Abalroado ou com Risco de Queda', slug: 'poste-risco', active: true },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: catPodaId,
      tenantId: tenantNovaEsperancaId,
      departmentId: deptMeioAmbienteId,
      name: 'Limpeza e Arborização',
      slug: 'limpeza-arborizacao',
      description: 'Poda preventiva de árvores, descarte irregular de lixo e entulho em vias públicas.',
      icon: 'trees',
      color: '#10b981',
      defaultPriority: RequestPriority.MEDIUM,
      slaHours: 96,
      subcategories: [
        { name: 'Poda de Galhos em Risco', slug: 'poda-arvore', active: true },
        { name: 'Descarte Irregular de Entulho', slug: 'descarte-entulho', active: true },
        { name: 'Terreno com Mato Alto', slug: 'mato-alto', active: true },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: catSemaforoId,
      tenantId: tenantNovaEsperancaId,
      departmentId: deptTransitoId,
      name: 'Trânsito e Sinalização',
      slug: 'transito-sinalizacao',
      description: 'Semáforos com defeito, placas caídas e pintura de faixa apagada.',
      icon: 'traffic-cone',
      color: '#3b82f6',
      defaultPriority: RequestPriority.HIGH,
      slaHours: 24,
      subcategories: [
        { name: 'Semáforo Desligado ou Intermitente', slug: 'semaforo-defeito', active: true },
        { name: 'Placa de Trânsito Danificada', slug: 'placa-danificada', active: true },
        { name: 'Pintura de Faixa de Pedestre Apagada', slug: 'faixa-pedestre-apagada', active: true },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('👤 5. Criando Usuários para todos os perfis RBAC...');
  const superAdminId = new Types.ObjectId();
  
  // Guaratinguetá Users
  const adminGuaraId = new Types.ObjectId();
  const secretarioGuaraId = new Types.ObjectId();
  const operadorGuaraId = new Types.ObjectId();
  const cidadaoGuaraId = new Types.ObjectId();

  // Nova Esperança Users
  const adminNovaEsperancaId = new Types.ObjectId();
  const secretarioObrasId = new Types.ObjectId();
  const operadorObrasId = new Types.ObjectId();
  const cidadaoJoaoId = new Types.ObjectId();
  const cidadaMariaId = new Types.ObjectId();

  await db.collection('users').insertMany([
    {
      _id: superAdminId,
      name: 'PixelLab Admin (Super)',
      email: 'superadmin@apponte.com',
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PixelLabAdmin',
      phone: '(12) 99999-0000',
      bio: 'Administrador Master e Desenvolvedor SaaS da PixelLab',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Guaratinguetá Users
    {
      _id: adminGuaraId,
      name: 'Gestor Municipal (Guaratinguetá)',
      email: 'admin.guara@guaratingueta.sp.gov.br',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      tenantId: tenantGuaratinguetaId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminGuara',
      phone: '(12) 99123-4567',
      bio: 'Gabinete do Prefeito e Secretaria de Governo de Guaratinguetá',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: secretarioGuaraId,
      name: 'Dr. Carlos Eduardo (Secretário Obras Guará)',
      email: 'secretario.obras@guaratingueta.sp.gov.br',
      passwordHash: adminPasswordHash,
      role: Role.SECRETARY,
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraObrasId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosSecretarioGuara',
      phone: '(12) 99234-5678',
      bio: 'Secretário Municipal de Obras e Serviços de Guaratinguetá',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: operadorGuaraId,
      name: 'Tiago Atuante (Operador Guará)',
      email: 'operador.obras@guaratingueta.sp.gov.br',
      passwordHash: adminPasswordHash,
      role: Role.OPERATOR,
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraObrasId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TiagoOperadorGuara',
      phone: '(12) 99345-6789',
      bio: 'Encarregado de Campo e Manutenção Viária - Guaratinguetá',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: cidadaoGuaraId,
      name: 'Lucas Ferreira (Cidadão Guará)',
      email: 'cidadao.guara@apponte.com',
      passwordHash: citizenPasswordHash,
      role: Role.CITIZEN,
      tenantId: tenantGuaratinguetaId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LucasCidadaoGuara',
      phone: '(12) 99456-7890',
      bio: 'Morador do Bairro Pedregulho em Guaratinguetá. Ativo na melhoria da cidade.',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Nova Esperança Users
    {
      _id: adminNovaEsperancaId,
      name: 'Gestor Municipal (Admin)',
      email: 'admin.novaesperanca@apponte.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      tenantId: tenantNovaEsperancaId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminNovaEsperanca',
      phone: '(11) 99999-1111',
      bio: 'Secretaria de Governo e Gestão Municipal',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: secretarioObrasId,
      name: 'Dr. Roberto Santos (Secretário)',
      email: 'secretario.obras@novaesperanca.gov.br',
      passwordHash: adminPasswordHash,
      role: Role.SECRETARY,
      tenantId: tenantNovaEsperancaId,
      departmentId: deptObrasId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RobertoSecretario',
      phone: '(11) 99999-2222',
      bio: 'Secretário Municipal de Obras e Infraestrutura',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: operadorObrasId,
      name: 'Marcos Atuante (Operador)',
      email: 'operador.obras@novaesperanca.gov.br',
      passwordHash: adminPasswordHash,
      role: Role.OPERATOR,
      tenantId: tenantNovaEsperancaId,
      departmentId: deptObrasId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcosOperador',
      phone: '(11) 99999-3333',
      bio: 'Líder da Equipe de Pavimentação e Manutenção Viária',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: cidadaoJoaoId,
      name: 'João Silva (Cidadão)',
      email: 'cidadao@apponte.com',
      passwordHash: citizenPasswordHash,
      role: Role.CITIZEN,
      tenantId: tenantNovaEsperancaId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JoaoSilva',
      phone: '(11) 98765-4321',
      bio: 'Morador do Bairro Bela Vista. Engajado em melhorias para a nossa cidade.',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: cidadaMariaId,
      name: 'Maria Oliveira (Cidadã)',
      email: 'maria.cidada@apponte.com',
      passwordHash: citizenPasswordHash,
      role: Role.CITIZEN,
      tenantId: tenantNovaEsperancaId,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariaOliveira',
      phone: '(11) 98765-5555',
      bio: 'Arquiteta e defensora de espaços públicos acessíveis.',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Atualiza secretaryUserId nas Secretarias
  await db.collection('departments').updateOne(
    { _id: deptGuaraObrasId },
    { $set: { secretaryUserId: secretarioGuaraId } },
  );
  await db.collection('departments').updateOne(
    { _id: deptObrasId },
    { $set: { secretaryUserId: secretarioObrasId } },
  );

  console.log('📌 6. Criando Solicitações Cidadãs com GeoJSON e Históricos...');
  // Guaratinguetá Requests
  const reqGuaraAsfaltoId = new Types.ObjectId();
  const reqGuaraLuzId = new Types.ObjectId();
  const reqGuaraArvoreId = new Types.ObjectId();
  const reqGuaraSinalId = new Types.ObjectId();

  // Nova Esperança Requests
  const reqBuracoId = new Types.ObjectId();
  const reqLuzId = new Types.ObjectId();
  const reqPodaId = new Types.ObjectId();
  const reqSemaforoId = new Types.ObjectId();

  await db.collection('requests').insertMany([
    // === GUARATINGUETÁ ===
    {
      _id: reqGuaraAsfaltoId,
      protocol: 'GUA-2026-00001',
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraObrasId,
      categoryId: catGuaraBuracoId,
      subcategoryId: 'buraco-asfalto',
      authorId: cidadaoGuaraId,
      assignedToUserId: operadorGuaraId,
      title: 'Cratera na Av. Juscelino Kubitschek próximo ao trevo de acesso',
      description: 'Buraco profundo na faixa da direita da Av. Juscelino Kubitschek de Oliveira no sentido Centro. Risco alto de estourar pneus e causar acidentes.',
      status: RequestStatus.IN_PROGRESS,
      priority: RequestPriority.URGENT,
      location: {
        type: 'Point',
        coordinates: [-45.1950, -22.8180], // GeoJSON Guaratinguetá [lng, lat]
      },
      address: {
        formattedAddress: 'Av. Juscelino Kubitschek de Oliveira, 1200 - Pedregulho, Guaratinguetá - SP',
        street: 'Av. Juscelino Kubitschek de Oliveira',
        number: '1200',
        neighborhood: 'Pedregulho',
        city: 'Guaratinguetá',
        state: 'SP',
        postalCode: '12515-000',
        reference: 'Próximo ao supermercado e posto de combustível',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'buraco_guara_jk.jpg',
          size: 145000,
        },
      ],
      resolutionMedia: [],
      resolutionNotes: '',
      supportsCount: 38,
      commentsCount: 6,
      sharesCount: 14,
      viewsCount: 420,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(),
    },
    {
      _id: reqGuaraLuzId,
      protocol: 'GUA-2026-00002',
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraIluminacaoId,
      categoryId: catGuaraIluminacaoId,
      subcategoryId: 'lampada-queimada',
      authorId: cidadaoGuaraId,
      title: 'Luminárias de LED apagadas na Rua Dr. Martiniano',
      description: 'Dois postes consecutivos com lâmpadas apagadas em frente ao comércio local, deixando o trecho escuro e perigoso para pedestres à noite.',
      status: RequestStatus.RESOLVED,
      priority: RequestPriority.HIGH,
      location: {
        type: 'Point',
        coordinates: [-45.1920, -22.8150],
      },
      address: {
        formattedAddress: 'Rua Dr. Martiniano, 350 - Centro, Guaratinguetá - SP',
        street: 'Rua Dr. Martiniano',
        number: '350',
        neighborhood: 'Centro',
        city: 'Guaratinguetá',
        state: 'SP',
        postalCode: '12500-000',
        reference: 'Em frente à farmácia',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'poste_guara_centro.jpg',
          size: 98000,
        },
      ],
      resolutionMedia: [
        {
          url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'luminaria_guara_trocada.jpg',
        },
      ],
      resolutionNotes: 'Equipe da Secretaria de Serviços Urbanos realizou a substituição dos módulos de LED na data de ontem.',
      resolvedAt: new Date(Date.now() - 3600000 * 6),
      supportsCount: 45,
      commentsCount: 3,
      sharesCount: 9,
      viewsCount: 512,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000 * 4),
      updatedAt: new Date(Date.now() - 3600000 * 6),
    },
    {
      _id: reqGuaraArvoreId,
      protocol: 'GUA-2026-00003',
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraMeioAmbienteId,
      categoryId: catGuaraPodaId,
      subcategoryId: 'poda-arvore',
      authorId: cidadaoGuaraId,
      title: 'Galho de árvore encostando na rede elétrica na Av. Presidente Vargas',
      description: 'Árvore de grande porte na calçada com galhos pesados tocando a fiação de média tensão na Vila Paraíba.',
      status: RequestStatus.PENDING,
      priority: RequestPriority.HIGH,
      location: {
        type: 'Point',
        coordinates: [-45.1880, -22.8120],
      },
      address: {
        formattedAddress: 'Av. Presidente Vargas, 450 - Vila Paraíba, Guaratinguetá - SP',
        street: 'Av. Presidente Vargas',
        number: '450',
        neighborhood: 'Vila Paraíba',
        city: 'Guaratinguetá',
        state: 'SP',
        postalCode: '12515-100',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'arvore_guara.jpg',
          size: 112000,
        },
      ],
      supportsCount: 17,
      commentsCount: 2,
      sharesCount: 5,
      viewsCount: 180,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000 * 1),
      updatedAt: new Date(),
    },
    {
      _id: reqGuaraSinalId,
      protocol: 'GUA-2026-00004',
      tenantId: tenantGuaratinguetaId,
      departmentId: deptGuaraTransitoId,
      categoryId: catGuaraSemaforoId,
      subcategoryId: 'semaforo-defeito',
      authorId: cidadaoGuaraId,
      title: 'Semáforo intermitente no cruzamento próximo à Praça da Estação',
      description: 'Semáforo em alerta amarelo intermitente travado no cruzamento, gerando confusão e congestionamento nos horários de pico.',
      status: RequestStatus.IN_PROGRESS,
      priority: RequestPriority.URGENT,
      location: {
        type: 'Point',
        coordinates: [-45.1910, -22.8140],
      },
      address: {
        formattedAddress: 'Praça Condessa de Frontin - Centro, Guaratinguetá - SP',
        street: 'Praça Condessa de Frontin',
        neighborhood: 'Centro',
        city: 'Guaratinguetá',
        state: 'SP',
        postalCode: '12500-110',
        reference: 'Próximo à antiga estação ferroviária',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'semaforo_guara.jpg',
          size: 89000,
        },
      ],
      supportsCount: 29,
      commentsCount: 4,
      sharesCount: 8,
      viewsCount: 310,
      isDeleted: false,
      createdAt: new Date(Date.now() - 3600000 * 12),
      updatedAt: new Date(),
    },

    // === NOVA ESPERANÇA ===
    {
      _id: reqBuracoId,
      protocol: 'APP-2026-00001',
      tenantId: tenantNovaEsperancaId,
      departmentId: deptObrasId,
      categoryId: catBuracoId,
      subcategoryId: 'buraco-asfalto',
      authorId: cidadaoJoaoId,
      assignedToUserId: operadorObrasId,
      title: 'Cratera profunda na Avenida Brasil esquina com Rua 15',
      description: 'Buraco de grande proporção com risco iminente de acidente e danos aos veículos. Já causou corte no pneu de 2 carros.',
      status: RequestStatus.IN_PROGRESS,
      priority: RequestPriority.URGENT,
      location: {
        type: 'Point',
        coordinates: [-46.6558, -23.5615],
      },
      address: {
        formattedAddress: 'Av. Brasil, 1420 - Centro, Nova Esperança - SP',
        street: 'Av. Brasil',
        number: '1420',
        neighborhood: 'Centro',
        city: 'Nova Esperança',
        state: 'SP',
        postalCode: '14800-000',
        reference: 'Em frente ao Banco do Brasil',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'buraco_asfalto.jpg',
          size: 145000,
        },
      ],
      resolutionMedia: [],
      resolutionNotes: '',
      supportsCount: 14,
      commentsCount: 3,
      sharesCount: 5,
      viewsCount: 120,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(),
    },
    {
      _id: reqLuzId,
      protocol: 'APP-2026-00002',
      tenantId: tenantNovaEsperancaId,
      departmentId: deptIluminacaoId,
      categoryId: catIluminacaoId,
      subcategoryId: 'lampada-queimada',
      authorId: cidadaMariaId,
      title: 'Poste com lâmpada apagada há 1 semana na Praça da Matriz',
      description: 'A praça central está muito escura durante a noite, gerando insegurança para os pedestres e frequentadores.',
      status: RequestStatus.RESOLVED,
      priority: RequestPriority.MEDIUM,
      location: {
        type: 'Point',
        coordinates: [-46.6540, -23.5630],
      },
      address: {
        formattedAddress: 'Praça da Matriz, s/n - Centro, Nova Esperança - SP',
        street: 'Praça da Matriz',
        neighborhood: 'Centro',
        city: 'Nova Esperança',
        state: 'SP',
        postalCode: '14800-000',
        reference: 'Próximo ao coreto',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'poste_apagado.jpg',
          size: 98000,
        },
      ],
      resolutionMedia: [
        {
          url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'lampada_reparada.jpg',
        },
      ],
      resolutionNotes: 'Equipe da Secretaria de Iluminação realizou a substituição da luminária por tecnologia LED de alta eficiência.',
      resolvedAt: new Date(Date.now() - 3600000 * 4),
      supportsCount: 22,
      commentsCount: 2,
      sharesCount: 8,
      viewsCount: 245,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000 * 4),
      updatedAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      _id: reqPodaId,
      protocol: 'APP-2026-00003',
      tenantId: tenantNovaEsperancaId,
      departmentId: deptMeioAmbienteId,
      categoryId: catPodaId,
      subcategoryId: 'poda-arvore',
      authorId: cidadaoJoaoId,
      title: 'Galho de árvore de grande porte tocando a fiação elétrica',
      description: 'Na Rua das Flores, árvore centenária com galhos pesados encostando nos cabos de alta tensão com faíscas quando venta.',
      status: RequestStatus.PENDING,
      priority: RequestPriority.HIGH,
      location: {
        type: 'Point',
        coordinates: [-46.6570, -23.5600],
      },
      address: {
        formattedAddress: 'Rua das Flores, 88 - Jardim Primavera, Nova Esperança - SP',
        street: 'Rua das Flores',
        number: '88',
        neighborhood: 'Jardim Primavera',
        city: 'Nova Esperança',
        state: 'SP',
        postalCode: '14800-110',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'arvore_fiacao.jpg',
          size: 112000,
        },
      ],
      supportsCount: 9,
      commentsCount: 1,
      sharesCount: 2,
      viewsCount: 89,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
    },
    {
      _id: reqSemaforoId,
      protocol: 'APP-2026-00004',
      tenantId: tenantNovaEsperancaId,
      departmentId: deptTransitoId,
      categoryId: catSemaforoId,
      subcategoryId: 'semaforo-defeito',
      authorId: cidadaMariaId,
      title: 'Semáforo desligado no cruzamento da Av. Paulista com Rua 7 de Setembro',
      description: 'Semáforo totalmente apagado desde a manhã de hoje, gerando grande retenção no fluxo e risco de colisão.',
      status: RequestStatus.IN_REVIEW,
      priority: RequestPriority.URGENT,
      location: {
        type: 'Point',
        coordinates: [-46.6530, -23.5645],
      },
      address: {
        formattedAddress: 'Av. Paulista, 500 - Centro, Nova Esperança - SP',
        street: 'Av. Paulista',
        number: '500',
        neighborhood: 'Centro',
        city: 'Nova Esperança',
        state: 'SP',
        postalCode: '14800-000',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'semaforo_apagado.jpg',
          size: 89000,
        },
      ],
      supportsCount: 31,
      commentsCount: 5,
      sharesCount: 11,
      viewsCount: 380,
      isDeleted: false,
      createdAt: new Date(Date.now() - 3600000 * 5),
      updatedAt: new Date(),
    },
  ]);

  console.log('📜 7. Criando Histórico de Mudanças de Status...');
  await db.collection('requeststatushistories').insertMany([
    {
      requestId: reqGuaraAsfaltoId,
      tenantId: tenantGuaratinguetaId,
      previousStatus: RequestStatus.PENDING,
      newStatus: RequestStatus.IN_PROGRESS,
      changedByUserId: secretarioGuaraId,
      notes: 'Chamado recebido pela Secretaria de Obras e equipe destacada para a Av. JK.',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      requestId: reqBuracoId,
      tenantId: tenantNovaEsperancaId,
      previousStatus: RequestStatus.PENDING,
      newStatus: RequestStatus.IN_PROGRESS,
      changedByUserId: secretarioObrasId,
      notes: 'Demanda autorizada para execução emergencial pela equipe de tapa-buracos.',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      requestId: reqLuzId,
      tenantId: tenantNovaEsperancaId,
      previousStatus: RequestStatus.IN_PROGRESS,
      newStatus: RequestStatus.RESOLVED,
      changedByUserId: operadorObrasId,
      notes: 'Luminária substituída e testada no período noturno.',
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
  ]);

  console.log('💬 8. Criando Comentários e Apoios Cívicos...');
  await db.collection('requestcomments').insertMany([
    {
      requestId: reqGuaraAsfaltoId,
      tenantId: tenantGuaratinguetaId,
      authorId: cidadaoGuaraId,
      content: 'Passo todo dia por aqui para ir trabalhar. Realmente estava perigoso, parabéns pela agilidade!',
      media: [],
      isInternal: false,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      requestId: reqGuaraAsfaltoId,
      tenantId: tenantGuaratinguetaId,
      authorId: operadorGuaraId,
      content: 'Equipe em deslocamento com maquinário para fresagem e recapeamento asfáltico.',
      media: [],
      isInternal: false,
      isDeleted: false,
      createdAt: new Date(Date.now() - 3600000 * 3),
      updatedAt: new Date(Date.now() - 3600000 * 3),
    },
    {
      requestId: reqBuracoId,
      tenantId: tenantNovaEsperancaId,
      authorId: cidadaMariaId,
      content: 'Passei hoje de manhã e o buraco aumentou ainda mais por conta da chuva de ontem.',
      media: [],
      isInternal: false,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      requestId: reqBuracoId,
      tenantId: tenantNovaEsperancaId,
      authorId: operadorObrasId,
      content: 'Caminhão com massa asfáltica quente já em deslocamento para o local.',
      media: [],
      isInternal: false,
      isDeleted: false,
      createdAt: new Date(Date.now() - 3600000 * 2),
      updatedAt: new Date(Date.now() - 3600000 * 2),
    },
  ]);

  await db.collection('requestsupports').insertMany([
    {
      requestId: reqGuaraAsfaltoId,
      userId: cidadaoGuaraId,
      tenantId: tenantGuaratinguetaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      requestId: reqGuaraLuzId,
      userId: cidadaoGuaraId,
      tenantId: tenantGuaratinguetaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      requestId: reqBuracoId,
      userId: cidadaMariaId,
      tenantId: tenantNovaEsperancaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      requestId: reqLuzId,
      userId: cidadaoJoaoId,
      tenantId: tenantNovaEsperancaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('📢 9. Criando Anúncios Locais e Patrocinadores SaaS (PixelLab)...');
  await db.collection('advertisements').insertMany([
    {
      tenantId: tenantGuaratinguetaId,
      advertiserName: 'Vale Sul Construtora & Materiais',
      advertiserContact: 'comercial@valesulguara.com.br',
      title: 'Materiais para Construção e Reforma em Guaratinguetá',
      description: 'Entrega rápida em toda a Estância de Guaratinguetá e região do Vale do Paraíba.',
      mediaUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      targetUrl: 'https://valesulguara.com.br',
      placement: AdPlacement.FEED,
      targetCity: 'Guaratinguetá',
      targetState: 'SP',
      status: AdStatus.ACTIVE,
      impressionsCount: 2420,
      clicksCount: 140,
      budget: 800,
      startDate: new Date(Date.now() - 86400000 * 10),
      endDate: new Date(Date.now() + 86400000 * 30),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: null, // Global banner PixelLab
      advertiserName: 'PixelLab GovTech Solutions',
      advertiserContact: 'contato@pixellab.com.br',
      title: 'Modernize a Gestão da sua Prefeitura com a PixelLab',
      description: 'SaaS completo de Zeladoria Urbana, Ouvidoria Digital e Participação Cidadã em Tempo Real.',
      mediaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      targetUrl: 'https://pixellab.com.br',
      placement: AdPlacement.HOME_HERO,
      status: AdStatus.ACTIVE,
      impressionsCount: 4500,
      clicksCount: 380,
      budget: 2000,
      startDate: new Date(Date.now() - 86400000 * 15),
      endDate: new Date(Date.now() + 86400000 * 45),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('🔔 10. Criando Notificações Iniciais...');
  await db.collection('notifications').insertMany([
    {
      userId: cidadaoGuaraId,
      tenantId: tenantGuaratinguetaId,
      title: 'Ocorrência em Guaratinguetá Atualizada',
      message: 'Sua solicitação GUA-2026-00001 na Av. JK agora está: Em Obras.',
      type: 'STATUS_CHANGE',
      link: '/requests/GUA-2026-00001',
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId: cidadaoJoaoId,
      tenantId: tenantNovaEsperancaId,
      title: 'Atualização na solicitação APP-2026-00001',
      message: 'Sua solicitação agora está com o status: Em atendimento.',
      type: 'STATUS_CHANGE',
      link: '/requests/APP-2026-00001',
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('\n======================================================');
  console.log('🎉 SEED CONCLUÍDO COM SUCESSO! (PIXELLAB GOVTECH)');
  console.log('======================================================');
  console.log('Credenciais de Acesso geradas:');
  console.log('👑 Super Admin:       superadmin@apponte.com              | Senha: admin123');
  console.log('🏛️ Gestor Guará:      admin.guara@guaratingueta.sp.gov.br | Senha: admin123');
  console.log('👔 Secretário Guará:  secretario.obras@guaratingueta.sp.gov.br| Senha: admin123');
  console.log('👷 Atuante Guará:     operador.obras@guaratingueta.sp.gov.br| Senha: admin123');
  console.log('👥 Cidadão Guará:     cidadao.guara@apponte.com           | Senha: cidadao123');
  console.log('🏛️ Admin N.Esperança: admin.novaesperanca@apponte.com     | Senha: admin123');
  console.log('👥 Cidadão Geral:     cidadao@apponte.com                 | Senha: cidadao123');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Erro durante o seed:', err);
  process.exit(1);
});
