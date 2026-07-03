import type { Category } from "@/types/catalog";

// Categorias de exemplo cobrindo nichos bem diferentes, para deixar claro
// que o catálogo não é preso a um único tipo de negócio.
export const categories: Category[] = [
  { id: "cat-moda", slug: "moda-vestuario", name: "Moda & Vestuário", icon: "👕", order: 1, description: "Roupas, calçados e acessórios." },
  { id: "cat-alimentacao", slug: "alimentacao-delivery", name: "Alimentação & Delivery", icon: "🍔", order: 2, description: "Pratos, marmitas e delivery." },
  { id: "cat-beleza", slug: "beleza-cosmeticos", name: "Beleza & Cosméticos", icon: "💄", order: 3, description: "Skincare, maquiagem e perfumaria." },
  { id: "cat-eletronicos", slug: "eletronicos-tecnologia", name: "Eletrônicos & Tecnologia", icon: "🎧", order: 4, description: "Acessórios, gadgets e eletrônicos." },
  { id: "cat-servicos", slug: "servicos-profissionais", name: "Serviços Profissionais", icon: "💼", order: 5, description: "Consultorias, projetos e serviços sob demanda." },
  { id: "cat-papelaria", slug: "papelaria-escritorio", name: "Papelaria & Escritório", icon: "🖊️", order: 6, description: "Materiais para escritório e escola." },
  { id: "cat-conveniencia", slug: "conveniencia-mercado", name: "Conveniência & Mercado", icon: "🛒", order: 7, description: "Itens do dia a dia e mercearia." },
  { id: "cat-salao", slug: "salao-estetica", name: "Salão & Estética", icon: "💇", order: 8, description: "Cortes, tratamentos e procedimentos estéticos." },
  { id: "cat-clinica", slug: "saude-clinicas", name: "Saúde & Clínicas", icon: "🩺", order: 9, description: "Consultas, exames e procedimentos." },
  { id: "cat-autonomos", slug: "autonomos-freelancers", name: "Autônomos & Freelancers", icon: "🧑‍💻", order: 10, description: "Trabalho sob demanda de profissionais independentes." },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
