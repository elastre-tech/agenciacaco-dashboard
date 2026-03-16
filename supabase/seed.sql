-- Seed data for Dashboard360 - Roberto Menezes 2026 Campaign

-- Agency
INSERT INTO agencies (id, name, slug, primary_color, secondary_color, background_color) VALUES
  ('11111111-1111-1111-1111-111111111111', 'CaCo Casa de Comunicação', 'caco', '#FFD100', '#1A1A1A', '#F8F8F6');

-- Profiles
INSERT INTO profiles (id, email, full_name) VALUES
  ('33333333-3333-3333-3333-333333333333', 'ana@caco.com.br', 'Ana Beatriz Costa'),
  ('44444444-4444-4444-4444-444444444444', 'lucas@caco.com.br', 'Lucas Ferreira'),
  ('55555555-5555-5555-5555-555555555555', 'mariana@caco.com.br', 'Mariana Silva');

-- Agency Members
INSERT INTO agency_members (agency_id, profile_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'agency_owner'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'agency_admin');

-- Workspace
INSERT INTO workspaces (id, agency_id, name, slug, candidate_name, candidate_party, election_type, election_year, city, state) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Roberto Menezes 2026', 'roberto-menezes-2026', 'Roberto Menezes', 'PSD', 'municipal', 2026, 'Florianópolis', 'SC');

-- Workspace Members
INSERT INTO workspace_members (workspace_id, profile_id, role) VALUES
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'campaign_coordinator'),
  ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'intelligence_analyst');

-- Integrations
INSERT INTO integrations (workspace_id, provider, is_connected) VALUES
  ('22222222-2222-2222-2222-222222222222', 'meta_ads', false),
  ('22222222-2222-2222-2222-222222222222', 'google_ads', false),
  ('22222222-2222-2222-2222-222222222222', 'whatsapp', false),
  ('22222222-2222-2222-2222-222222222222', 'instagram', false);

-- metrics_daily (30 days)
INSERT INTO metrics_daily (workspace_id, date, total_reach, impressions, clicks, leads_count, cpl, budget_spent, budget_total, engagement_rate) VALUES
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '30 days', 44800, 89600, 3584, 8, 11.80, 520.00, 75000, 2.6),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '29 days', 46200, 92400, 3696, 9, 11.50, 580.00, 75000, 2.8),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '28 days', 43100, 86200, 2586, 7, 11.90, 490.00, 75000, 2.5),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '27 days', 47500, 95000, 3800, 10, 11.20, 650.00, 75000, 3.0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '26 days', 49000, 98000, 4410, 11, 10.80, 720.00, 75000, 3.2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '25 days', 51200, 102400, 4608, 12, 10.50, 800.00, 75000, 3.4),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '24 days', 48500, 97000, 2910, 9, 10.90, 680.00, 75000, 2.9),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '23 days', 45800, 91600, 2748, 8, 11.30, 560.00, 75000, 2.7),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '22 days', 53000, 106000, 4770, 13, 10.00, 890.00, 75000, 3.5),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '21 days', 55200, 110400, 4968, 14, 9.70, 950.00, 75000, 3.8),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '20 days', 57800, 115600, 5202, 14, 9.30, 1050.00, 75000, 4.0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '19 days', 56100, 112200, 4488, 13, 9.50, 980.00, 75000, 3.7),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '18 days', 52400, 104800, 3144, 10, 9.80, 820.00, 75000, 3.1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '17 days', 59500, 119000, 5355, 15, 8.90, 1150.00, 75000, 4.2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '16 days', 61000, 122000, 5490, 16, 8.50, 1280.00, 75000, 4.5),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '15 days', 63500, 127000, 5715, 17, 8.10, 1400.00, 75000, 4.7),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '14 days', 60200, 120400, 4816, 14, 8.40, 1200.00, 75000, 4.1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '13 days', 57000, 114000, 3420, 11, 8.80, 1050.00, 75000, 3.6),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '12 days', 66000, 132000, 5940, 18, 7.60, 1550.00, 75000, 5.0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '11 days', 68500, 137000, 6165, 19, 7.20, 1680.00, 75000, 5.2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '10 days', 70200, 140400, 6318, 20, 6.90, 1800.00, 75000, 5.5),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '9 days', 72000, 144000, 6480, 20, 6.60, 1900.00, 75000, 5.7),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '8 days', 68800, 137600, 5504, 17, 7.00, 1650.00, 75000, 5.0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '7 days', 65500, 131000, 3930, 14, 7.40, 1350.00, 75000, 4.3),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '6 days', 75000, 150000, 6750, 21, 6.10, 2050.00, 75000, 5.9),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '5 days', 78000, 156000, 7020, 22, 5.70, 2200.00, 75000, 6.1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '4 days', 80500, 161000, 7245, 23, 5.30, 2350.00, 75000, 6.3),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '3 days', 82000, 164000, 7380, 24, 5.00, 2400.00, 75000, 6.4),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '2 days', 78500, 157000, 6280, 19, 5.50, 2100.00, 75000, 5.6),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '1 day', 85000, 170000, 7650, 25, 4.60, 2500.00, 75000, 6.5);

