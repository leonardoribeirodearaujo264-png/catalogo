import type { CatalogItem } from "@/types/catalog";

// Itens de exemplo cobrindo nichos variados e todos os "formatos" que o
// catálogo precisa suportar: produto físico, serviço, item com variação,
// item promocional e item sem estoque.
export const items: CatalogItem[] = [
  {
    id: "item-camisa-polo",
    slug: "camisa-polo-piquet",
    name: "Camisa Polo Piquet",
    kind: "produto",
    categoryId: "cat-moda",
    description:
      "Camisa polo em malha piquet 100% algodão, corte tradicional e caimento confortável. Disponível em vários tamanhos.",
    price: 89.9,
    image: "",
    stock: 42,
    variations: [
      { id: "v1", name: "P", available: true },
      { id: "v2", name: "M", available: true },
      { id: "v3", name: "G", available: true },
      { id: "v4", name: "GG", available: false },
    ],
    active: true,
    featured: true,
    createdAt: "2026-05-02",
  },
  {
    id: "item-marmita-fit",
    slug: "combo-marmita-fit",
    name: "Combo Marmita Fit (5 unidades)",
    kind: "produto",
    categoryId: "cat-alimentacao",
    description:
      "Combo com 5 marmitas fit balanceadas, montadas por nutricionista. Congeladas, prontas para aquecer. Opções de proteína à escolha.",
    price: 99.9,
    priceCompare: 129.9,
    image: "",
    stock: 15,
    variations: [
      { id: "v1", name: "Frango", available: true },
      { id: "v2", name: "Carne", available: true },
      { id: "v3", name: "Vegetariano", available: true },
    ],
    active: true,
    promotional: true,
    featured: true,
    createdAt: "2026-06-10",
  },
  {
    id: "item-serum-facial",
    slug: "serum-facial-vitamina-c",
    name: "Sérum Facial Vitamina C",
    kind: "produto",
    categoryId: "cat-beleza",
    description:
      "Sérum antioxidante com vitamina C estabilizada, ácido hialurônico e niacinamida. Uniformiza o tom da pele e ilumina o rosto.",
    price: 74.9,
    image: "",
    stock: 0,
    variations: [
      { id: "v1", name: "15ml", available: false },
      { id: "v2", name: "30ml", available: false },
    ],
    active: true,
    createdAt: "2026-04-18",
  },
  {
    id: "item-fone-bluetooth",
    slug: "fone-de-ouvido-bluetooth-tws",
    name: "Fone de Ouvido Bluetooth TWS",
    kind: "produto",
    categoryId: "cat-eletronicos",
    description:
      "Fone intra-auricular sem fio, Bluetooth 5.3, cancelamento de ruído ambiente, até 24h de bateria com o case de carregamento.",
    price: 129.9,
    priceCompare: 189.9,
    image: "",
    stock: 27,
    active: true,
    promotional: true,
    createdAt: "2026-05-22",
  },
  {
    id: "item-consultoria-marketing",
    slug: "consultoria-de-marketing-digital",
    name: "Consultoria de Marketing Digital",
    kind: "servico",
    categoryId: "cat-servicos",
    description:
      "Diagnóstico completo das redes sociais e anúncios do seu negócio, com plano de ação personalizado para os próximos 90 dias.",
    price: 350,
    image: "",
    stock: null,
    variations: [
      { id: "v1", name: "Diagnóstico avulso", available: true },
      { id: "v2", name: "Acompanhamento mensal", available: true, price: 890 },
    ],
    active: true,
    featured: true,
    createdAt: "2026-03-30",
  },
  {
    id: "item-kit-canetas",
    slug: "kit-canetas-coloridas",
    name: "Kit Canetas Coloridas (12 cores)",
    kind: "produto",
    categoryId: "cat-papelaria",
    description:
      "Kit com 12 canetas coloridas ponta fina, ideal para estudos, planner e cadernos de anotação.",
    price: 34.9,
    image: "",
    stock: 60,
    active: true,
    createdAt: "2026-02-14",
  },
  {
    id: "item-corte-masculino",
    slug: "corte-de-cabelo-masculino",
    name: "Corte de Cabelo Masculino",
    kind: "servico",
    categoryId: "cat-salao",
    description:
      "Corte na tesoura e máquina, com acabamento na navalha. Ambiente climatizado e agendamento por WhatsApp.",
    price: 45,
    image: "",
    stock: null,
    variations: [
      { id: "v1", name: "Corte simples", available: true },
      { id: "v2", name: "Corte + barba", available: true, price: 70 },
      { id: "v3", name: "Corte + barba + sobrancelha", available: true, price: 90 },
    ],
    active: true,
    createdAt: "2026-06-01",
  },
  {
    id: "item-limpeza-pele",
    slug: "limpeza-de-pele-profunda",
    name: "Limpeza de Pele Profunda",
    kind: "servico",
    categoryId: "cat-clinica",
    description:
      "Procedimento estético com higienização, esfoliação, extração e máscara calmante. Indicado a cada 30-45 dias.",
    price: 180,
    image: "",
    stock: null,
    active: true,
    featured: true,
    createdAt: "2026-05-15",
  },
  {
    id: "item-cesta-basica",
    slug: "cesta-basica-premium",
    name: "Cesta Básica Premium",
    kind: "produto",
    categoryId: "cat-conveniencia",
    description:
      "Cesta com 25 itens essenciais selecionados, incluindo arroz, feijão, óleo, café e produtos de limpeza.",
    price: 149.9,
    image: "",
    stock: 8,
    active: true,
    createdAt: "2026-01-20",
  },
  {
    id: "item-design-logotipo",
    slug: "design-de-logotipo",
    name: "Design de Logotipo",
    kind: "servico",
    categoryId: "cat-autonomos",
    description:
      "Criação de identidade visual com 3 propostas de logotipo, arquivos em alta resolução e manual de uso das cores.",
    price: 250,
    image: "",
    stock: null,
    variations: [
      { id: "v1", name: "Pacote básico (1 proposta)", available: true },
      { id: "v2", name: "Pacote completo (3 propostas + manual)", available: true, price: 450 },
    ],
    active: true,
    createdAt: "2026-04-05",
  },
  {
    id: "item-tenis-runner",
    slug: "tenis-esportivo-runner",
    name: "Tênis Esportivo Runner",
    kind: "produto",
    categoryId: "cat-moda",
    description:
      "Tênis leve para corrida e caminhada, solado em EVA com amortecimento e cabedal respirável.",
    price: 199.9,
    image: "",
    stock: 0,
    variations: [
      { id: "v1", name: "38", available: false },
      { id: "v2", name: "40", available: false },
      { id: "v3", name: "42", available: false },
    ],
    active: true,
    createdAt: "2026-03-11",
  },
  {
    id: "item-smartwatch",
    slug: "smartwatch-fit-pro",
    name: "Smartwatch Fit Pro",
    kind: "produto",
    categoryId: "cat-eletronicos",
    description:
      "Monitor de atividades com medição de batimentos, oxigenação, notificações do celular e resistência à água.",
    price: 249.9,
    image: "",
    stock: 19,
    active: true,
    featured: true,
    createdAt: "2026-06-20",
  },
];

export function getItemBySlug(slug: string): CatalogItem | undefined {
  return items.find((i) => i.slug === slug);
}

export function getItemById(id: string): CatalogItem | undefined {
  return items.find((i) => i.id === id);
}
