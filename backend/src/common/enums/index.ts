export enum Role {
  PUBLIC = 'PUBLIC',
  CITIZEN = 'CITIZEN',
  OPERATOR = 'OPERATOR', // Atuante
  SECRETARY = 'SECRETARY', // Secretário
  ADMIN = 'ADMIN', // Administrador do Tenant
  SUPER_ADMIN = 'SUPER_ADMIN', // Administrador Geral da Plataforma
}

export enum RequestStatus {
  PENDING = 'PENDING', // Pendente
  IN_REVIEW = 'IN_REVIEW', // Em análise
  IN_PROGRESS = 'IN_PROGRESS', // Em atendimento
  RESOLVED = 'RESOLVED', // Resolvida
  REJECTED = 'REJECTED', // Recusada
  CANCELLED = 'CANCELLED', // Cancelada
}

export enum RequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

export enum AdPlacement {
  FEED = 'FEED',
  SIDEBAR = 'SIDEBAR',
  HOME_HERO = 'HOME_HERO',
  MAP_BANNER = 'MAP_BANNER',
  DASHBOARD = 'DASHBOARD',
}

export enum AdStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
}

export enum PlanTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum NotificationType {
  STATUS_CHANGE = 'STATUS_CHANGE',
  NEW_COMMENT = 'NEW_COMMENT',
  ASSIGNED = 'ASSIGNED',
  SYSTEM = 'SYSTEM',
}
