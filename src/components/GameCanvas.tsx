import { useRef, useEffect, useCallback } from 'react';
import type { GameState } from '../types/game';
import { ITEMS_BY_ID } from '../data/items';
import { LANES, CATCH_ZONE_HEIGHT } from '../game/gameEngine';

interface Props {
  state: GameState;
  canvasWidth: number;
  canvasHeight: number;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function GameCanvas({ state, canvasWidth, canvasHeight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const laneW = canvasWidth / LANES;
    const catchY = canvasHeight - CATCH_ZONE_HEIGHT;
    const playerW = laneW * 0.8;
    const playerH = 56;

    // ── Background ───────────────────────────────────────────────────
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Grid pattern
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < canvasWidth; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvasHeight); ctx.stroke();
    }
    for (let gy = 0; gy < canvasHeight; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvasWidth, gy); ctx.stroke();
    }

    // ── Lane dividers ────────────────────────────────────────────────
    for (let i = 1; i < LANES; i++) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(i * laneW, 0);
      ctx.lineTo(i * laneW, catchY - 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Catch zone ───────────────────────────────────────────────────
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, catchY, canvasWidth, CATCH_ZONE_HEIGHT);

    // Catch zone border
    const grad = ctx.createLinearGradient(0, catchY, 0, catchY + 4);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, catchY, canvasWidth, 4);

    // ── Lane highlights (active lane) ────────────────────────────────
    const pl = state.playerLane;
    ctx.fillStyle = 'rgba(59,130,246,0.08)';
    ctx.fillRect(pl * laneW + 2, 0, laneW - 4, canvasHeight);

    // Lane number indicators
    for (let i = 0; i < LANES; i++) {
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = i === pl ? '#3b82f6' : '#1e293b';
      ctx.fillText(String(i + 1), i * laneW + laneW / 2, 18);
    }

    // ── Catch flash ──────────────────────────────────────────────────
    if (state.catchFlash && state.catchFlash.timer > 0) {
      const { lane, type, timer } = state.catchFlash;
      const alpha = Math.min(timer / 0.3, 1) * 0.45;
      ctx.fillStyle = type === 'good'
        ? `rgba(74,222,128,${alpha})`
        : `rgba(248,113,113,${alpha})`;
      ctx.fillRect(lane * laneW + 2, catchY, laneW - 4, CATCH_ZONE_HEIGHT);
    }

    // ── Falling items ────────────────────────────────────────────────
    const itemW = laneW * 0.78;
    const itemH = 52;
    const itemR = 10;

    for (const item of state.items) {
      const def = ITEMS_BY_ID[item.defId];
      const cx = item.lane * laneW + laneW / 2;
      const cy = item.y;
      const ix = cx - itemW / 2;
      const iy = cy - itemH / 2;

      // Flicker: skip draw on some frames
      if (item.flicker && Math.floor(Date.now() / 120) % 4 === 0) continue;

      // Determine visual appearance (disguise)
      let displayColor = def.color;
      let displayEmoji = def.emoji;
      let displayLabel = def.label;

      if (item.disguised) {
        if (def.category === 'bad') {
          // looks like a normal box
          displayColor = '#f59e0b';
          displayEmoji = '📦';
          displayLabel = 'Коробка';
        } else if (def.category === 'troll') {
          // looks like VIP
          displayColor = '#eab308';
          displayEmoji = '⭐';
          displayLabel = 'VIP заказ';
        }
      }

      // Shadow / glow
      ctx.shadowColor = item.disguised ? '#fbbf24' : def.glowColor;
      ctx.shadowBlur = 12;

      // Card background
      drawRoundedRect(ctx, ix, iy, itemW, itemH, itemR);
      ctx.fillStyle = displayColor;
      ctx.globalAlpha = item.flicker ? 0.7 : 1;
      ctx.fill();

      // Card border
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Emoji
      ctx.font = `${itemH * 0.48}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayEmoji, cx, iy + itemH * 0.42);

      // Label
      ctx.font = `bold ${Math.max(9, itemW * 0.14)}px system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(displayLabel, cx, iy + itemH * 0.82);
    }

    // ── Player (warehouse worker) ────────────────────────────────────
    const px = pl * laneW + laneW / 2;
    const py = catchY + CATCH_ZONE_HEIGHT / 2 - 4;
    const bx = px - playerW / 2;
    const by = py - playerH / 2 + 8;

    // Box the player is holding
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 16;
    drawRoundedRect(ctx, bx, by + playerH * 0.3, playerW, playerH * 0.55, 6);
    ctx.fillStyle = '#1e40af';
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Box lid
    drawRoundedRect(ctx, bx - 2, by + playerH * 0.28, playerW + 4, playerH * 0.14, 4);
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    // Worker emoji
    ctx.font = `${playerH * 0.55}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧑‍🏭', px, by + playerH * 0.12);

    // ── Combo popup ──────────────────────────────────────────────────
    if (state.comboPopup && state.comboPopup.timer > 0) {
      const { value, timer } = state.comboPopup;
      const alpha = Math.min(timer / 0.4, 1);
      const scale = 1 + (1 - timer / 0.8) * 0.3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(px, catchY - 20);
      ctx.scale(scale, scale);
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`🔥 x${value} COMBO!`, 0, 0);
      ctx.restore();
    }

    // ── Chaos overlay at high chaos ──────────────────────────────────
    if (state.chaos >= 70) {
      const alpha = ((state.chaos - 70) / 30) * 0.2;
      ctx.fillStyle = `rgba(239,68,68,${alpha})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Vignette
      const vg = ctx.createRadialGradient(
        canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.2,
        canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.7
      );
      vg.addColorStop(0, 'transparent');
      vg.addColorStop(1, `rgba(239,68,68,${alpha * 1.5})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

  }, [state, canvasWidth, canvasHeight]);

  useEffect(() => {
    draw();
  });

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ display: 'block', touchAction: 'none' }}
    />
  );
}
