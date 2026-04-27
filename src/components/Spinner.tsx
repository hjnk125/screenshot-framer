type SpinnerProps = {
  size?: number;
};

export function Spinner({ size = 16 }: SpinnerProps) {
  return (
    <div
      data-testid="spinner"
      style={{ width: size, height: size }}
      className="animate-spin rounded-full border-2 border-ink/30 border-t-ink"
    />
  );
}
