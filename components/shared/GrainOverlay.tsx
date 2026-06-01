export default function GrainOverlay() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='300' height='300' filter='url(%23noise)' opacity='1'/></svg>`;
  const dataUri = `data:image/svg+xml,${svg}`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999,
        backgroundImage: `url("${dataUri}")`,
        backgroundRepeat: "repeat",
        opacity: 0.03,
      }}
    />
  );
}