-- intelligence_alerts
INSERT INTO intelligence_alerts (workspace_id, title, description, severity, status, source, created_at, resolved_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Menção negativa em alta nas redes sociais', 'Volume de menções negativas aumentou 35% nas últimas 6 horas, principalmente no Twitter relacionado a declarações sobre transporte público.', 'high', 'active', 'social_listening', CURRENT_DATE - interval '2 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'CPL acima da meta em Google Ads', 'O custo por lead nas campanhas de Google Ads está 22% acima da meta estabelecida de R$ 8,00. Campanhas de busca genérica são as principais responsáveis.', 'medium', 'acknowledged', 'google_ads', CURRENT_DATE - interval '5 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Pico de engajamento no Instagram', 'Post sobre proposta de ciclovias gerou 3x mais engajamento que a média. Considerar impulsionar e criar conteúdo similar.', 'low', 'resolved', 'instagram', CURRENT_DATE - interval '8 days', CURRENT_DATE - interval '7 days'),
  ('22222222-2222-2222-2222-222222222222', 'Concorrente lançou campanha agressiva', 'Ana Clara Rodrigues iniciou campanha digital com alto investimento em Meta Ads focando no tema segurança pública. Monitorar impacto no share of voice.', 'critical', 'active', 'competitive_intelligence', CURRENT_DATE - interval '1 day', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Taxa de abertura WhatsApp em queda', 'Taxa de abertura das mensagens via WhatsApp caiu de 72% para 58% nos últimos 7 dias. Possível fadiga da base de contatos.', 'medium', 'active', 'whatsapp', CURRENT_DATE - interval '3 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Novo termo emergente: #RobertoFaz', 'Hashtag #RobertoFaz surgiu organicamente e está ganhando tração. 342 menções nas últimas 48 horas com sentimento majoritariamente positivo.', 'low', 'resolved', 'social_listening', CURRENT_DATE - interval '10 days', CURRENT_DATE - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'Queda de alcance orgânico no Facebook', 'Alcance orgânico no Facebook caiu 28% na última semana. Algoritmo pode estar penalizando conteúdo político. Recomenda-se diversificar formatos.', 'high', 'acknowledged', 'meta_ads', CURRENT_DATE - interval '4 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Leads duplicados detectados no CRM', 'Identificados 47 leads duplicados na base, originados de múltiplos formulários. Necessário deduplicação para evitar desperdício em comunicações.', 'medium', 'resolved', 'crm', CURRENT_DATE - interval '12 days', CURRENT_DATE - interval '10 days');

-- channel_budgets
INSERT INTO channel_budgets (workspace_id, channel, allocated, spent, month) VALUES
  ('22222222-2222-2222-2222-222222222222', 'meta_ads', 25000, 18500, date_trunc('month', CURRENT_DATE)::date),
  ('22222222-2222-2222-2222-222222222222', 'google_ads', 20000, 14200, date_trunc('month', CURRENT_DATE)::date),
  ('22222222-2222-2222-2222-222222222222', 'whatsapp', 10000, 7800, date_trunc('month', CURRENT_DATE)::date),
  ('22222222-2222-2222-2222-222222222222', 'field_operations', 15000, 11000, date_trunc('month', CURRENT_DATE)::date),
  ('22222222-2222-2222-2222-222222222222', 'events', 5000, 3200, date_trunc('month', CURRENT_DATE)::date);

-- territorial_interactions
INSERT INTO territorial_interactions (workspace_id, interaction_type, neighborhood, latitude, longitude, notes, recorded_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'visit', 'Centro', -27.5954, -48.5480, 'Visita ao comércio local na Rua Felipe Schmidt', CURRENT_DATE - interval '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'event', 'Centro', -27.5969, -48.5495, 'Panfletagem na Praça XV de Novembro', CURRENT_DATE - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'canvassing', 'Trindade', -27.5847, -48.5210, 'Corpo a corpo no bairro Trindade', CURRENT_DATE - interval '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'meeting', 'Trindade', -27.5812, -48.5188, 'Reunião com líderes comunitários da Trindade', CURRENT_DATE - interval '8 days'),
  ('22222222-2222-2222-2222-222222222222', 'event', 'Lagoa da Conceição', -27.5930, -48.4650, 'Evento cultural na Lagoa da Conceição', CURRENT_DATE - interval '10 days'),
  ('22222222-2222-2222-2222-222222222222', 'canvassing', 'Lagoa da Conceição', -27.5985, -48.4690, 'Caminhada com moradores na Lagoa', CURRENT_DATE - interval '15 days'),
  ('22222222-2222-2222-2222-222222222222', 'visit', 'Canasvieiras', -27.4270, -48.4620, 'Visita a associação de moradores de Canasvieiras', CURRENT_DATE - interval '7 days'),
  ('22222222-2222-2222-2222-222222222222', 'event', 'Canasvieiras', -27.4285, -48.4580, 'Comício na praia de Canasvieiras', CURRENT_DATE - interval '12 days'),
  ('22222222-2222-2222-2222-222222222222', 'canvassing', 'Ingleses', -27.4380, -48.3940, 'Panfletagem nos Ingleses', CURRENT_DATE - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'meeting', 'Ingleses', -27.4350, -48.3980, 'Encontro com comerciantes dos Ingleses', CURRENT_DATE - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'visit', 'Campeche', -27.6680, -48.4780, 'Visita a escola municipal no Campeche', CURRENT_DATE - interval '6 days'),
  ('22222222-2222-2222-2222-222222222222', 'canvassing', 'Campeche', -27.6720, -48.4810, 'Corpo a corpo no Campeche', CURRENT_DATE - interval '14 days'),
  ('22222222-2222-2222-2222-222222222222', 'event', 'Coqueiros', -27.5880, -48.5730, 'Evento no Parque de Coqueiros', CURRENT_DATE - interval '11 days'),
  ('22222222-2222-2222-2222-222222222222', 'visit', 'Coqueiros', -27.5855, -48.5710, 'Visita ao posto de saúde de Coqueiros', CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'canvassing', 'Estreito', -27.5960, -48.5780, 'Panfletagem no Estreito', CURRENT_DATE - interval '13 days'),
  ('22222222-2222-2222-2222-222222222222', 'meeting', 'Estreito', -27.5940, -48.5800, 'Reunião com associação de bairro do Estreito', CURRENT_DATE - interval '6 days'),
  ('22222222-2222-2222-2222-222222222222', 'visit', 'Itacorubi', -27.5760, -48.5080, 'Visita à UDESC campus Itacorubi', CURRENT_DATE - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'canvassing', 'Itacorubi', -27.5780, -48.5100, 'Caminhada pelo Itacorubi', CURRENT_DATE - interval '16 days'),
  ('22222222-2222-2222-2222-222222222222', 'event', 'Pantanal', -27.5890, -48.5120, 'Roda de conversa no Pantanal', CURRENT_DATE - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'meeting', 'Pantanal', -27.5870, -48.5140, 'Encontro com moradores do Pantanal', CURRENT_DATE - interval '18 days'),
  ('22222222-2222-2222-2222-222222222222', 'visit', 'Centro', -27.5920, -48.5510, 'Visita ao Mercado Público', CURRENT_DATE - interval '20 days'),
  ('22222222-2222-2222-2222-222222222222', 'event', 'Trindade', -27.5830, -48.5230, 'Debate na UFSC', CURRENT_DATE - interval '22 days');

-- qr_codes
INSERT INTO qr_codes (workspace_id, label, code, url, location, scans_count) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Panfleto Centro', 'QR-PANFLETO-CENTRO', 'https://roberto2026.com.br/qr/panfleto-centro', 'Centro - Rua Felipe Schmidt', 245),
  ('22222222-2222-2222-2222-222222222222', 'Adesivo Carro', 'QR-ADESIVO-CARRO', 'https://roberto2026.com.br/qr/adesivo-carro', 'Frota de veículos da campanha', 87),
  ('22222222-2222-2222-2222-222222222222', 'Banner Comício Trindade', 'QR-BANNER-TRINDADE', 'https://roberto2026.com.br/qr/banner-trindade', 'Trindade - Praça Santos Dumont', 156),
  ('22222222-2222-2222-2222-222222222222', 'Flyer Mercado Público', 'QR-FLYER-MERCADO', 'https://roberto2026.com.br/qr/flyer-mercado', 'Centro - Mercado Público Municipal', 198),
  ('22222222-2222-2222-2222-222222222222', 'Cartaz Universidade UFSC', 'QR-CARTAZ-UFSC', 'https://roberto2026.com.br/qr/cartaz-ufsc', 'Trindade - Campus UFSC', 12);

-- leads
INSERT INTO leads (workspace_id, full_name, email, phone, temperature, source, neighborhood, notes, converted_at, created_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Pedro Henrique Santos', 'pedro.santos@email.com', '48991001001', 'hot', 'instagram', 'Centro', 'Interessado em voluntariado', CURRENT_DATE - interval '5 days', CURRENT_DATE - interval '40 days'),
  ('22222222-2222-2222-2222-222222222222', 'Juliana Oliveira', 'juliana.oliveira@email.com', '48991001002', 'hot', 'facebook', 'Trindade', 'Quer participar de eventos', CURRENT_DATE - interval '3 days', CURRENT_DATE - interval '38 days'),
  ('22222222-2222-2222-2222-222222222222', 'Fernando Almeida', 'fernando.almeida@email.com', '48991001003', 'hot', 'website', 'Lagoa da Conceição', 'Doador potencial', CURRENT_DATE - interval '7 days', CURRENT_DATE - interval '35 days'),
  ('22222222-2222-2222-2222-222222222222', 'Camila Rodrigues', 'camila.rodrigues@email.com', '48991001004', 'hot', 'whatsapp', 'Canasvieiras', 'Líder comunitária engajada', CURRENT_DATE - interval '2 days', CURRENT_DATE - interval '42 days'),
  ('22222222-2222-2222-2222-222222222222', 'Rafael Nascimento', 'rafael.nasc@email.com', '48991001005', 'hot', 'event', 'Coqueiros', 'Presente em 3 eventos', CURRENT_DATE - interval '4 days', CURRENT_DATE - interval '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'Gabriela Martins', 'gabi.martins@email.com', '48991001006', 'hot', 'referral', 'Estreito', 'Indicada por liderança do PSD', CURRENT_DATE - interval '1 day', CURRENT_DATE - interval '28 days'),
  ('22222222-2222-2222-2222-222222222222', 'Thiago Pereira', 'thiago.p@email.com', '48991001007', 'hot', 'field', 'Ingleses', 'Empresário local apoiador', CURRENT_DATE - interval '6 days', CURRENT_DATE - interval '33 days'),
  ('22222222-2222-2222-2222-222222222222', 'Isabela Costa', 'isabela.costa@email.com', '48991001008', 'hot', 'instagram', 'Itacorubi', 'Influenciadora digital local', CURRENT_DATE - interval '8 days', CURRENT_DATE - interval '25 days'),
  ('22222222-2222-2222-2222-222222222222', 'Marcos Vinícius Lima', 'marcos.lima@email.com', '48991001009', 'hot', 'website', 'Pantanal', 'Professor universitário', CURRENT_DATE - interval '3 days', CURRENT_DATE - interval '20 days'),
  ('22222222-2222-2222-2222-222222222222', 'Letícia Souza', 'leticia.souza@email.com', '48991001010', 'hot', 'facebook', 'Campeche', 'Ativista ambiental', CURRENT_DATE - interval '10 days', CURRENT_DATE - interval '36 days'),
  ('22222222-2222-2222-2222-222222222222', 'Diego Carvalho', 'diego.carvalho@email.com', '48991001011', 'hot', 'whatsapp', 'Centro', 'Advogado, quer colaborar com propostas', CURRENT_DATE - interval '2 days', CURRENT_DATE - interval '22 days'),
  ('22222222-2222-2222-2222-222222222222', 'Amanda Ferreira', 'amanda.f@email.com', '48991001012', 'hot', 'event', 'Trindade', 'Estudante de direito UFSC', CURRENT_DATE - interval '9 days', CURRENT_DATE - interval '27 days'),
  ('22222222-2222-2222-2222-222222222222', 'Bruno Rezende', 'bruno.rezende@email.com', '48991001013', 'hot', 'field', 'Lagoa da Conceição', 'Dono de restaurante na Lagoa', NULL, CURRENT_DATE - interval '15 days'),
  ('22222222-2222-2222-2222-222222222222', 'Carolina Mendes', 'carol.mendes@email.com', '48991001014', 'hot', 'referral', 'Coqueiros', 'Médica engajada em saúde pública', NULL, CURRENT_DATE - interval '12 days'),
  ('22222222-2222-2222-2222-222222222222', 'Lucas Gabriel Ramos', 'lucas.ramos@email.com', '48991001015', 'hot', 'instagram', 'Estreito', 'Produtor cultural', NULL, CURRENT_DATE - interval '8 days'),
  ('22222222-2222-2222-2222-222222222222', 'Patrícia Barbosa', 'patricia.b@email.com', '48991001016', 'warm', 'facebook', 'Centro', 'Curtiu vários posts', NULL, CURRENT_DATE - interval '18 days'),
  ('22222222-2222-2222-2222-222222222222', 'Ricardo Tavares', 'ricardo.t@email.com', '48991001017', 'warm', 'instagram', 'Trindade', 'Comentou em live', NULL, CURRENT_DATE - interval '14 days'),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Azevedo', 'fernanda.a@email.com', '48991001018', 'warm', 'website', 'Canasvieiras', 'Preencheu formulário de contato', NULL, CURRENT_DATE - interval '20 days'),
  ('22222222-2222-2222-2222-222222222222', 'Gustavo Moreira', 'gustavo.m@email.com', '48991001019', 'warm', 'whatsapp', 'Ingleses', 'Respondeu pesquisa via WhatsApp', NULL, CURRENT_DATE - interval '25 days'),
  ('22222222-2222-2222-2222-222222222222', 'Renata Pinto', 'renata.p@email.com', '48991001020', 'warm', 'event', 'Campeche', 'Presente no comício do Campeche', NULL, CURRENT_DATE - interval '16 days'),
  ('22222222-2222-2222-2222-222222222222', 'Vinícius Duarte', 'vinicius.d@email.com', '48991001021', 'warm', 'field', 'Coqueiros', 'Abordado em panfletagem', NULL, CURRENT_DATE - interval '22 days'),
  ('22222222-2222-2222-2222-222222222222', 'Aline Machado', 'aline.m@email.com', '48991001022', 'warm', 'instagram', 'Estreito', 'Salvou publicação sobre educação', NULL, CURRENT_DATE - interval '11 days'),
  ('22222222-2222-2222-2222-222222222222', 'Rodrigo Farias', 'rodrigo.f@email.com', '48991001023', 'warm', 'facebook', 'Itacorubi', 'Compartilhou vídeo da campanha', NULL, CURRENT_DATE - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'Tatiana Lopes', 'tatiana.l@email.com', '48991001024', 'warm', 'referral', 'Pantanal', 'Indicada por vizinha', NULL, CURRENT_DATE - interval '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'Eduardo Braga', 'eduardo.b@email.com', '48991001025', 'warm', 'website', 'Lagoa da Conceição', 'Baixou plano de governo', NULL, CURRENT_DATE - interval '19 days'),
  ('22222222-2222-2222-2222-222222222222', 'Daniela Castro', 'daniela.c@email.com', '48991001026', 'warm', 'whatsapp', 'Centro', 'Pediu adesivo para carro', NULL, CURRENT_DATE - interval '13 days'),
  ('22222222-2222-2222-2222-222222222222', 'Felipe Monteiro', 'felipe.m@email.com', '48991001027', 'warm', 'event', 'Trindade', 'Fez pergunta no debate UFSC', NULL, CURRENT_DATE - interval '7 days'),
  ('22222222-2222-2222-2222-222222222222', 'Jéssica Ribeiro', 'jessica.r@email.com', '48991001028', 'warm', 'field', 'Canasvieiras', 'Recebeu panfleto e pediu mais info', NULL, CURRENT_DATE - interval '17 days'),
  ('22222222-2222-2222-2222-222222222222', 'André Nunes', 'andre.n@email.com', '48991001029', 'warm', 'instagram', 'Ingleses', 'Seguiu perfil e curtiu stories', NULL, CURRENT_DATE - interval '24 days'),
  ('22222222-2222-2222-2222-222222222222', 'Roberta Campos', 'roberta.c@email.com', '48991001030', 'warm', 'facebook', 'Campeche', 'Reagiu a post sobre mobilidade', NULL, CURRENT_DATE - interval '21 days'),
  ('22222222-2222-2222-2222-222222222222', 'Caio Henrique Dias', 'caio.dias@email.com', '48991001031', 'warm', 'website', 'Coqueiros', 'Acessou site 4 vezes', NULL, CURRENT_DATE - interval '6 days'),
  ('22222222-2222-2222-2222-222222222222', 'Priscila Andrade', 'priscila.a@email.com', '48991001032', 'warm', 'referral', 'Estreito', 'Indicada pelo marido que é apoiador', NULL, CURRENT_DATE - interval '10 days'),
  ('22222222-2222-2222-2222-222222222222', 'Luciana Melo', 'luciana.m@email.com', '48991001033', 'warm', 'whatsapp', 'Itacorubi', 'Entrou no grupo de WhatsApp', NULL, CURRENT_DATE - interval '15 days'),
  ('22222222-2222-2222-2222-222222222222', 'Matheus Correia', 'matheus.c@email.com', '48991001034', 'warm', 'event', 'Pantanal', 'Participou da roda de conversa', NULL, CURRENT_DATE - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'Vanessa Teixeira', 'vanessa.t@email.com', '48991001035', 'warm', 'field', 'Centro', 'Abordada na Rua Conselheiro Mafra', NULL, CURRENT_DATE - interval '28 days'),
  ('22222222-2222-2222-2222-222222222222', 'Sérgio Albuquerque', 'sergio.a@email.com', '48991001036', 'cold', 'facebook', 'Trindade', NULL, NULL, CURRENT_DATE - interval '40 days'),
  ('22222222-2222-2222-2222-222222222222', 'Cláudia Vasconcelos', 'claudia.v@email.com', '48991001037', 'cold', 'instagram', 'Lagoa da Conceição', NULL, NULL, CURRENT_DATE - interval '37 days'),
  ('22222222-2222-2222-2222-222222222222', 'Marcelo Fontes', 'marcelo.f@email.com', '48991001038', 'cold', 'website', 'Canasvieiras', 'Acessou site uma vez', NULL, CURRENT_DATE - interval '35 days'),
  ('22222222-2222-2222-2222-222222222222', 'Natália Borges', 'natalia.b@email.com', '48991001039', 'cold', 'whatsapp', 'Ingleses', NULL, NULL, CURRENT_DATE - interval '32 days'),
  ('22222222-2222-2222-2222-222222222222', 'Otávio Rangel', 'otavio.r@email.com', '48991001040', 'cold', 'event', 'Campeche', 'Passou pelo evento rapidamente', NULL, CURRENT_DATE - interval '29 days'),
  ('22222222-2222-2222-2222-222222222222', 'Bianca Freitas', 'bianca.f@email.com', '48991001041', 'cold', 'field', 'Coqueiros', NULL, NULL, CURRENT_DATE - interval '44 days'),
  ('22222222-2222-2222-2222-222222222222', 'Henrique Pacheco', 'henrique.p@email.com', '48991001042', 'cold', 'instagram', 'Estreito', NULL, NULL, CURRENT_DATE - interval '41 days'),
  ('22222222-2222-2222-2222-222222222222', 'Simone Guimarães', 'simone.g@email.com', '48991001043', 'cold', 'facebook', 'Itacorubi', 'Curtiu uma publicação', NULL, CURRENT_DATE - interval '38 days'),
  ('22222222-2222-2222-2222-222222222222', 'Wagner Pinheiro', 'wagner.p@email.com', '48991001044', 'cold', 'website', 'Pantanal', NULL, NULL, CURRENT_DATE - interval '33 days'),
  ('22222222-2222-2222-2222-222222222222', 'Elaine Cardoso', 'elaine.c@email.com', '48991001045', 'cold', 'referral', 'Centro', 'Nome repassado por apoiador', NULL, CURRENT_DATE - interval '43 days'),
  ('22222222-2222-2222-2222-222222222222', 'Alexandre Motta', 'alexandre.m@email.com', '48991001046', 'cold', 'whatsapp', 'Trindade', NULL, NULL, CURRENT_DATE - interval '39 days'),
  ('22222222-2222-2222-2222-222222222222', 'Débora Figueiredo', 'debora.f@email.com', '48991001047', 'cold', 'event', 'Lagoa da Conceição', NULL, NULL, CURRENT_DATE - interval '36 days'),
  ('22222222-2222-2222-2222-222222222222', 'Milton Araújo', 'milton.a@email.com', '48991001048', 'cold', 'field', 'Canasvieiras', NULL, NULL, CURRENT_DATE - interval '31 days'),
  ('22222222-2222-2222-2222-222222222222', 'Lúcia Sampaio', 'lucia.s@email.com', '48991001049', 'cold', 'instagram', 'Ingleses', NULL, NULL, CURRENT_DATE - interval '45 days'),
  ('22222222-2222-2222-2222-222222222222', 'Cristiano Rocha', 'cristiano.r@email.com', '48991001050', 'cold', 'facebook', 'Campeche', NULL, NULL, CURRENT_DATE - interval '42 days'),
  ('22222222-2222-2222-2222-222222222222', 'Adriana Moura', 'adriana.m@email.com', '48991001051', 'cold', 'website', 'Estreito', NULL, NULL, CURRENT_DATE - interval '34 days'),
  ('22222222-2222-2222-2222-222222222222', 'Fábio Cavalcanti', 'fabio.c@email.com', '48991001052', 'cold', 'referral', 'Coqueiros', NULL, NULL, CURRENT_DATE - interval '26 days');

-- whatsapp_metrics (30 days)
INSERT INTO whatsapp_metrics (workspace_id, date, messages_sent, messages_delivered, messages_read, responses, opt_outs) VALUES
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '30 days', 210, 185, 125, 18, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '29 days', 245, 215, 148, 22, 0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '28 days', 198, 172, 110, 14, 2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '27 days', 310, 275, 192, 30, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '26 days', 340, 302, 211, 35, 0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '25 days', 380, 338, 237, 40, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '24 days', 290, 254, 170, 24, 2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '23 days', 225, 198, 130, 16, 0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '22 days', 410, 365, 258, 42, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '21 days', 450, 400, 280, 48, 2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '20 days', 480, 427, 302, 52, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '19 days', 460, 408, 285, 45, 0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '18 days', 320, 282, 190, 28, 3),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '17 days', 520, 462, 330, 55, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '16 days', 540, 480, 345, 58, 2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '15 days', 560, 498, 358, 62, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '14 days', 490, 435, 304, 50, 0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '13 days', 350, 310, 210, 32, 2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '12 days', 580, 516, 372, 65, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '11 days', 610, 542, 390, 70, 3),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '10 days', 640, 570, 410, 75, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '9 days', 660, 588, 425, 78, 2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '8 days', 580, 515, 365, 60, 0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '7 days', 400, 355, 245, 38, 4),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '6 days', 700, 623, 450, 82, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '5 days', 720, 640, 462, 85, 2),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '4 days', 740, 660, 478, 88, 1),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '3 days', 760, 678, 490, 92, 0),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '2 days', 680, 605, 430, 72, 5),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - interval '1 day', 800, 712, 520, 95, 1);

