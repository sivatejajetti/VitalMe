const SkeletonCard = () => (
  <div className="glass-card p-5 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-4 w-16 bg-muted rounded" />
      <div className="h-5 w-5 bg-muted rounded" />
    </div>
    <div className="h-8 w-24 bg-muted rounded mb-3" />
    <div className="h-2 w-full bg-muted rounded" />
  </div>
);

export default SkeletonCard;
