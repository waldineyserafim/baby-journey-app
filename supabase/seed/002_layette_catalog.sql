-- ============================================================
-- Baby Journey — Catálogo do Enxoval
-- ~80 itens organizados por categoria
-- ============================================================

INSERT INTO public.layette_catalog
  (category, item_name, description, ideal_quantity, criticality, usage_period,
   price_brl_min, price_brl_max, price_usd_min, price_usd_max, base_recommendation, sort_order)
VALUES
-- ============================================================
-- QUARTO
-- ============================================================
('quarto', 'Berço', 'Berço com grades reguláveis e proteção lateral', 1, 'CRITICO', 'NO_NASCIMENTO', 800, 2500, 150, 500, 'COMPRAR_AGORA_BRASIL', 10),
('quarto', 'Colchão para Berço', 'Colchão firme e impermeável para berço', 1, 'CRITICO', 'NO_NASCIMENTO', 200, 600, 40, 120, 'COMPRAR_AGORA_BRASIL', 11),
('quarto', 'Kit Berço (jogo)', 'Protetor, lençol, fronha e travesseiro', 2, 'IMPORTANTE', 'NO_NASCIMENTO', 150, 400, 30, 80, 'COMPRAR_AGORA_BRASIL', 12),
('quarto', 'Cômoda com Trocador', 'Cômoda com trocador integrado e gavetas', 1, 'CRITICO', 'NO_NASCIMENTO', 600, 1800, 120, 350, 'COMPRAR_AGORA_BRASIL', 13),
('quarto', 'Poltrona de Amamentação', 'Poltrona reclinável com apoio lateral', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 500, 2000, 100, 400, 'COMPRAR_AGORA_BRASIL', 14),
('quarto', 'Babá Eletrônica', 'Monitor com vídeo e sensor de temperatura', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 300, 1000, 40, 180, 'AGUARDAR_EUA', 15),
('quarto', 'Móbile Musical', 'Móbile com luzes e músicas para berço', 1, 'OPCIONAL', 'NO_NASCIMENTO', 80, 300, 15, 60, 'AGUARDAR_EUA', 16),
('quarto', 'Tapete de Atividades', 'Tapete com arco de atividades e espelho', 1, 'IMPORTANTE', 'ATE_3_MESES', 150, 500, 25, 80, 'AGUARDAR_EUA', 17),
('quarto', 'Projetor Estrelado', 'Projetor de estrelas para quarto do bebê', 1, 'OPCIONAL', 'NO_NASCIMENTO', 80, 250, 15, 40, 'AGUARDAR_EUA', 18),
('quarto', 'Umidificador de Ar', 'Umidificador para manter a umidade ideal', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 150, 400, 30, 80, 'AGUARDAR_EUA', 19),
('quarto', 'Luminária Infantil', 'Luminária com luz difusa e suave', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 80, 300, 20, 50, 'COMPRAR_AGORA_BRASIL', 20),
('quarto', 'Cesto de Roupas Sujas', 'Cesto para roupa suja do bebê', 1, 'OPCIONAL', 'NO_NASCIMENTO', 50, 150, 10, 30, 'COMPRAR_AGORA_BRASIL', 21),

