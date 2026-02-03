import { useState } from "react";

const COLOR_MAP: Record<string, string> = {
  white: "#ffffff",
  grey: "#c0c0c0",
  red: "#ff4d4f",
  orange: "#ff7a45",
  yellow: "#ffd666",
  green: "#52c41a",
  teal: "#20c997",
  "light-blue": "#85d7ff",
  blue: "#1e90ff",
  purple: "#7b61ff",
  pink: "#ff85c0",
  peach: "#ffd2b3",
  brown: "#8b5e3c",
  black: "#000000",
  "dark-grey": "#4a4a4a",
  "dark-red": "#a80000",
  "dark-orange": "#b35900",
  "dark-yellow": "#b38f00",
  "dark-green": "#0b6623",
  "dark-teal": "#117a65",
  "dark-light-blue": "#2b6cb0",
  "dark-blue": "#003366",
  "dark-purple": "#4b0082",
  "dark-pink": "#c71585",
  tan: "#d2b48c",
  "dark-brown": "#654321",
};

const THICKNESS_OPTIONS = [2, 5, 10, 20, 40];

interface ToolbarProps {
  color: string;
  onColorSelect: (color: string) => void;
  primaryColor: string;
  secondaryColor: string;
  onRecentClick: () => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  mode: "draw" | "fill";
  onModeChange: (mode: "draw" | "fill") => void;
  onUndo: () => void;
  onTrash: () => void;
}

function Toolbar({
  color,
  onColorSelect,
  primaryColor,
  secondaryColor,
  onRecentClick,
  brushSize,
  onBrushSizeChange,
  mode,
  onModeChange,
  onUndo,
  onTrash,
}: ToolbarProps) {
  const [showThickness, setShowThickness] = useState(false);

  return (
    <>
      <div className="toolbar">
        <div className="recents">
          <button id="recent-colors" onClick={onRecentClick}>
            <svg viewBox="0 0 24 24" fill="none">
              <polygon points="0,0 24,0 24,24" fill={primaryColor} />
              <polygon points="0,0 0,24 24,24" fill={secondaryColor} />
              <line
                x1="0"
                y1="0"
                x2="26"
                y2="26"
                stroke="#888"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
        <div className="colors">
          {Object.entries(COLOR_MAP).map(([id, hex]) => (
            <button
              key={id}
              id={id}
              className={color === hex ? "color-active" : ""}
              onClick={() => onColorSelect(hex)}
            ></button>
          ))}
        </div>
        <div className="drawing">
          <div className="thickness">
            {showThickness && (
              <div className="thickness-menu">
                {THICKNESS_OPTIONS.map((size) => (
                  <button
                    key={size}
                    className={brushSize === size ? "active" : ""}
                    onClick={() => {
                      onBrushSizeChange(size);
                      setShowThickness(false);
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r={Math.min(size / 2 + 1, 10)}
                        fill="#000000"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            )}
            <button
              id="draw-thickness"
              onClick={() => setShowThickness(!showThickness)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r={Math.min(brushSize / 2 + 1, 10)}
                  fill="#000000"
                />
              </svg>
            </button>
          </div>
          <div className="draw-or-fill">
            <button
              id="draw"
              className={mode === "draw" ? "active" : ""}
              onClick={() => onModeChange("draw")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="6"
                  y="1"
                  width="8"
                  height="16"
                  rx="1"
                  transform="rotate(30 10 12)"
                />
                <polygon
                  points="5.5,18.5 4,22 7.5,20.5"
                  fill="#000"
                  stroke="#000"
                />
              </svg>
            </button>
            <button
              id="fill"
              className={mode === "fill" ? "active" : ""}
              onClick={() => onModeChange("fill")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 16 L5 8 C5 6 7 4 9 4 L13 4 C15 4 17 6 17 8 L17 12" />
                <path d="M3 12 L17 12" />
                <path d="M5 16 L17 12" />
                <path
                  d="M20 14 C20 14 22 17 22 18.5 C22 19.9 20.9 21 20 21 C19.1 21 18 19.9 18 18.5 C18 17 20 14 20 14Z"
                  fill="#000"
                  stroke="#000"
                />
              </svg>
            </button>
          </div>
          <div className="undo-or-trash">
            <button id="undo" onClick={onUndo}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4,8 8,4" />
                <polyline points="4,8 8,12" />
                <path d="M4 8 L14 8 C18 8 20 11 20 14 C20 17 18 20 14 20 L10 20" />
              </svg>
            </button>
            <button id="trash" onClick={onTrash}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6 L20 6" />
                <path d="M9 6 L9 3 L15 3 L15 6" />
                <path d="M6 6 L7 20 L17 20 L18 6" />
                <line x1="10" y1="10" x2="10" y2="16" />
                <line x1="14" y1="10" x2="14" y2="16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Toolbar;
