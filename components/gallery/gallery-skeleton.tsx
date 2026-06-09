export function GallerySkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="aspect-square rounded-xl shimmer-surface"
        />
      ))}
    </div>
  );
}
