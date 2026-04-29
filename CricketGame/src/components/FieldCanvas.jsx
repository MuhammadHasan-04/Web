import { useEffect, useRef } from "react";

export default function FieldCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    skyGrad.addColorStop(0, "#1a6699");
    skyGrad.addColorStop(1, "#87ceeb");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.45);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    [
      [80, 30, 40, 18],
      [200, 20, 55, 22],
      [380, 35, 45, 18],
      [580, 25, 60, 20],
      [750, 32, 40, 16],
    ].forEach(([x, y, rw, rh]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - 20, y + 5, rw * 0.7, rh * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 22, y + 4, rw * 0.65, rh * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const standGrad = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.45);
    standGrad.addColorStop(0, "#5a1a1a");
    standGrad.addColorStop(1, "#8b2e2e");
    ctx.fillStyle = standGrad;
    ctx.fillRect(0, H * 0.3, W, H * 0.15);

    for (let ci = 0; ci < 120; ci++) {
      const cx2 = 10 + Math.random() * (W - 20);
      const cy2 = H * 0.3 + Math.random() * (H * 0.13);
      const colors = ["#ff6666", "#ffcc66", "#66ccff", "#ffffff", "#ff9966"];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(cx2, cy2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const fieldGrad = ctx.createLinearGradient(0, H * 0.44, 0, H);
    fieldGrad.addColorStop(0, "#2d8a1e");
    fieldGrad.addColorStop(0.5, "#3aab26");
    fieldGrad.addColorStop(1, "#1a5c10");
    ctx.fillStyle = fieldGrad;
    ctx.fillRect(0, H * 0.44, W, H * 0.56);

    const pitchGrad = ctx.createLinearGradient(0, H * 0.55, 0, H);
    pitchGrad.addColorStop(0, "#d4b87a");
    pitchGrad.addColorStop(1, "#c8a06a");
    ctx.fillStyle = pitchGrad;
    ctx.fillRect(W * 0.15, H * 0.6, W * 0.65, H * 0.4);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.6, H * 0.62);
    ctx.lineTo(W * 0.78, H * 0.62);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.17, H * 0.72);
    ctx.lineTo(W * 0.35, H * 0.72);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.7, W * 0.46, H * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  return (
    <canvas ref={canvasRef} className="field-canvas" width={880} height={320} />
  );
}
