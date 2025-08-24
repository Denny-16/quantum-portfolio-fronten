export default function EmptyState({ title="Nothing to show", subtitle="Adjust inputs and try again.", action=null }) {
  return (
    <div className="border border-dashed rounded-2xl p-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="font-medium text-gray-800 dark:text-gray-100">{title}</div>
      <div className="mt-1">{subtitle}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
