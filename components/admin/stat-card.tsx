export function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">{icon}</span>
        <div>
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
          <p className="text-xs font-semibold text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