-- mobilization_funnel
INSERT INTO mobilization_funnel (workspace_id, stage, count, date) VALUES
  ('22222222-2222-2222-2222-222222222222', 'awareness', 45000, CURRENT_DATE),
  ('22222222-2222-2222-2222-222222222222', 'interest', 12000, CURRENT_DATE),
  ('22222222-2222-2222-2222-222222222222', 'consideration', 4500, CURRENT_DATE),
  ('22222222-2222-2222-2222-222222222222', 'action', 1800, CURRENT_DATE),
  ('22222222-2222-2222-2222-222222222222', 'advocate', 650, CURRENT_DATE);

-- waste_detections
INSERT INTO waste_detections (workspace_id, channel, amount, reason, detected_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'google_ads', 2340.00, 'Gastos com termos de busca não relacionados à campanha identificados nos últimos 30 dias.', CURRENT_DATE - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'meta_ads', 1850.00, 'Sobreposição de 38% entre conjuntos de anúncios resultando em competição interna.', CURRENT_DATE - interval '8 days'),
  ('22222222-2222-2222-2222-222222222222', 'meta_ads', 980.00, 'Posts impulsionados sem segmentação geográfica atingindo público fora de Florianópolis.', CURRENT_DATE - interval '12 days'),
  ('22222222-2222-2222-2222-222222222222', 'whatsapp', 560.00, 'Envio de mensagens para 892 números que não interagem há mais de 60 dias.', CURRENT_DATE - interval '3 days');