-- ============================================================
-- HIGIENE
-- ============================================================
('higiene', 'Banheira do Bebê', 'Banheira ergonômica com suporte antiderrapante', 1, 'CRITICO', 'NO_NASCIMENTO', 80, 250, 15, 50, 'COMPRAR_AGORA_BRASIL', 30),
('higiene', 'Termômetro Digital', 'Termômetro clínico digital', 2, 'CRITICO', 'NO_NASCIMENTO', 30, 100, 8, 20, 'COMPRAR_AGORA_BRASIL', 31),
('higiene', 'Termômetro de Testa', 'Termômetro infravermelho de testa/ouvido', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 80, 300, 15, 60, 'AGUARDAR_EUA', 32),
('higiene', 'Kit Higiene Completo', 'Escova, pente, cortador de unhas, tesoura', 1, 'CRITICO', 'NO_NASCIMENTO', 40, 150, 10, 25, 'COMPRAR_AGORA_BRASIL', 33),
('higiene', 'Aspirador Nasal', 'Aspirador nasal para bebê', 1, 'CRITICO', 'NO_NASCIMENTO', 30, 80, 8, 15, 'COMPRAR_AGORA_BRASIL', 34),
('higiene', 'Toalhas de Banho (3 unid)', 'Toalhas com capuz para bebê', 3, 'CRITICO', 'NO_NASCIMENTO', 40, 150, 10, 30, 'COMPRAR_AGORA_BRASIL', 35),
('higiene', 'Fraldas Descartáveis RN', 'Fraldas tamanho RN (0-4kg)', 4, 'CRITICO', 'NO_NASCIMENTO', 25, 70, 8, 20, 'COMPRAR_AGORA_BRASIL', 36),
('higiene', 'Lenços Umedecidos', 'Lenços sem perfume e hipoalergênicos', 10, 'CRITICO', 'NO_NASCIMENTO', 8, 20, 2, 5, 'COMPRAR_AGORA_BRASIL', 37),
('higiene', 'Pomada para Assaduras', 'Pomada protetora para região da fralda', 3, 'CRITICO', 'NO_NASCIMENTO', 15, 40, 4, 10, 'COMPRAR_AGORA_BRASIL', 38),
('higiene', 'Shampoo Infantil', 'Shampoo sem lágrimas e sem perfume', 2, 'CRITICO', 'NO_NASCIMENTO', 15, 40, 5, 12, 'COMPRAR_AGORA_BRASIL', 39),
('higiene', 'Sabonete Líquido Infantil', 'Sabonete pH neutro para bebê', 2, 'CRITICO', 'NO_NASCIMENTO', 12, 35, 4, 10, 'COMPRAR_AGORA_BRASIL', 40),
('higiene', 'Óleo Corporal Infantil', 'Óleo para massagem e hidratação', 2, 'IMPORTANTE', 'NO_NASCIMENTO', 15, 40, 5, 12, 'COMPRAR_AGORA_BRASIL', 41),
('higiene', 'Talco Infantil', 'Talco ou amido de milho', 2, 'OPCIONAL', 'NO_NASCIMENTO', 8, 20, 3, 8, 'COMPRAR_AGORA_BRASIL', 42),
('higiene', 'Algodão em Bolas', 'Algodão hidrófilo para higiene', 2, 'CRITICO', 'NO_NASCIMENTO', 5, 15, 2, 5, 'COMPRAR_AGORA_BRASIL', 43),
('higiene', 'Bolsa Trocador Portátil', 'Trocador portátil para viagens', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 60, 200, 15, 40, 'AGUARDAR_EUA', 44),

-- ============================================================
-- ALIMENTAÇÃO
-- ============================================================
('alimentacao', 'Bomba de Leite Elétrica', 'Bomba elétrica de dupla extração', 1, 'CRITICO', 'NO_NASCIMENTO', 300, 1500, 50, 250, 'AGUARDAR_EUA', 50),
('alimentacao', 'Bomba de Leite Manual', 'Bomba manual de extração', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 80, 250, 15, 40, 'AGUARDAR_EUA', 51),
('alimentacao', 'Mamadeiras (kit 3)', 'Mamadeiras anticoólica com bico ortodôntico', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 80, 250, 15, 50, 'AGUARDAR_EUA', 52),
('alimentacao', 'Esterilizador Elétrico', 'Esterilizador a vapor para mamadeiras', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 150, 500, 30, 80, 'AGUARDAR_EUA', 53),
('alimentacao', 'Conchas Protetoras', 'Conchas para proteção dos seios', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 40, 120, 10, 25, 'COMPRAR_AGORA_BRASIL', 54),
('alimentacao', 'Absorventes para Seio', 'Absorventes descartáveis/laváveis', 2, 'CRITICO', 'NO_NASCIMENTO', 20, 60, 5, 15, 'COMPRAR_AGORA_BRASIL', 55),
('alimentacao', 'Protetor de Mamilo', 'Protetor de silicone para amamentação', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 30, 80, 8, 15, 'COMPRAR_AGORA_BRASIL', 56),
('alimentacao', 'Travesseiro de Amamentação', 'Travesseiro em C para apoio na amamentação', 1, 'CRITICO', 'NO_NASCIMENTO', 80, 300, 20, 60, 'COMPRAR_AGORA_BRASIL', 57),
('alimentacao', 'Cadeirão de Alimentação', 'Cadeira de refeição com bandeja regulável', 1, 'CRITICO', 'ATE_6_MESES', 250, 800, 50, 200, 'AGUARDAR_EUA', 58),
('alimentacao', 'Copo com Bico', 'Copo de transição com bico', 2, 'IMPORTANTE', 'ATE_6_MESES', 25, 80, 5, 15, 'AGUARDAR_EUA', 59),
('alimentacao', 'Babadores (kit)', 'Babadores impermeáveis e de tecido', 5, 'CRITICO', 'NO_NASCIMENTO', 30, 100, 8, 20, 'COMPRAR_AGORA_BRASIL', 60),
('alimentacao', 'Escovas de Limpeza', 'Escovas para lavar mamadeiras', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 20, 60, 5, 12, 'COMPRAR_AGORA_BRASIL', 61),
('alimentacao', 'Freezer Bags de Leite', 'Sacos para congelar leite materno (50 unid)', 2, 'IMPORTANTE', 'NO_NASCIMENTO', 30, 80, 8, 15, 'AGUARDAR_EUA', 62),
('alimentacao', 'Processador de Alimentos Baby', 'Processador pequeno para papinhas', 1, 'IMPORTANTE', 'ATE_6_MESES', 150, 500, 30, 80, 'AGUARDAR_EUA', 63),

