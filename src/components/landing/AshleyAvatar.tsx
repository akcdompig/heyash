export function AshleyAvatar({ size = 96 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(150deg, var(--color-accent), var(--color-primary))",
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center font-display text-primary-foreground"
        style={{ fontSize: size * 0.4 }}
      >
        A
      </span>
    </div>
  );
}
