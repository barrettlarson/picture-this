import "./index.css";
import { useEffect, useMemo, useRef, useState } from "react";
import Chat from "./Chat";
import Toolbar from "./Toolbar";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<"draw" | "fill">("draw");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const undoStack = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCanvasPos = (
    canvas: HTMLCanvasElement,
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / canvas.clientWidth;
    const scaleY = canvas.height / canvas.clientHeight;

    const x = (clientX - rect.left - canvas.clientLeft) * scaleX;
    const y = (clientY - rect.top - canvas.clientTop) * scaleY;

    return { x, y };
  };

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const snapshot = undoStack.current.pop();
    if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
    }
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    startX = Math.floor(startX);
    startY = Math.floor(startY);

    if (
      startX < 0 ||
      startX >= canvas.width ||
      startY < 0 ||
      startY >= canvas.height
    )
      return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    const fr = parseInt(fillColor.slice(1, 3), 16);
    const fg = parseInt(fillColor.slice(3, 5), 16);
    const fb = parseInt(fillColor.slice(5, 7), 16);

    const startPx = startY * w + startX;
    const si = startPx * 4;
    const tr = data[si];
    const tg = data[si + 1];
    const tb = data[si + 2];
    const ta = data[si + 3];

    if (tr === fr && tg === fg && tb === fb && ta === 255) return;

    const tolerance = 32;
    const visited = new Uint8Array(w * h);

    const matches = (px: number) => {
      const i = px * 4;
      return (
        Math.abs(data[i] - tr) <= tolerance &&
        Math.abs(data[i + 1] - tg) <= tolerance &&
        Math.abs(data[i + 2] - tb) <= tolerance &&
        Math.abs(data[i + 3] - ta) <= tolerance
      );
    };

    const stack = [startPx];
    while (stack.length > 0) {
      const px = stack.pop()!;
      if (visited[px]) continue;
      visited[px] = 1;

      const i = px * 4;
      data[i] = fr;
      data[i + 1] = fg;
      data[i + 2] = fb;
      data[i + 3] = 255;

      const x = px % w;
      const y = (px - x) / w;
      if (x > 0 && !visited[px - 1] && matches(px - 1)) stack.push(px - 1);
      if (x < w - 1 && !visited[px + 1] && matches(px + 1)) stack.push(px + 1);
      if (y > 0 && !visited[px - w] && matches(px - w)) stack.push(px - w);
      if (y < h - 1 && !visited[px + w] && matches(px + w)) stack.push(px + w);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasPos(canvas, e);

    saveSnapshot();

    if (mode === "fill") {
      floodFill(x, y, color);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if ("touches" in e) {
      e.preventDefault();
    }

    const { x, y } = getCanvasPos(canvas, e);

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    saveSnapshot();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleColorSelect = (newColor: string) => {
    if (newColor !== primaryColor) {
      setSecondaryColor(primaryColor);
      setPrimaryColor(newColor);
    }
    setColor(newColor);
  };

  const handleRecentClick = () => {
    if (color === primaryColor) {
      setPrimaryColor(secondaryColor);
      setSecondaryColor(primaryColor);
      setColor(secondaryColor);
    } else {
      setColor(primaryColor);
    }
  };

  const cursorStyle = useMemo(() => {
    if (mode === "fill") {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 16 L5 8 C5 6 7 4 9 4 L13 4 C15 4 17 6 17 8 L17 12'/><path d='M3 12 L17 12'/><path d='M5 16 L17 12'/><path d='M20 14 C20 14 22 17 22 18.5 C22 19.9 20.9 21 20 21 C19.1 21 18 19.9 18 18.5 C18 17 20 14 20 14Z' fill='%23000' stroke='%23000'/></svg>`;
      return `url("data:image/svg+xml,${svg}") 3 21, crosshair`;
    }
    const size = Math.max(brushSize, 4);
    const half = size / 2;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><circle cx='${half}' cy='${half}' r='${half - 0.5}' fill='rgba(0,0,0,0.3)' stroke='%23000' stroke-width='1'/></svg>`;
    const hotspot = Math.floor(half);
    return `url("data:image/svg+xml,${svg}") ${hotspot} ${hotspot}, crosshair`;
  }, [mode, brushSize]);

  return (
    <>
      <header className="pt">
        <h1>PictureThis!</h1>
      </header>
      <div className="top-bar">
        <p>120</p>
        <div className="guess">
          <p>Guess This</p>
          <p>_ _ _ _ _ _ _ _</p>
        </div>
      </div>
      <div className="main">
        <canvas
          width={1000}
          height={700}
          ref={canvasRef}
          id="canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            border: "2px solid black",
            cursor: cursorStyle,
            touchAction: "none",
          }}
        />
        <Chat></Chat>
      </div>
      <Toolbar
        color={color}
        onColorSelect={handleColorSelect}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onRecentClick={handleRecentClick}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        mode={mode}
        onModeChange={setMode}
        onUndo={undo}
        onTrash={clearCanvas}
      />
    </>
  );
}

export default App;
