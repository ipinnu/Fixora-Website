import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  size?: number;
  href?: string | null;
  className?: string;
};

/**
 * FIXORA lockup on a warm cream plate.
 * The asset's dark "FIX" / brown mark disappear on pure black —
 * cream restores contrast without the flat white sticker look.
 */
export default function BrandLogo({ size = 96, href = "/", className = "" }: BrandLogoProps) {
  const pad = Math.max(8, Math.round(size * 0.1));
  const radius = Math.max(12, Math.round(size * 0.18));

  const mark = (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        padding: pad,
        borderRadius: radius,
        background: "linear-gradient(160deg, #F7F2E6 0%, #EDE6D4 55%, #E4DCC8 100%)",
        border: "1px solid rgba(200,134,26,0.28)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.55) inset, 0 10px 28px rgba(0,0,0,0.22)",
      }}
    >
      <Image
        src="/Logo no bcakground.png"
        alt="FIXORA"
        width={size}
        height={size}
        className="object-contain"
        style={{ borderRadius: Math.max(6, Math.round(radius * 0.45)) }}
        priority={size >= 80}
      />
    </div>
  );

  if (href === null) return mark;
  return (
    <Link href={href} className="inline-flex" aria-label="FIXORA home">
      {mark}
    </Link>
  );
}
