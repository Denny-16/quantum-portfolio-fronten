export default function Skeleton({ className = "h-6 w-full" }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 ${className}`} />;
}
