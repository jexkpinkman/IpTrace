export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-[3px]",
  }[size];

  return (
    <div
      className={`${sizeClass} rounded-full border-sky-400/20 border-t-sky-400 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
