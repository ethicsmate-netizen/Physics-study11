import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { KinematicGraphs } from '../../components/common/KinematicGraphs';
import { KinematicsTheory } from './KinematicsTheory';
import { ZoomIn, ZoomOut, Maximize2, Activity, BookOpen, Layers, Target, Compass } from 'lucide-react';

interface Kinematics2DLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const Kinematics2DLab: React.FC<Kinematics2DLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  // Navigation View: 'simulation' | 'theory'
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Submode: Ground-to-ground, Incline, or River-Boat
  const [subMode, setSubMode] = useState<'ground' | 'incline' | 'river'>('ground');

  // Ground Projectile Parameters
  const [velocity, setVelocity] = useState<number>(25); // m/s
  const [angleDeg, setAngleDeg] = useState<number>(45); // degrees
  const [gravity, setGravity] = useState<number>(9.8); // m/s^2
  const [inclineAngleDeg, setInclineAngleDeg] = useState<number>(30); // for incline mode
  const [showComponents, setShowComponents] = useState<boolean>(true);
  const [showComplementary, setShowComplementary] = useState<boolean>(false);
  const [showTrajectoryGrid, setShowTrajectoryGrid] = useState<boolean>(true);
  const [showLiveGraphs, setShowLiveGraphs] = useState<boolean>(true);

  // River-boat parameters
  const [riverSpeed, setRiverSpeed] = useState<number>(4); // m/s
  const [boatSpeed, setBoatSpeed] = useState<number>(5); // m/s
  const [boatAngleDeg, setBoatAngleDeg] = useState<number>(90); // degrees w.r.t bank

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timeScale, setTimeScale] = useState<number>(1.0);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordSysRef = useRef<CoordinateSystem>(new CoordinateSystem({ pixelsPerMeter: 12, originX: 50, originY: 420 }));
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Current physics particle state
  const posRef = useRef<Vector2D>(new Vector2D(0, 0));
  const velRef = useRef<Vector2D>(new Vector2D(0, 0));
  const trailRef = useRef<Vector2D[]>([]);

  // Calculate standard Allen JEE Projectile Analytical values
  const rad = (angleDeg * Math.PI) / 180;
  const u = velocity;
  const g = gravity;
  const ux = u * Math.cos(rad);
  const uy = u * Math.sin(rad);

  const timeOfFlight = (2 * uy) / g;
  const maxHeight = (uy * uy) / (2 * g);
  const maxRange = (u * u * Math.sin(2 * rad)) / g;

  // Incline analytical values (up incline)
  const betaRad = (inclineAngleDeg * Math.PI) / 180;
  const inclineFlightTime = (2 * u * Math.sin(rad - betaRad)) / (g * Math.cos(betaRad));
  const inclineRange =
    (u * u / (g * Math.cos(betaRad) * Math.cos(betaRad))) *
    (Math.sin(2 * rad - betaRad) - Math.sin(betaRad));
  const maxInclineRangeAngle = 45 + inclineAngleDeg / 2;

  // River analytical values (Allen Notes Pg 87-88)
  const riverWidth = 30; // meters
  const boatRad = (boatAngleDeg * Math.PI) / 180;
  const riverVx = riverSpeed + boatSpeed * Math.cos(boatRad);
  const riverVy = Math.max(0.1, boatSpeed * Math.sin(boatRad));
  const riverCrossTime = riverWidth / riverVy;
  const riverDrift = riverVx * riverCrossTime;
  const riverNetSpeed = Math.sqrt(riverVx * riverVx + riverVy * riverVy);
  const riverMotionAngleDeg = (Math.atan2(riverVy, riverVx) * 180) / Math.PI;
  const riverPathLength = Math.sqrt(riverWidth * riverWidth + riverDrift * riverDrift);
  const canZeroDrift = boatSpeed > riverSpeed;
  const zeroDriftAngleDeg = canZeroDrift ? (Math.acos(-riverSpeed / boatSpeed) * 180) / Math.PI : null;
  const minDriftIfSlower = !canZeroDrift ? riverWidth * Math.sqrt((riverSpeed * riverSpeed) / (boatSpeed * boatSpeed) - 1) : 0;

  // Auto-fit function to guarantee FULL trajectory and predicted reaching spot are always visible on canvas
  const autoFitViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coordSys = coordSysRef.current;

    const width = canvas.width;
    const height = canvas.height;

    let targetWorldWidth = 20;
    let targetWorldHeight = 12;

    if (subMode === 'ground') {
      targetWorldWidth = Math.max(15, maxRange * 1.15);
      targetWorldHeight = Math.max(10, maxHeight * 1.35);
      coordSys.originX = 50;
      coordSys.originY = height - 45;
    } else if (subMode === 'incline') {
      const inclineHorizontalSpan = Math.max(20, (inclineRange > 0 ? inclineRange : 40) * Math.cos(betaRad) * 1.2);
      const inclineVerticalSpan = Math.max(15, (inclineRange > 0 ? inclineRange : 40) * Math.sin(betaRad) * 1.3);
      targetWorldWidth = inclineHorizontalSpan;
      targetWorldHeight = inclineVerticalSpan;
      coordSys.originX = 50;
      coordSys.originY = height - 45;
    } else {
      // River mode: ensure start (0,0), direct opposite B(0,30), AND predicted reaching spot B'(riverDrift, 30) are perfectly visible
      const marginX = Math.max(8, Math.abs(riverDrift) * 0.18 + 6);
      const minX = Math.min(0, riverDrift) - marginX;
      const maxX = Math.max(0, riverDrift) + marginX;
      const spanX = Math.max(30, maxX - minX);
      const spanY = riverWidth + 16; // 30m river + 16m for callout tag & dimension line

      const padLeft = 60;
      const padRight = 60;
      const padTop = 68;
      const padBottom = 45;

      const scale = Math.max(2, Math.min(22, Math.min((width - padLeft - padRight) / spanX, (height - padTop - padBottom) / spanY)));
      coordSys.pixelsPerMeter = scale;
      coordSys.originX = padLeft - minX * scale;
      coordSys.originY = height - padBottom;
      return;
    }

    const scaleX = (width - 100) / targetWorldWidth;
    const scaleY = (height - 80) / targetWorldHeight;
    const bestScale = Math.max(2, Math.min(60, Math.min(scaleX, scaleY)));

    coordSys.pixelsPerMeter = bestScale;
    coordSys.originX = 50;
    coordSys.originY = height - 45;
  }, [subMode, maxRange, maxHeight, inclineRange, betaRad, riverDrift, riverWidth]);

  // Reset physics state
  const handleReset = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.reset();
      loopRef.current.pause();
    }
    setIsRunning(false);
    setCurrentTime(0);
    posRef.current = new Vector2D(0, 0);
    velRef.current = new Vector2D(ux, uy);
    trailRef.current = [];
    autoFitViewport();
    renderScene();
  }, [ux, uy, autoFitViewport]);

  // Main Render Routine
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const coordSys = coordSysRef.current;

    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Draw coordinate grid
    if (showTrajectoryGrid) {
      coordSys.drawGrid(ctx, width, height, {
        gridColor: 'rgba(255, 255, 255, 0.03)',
        axisColor: 'rgba(161, 161, 170, 0.25)',
        labelColor: '#71717a',
      });
    }

    if (subMode === 'ground') {
      // 1. Draw Analytical Predicted Trajectory Curve (Full curve)
      ctx.save();
      ctx.strokeStyle = 'rgba(212, 212, 216, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const points = 140;
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * timeOfFlight;
        const px = ux * t;
        const py = uy * t - 0.5 * g * t * t;
        const screenP = coordSys.worldToScreen(new Vector2D(px, Math.max(0, py)));
        if (i === 0) ctx.moveTo(screenP.x, screenP.y);
        else ctx.lineTo(screenP.x, screenP.y);
      }
      ctx.stroke();
      ctx.restore();

      // 2. Optional Complementary Angle Trajectory (90° - α)
      if (showComplementary) {
        const compRad = (Math.PI / 2) - rad;
        const compUx = u * Math.cos(compRad);
        const compUy = u * Math.sin(compRad);
        const compTime = (2 * compUy) / g;

        ctx.save();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const t = (i / points) * compTime;
          const px = compUx * t;
          const py = compUy * t - 0.5 * g * t * t;
          const screenP = coordSys.worldToScreen(new Vector2D(px, Math.max(0, py)));
          if (i === 0) ctx.moveTo(screenP.x, screenP.y);
          else ctx.lineTo(screenP.x, screenP.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 3. Mark Apex & Range with clean badges
      const apexScreen = coordSys.worldToScreen(new Vector2D(maxRange / 2, maxHeight));
      const rangeScreen = coordSys.worldToScreen(new Vector2D(maxRange, 0));

      ctx.fillStyle = '#a1a1aa';
      ctx.beginPath();
      ctx.arc(apexScreen.x, apexScreen.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`H = ${maxHeight.toFixed(1)}m`, apexScreen.x, apexScreen.y - 8);

      ctx.beginPath();
      ctx.arc(rangeScreen.x, rangeScreen.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`R = ${maxRange.toFixed(1)}m`, rangeScreen.x, rangeScreen.y + 14);

      // 4. Particle Trail
      if (trailRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 244, 245, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        trailRef.current.forEach((p, idx) => {
          const s = coordSys.worldToScreen(p);
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // 5. Projectile Ball
      const ballScreen = coordSys.worldToScreen(posRef.current);
      ctx.save();
      ctx.fillStyle = '#fafafa';
      ctx.beginPath();
      ctx.arc(ballScreen.x, ballScreen.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 6. Velocity Vectors
      const currentV = velRef.current;
      const vScale = Math.min(2.5, Math.max(0.6, coordSys.pixelsPerMeter * 0.08));

      if (showComponents) {
        const vxVec = new Vector2D(currentV.x * vScale, 0);
        VectorRenderer.drawScreenVector(ctx, ballScreen, vxVec, {
          color: '#a1a1aa',
          lineWidth: 1.5,
          label: `vx=${currentV.x.toFixed(1)}`,
          dashed: true,
        });

        const vyVec = new Vector2D(0, -currentV.y * vScale);
        VectorRenderer.drawScreenVector(ctx, ballScreen, vyVec, {
          color: '#a1a1aa',
          lineWidth: 1.5,
          label: `vy=${currentV.y.toFixed(1)}`,
          dashed: true,
        });
      }

      const netVVec = new Vector2D(currentV.x * vScale, -currentV.y * vScale);
      VectorRenderer.drawScreenVector(ctx, ballScreen, netVVec, {
        color: '#38bdf8',
        lineWidth: 2,
        label: `v=${currentV.mag().toFixed(1)} m/s`,
        headSize: 8,
      });

    } else if (subMode === 'incline') {
      const inclineLengthMeters = Math.max(40, (inclineRange > 0 ? inclineRange : 30) * 1.15);
      const inclineEndWorld = new Vector2D(
        inclineLengthMeters * Math.cos(betaRad),
        inclineLengthMeters * Math.sin(betaRad)
      );
      const originScreen = coordSys.worldToScreen(new Vector2D(0, 0));
      const inclineEndScreen = coordSys.worldToScreen(inclineEndWorld);

      ctx.save();
      ctx.fillStyle = 'rgba(24, 24, 27, 0.4)';
      ctx.beginPath();
      ctx.moveTo(originScreen.x, originScreen.y);
      ctx.lineTo(inclineEndScreen.x, inclineEndScreen.y);
      ctx.lineTo(inclineEndScreen.x, originScreen.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originScreen.x, originScreen.y);
      ctx.lineTo(inclineEndScreen.x, inclineEndScreen.y);
      ctx.stroke();

      VectorRenderer.drawAngleArc(ctx, originScreen, 30, 0, betaRad, `β=${inclineAngleDeg}°`, '#a1a1aa');
      ctx.restore();

      // Predicted incline trajectory
      ctx.save();
      ctx.strokeStyle = 'rgba(212, 212, 216, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const t = (i / 100) * inclineFlightTime;
        const px = ux * t;
        const py = uy * t - 0.5 * g * t * t;
        const s = coordSys.worldToScreen(new Vector2D(px, py));
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      }
      ctx.stroke();
      ctx.restore();

      const ballScreen = coordSys.worldToScreen(posRef.current);
      ctx.fillStyle = '#fafafa';
      ctx.beginPath();
      ctx.arc(ballScreen.x, ballScreen.y, 6, 0, Math.PI * 2);
      ctx.fill();

    } else if (subMode === 'river') {
      const riverWidthMeters = 30;
      const bankTopY = riverWidthMeters;
      const topBankScreen = coordSys.worldToScreen(new Vector2D(0, bankTopY));
      const bottomBankScreen = coordSys.worldToScreen(new Vector2D(0, 0));

      const boatRad = (boatAngleDeg * Math.PI) / 180;
      const vx = riverSpeed + boatSpeed * Math.cos(boatRad);
      const vy = boatSpeed * Math.sin(boatRad);
      const crossTime = riverWidthMeters / (vy || 1);
      const drift = vx * crossTime;

      // 1. Water Background
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.fillRect(0, topBankScreen.y, width, bottomBankScreen.y - topBankScreen.y);

      // Water current wave ripples
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.lineWidth = 1;
      for (let y = topBankScreen.y + 25; y < bottomBankScreen.y; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. River Banks
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, bottomBankScreen.y);
      ctx.lineTo(width, bottomBankScreen.y);
      ctx.moveTo(0, topBankScreen.y);
      ctx.lineTo(width, topBankScreen.y);
      ctx.stroke();

      // Bank labels
      ctx.fillStyle = '#71717a';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Bank A (Start, y = 0m)', 15, bottomBankScreen.y + 16);
      ctx.fillText(`Bank B (Opposite Bank, y = ${riverWidthMeters}m)`, 15, topBankScreen.y - 8);

      // 3. River flow velocity arrows vr along flow (+x)
      for (let rx = 70; rx < width; rx += 140) {
        VectorRenderer.drawScreenVector(
          ctx,
          new Vector2D(rx, (topBankScreen.y + bottomBankScreen.y) / 2),
          new Vector2D(riverSpeed * 10, 0),
          { color: '#06b6d4', lineWidth: 1.5, label: `v_river = ${riverSpeed}m/s`, headSize: 6 }
        );
      }

      // 4. Points of Reference
      const startScreen = coordSys.worldToScreen(new Vector2D(0, 0));
      const oppScreen = coordSys.worldToScreen(new Vector2D(0, riverWidthMeters));
      const landScreen = coordSys.worldToScreen(new Vector2D(drift, riverWidthMeters));

      // Normal reference line across river (dashed)
      ctx.save();
      ctx.strokeStyle = 'rgba(161, 161, 170, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startScreen.x, startScreen.y);
      ctx.lineTo(oppScreen.x, oppScreen.y);
      ctx.stroke();
      ctx.restore();

      // Perpendicular right-angle indicator at start Bank A (0, 0)
      ctx.strokeStyle = 'rgba(161, 161, 170, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(startScreen.x, startScreen.y - 10, 10, 10);

      // Direct Opposite Point B Marker
      ctx.save();
      ctx.fillStyle = '#52525b';
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(oppScreen.x, oppScreen.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Point B (x = 0m)', oppScreen.x, oppScreen.y + 14);
      ctx.restore();

      // High-Visibility Predicted Trajectory Line to Predicted Landing Spot B'
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(startScreen.x, startScreen.y);
      ctx.lineTo(landScreen.x, landScreen.y);
      ctx.stroke();
      ctx.restore();

      // Trajectory Midpoint Info Badge (Ground Path & Crossing Time)
      const midScreen = coordSys.worldToScreen(new Vector2D(drift / 2, riverWidthMeters / 2));
      const groundDist = Math.sqrt(riverWidthMeters * riverWidthMeters + drift * drift);
      const pathBadge = `Path: ${groundDist.toFixed(1)}m | t: ${crossTime.toFixed(1)}s`;
      ctx.font = '10px "JetBrains Mono", monospace';
      const badgeWidth = ctx.measureText(pathBadge).width + 16;
      ctx.fillStyle = 'rgba(9, 9, 11, 0.88)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(midScreen.x - badgeWidth / 2, midScreen.y - 10, badgeWidth, 20, 4);
      } else {
        ctx.rect(midScreen.x - badgeWidth / 2, midScreen.y - 10, badgeWidth, 20);
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pathBadge, midScreen.x, midScreen.y);

      // Arrival Ghost Boat Preview at Predicted Reaching Spot B'
      ctx.save();
      ctx.translate(landScreen.x, landScreen.y);
      ctx.rotate(-boatRad + Math.PI / 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(7, 5);
      ctx.lineTo(5, 12);
      ctx.lineTo(-5, 12);
      ctx.lineTo(-7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Bullseye / Target Radar Reticle at Predicted Spot B'
      const isZeroDrift = Math.abs(drift) <= 0.3;
      const targetColor = isZeroDrift ? '#22c55e' : '#38bdf8';

      ctx.save();
      // Outer radar ring
      ctx.strokeStyle = targetColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(landScreen.x, landScreen.y, 11, 0, Math.PI * 2);
      ctx.stroke();

      // Faint soft outer pulse ring
      ctx.strokeStyle = isZeroDrift ? 'rgba(34, 197, 94, 0.3)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(landScreen.x, landScreen.y, 16, 0, Math.PI * 2);
      ctx.stroke();

      // 4 Crosshair ticks
      ctx.strokeStyle = targetColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(landScreen.x - 14, landScreen.y);
      ctx.lineTo(landScreen.x - 7, landScreen.y);
      ctx.moveTo(landScreen.x + 7, landScreen.y);
      ctx.lineTo(landScreen.x + 14, landScreen.y);
      ctx.moveTo(landScreen.x, landScreen.y - 14);
      ctx.lineTo(landScreen.x, landScreen.y - 7);
      ctx.moveTo(landScreen.x, landScreen.y + 7);
      ctx.lineTo(landScreen.x, landScreen.y + 14);
      ctx.stroke();

      // Center bullseye dot
      ctx.fillStyle = targetColor;
      ctx.beginPath();
      ctx.arc(landScreen.x, landScreen.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // High-Contrast Floating Target Callout Tag
      const tagBoxHeight = 28;
      const tagBoxY = landScreen.y - 22 - tagBoxHeight;
      let tagTitle = `B' Predicted Spot: ${drift >= 0 ? '+' : ''}${drift.toFixed(1)}m`;
      let tagSub = drift >= 0 ? `Downstream Drift = +${drift.toFixed(1)}m` : `Upstream Drift = ${drift.toFixed(1)}m`;

      if (isZeroDrift) {
        tagTitle = '🎯 SHORTEST PATH (Zero Drift)';
        tagSub = `Direct Landing at Point B (t = ${crossTime.toFixed(1)}s)`;
      }

      ctx.save();
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      const titleWidth = ctx.measureText(tagTitle).width;
      ctx.font = '9px "JetBrains Mono", monospace';
      const subWidth = ctx.measureText(tagSub).width;
      const tagBoxWidth = Math.max(titleWidth, subWidth) + 16;
      const tagBoxX = landScreen.x - tagBoxWidth / 2;

      ctx.fillStyle = isZeroDrift ? 'rgba(6, 78, 59, 0.95)' : 'rgba(9, 9, 11, 0.92)';
      ctx.strokeStyle = isZeroDrift ? '#22c55e' : 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(tagBoxX, tagBoxY, tagBoxWidth, tagBoxHeight, 5);
      } else {
        ctx.rect(tagBoxX, tagBoxY, tagBoxWidth, tagBoxHeight);
      }
      ctx.fill();
      ctx.stroke();

      // Pointer triangle pointing to bullseye
      ctx.fillStyle = isZeroDrift ? 'rgba(6, 78, 59, 0.95)' : 'rgba(9, 9, 11, 0.92)';
      ctx.beginPath();
      ctx.moveTo(landScreen.x - 5, tagBoxY + tagBoxHeight);
      ctx.lineTo(landScreen.x + 5, tagBoxY + tagBoxHeight);
      ctx.lineTo(landScreen.x, tagBoxY + tagBoxHeight + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isZeroDrift ? '#22c55e' : 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.moveTo(landScreen.x - 5, tagBoxY + tagBoxHeight);
      ctx.lineTo(landScreen.x, tagBoxY + tagBoxHeight + 5);
      ctx.lineTo(landScreen.x + 5, tagBoxY + tagBoxHeight);
      ctx.stroke();

      // Text inside tag
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isZeroDrift ? '#4ade80' : '#38bdf8';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(tagTitle, landScreen.x, tagBoxY + 9);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(tagSub, landScreen.x, tagBoxY + 20);
      ctx.restore();

      // Drift Dimension Line between (0, 30) and (drift, 30)
      if (Math.abs(drift) > 0.5) {
        const dimY = Math.min(oppScreen.y, landScreen.y) - 58;
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;

        // Vertical tick lines from banks to dimension line
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(oppScreen.x, oppScreen.y - 6);
        ctx.lineTo(oppScreen.x, dimY - 3);
        ctx.moveTo(landScreen.x, landScreen.y - 6);
        ctx.lineTo(landScreen.x, dimY - 3);
        ctx.stroke();
        ctx.setLineDash([]);

        // Horizontal dimension line
        ctx.beginPath();
        ctx.moveTo(oppScreen.x, dimY);
        ctx.lineTo(landScreen.x, dimY);
        ctx.stroke();

        // Directional arrowheads
        const arrow = 4;
        const dir = drift > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(oppScreen.x + dir * arrow, dimY - arrow);
        ctx.lineTo(oppScreen.x, dimY);
        ctx.lineTo(oppScreen.x + dir * arrow, dimY + arrow);
        ctx.moveTo(landScreen.x - dir * arrow, dimY - arrow);
        ctx.lineTo(landScreen.x, dimY);
        ctx.lineTo(landScreen.x - dir * arrow, dimY + arrow);
        ctx.stroke();

        // Centered dimension text pill
        const dimText = `Drift x = ${Math.abs(drift).toFixed(1)}m ${drift > 0 ? '→ (Downstream)' : '← (Upstream)'}`;
        ctx.font = '10px "JetBrains Mono", monospace';
        const dimW = ctx.measureText(dimText).width + 12;
        const midDimX = (oppScreen.x + landScreen.x) / 2;

        ctx.fillStyle = 'rgba(9, 9, 11, 0.92)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(midDimX - dimW / 2, dimY - 9, dimW, 18, 3);
        } else {
          ctx.rect(midDimX - dimW / 2, dimY - 9, dimW, 18);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dimText, midDimX, dimY);
        ctx.restore();
      }

      // 5. Boat Motion Trail
      if (trailRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 250, 250, 0.6)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        trailRef.current.forEach((p, idx) => {
          const s = coordSys.worldToScreen(p);
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // 6. Draw Sleek Boat Body
      const boatScreen = coordSys.worldToScreen(posRef.current);
      ctx.save();
      ctx.translate(boatScreen.x, boatScreen.y);
      ctx.rotate(-boatRad + Math.PI / 2);

      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(7, 5);
      ctx.lineTo(5, 12);
      ctx.lineTo(-5, 12);
      ctx.lineTo(-7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 7. THE THREE VELOCITY VECTORS AT THE BOAT:
      const vScale = 12; // pixels per m/s

      // A. Boat Steering Velocity Vector v_boat/river (Amber)
      const vbVec = new Vector2D(
        boatSpeed * Math.cos(boatRad) * vScale,
        -boatSpeed * Math.sin(boatRad) * vScale
      );
      VectorRenderer.drawScreenVector(ctx, boatScreen, vbVec, {
        color: '#f59e0b',
        lineWidth: 2,
        label: `v_b/r = ${boatSpeed} m/s`,
        subLabel: `(Steer: ${boatAngleDeg}°)`,
        headSize: 8,
      });

      // B. River Flow Vector v_river (Cyan)
      const vrVec = new Vector2D(riverSpeed * vScale, 0);
      VectorRenderer.drawScreenVector(ctx, boatScreen, vrVec, {
        color: '#06b6d4',
        lineWidth: 1.5,
        label: `v_r = ${riverSpeed} m/s`,
        dashed: true,
        headSize: 7,
      });

      // C. THE ARROW OF MOTION! Net Resultant Velocity v_ground (Emerald Green)
      // v_motion = v_b/r + v_r
      const vNetVec = new Vector2D(vx * vScale, -vy * vScale);
      const netSpeed = Math.sqrt(vx * vx + vy * vy);
      const motionAngleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;

      VectorRenderer.drawScreenVector(ctx, boatScreen, vNetVec, {
        color: '#22c55e',
        lineWidth: 3,
        label: `MOTION → v_ground = ${netSpeed.toFixed(1)} m/s`,
        subLabel: `(Actual Angle: ${motionAngleDeg.toFixed(1)}°)`,
        headSize: 11,
      });
    }
  }, [
    subMode,
    showTrajectoryGrid,
    timeOfFlight,
    ux,
    uy,
    g,
    showComplementary,
    rad,
    u,
    maxRange,
    maxHeight,
    showComponents,
    betaRad,
    inclineAngleDeg,
    inclineFlightTime,
    inclineRange,
    riverSpeed,
    boatSpeed,
    boatAngleDeg,
  ]);

  // Trigger auto-fit on parameter changes
  useEffect(() => {
    autoFitViewport();
    renderScene();
  }, [velocity, angleDeg, gravity, inclineAngleDeg, boatSpeed, boatAngleDeg, riverSpeed, subMode, autoFitViewport, renderScene]);

  // Setup simulation loop
  useEffect(() => {
    handleReset();

    const loop = new PhysicsLoop({
      update: (_dt, totalTime) => {
        setCurrentTime(totalTime);

        if (subMode === 'ground') {
          if (totalTime <= timeOfFlight) {
            const px = ux * totalTime;
            const py = uy * totalTime - 0.5 * g * totalTime * totalTime;
            const vx = ux;
            const vy = uy - g * totalTime;

            posRef.current = new Vector2D(px, Math.max(0, py));
            velRef.current = new Vector2D(vx, vy);

            if (trailRef.current.length < 300) {
              trailRef.current.push(new Vector2D(px, Math.max(0, py)));
            }
          } else {
            posRef.current = new Vector2D(maxRange, 0);
            velRef.current = new Vector2D(ux, 0);
            loop.pause();
            setIsRunning(false);
          }
        } else if (subMode === 'incline') {
          if (totalTime <= inclineFlightTime) {
            const px = ux * totalTime;
            const py = uy * totalTime - 0.5 * g * totalTime * totalTime;
            posRef.current = new Vector2D(px, py);
            velRef.current = new Vector2D(ux, uy - g * totalTime);
            trailRef.current.push(new Vector2D(px, py));
          } else {
            loop.pause();
            setIsRunning(false);
          }
        } else if (subMode === 'river') {
          const boatRad = (boatAngleDeg * Math.PI) / 180;
          const vx = riverSpeed + boatSpeed * Math.cos(boatRad);
          const vy = boatSpeed * Math.sin(boatRad);

          const px = vx * totalTime;
          const py = vy * totalTime;

          if (py >= 30) {
            const finalCrossTime = 30 / (vy || 1);
            const finalPx = vx * finalCrossTime;
            posRef.current = new Vector2D(finalPx, 30);
            velRef.current = new Vector2D(vx, vy);
            trailRef.current.push(new Vector2D(finalPx, 30));
            loop.pause();
            setIsRunning(false);
          } else {
            posRef.current = new Vector2D(px, py);
            velRef.current = new Vector2D(vx, vy);
            if (trailRef.current.length < 400) {
              trailRef.current.push(new Vector2D(px, py));
            }
          }
        }
      },
      render: renderScene,
    });

    loopRef.current = loop;

    return () => {
      loop.destroy();
    };
  }, [subMode, velocity, angleDeg, gravity, inclineAngleDeg, riverSpeed, boatSpeed, boatAngleDeg, timeOfFlight, ux, uy, g, inclineFlightTime, maxRange, handleReset, renderScene]);

  const handleTogglePlay = () => {
    if (loopRef.current) {
      const isFinished =
        subMode === 'ground'
          ? currentTime >= timeOfFlight
          : subMode === 'incline'
          ? currentTime >= inclineFlightTime
          : posRef.current.y >= 30;

      if (isFinished) {
        handleReset();
      }
      loopRef.current.toggle();
      setIsRunning(loopRef.current.getIsRunning());
    }
  };

  const handleStep = () => {
    if (loopRef.current) {
      loopRef.current.step(0.04);
    }
  };

  const handleTimeScaleChange = (scale: number) => {
    setTimeScale(scale);
    if (loopRef.current) {
      loopRef.current.setTimeScale(scale);
    }
  };

  const handleZoom = (factor: number) => {
    coordSysRef.current.zoom(factor);
    renderScene();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium text-zinc-100">
              Kinematics in 2D & Projectiles
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              Allen Ch 03
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full trajectory equation, live velocity resolution, and complete theoretical derivations.
          </p>
        </div>

        {/* View Tabs: Simulation Lab vs Theory & Derivations */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'simulation'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Lab</span>
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'theory'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory & Derivations</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Simulation & Kinematic Graphs */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          {/* Sub-modes selector */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-md border border-zinc-800/80">
              <button
                onClick={() => { setSubMode('ground'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'ground' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Ground Projectile
              </button>
              <button
                onClick={() => { setSubMode('incline'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'incline' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Incline Plane Projectile
              </button>
              <button
                onClick={() => { setSubMode('river'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'river' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Relative Velocity (River-Boat)
              </button>
            </div>

            {/* Auto-fit and zoom controls */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <button
                onClick={autoFitViewport}
                title="Fit full trajectory to screen"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fit Graph</span>
              </button>
              <button
                onClick={() => handleZoom(1.2)}
                title="Zoom in"
                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom(0.8)}
                title="Zoom out"
                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Grid: Canvas on Left, Controls & HUD on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Canvas Viewport (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b]">
                <canvas
                  ref={canvasRef}
                  width={820}
                  height={480}
                  className="w-full h-[440px] block"
                />

                {/* Readout Badges */}
                <div className="absolute top-3 left-3 flex gap-2 font-mono text-[11px] text-zinc-300">
                  <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                    x: {posRef.current.x.toFixed(1)}m, y: {posRef.current.y.toFixed(1)}m
                  </span>
                  <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                    |v|: {velRef.current.mag().toFixed(1)} m/s
                  </span>
                </div>

                {/* Bottom Canvas Controls */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <button
                    onClick={() => setShowComponents(!showComponents)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                      showComponents
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                        : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    Components (Vx, Vy)
                  </button>

                  {subMode === 'ground' && (
                    <button
                      onClick={() => setShowComplementary(!showComplementary)}
                      className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                        showComplementary
                          ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                          : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      Complementary ({90 - angleDeg}°)
                    </button>
                  )}

                  <button
                    onClick={() => setShowTrajectoryGrid(!showTrajectoryGrid)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                      showTrajectoryGrid
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                        : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    <Layers className="w-3 h-3 inline mr-1" />
                    Grid
                  </button>
                </div>
              </div>

              {/* Playback Controls */}
              <PlaybackControls
                isRunning={isRunning}
                onTogglePlay={handleTogglePlay}
                onReset={handleReset}
                onStep={handleStep}
                timeScale={timeScale}
                onTimeScaleChange={handleTimeScaleChange}
                currentTime={currentTime}
              />

              {/* Synchronized Live Graphs Panel */}
              {subMode === 'ground' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">
                      Synchronized Kinematic & Energy Graphs
                    </span>
                    <button
                      onClick={() => setShowLiveGraphs(!showLiveGraphs)}
                      className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
                    >
                      {showLiveGraphs ? 'Hide Graphs' : 'Show Graphs'}
                    </button>
                  </div>

                  {showLiveGraphs && (
                    <KinematicGraphs
                      velocity={velocity}
                      angleDeg={angleDeg}
                      gravity={gravity}
                      currentTime={currentTime}
                      timeOfFlight={timeOfFlight}
                      maxHeight={maxHeight}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Controls (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-3.5 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                <span className="text-xs font-medium text-zinc-300 block">
                  Parameters
                </span>

                {subMode === 'ground' && (
                  <>
                    <SliderControl
                      label="Initial Velocity"
                      symbol="u"
                      value={velocity}
                      min={5}
                      max={50}
                      step={1}
                      unit="m/s"
                      onChange={setVelocity}
                      presets={[
                        { label: '10', value: 10 },
                        { label: '20', value: 20 },
                        { label: '25', value: 25 },
                        { label: '40', value: 40 },
                      ]}
                    />

                    <SliderControl
                      label="Launch Angle"
                      symbol="α"
                      value={angleDeg}
                      min={1}
                      max={89}
                      step={1}
                      unit="°"
                      onChange={setAngleDeg}
                      presets={[
                        { label: '30°', value: 30 },
                        { label: '37°', value: 37 },
                        { label: '45° (Max R)', value: 45 },
                        { label: '53°', value: 53 },
                        { label: '60°', value: 60 },
                      ]}
                    />

                    <SliderControl
                      label="Gravity"
                      symbol="g"
                      value={gravity}
                      min={1}
                      max={25}
                      step={0.1}
                      unit="m/s²"
                      onChange={setGravity}
                      presets={[
                        { label: '9.8', value: 9.8 },
                        { label: '10', value: 10 },
                      ]}
                    />
                  </>
                )}

                {subMode === 'incline' && (
                  <>
                    <SliderControl
                      label="Initial Velocity"
                      symbol="u"
                      value={velocity}
                      min={5}
                      max={45}
                      unit="m/s"
                      onChange={setVelocity}
                    />
                    <SliderControl
                      label="Launch Angle"
                      symbol="α"
                      value={angleDeg}
                      min={inclineAngleDeg + 5}
                      max={85}
                      unit="°"
                      onChange={setAngleDeg}
                      presets={[
                        { label: `Max Range (${maxInclineRangeAngle}°)`, value: maxInclineRangeAngle },
                      ]}
                    />
                    <SliderControl
                      label="Incline Slope"
                      symbol="β"
                      value={inclineAngleDeg}
                      min={10}
                      max={60}
                      unit="°"
                      onChange={setInclineAngleDeg}
                      presets={[
                        { label: '30°', value: 30 },
                        { label: '45°', value: 45 },
                      ]}
                    />
                  </>
                )}

                {subMode === 'river' && (
                  <>
                    <SliderControl
                      label="River Speed"
                      symbol="v_r"
                      value={riverSpeed}
                      min={1}
                      max={10}
                      unit="m/s"
                      onChange={setRiverSpeed}
                    />
                    <SliderControl
                      label="Boat Speed"
                      symbol="v_b"
                      value={boatSpeed}
                      min={1}
                      max={12}
                      unit="m/s"
                      onChange={setBoatSpeed}
                    />
                    <SliderControl
                      label="Heading Angle"
                      symbol="θ"
                      value={boatAngleDeg}
                      min={30}
                      max={150}
                      unit="°"
                      onChange={setBoatAngleDeg}
                      presets={[
                        ...(canZeroDrift && zeroDriftAngleDeg !== null
                          ? [
                              {
                                label: `🎯 Zero Drift (${Math.round(zeroDriftAngleDeg)}°)`,
                                value: Math.round(zeroDriftAngleDeg),
                              },
                            ]
                          : []),
                        { label: '⚡ Min Time (90°)', value: 90 },
                        { label: '60° Downstream', value: 60 },
                        { label: '120° Upstream', value: 120 },
                      ]}
                    />

                    {/* Quick JEE Goal Presets */}
                    <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                      <span className="text-[11px] font-mono text-zinc-400 block">
                        JEE Exam Targets:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            if (canZeroDrift && zeroDriftAngleDeg !== null) {
                              setBoatAngleDeg(Math.round(zeroDriftAngleDeg));
                            } else {
                              setBoatSpeed(riverSpeed + 2);
                              const newAngle = Math.round(
                                (Math.acos(-riverSpeed / (riverSpeed + 2)) * 180) / Math.PI
                              );
                              setBoatAngleDeg(newAngle);
                            }
                            handleReset();
                          }}
                          title={
                            canZeroDrift
                              ? `Set angle θ = ${Math.round(zeroDriftAngleDeg || 120)}° for exact Zero Drift`
                              : `Boat too slow (vb ≤ vr). Increase vb to achieve zero drift.`
                          }
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono transition-colors"
                        >
                          <Compass className="w-3 h-3 text-emerald-400" />
                          <span>Shortest Path (x=0)</span>
                        </button>

                        <button
                          onClick={() => {
                            setBoatAngleDeg(90);
                            handleReset();
                          }}
                          title="Steer at 90° for minimum crossing time (t_min = d/vb)"
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/60 text-sky-300 text-[10px] font-mono transition-colors"
                        >
                          <Target className="w-3 h-3 text-sky-400" />
                          <span>Shortest Time (90°)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Formula HUD */}
              {subMode === 'ground' && (
                <FormulaHUD
                  title="Trajectory & Kinematic Relations"
                  formulaLatex="y = x\tan\alpha\left(1 - \frac{x}{R}\right), \quad R = \frac{u^2 \sin 2\alpha}{g}"
                  evaluatedValues={{
                    'Flight Time (T)': `${timeOfFlight.toFixed(2)}s`,
                    'Max Height (H)': `${maxHeight.toFixed(2)}m`,
                    'Range (R)': `${maxRange.toFixed(2)}m`,
                  }}
                  explanation="The horizontal velocity component remains constant (u cos α) throughout because gravity acts strictly downward."
                  noteSource="Allen Notes Pg 85"
                />
              )}

              {subMode === 'incline' && (
                <FormulaHUD
                  title="Incline Projectile Range"
                  formulaLatex="R_{PQ} = \frac{u^2}{g\cos^2\beta}[\sin(2\alpha - \beta) - \sin\beta]"
                  evaluatedValues={{
                    'Flight Time': `${inclineFlightTime.toFixed(2)}s`,
                    'Range PQ': `${inclineRange.toFixed(2)}m`,
                  }}
                  explanation="For maximum range on an inclined plane, the direction of projection bisects the angle between the vertical and the inclined plane (α = π/4 + β/2)."
                  noteSource="Allen Notes Pg 87"
                />
              )}

              {subMode === 'river' && (
                <FormulaHUD
                  title="River-Boat Kinematics & Drift"
                  formulaLatex="\vec{v}_g = \vec{v}_{b/r} + \vec{v}_r, \quad x = (v_r + v_b\cos\theta)\frac{d}{v_b\sin\theta}"
                  evaluatedValues={{
                    'Predicted Spot (B\')': `x = ${riverDrift >= 0 ? '+' : ''}${riverDrift.toFixed(1)}m, y = 30m`,
                    'Drift Distance': `${riverDrift >= 0 ? '+' : ''}${riverDrift.toFixed(1)}m ${Math.abs(riverDrift) <= 0.3 ? '(Zero Drift 🎯)' : riverDrift > 0 ? '(Downstream)' : '(Upstream)'}`,
                    'Crossing Time': `${riverCrossTime.toFixed(2)}s ${boatAngleDeg === 90 ? '(Min Time ⚡)' : ''}`,
                    'Ground Speed': `${riverNetSpeed.toFixed(1)} m/s (${riverMotionAngleDeg.toFixed(1)}°)`,
                    'Ground Path Length': `${riverPathLength.toFixed(1)} m`,
                    'Zero Drift Feasible?': canZeroDrift
                      ? `Yes, at θ = ${zeroDriftAngleDeg?.toFixed(1)}°`
                      : `No (v_b ≤ v_r, min drift = ${minDriftIfSlower.toFixed(1)}m)`,
                  }}
                  explanation="Allen Notes Pg 87-88: (1) Minimum Time requires steering perpendicular (θ = 90°). (2) Shortest Path (Zero Drift) requires cos θ = -v_r / v_b (only possible if v_b > v_r)."
                  noteSource="Allen Notes Pg 87-88"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dedicated Theory, Derivations & Exam Concepts */}
      {activeTab === 'theory' && <KinematicsTheory onNavigateChapter={onNavigateChapter} />}
    </div>
  );
};
