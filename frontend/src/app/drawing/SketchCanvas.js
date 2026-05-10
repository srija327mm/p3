"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text } from "react-konva";

export default function SketchCanvas({
  initialData,
  color,
  brushSize,
  mode,
  pendingText,
  onTextPlaced,
  registerExport,
  registerClear,
  registerHasContent,
}) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 500 });
  const [lines, setLines] = useState(() => initialData?.lines || []);
  const [texts, setTexts] = useState(() => initialData?.texts || []);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    setLines(initialData?.lines || []);
    setTexts(initialData?.texts || []);
  }, [initialData]);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const w = containerRef.current.clientWidth;
      setSize({ width: w, height: Math.max(400, Math.round(w * 0.55)) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    registerExport?.(() => ({ lines, texts }));
    registerHasContent?.(() => lines.length > 0 || texts.length > 0);
  }, [lines, texts, registerExport, registerHasContent]);

  useEffect(() => {
    registerClear?.(() => {
      setLines([]);
      setTexts([]);
    });
  }, [registerClear]);

  function handleMouseDown(e) {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    if (mode === "text") {
      if (!pendingText?.trim()) return;
      setTexts((t) => [
        ...t,
        { x: point.x, y: point.y, text: pendingText, color, fontSize: Math.max(14, brushSize * 5) },
      ]);
      onTextPlaced?.();
      return;
    }

    isDrawingRef.current = true;
    setLines((ls) => [...ls, { points: [point.x, point.y], color, strokeWidth: brushSize }]);
  }

  function handleMouseMove(e) {
    if (mode !== "draw" || !isDrawingRef.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;
    setLines((ls) => {
      const last = ls[ls.length - 1];
      const updated = { ...last, points: [...last.points, point.x, point.y] };
      return [...ls.slice(0, -1), updated];
    });
  }

  function handleMouseUp() {
    isDrawingRef.current = false;
  }

  return (
    <div
      ref={containerRef}
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #3a3a3a",
        overflow: "hidden",
        cursor: mode === "text" ? "text" : "crosshair",
        touchAction: "none",
      }}
    >
      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {lines.map((ln, i) => (
            <Line
              key={`l-${i}`}
              points={ln.points}
              stroke={ln.color}
              strokeWidth={ln.strokeWidth}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {texts.map((t, i) => (
            <Text
              key={`t-${i}`}
              x={t.x}
              y={t.y}
              text={t.text}
              fontSize={t.fontSize}
              fill={t.color}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
