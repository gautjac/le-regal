import { ACCENT_CLASS, DOMAIN_MAP, type DomainId } from "../domains";

interface Props {
  domain: DomainId;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 w-8 text-base",
  md: "h-12 w-12 text-2xl",
  lg: "h-16 w-16 text-3xl",
};

/** A small medallion bearing the domain's emblem in its jewel tone. */
export default function DomainEmblem({ domain, size = "md", className = "" }: Props) {
  const d = DOMAIN_MAP[domain];
  const accent = ACCENT_CLASS[domain];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border ${SIZE[size]} ${className}`}
      style={{
        borderColor: accent.hex + "88",
        background: `radial-gradient(circle at 38% 30%, ${accent.hex}33, transparent 70%)`,
        color: accent.hex,
        boxShadow: `inset 0 1px 0 rgba(231,200,115,0.18)`,
      }}
      aria-hidden="true"
    >
      <span style={{ filter: "saturate(1.1)" }}>{d.emblem}</span>
    </span>
  );
}
