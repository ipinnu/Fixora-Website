interface SectionLabelProps {
  text: string;
}

export default function SectionLabel({ text }: SectionLabelProps) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-4 py-1.5 font-sans text-[11px] font-semibold tracking-[0.12em] uppercase"
      style={{
        borderColor: "var(--color-border-light)",
        color: "var(--color-ochre)",
      }}
    >
      {text}
    </span>
  );
}