-- listening_terms
INSERT INTO listening_terms (id, workspace_id, term) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Roberto Menezes'),
  ('aaaa0001-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Prefeito Florianópolis'),
  ('aaaa0001-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '#RobertoFaz'),
  ('aaaa0001-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'eleições 2026 floripa'),
  ('aaaa0001-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'PSD Florianópolis'),
  ('aaaa0001-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Ana Clara Rodrigues'),
  ('aaaa0001-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'Carlos Eduardo Lima'),
  ('aaaa0001-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', 'Fernanda Bastos');

-- mentions
INSERT INTO mentions (workspace_id, term_id, source, sentiment, content, author, url, published_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'twitter', 'positive', 'Roberto Menezes apresentou propostas concretas para mobilidade urbana em Floripa. Finalmente alguém com plano real!', '@floripa_politica', 'https://twitter.com/floripa_politica/status/1', CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'instagram', 'positive', 'Conheci o Roberto no evento do Campeche. Pessoa acessível e que ouve a comunidade.', '@moradora_campeche', 'https://instagram.com/p/abc1', CURRENT_DATE - interval '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'facebook', 'neutral', 'Roberto Menezes participou de debate na UFSC sobre educação municipal. Vamos acompanhar as propostas.', 'Florianópolis Notícias', 'https://facebook.com/post/1', CURRENT_DATE - interval '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'news', 'positive', 'Pesquisa aponta Roberto Menezes em segundo lugar com crescimento de 5 pontos percentuais.', 'NSC Total', 'https://nsctotal.com.br/noticias/1', CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'twitter', 'negative', 'Cadê as propostas concretas de Roberto Menezes para o trânsito da ilha? Só promessa vazia.', '@cidadao_critico', 'https://twitter.com/cidadao_critico/status/2', CURRENT_DATE - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'blog', 'positive', 'Análise: por que Roberto Menezes se destaca entre os candidatos a prefeito de Florianópolis em 2026.', 'Blog Política SC', 'https://politicasc.blog/analise-rm', CURRENT_DATE - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'twitter', 'neutral', 'Debate entre candidatos a prefeito de Florianópolis terá Roberto Menezes, Ana Clara e Carlos Eduardo.', '@jornalismo_sc', 'https://twitter.com/jornalismo_sc/status/3', CURRENT_DATE - interval '6 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'instagram', 'positive', 'O projeto de ciclovias do Roberto Menezes faz muito sentido. Floripa precisa disso!', '@bike_floripa', 'https://instagram.com/p/abc2', CURRENT_DATE - interval '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000003', 'twitter', 'positive', '#RobertoFaz é a hashtag que mostra o trabalho de quem realmente conhece Florianópolis.', '@apoiador_rm', 'https://twitter.com/apoiador_rm/status/4', CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000003', 'instagram', 'positive', 'Mais um dia de campanha nas ruas! #RobertoFaz #Floripa2026', '@voluntario_rm', 'https://instagram.com/p/abc3', CURRENT_DATE - interval '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000003', 'twitter', 'positive', 'Adorei a proposta de parques urbanos. #RobertoFaz diferença!', '@mae_floripa', 'https://twitter.com/mae_floripa/status/5', CURRENT_DATE - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000003', 'facebook', 'neutral', 'Alguém pode explicar o que significa essa hashtag #RobertoFaz que está aparecendo em todo lugar?', 'Maria Curiosa', 'https://facebook.com/post/2', CURRENT_DATE - interval '7 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000002', 'news', 'neutral', 'Corrida para prefeito de Florianópolis em 2026 já conta com 6 pré-candidatos confirmados.', 'Diário Catarinense', 'https://dc.clicrbs.com.br/noticia/1', CURRENT_DATE - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000002', 'twitter', 'negative', 'Florianópolis precisa de prefeito que resolva o problema dos alagamentos. Nenhum candidato fala disso.', '@morador_continente', 'https://twitter.com/morador_continente/status/6', CURRENT_DATE - interval '8 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000002', 'blog', 'neutral', 'Quem são os candidatos a prefeito de Florianópolis em 2026? Conheça os perfis.', 'SC Hoje', 'https://schoje.com.br/candidatos-2026', CURRENT_DATE - interval '10 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000004', 'twitter', 'neutral', 'As eleições 2026 em Floripa prometem ser as mais disputadas da história da cidade.', '@analista_politico', 'https://twitter.com/analista_politico/status/7', CURRENT_DATE - interval '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000004', 'news', 'neutral', 'TSE define calendário das eleições 2026. Floripa terá 12 locais de votação novos.', 'G1 SC', 'https://g1.com.br/sc/floripa-eleicoes-2026', CURRENT_DATE - interval '6 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000004', 'facebook', 'positive', 'Esse ano vou votar com consciência. Já estou pesquisando os candidatos para as eleições 2026 em Floripa.', 'João Eleitor', 'https://facebook.com/post/3', CURRENT_DATE - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000005', 'twitter', 'neutral', 'PSD Florianópolis confirma apoio integral à candidatura de Roberto Menezes.', '@psd_floripa', 'https://twitter.com/psd_floripa/status/8', CURRENT_DATE - interval '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000005', 'news', 'neutral', 'PSD Florianópolis realiza convenção e define estratégia para eleições municipais.', 'ND Mais', 'https://ndmais.com.br/psd-floripa', CURRENT_DATE - interval '11 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000006', 'twitter', 'positive', 'Ana Clara Rodrigues trouxe propostas interessantes sobre segurança pública para Floripa.', '@eleitor_informado', 'https://twitter.com/eleitor_informado/status/9', CURRENT_DATE - interval '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000006', 'news', 'neutral', 'Ana Clara Rodrigues intensifica campanha no norte da ilha com foco em infraestrutura.', 'NSC Total', 'https://nsctotal.com.br/noticias/2', CURRENT_DATE - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000006', 'instagram', 'positive', 'A Ana Clara é a candidata que mais representa as mulheres de Florianópolis.', '@mulheres_floripa', 'https://instagram.com/p/abc4', CURRENT_DATE - interval '6 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000006', 'twitter', 'negative', 'Ana Clara Rodrigues não tem experiência administrativa. Floripa não é laboratório.', '@contribuinte_sc', 'https://twitter.com/contribuinte_sc/status/10', CURRENT_DATE - interval '8 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000006', 'facebook', 'neutral', 'Pesquisa mostra Ana Clara Rodrigues em terceiro lugar na disputa pela prefeitura de Florianópolis.', 'Política SC', 'https://facebook.com/post/4', CURRENT_DATE - interval '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000007', 'twitter', 'negative', 'Carlos Eduardo Lima prometeu a mesma coisa nas últimas 3 eleições. Difícil acreditar.', '@floripa_real', 'https://twitter.com/floripa_real/status/11', CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000007', 'news', 'neutral', 'Carlos Eduardo Lima anuncia plano de R$ 500 milhões para transporte público em Florianópolis.', 'Diário Catarinense', 'https://dc.clicrbs.com.br/noticia/2', CURRENT_DATE - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000007', 'twitter', 'neutral', 'Debate entre Carlos Eduardo Lima e outros candidatos será transmitido ao vivo amanhã.', '@tv_floripa', 'https://twitter.com/tv_floripa/status/12', CURRENT_DATE - interval '7 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000007', 'facebook', 'negative', 'As propostas do Carlos Eduardo Lima são cópia do que já existe no plano diretor. Zero originalidade.', 'Urbanista Floripa', 'https://facebook.com/post/5', CURRENT_DATE - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000007', 'instagram', 'neutral', 'Carlos Eduardo Lima visitou o bairro Estreito para ouvir moradores sobre problemas de saneamento.', '@cel_campanha', 'https://instagram.com/p/abc5', CURRENT_DATE - interval '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000008', 'twitter', 'positive', 'Fernanda Bastos é a candidata mais jovem e traz uma visão moderna para Florianópolis.', '@juventude_floripa', 'https://twitter.com/juventude_floripa/status/13', CURRENT_DATE - interval '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000008', 'news', 'neutral', 'Fernanda Bastos apresenta plano de governo focado em tecnologia e inovação para Florianópolis.', 'ND Mais', 'https://ndmais.com.br/fernanda-bastos', CURRENT_DATE - interval '6 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000008', 'instagram', 'positive', 'Amei a proposta da Fernanda Bastos para transformar Floripa em cidade inteligente!', '@tech_floripa', 'https://instagram.com/p/abc6', CURRENT_DATE - interval '4 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000008', 'facebook', 'neutral', 'Fernanda Bastos é a quarta candidata a registrar candidatura para prefeita de Florianópolis.', 'Eleições SC', 'https://facebook.com/post/6', CURRENT_DATE - interval '10 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'news', 'positive', 'Roberto Menezes recebe apoio de associações de bairro do continente em evento no Estreito.', 'ND Mais', 'https://ndmais.com.br/roberto-apoio', CURRENT_DATE - interval '8 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'facebook', 'positive', 'Tive a oportunidade de conversar com Roberto Menezes sobre saúde pública. Ele realmente entende do assunto.', 'Dr. Paulo Andrade', 'https://facebook.com/post/7', CURRENT_DATE - interval '10 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'twitter', 'positive', 'O debate de ontem mostrou que Roberto Menezes é o mais preparado tecnicamente entre os candidatos.', '@professor_ufsc', 'https://twitter.com/professor_ufsc/status/14', CURRENT_DATE - interval '12 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000003', 'twitter', 'positive', 'O povo de Floripa já escolheu! #RobertoFaz acontecer!', '@apoio_popular', 'https://twitter.com/apoio_popular/status/15', CURRENT_DATE - interval '9 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'instagram', 'neutral', 'Roberto Menezes esteve no Mercado Público hoje conversando com comerciantes.', '@mercado_floripa', 'https://instagram.com/p/abc7', CURRENT_DATE - interval '11 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000001', 'news', 'neutral', 'Candidatos a prefeito de Florianópolis debatem propostas para turismo sustentável na ilha.', 'G1 SC', 'https://g1.com.br/sc/debate-turismo', CURRENT_DATE - interval '13 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000002', 'twitter', 'positive', 'Florianópolis merece um prefeito que ame essa cidade. Roberto Menezes é esse cara.', '@amor_floripa', 'https://twitter.com/amor_floripa/status/16', CURRENT_DATE - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa0001-0000-0000-0000-000000000006', 'blog', 'neutral', 'Entrevista exclusiva com Ana Clara Rodrigues sobre suas propostas para educação em Floripa.', 'Blog Ilha da Magia', 'https://ilhadamagia.blog/entrevista-acr', CURRENT_DATE - interval '12 days');

-- emerging_terms
INSERT INTO emerging_terms (workspace_id, term, frequency, growth_rate) VALUES
  ('22222222-2222-2222-2222-222222222222', '#RobertoFaz', 342, 45.20),
  ('22222222-2222-2222-2222-222222222222', '#Floripa2026', 289, 32.10),
  ('22222222-2222-2222-2222-222222222222', 'mobilidade urbana florianópolis', 156, 28.70),
  ('22222222-2222-2222-2222-222222222222', '#MudançaReal', 134, 52.30),
  ('22222222-2222-2222-2222-222222222222', 'debate prefeito', 98, 18.90);

-- share_of_voice (4 candidates x 4 weeks)
INSERT INTO share_of_voice (workspace_id, candidate_name, mentions_count, sentiment_score, period_start, period_end) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Roberto Menezes', 385, 0.72, (CURRENT_DATE - interval '28 days')::date, (CURRENT_DATE - interval '22 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Ana Clara Rodrigues', 240, 0.58, (CURRENT_DATE - interval '28 days')::date, (CURRENT_DATE - interval '22 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Eduardo Lima', 192, 0.45, (CURRENT_DATE - interval '28 days')::date, (CURRENT_DATE - interval '22 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Bastos', 145, 0.65, (CURRENT_DATE - interval '28 days')::date, (CURRENT_DATE - interval '22 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Roberto Menezes', 410, 0.71, (CURRENT_DATE - interval '21 days')::date, (CURRENT_DATE - interval '15 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Ana Clara Rodrigues', 255, 0.56, (CURRENT_DATE - interval '21 days')::date, (CURRENT_DATE - interval '15 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Eduardo Lima', 200, 0.43, (CURRENT_DATE - interval '21 days')::date, (CURRENT_DATE - interval '15 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Bastos', 150, 0.64, (CURRENT_DATE - interval '21 days')::date, (CURRENT_DATE - interval '15 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Roberto Menezes', 445, 0.74, (CURRENT_DATE - interval '14 days')::date, (CURRENT_DATE - interval '8 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Ana Clara Rodrigues', 275, 0.59, (CURRENT_DATE - interval '14 days')::date, (CURRENT_DATE - interval '8 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Eduardo Lima', 215, 0.47, (CURRENT_DATE - interval '14 days')::date, (CURRENT_DATE - interval '8 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Bastos', 160, 0.66, (CURRENT_DATE - interval '14 days')::date, (CURRENT_DATE - interval '8 days')::date),
  ('22222222-2222-2222-2222-222222222222', 'Roberto Menezes', 480, 0.73, (CURRENT_DATE - interval '7 days')::date, (CURRENT_DATE - interval '1 day')::date),
  ('22222222-2222-2222-2222-222222222222', 'Ana Clara Rodrigues', 298, 0.57, (CURRENT_DATE - interval '7 days')::date, (CURRENT_DATE - interval '1 day')::date),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Eduardo Lima', 230, 0.44, (CURRENT_DATE - interval '7 days')::date, (CURRENT_DATE - interval '1 day')::date),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Bastos', 172, 0.67, (CURRENT_DATE - interval '7 days')::date, (CURRENT_DATE - interval '1 day')::date);

-- digital_dominance (4 candidates x 3 platforms)
INSERT INTO digital_dominance (workspace_id, candidate_name, platform, followers, engagement_rate, posts_count, measured_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Roberto Menezes', 'instagram', 45200, 5.8, 320, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Roberto Menezes', 'facebook', 38500, 3.2, 285, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Roberto Menezes', 'twitter', 12800, 4.5, 510, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Ana Clara Rodrigues', 'instagram', 32100, 4.9, 275, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Ana Clara Rodrigues', 'facebook', 28700, 2.8, 240, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Ana Clara Rodrigues', 'twitter', 8900, 3.6, 380, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Eduardo Lima', 'instagram', 28400, 3.1, 195, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Eduardo Lima', 'facebook', 35200, 2.4, 310, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Eduardo Lima', 'twitter', 6500, 2.1, 220, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Bastos', 'instagram', 22800, 6.2, 340, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Bastos', 'facebook', 15400, 3.5, 180, CURRENT_DATE - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'Fernanda Bastos', 'twitter', 9200, 5.1, 420, CURRENT_DATE - interval '1 day');

-- crisis_events
INSERT INTO crisis_events (workspace_id, title, description, severity, status, source, impact_score, started_at, resolved_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Fake news sobre posição em saúde pública', 'Vídeo editado circulando nas redes distorcendo declaração do candidato sobre investimentos em saúde pública. Conteúdo original retirado de contexto de entrevista para a NSC.', 'high', 'contained', 'social_media', 7.5, CURRENT_DATE - interval '18 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Vazamento de áudio editado', 'Áudio editado atribuído ao candidato circulando em grupos de WhatsApp. Perícia contratada confirmou edição. Nota de esclarecimento publicada.', 'critical', 'monitoring', 'whatsapp', 8.2, CURRENT_DATE - interval '10 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Ataque coordenado em redes sociais', 'Identificada rede de perfis falsos publicando conteúdo negativo de forma coordenada. Denúncias realizadas às plataformas. Volume reduziu 80% após ação.', 'medium', 'resolved', 'social_media', 5.0, CURRENT_DATE - interval '25 days', CURRENT_DATE - interval '20 days');

-- crisis_alert_configs
INSERT INTO crisis_alert_configs (workspace_id, trigger_type, trigger_value, is_active) VALUES
  ('22222222-2222-2222-2222-222222222222', 'keyword', 'escândalo,corrupção,fake', true),
  ('22222222-2222-2222-2222-222222222222', 'sentiment_drop', '-20', true),
  ('22222222-2222-2222-2222-222222222222', 'mention_spike', '500', true);

-- election_history (2020 Florianópolis municipal)
INSERT INTO election_history (workspace_id, election_year, election_type, city, state, candidate_name, party, votes_received, vote_percentage, zone, section, is_elected) VALUES
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Topázio Silveira Neto', 'PSD', 112500, 37.5, '39', 'Consolidado', true),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Topázio Silveira Neto', 'PSD', 42800, 38.2, '39', '001-120', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Topázio Silveira Neto', 'PSD', 38200, 37.1, '39', '121-240', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Topázio Silveira Neto', 'PSD', 31500, 36.9, '39', '241-380', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Pedrão da Auto Escola', 'MDB', 84000, 28.0, '39', 'Consolidado', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Pedrão da Auto Escola', 'MDB', 31500, 28.1, '39', '001-120', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Pedrão da Auto Escola', 'MDB', 28900, 28.1, '39', '121-240', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Pedrão da Auto Escola', 'MDB', 23600, 27.6, '39', '241-380', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Prof. Elson Manoel Pereira', 'PSOL', 54000, 18.0, '39', 'Consolidado', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Prof. Elson Manoel Pereira', 'PSOL', 20500, 18.3, '39', '001-120', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Prof. Elson Manoel Pereira', 'PSOL', 18400, 17.9, '39', '121-240', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Prof. Elson Manoel Pereira', 'PSOL', 15100, 17.7, '39', '241-380', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Angela Regina Heinzen Amin', 'PP', 33000, 11.0, '39', 'Consolidado', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Angela Regina Heinzen Amin', 'PP', 12400, 11.1, '39', '001-120', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Angela Regina Heinzen Amin', 'PP', 11300, 11.0, '39', '121-240', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Angela Regina Heinzen Amin', 'PP', 9300, 10.9, '39', '241-380', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Décio Gomes Góes', 'PT', 16500, 5.5, '39', 'Consolidado', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Décio Gomes Góes', 'PT', 5700, 5.1, '39', '001-120', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Décio Gomes Góes', 'PT', 5900, 5.7, '39', '121-240', false),
  ('22222222-2222-2222-2222-222222222222', 2020, 'municipal', 'Florianópolis', 'SC', 'Décio Gomes Góes', 'PT', 4900, 5.7, '39', '241-380', false);
