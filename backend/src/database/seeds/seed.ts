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

  console.log('📦 1. Criando Planos SaaS...');
  const planFreeId = new Types.ObjectId();
  const planProId = new Types.ObjectId();
  const planEnterpriseId = new Types.ObjectId();

  await db.collection('plans').insertMany([
    {
      _id: planFreeId,
      name: 'Plano Gratuito',
      slug: 'gratuito',
      tier: 'FREE',
      priceMonthly: 0,
      priceYearly: 0,
      features: ['Acesso ao Feed e Mapa', 'Até 50 solicitações/mês', 'Exibição de anúncios', '1 Atuante'],
      limits: { maxRequestsPerMonth: 50, maxStorageMb: 500, customDomain: false, removeAds: false, advancedAnalytics: false, operatorsLimit: 1 },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: planProId,
      name: 'Prefeitura Pro',
      slug: 'prefeitura-pro',
      tier: 'PRO',
      priceMonthly: 990,
      priceYearly: 9900,
      features: ['Solicitações Ilimitadas', 'Sem anúncios externos', 'Até 15 Atuantes', 'Dashboard Analítico', 'Relatórios em PDF'],
      limits: { maxRequestsPerMonth: 5000, maxStorageMb: 20480, customDomain: true, removeAds: true, advancedAnalytics: true, operatorsLimit: 15 },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: planEnterpriseId,
      name: 'Prefeitura Enterprise',
      slug: 'prefeitura-enterprise',
      tier: 'ENTERPRISE',
      priceMonthly: 2490,
      priceYearly: 24900,
      features: ['Tudo do Pro', 'Atuantes Ilimitados', 'API de Integração Governamental', 'SLA Garantido 99.9%', 'Suporte Dedicado 24/7'],
      limits: { maxRequestsPerMonth: 999999, maxStorageMb: 102400, customDomain: true, removeAds: true, advancedAnalytics: true, operatorsLimit: 100 },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('🏛️ 2. Criando Prefeituras (Tenants)...');
  const tenantNovaEsperancaId = new Types.ObjectId();
  const tenantSaoBentoId = new Types.ObjectId();

  await db.collection('tenants').insertMany([
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
  const deptObrasId = new Types.ObjectId();
  const deptIluminacaoId = new Types.ObjectId();
  const deptMeioAmbienteId = new Types.ObjectId();
  const deptTransitoId = new Types.ObjectId();

  await db.collection('departments').insertMany([
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
  const catBuracoId = new Types.ObjectId();
  const catIluminacaoId = new Types.ObjectId();
  const catPodaId = new Types.ObjectId();
  const catSemaforoId = new Types.ObjectId();

  await db.collection('requestcategories').insertMany([
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
  const adminNovaEsperancaId = new Types.ObjectId();
  const secretarioObrasId = new Types.ObjectId();
  const operadorObrasId = new Types.ObjectId();
  const cidadaoJoaoId = new Types.ObjectId();
  const cidadaMariaId = new Types.ObjectId();

  await db.collection('users').insertMany([
    {
      _id: superAdminId,
      name: 'Super Administrador',
      email: 'superadmin@apponte.com',
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin',
      phone: '(11) 99999-0000',
      bio: 'Administrador Geral da Plataforma APPonte',
      isEmailVerified: true,
      status: 'ACTIVE',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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
    { _id: deptObrasId },
    { $set: { secretaryUserId: secretarioObrasId } },
  );

  console.log('📌 6. Criando Solicitações Cidadãs com GeoJSON e Históricos...');
  const reqBuracoId = new Types.ObjectId();
  const reqLuzId = new Types.ObjectId();
  const reqPodaId = new Types.ObjectId();
  const reqSemaforoId = new Types.ObjectId();

  await db.collection('requests').insertMany([
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
        coordinates: [-46.6558, -23.5615], // GeoJSON [lng, lat]
      },
      address: {
        formattedAddress: 'Av. Brasil, 1420 - Centro, Nova Esperança - SP',
        street: 'Av. Brasil',
        number: '1420',
        neighborhood: 'Centro',
        city: 'Nova Esperança',
        state: 'SP',
        postalCode: '14800-000',
        reference: 'Em frente à Farmácia Popular',
      },
      media: [
        {
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'buraco_av_brasil.jpg',
          size: 145000,
        },
      ],
      supportsCount: 14,
      commentsCount: 3,
      sharesCount: 5,
      viewsCount: 128,
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
      title: 'Semáforo apagado no cruzamento da Av. São Paulo com Rua 7',
      description: 'O cruzamento é muito movimentado com linha de ônibus. Trânsito confuso e pedestres sem conseguir atravessar.',
      status: RequestStatus.IN_REVIEW,
      priority: RequestPriority.URGENT,
      location: {
        type: 'Point',
        coordinates: [-46.6520, -23.5645],
      },
      address: {
        formattedAddress: 'Av. São Paulo, 500 - Centro, Nova Esperança - SP',
        street: 'Av. São Paulo',
        number: '500',
        neighborhood: 'Centro',
        city: 'Nova Esperança',
        state: 'SP',
        postalCode: '14800-000',
      },
      media: [],
      supportsCount: 31,
      commentsCount: 4,
      sharesCount: 12,
      viewsCount: 310,
      isDeleted: false,
      createdAt: new Date(Date.now() - 3600000 * 8),
      updatedAt: new Date(),
    },
  ]);

  console.log('📜 7. Criando Históricos de Status com Evidências...');
  await db.collection('requeststatushistories').insertMany([
    {
      requestId: reqBuracoId,
      tenantId: tenantNovaEsperancaId,
      status: RequestStatus.PENDING,
      changedById: cidadaoJoaoId,
      comment: 'Solicitação registrada pelo cidadão no aplicativo.',
      evidenceMedia: [],
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      requestId: reqBuracoId,
      tenantId: tenantNovaEsperancaId,
      status: RequestStatus.IN_REVIEW,
      changedById: secretarioObrasId,
      comment: 'Solicitação analisada e encaminhada para a equipe de pavimentação asfáltica.',
      evidenceMedia: [],
      createdAt: new Date(Date.now() - 86400000 * 1.5),
      updatedAt: new Date(Date.now() - 86400000 * 1.5),
    },
    {
      requestId: reqBuracoId,
      tenantId: tenantNovaEsperancaId,
      status: RequestStatus.IN_PROGRESS,
      changedById: operadorObrasId,
      comment: 'Equipe de campo no local realizando o isolamento e preparação da massa asfáltica.',
      evidenceMedia: [],
      createdAt: new Date(Date.now() - 86400000 * 0.5),
      updatedAt: new Date(Date.now() - 86400000 * 0.5),
    },
    {
      requestId: reqLuzId,
      tenantId: tenantNovaEsperancaId,
      status: RequestStatus.PENDING,
      changedById: cidadaMariaId,
      comment: 'Abertura de chamado de iluminação pública.',
      evidenceMedia: [],
      createdAt: new Date(Date.now() - 86400000 * 4),
      updatedAt: new Date(Date.now() - 86400000 * 4),
    },
    {
      requestId: reqLuzId,
      tenantId: tenantNovaEsperancaId,
      status: RequestStatus.RESOLVED,
      changedById: operadorObrasId,
      comment: 'Lâmpada substituída com sucesso por modelo LED.',
      evidenceMedia: [
        {
          url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
          type: 'IMAGE',
          filename: 'reparo_concluido.jpg',
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 4),
      updatedAt: new Date(Date.now() - 3600000 * 4),
    },
  ]);

  console.log('💬 8. Criando Comentários e Apoios...');
  await db.collection('requestcomments').insertMany([
    {
      requestId: reqBuracoId,
      tenantId: tenantNovaEsperancaId,
      authorId: cidadaMariaId,
      content: 'Passei por lá ontem e quase furei o pneu! Muito importante consertar rápido.',
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
    {
      requestId: reqBuracoId,
      tenantId: tenantNovaEsperancaId,
      authorId: secretarioObrasId,
      content: 'Nota interna: verificar se há vazamento da concessionária de água sob a via.',
      media: [],
      isInternal: true, // Apenas para staff
      isDeleted: false,
      createdAt: new Date(Date.now() - 3600000 * 3),
      updatedAt: new Date(Date.now() - 3600000 * 3),
    },
  ]);

  await db.collection('requestsupports').insertMany([
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

  console.log('📢 9. Criando Anúncios Locais e Patrocinadores SaaS...');
  await db.collection('advertisements').insertMany([
    {
      tenantId: tenantNovaEsperancaId,
      advertiserName: 'Supermercado Bom Preço',
      advertiserContact: 'comercial@bompreco.com.br',
      title: 'Super Ofertas da Semana no Bom Preço!',
      description: 'Hortifruti fresquinho todos os dias e até 30% de economia no seu carrinho.',
      mediaUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      targetUrl: 'https://bompreco.com.br',
      placement: AdPlacement.FEED,
      targetCity: 'Nova Esperança',
      targetState: 'SP',
      status: AdStatus.ACTIVE,
      impressionsCount: 1420,
      clicksCount: 88,
      budget: 500,
      startDate: new Date(Date.now() - 86400000 * 10),
      endDate: new Date(Date.now() + 86400000 * 30),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: tenantNovaEsperancaId,
      advertiserName: 'Auto Center Confiança',
      advertiserContact: 'contato@autocenter.com.br',
      title: 'Revisão Preventiva & Pneus em até 10x Sem Juros',
      description: 'Alinhamento, balanceamento e suspensão com garantia total para você rodar seguro.',
      mediaUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
      targetUrl: 'https://autocenter.com.br',
      placement: AdPlacement.SIDEBAR,
      targetCity: 'Nova Esperança',
      targetState: 'SP',
      status: AdStatus.ACTIVE,
      impressionsCount: 890,
      clicksCount: 42,
      budget: 350,
      startDate: new Date(Date.now() - 86400000 * 5),
      endDate: new Date(Date.now() + 86400000 * 25),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      tenantId: null, // Global banner
      advertiserName: 'Energia Solar Sustentável',
      advertiserContact: 'vendas@energiasolar.com.br',
      title: 'Reduza sua conta de energia em até 95%',
      description: 'Instalação rápida com financiamento facilitado para residências e comércios da região.',
      mediaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      targetUrl: 'https://energiasolar.com.br',
      placement: AdPlacement.HOME_HERO,
      status: AdStatus.ACTIVE,
      impressionsCount: 3100,
      clicksCount: 195,
      budget: 1200,
      startDate: new Date(Date.now() - 86400000 * 15),
      endDate: new Date(Date.now() + 86400000 * 45),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('🔔 10. Criando Notificações Iniciais...');
  await db.collection('notifications').insertMany([
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
    {
      userId: cidadaMariaId,
      tenantId: tenantNovaEsperancaId,
      title: 'Solicitação APP-2026-00002 Resolvida com Sucesso!',
      message: 'A equipe municipal concluiu o reparo da iluminação pública.',
      type: 'STATUS_CHANGE',
      link: '/requests/APP-2026-00002',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 4),
      updatedAt: new Date(),
    },
  ]);

  console.log('\n======================================================');
  console.log('🎉 SEED CONCLUÍDO COM SUCESSO!');
  console.log('======================================================');
  console.log('Credenciais de Acesso geradas:');
  console.log('👑 Super Admin:  superadmin@apponte.com              | Senha: admin123');
  console.log('🏛️ Admin Tenant: admin.novaesperanca@apponte.com     | Senha: admin123');
  console.log('👔 Secretário:   secretario.obras@novaesperanca.gov.br| Senha: admin123');
  console.log('👷 Atuante:      operador.obras@novaesperanca.gov.br  | Senha: admin123');
  console.log('👥 Cidadão:      cidadao@apponte.com                 | Senha: cidadao123');
  console.log('👥 Cidadã:       maria.cidada@apponte.com            | Senha: cidadao123');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Erro durante o seed:', err);
  process.exit(1);
});
