# Matriz de Perfis e Permissões (RBAC) — APPonte

## 1. Definição dos Perfis

1. **`PUBLIC` (Visitante Anônimo)**:
   - Acesso à Landing Page, Feed de solicitações públicas, Mapa Urbano e anúncios.
   - Pode visualizar detalhes de qualquer solicitação e sua localização.
   - Não pode criar chamados, apoiar ou comentar sem efetuar login.

2. **`CITIZEN` (Cidadão)**:
   - Todas as permissões do perfil Público.
   - Criação de novas solicitações com fixação de ponto no mapa e fotos anexadas.
   - Edição e exclusão de solicitações próprias enquanto estiverem no status `PENDING`.
   - Apoiar chamados de outros cidadãos (1 apoio por chamado).
   - Comentar publicamente em qualquer solicitação.
   - Acesso ao **Painel do Cidadão** para acompanhamento em tempo real.

3. **`OPERATOR` (Atuante / Equipe de Campo)**:
   - Responsável direto pela execução dos reparos e serviços públicos.
   - Acesso à fila de solicitações atribuídas à sua equipe/secretaria.
   - Atualização de status: iniciar atendimento (`IN_PROGRESS`) e conclusão com comprovação fotográfica (`RESOLVED`).
   - Emissão de pareceres técnicos e justificativas de recusa.
   - Inserção de comentários internos visíveis apenas para a equipe da prefeitura.

4. **`SECRETARY` (Secretário Municipal)**:
   - Gestão estratégica da Secretaria da pasta.
   - Acesso ao **Painel Executivo da Secretaria** com gráficos de demandas por categoria e bairro.
   - Atribuição manual ou automática de chamados a atuantes da equipe.
   - Gestão de categorias de serviços e definição de prazos de SLA.

5. **`ADMIN` (Gestor do Tenant / Prefeitura)**:
   - Gestão de todas as secretarias e departamentos municipais.
   - Cadastro e alocação de secretários e atuantes.
   - Criação e monitoramento de campanhas publicitárias locais.
   - Acesso ao **Painel Geral de Gestão Municipal** e relatórios de auditoria.

6. **`SUPER_ADMIN` (Administrador Global do SaaS)**:
   - Criação e gestão de novas Prefeituras / Tenants na plataforma.
   - Definição dos planos de assinatura SaaS e limites operacionais.
   - Acesso irrestrito a todas as métricas globais e trilhas de auditoria de segurança.