-- ============================================================
-- PASSEIO
-- ============================================================
('passeio', 'Carrinho de Bebê', 'Carrinho com reclinação total para recém-nascido', 1, 'CRITICO', 'NO_NASCIMENTO', 600, 3000, 100, 600, 'COMPRAR_AGORA_BRASIL', 70),
('passeio', 'Bebê Conforto', 'Cadeirinha para carro grupo 0+ (até 13kg)', 1, 'CRITICO', 'NO_NASCIMENTO', 400, 1500, 80, 350, 'COMPRAR_AGORA_BRASIL', 71),
('passeio', 'Cadeirinha para Carro', 'Cadeirinha grupo 1 (9-18kg)', 1, 'CRITICO', 'ATE_6_MESES', 400, 2000, 80, 400, 'AGUARDAR_EUA', 72),
('passeio', 'Mochila Canguru', 'Canguru ergonômico com suporte lombar', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 150, 600, 30, 150, 'AGUARDAR_EUA', 73),
('passeio', 'Bolsa Maternidade', 'Bolsa grande com múltiplos compartimentos', 1, 'CRITICO', 'NO_NASCIMENTO', 100, 400, 25, 80, 'COMPRAR_AGORA_BRASIL', 74),
('passeio', 'Capa para Chuva Carrinho', 'Capa impermeável para o carrinho', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 40, 120, 10, 25, 'COMPRAR_AGORA_BRASIL', 75),
('passeio', 'Redutor para Carrinho', 'Redutor para recém-nascido no carrinho', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 80, 250, 15, 50, 'COMPRAR_AGORA_BRASIL', 76),

-- ============================================================
-- ROUPAS
-- ============================================================
('roupas', 'Body Manga Curta (kit 5 unid) RN', 'Bodies para recém-nascido', 1, 'CRITICO', 'NO_NASCIMENTO', 40, 120, 10, 30, 'COMPRAR_AGORA_BRASIL', 80),
('roupas', 'Body Manga Longa (kit 3 unid) RN', 'Bodies manga longa para recém-nascido', 1, 'CRITICO', 'NO_NASCIMENTO', 40, 120, 10, 30, 'COMPRAR_AGORA_BRASIL', 81),
('roupas', 'Macacão (kit 3 unid) RN', 'Macacões para recém-nascido', 1, 'CRITICO', 'NO_NASCIMENTO', 50, 150, 12, 35, 'COMPRAR_AGORA_BRASIL', 82),
('roupas', 'Calça (kit 3 unid) RN', 'Calças confortáveis para bebê', 1, 'CRITICO', 'NO_NASCIMENTO', 30, 90, 8, 20, 'COMPRAR_AGORA_BRASIL', 83),
('roupas', 'Meias (kit 6 pares) RN', 'Meias antiderrapante para bebê', 2, 'CRITICO', 'NO_NASCIMENTO', 20, 60, 5, 15, 'COMPRAR_AGORA_BRASIL', 84),
('roupas', 'Mantas (2 unid)', 'Manta de algodão ou malha para enrolar', 2, 'CRITICO', 'NO_NASCIMENTO', 40, 150, 10, 30, 'COMPRAR_AGORA_BRASIL', 85),
('roupas', 'Luvas de Recém-Nascido', 'Luvinhas para evitar arranhões', 3, 'IMPORTANTE', 'NO_NASCIMENTO', 10, 30, 3, 8, 'COMPRAR_AGORA_BRASIL', 86),
('roupas', 'Touca de Recém-Nascido', 'Touca para manter a temperatura', 3, 'IMPORTANTE', 'NO_NASCIMENTO', 10, 30, 3, 8, 'COMPRAR_AGORA_BRASIL', 87),
('roupas', 'Sapatinhos (2 pares) RN', 'Sapatinhos macios para bebê', 2, 'OPCIONAL', 'NO_NASCIMENTO', 20, 60, 5, 15, 'COMPRAR_AGORA_BRASIL', 88),
('roupas', 'Macacão de Inverno', 'Macacão quente para dias frios', 2, 'IMPORTANTE', 'NO_NASCIMENTO', 60, 200, 15, 40, 'AGUARDAR_EUA', 89),
('roupas', 'Body Tamanho 3-6 meses (kit)', 'Roupas para fase seguinte', 1, 'IMPORTANTE', 'ATE_3_MESES', 40, 120, 10, 30, 'AGUARDAR_EUA', 90),
('roupas', 'Casaco Leve', 'Casaco para proteger do vento', 1, 'IMPORTANTE', 'NO_NASCIMENTO', 40, 150, 10, 30, 'AGUARDAR_EUA', 91),
('roupas', 'Collant/Meia-calça', 'Collant de malha para bebê', 3, 'OPCIONAL', 'NO_NASCIMENTO', 15, 40, 4, 10, 'COMPRAR_AGORA_BRASIL', 92);
