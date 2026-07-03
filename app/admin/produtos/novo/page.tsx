import { ItemForm } from "@/components/admin/item-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Novo produto ou serviço</h1>
      <p className="mt-1 text-sm text-gray-500">Preencha os dados abaixo para cadastrar um novo item no catálogo.</p>
      <div className="mt-6">
        <ItemForm />
      </div>
    </div>
  );
}
