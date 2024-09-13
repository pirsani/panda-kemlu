"use client";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Maximize,
  Minimize,
  Minus,
} from "lucide-react"; // Import icons from lucide-react
import React, { MouseEvent, useEffect, useRef, useState } from "react";

interface ResizableDraggableProps {
  children?: React.ReactNode;
}

const ResizableDraggable: React.FC<ResizableDraggableProps> = ({
  children,
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 750, height: 600 });
  const [isFixed, setIsFixed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const resizableRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeDirection = useRef<string | null>(null);
  const initialMousePosition = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 750, height: 600 });
  const initialPosition = useRef({ x: 500, y: 100 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updatePosition = (deltaX: number, deltaY: number) => {
    if (!isFixed) {
      setPosition((prevPosition) => ({
        x: Math.max(
          0,
          Math.min(
            window.innerWidth - size.width - 20,
            initialPosition.current.x + deltaX
          )
        ),
        y: Math.max(
          11,
          Math.min(
            window.scrollY + window.innerHeight - size.height - 20,
            initialPosition.current.y + deltaY
          )
        ),
      }));
    }
  };

  const updateSize = (side: string, deltaX: number, deltaY: number) => {
    switch (side) {
      case "right":
        setSize((prevSize) => ({
          ...prevSize,
          width: Math.max(prevSize.width + deltaX, 50),
        }));
        break;
      case "bottom":
        setSize((prevSize) => ({
          ...prevSize,
          height: Math.max(prevSize.height + deltaY, 50),
        }));
        break;
      case "left":
        setSize((prevSize) => ({
          ...prevSize,
          width: Math.max(prevSize.width - deltaX, 50),
        }));
        setPosition((prevPosition) => ({
          ...prevPosition,
          x: prevPosition.x + deltaX,
        }));
        break;
      case "top":
        setSize((prevSize) => ({
          ...prevSize,
          height: Math.max(prevSize.height - deltaY, 50),
        }));
        setPosition((prevPosition) => ({
          ...prevPosition,
          y: prevPosition.y + deltaY,
        }));
        break;
      default:
        break;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - initialMousePosition.current.x;
    const deltaY = e.clientY - initialMousePosition.current.y;

    if (isDragging.current) {
      updatePosition(deltaX, deltaY);
    } else if (isResizing.current && resizeDirection.current) {
      updateSize(resizeDirection.current, deltaX, deltaY);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
    resizeDirection.current = null;
  };

  const handleDragStart = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    initialMousePosition.current = { x: e.clientX, y: e.clientY };
    initialPosition.current = { ...position };
  };

  const handleResizeStart =
    (side: string) => (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      isResizing.current = true;
      resizeDirection.current = side;
      initialMousePosition.current = { x: e.clientX, y: e.clientY };
      initialSize.current = { ...size };
      initialPosition.current = { ...position };
    };

  const handleMinimize = () => {
    setIsMinimized(true);
    setSize({ width: 600, height: 50 });
    setPosition({ x: 100, y: 80 });
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setIsFixed(false);
    setSize({
      width: window.innerWidth - 200,
      height: window.innerHeight - 100,
    });
    setPosition({ x: 100, y: 80 });
  };

  const handleToggleFixed = () => {
    setIsFixed((prev) => !prev);
    setIsMinimized(false);
    if (!isFixed) {
      setSize({ width: window.innerWidth - 200, height: 350 });
      setPosition({ x: 100, y: 80 });
    } else {
      handleRestore();
    }
  };

  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleDocumentMouseUp = handleMouseUp;

    document.addEventListener("mousemove", handleDocumentMouseMove);
    document.addEventListener("mouseup", handleDocumentMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleDocumentMouseMove);
      document.removeEventListener("mouseup", handleDocumentMouseUp);
    };
  }, [size, position]);

  if (!isClient) return null;

  const useAbsolutePosition =
    size.width >= window.innerWidth - 40 ||
    size.height >= window.innerHeight - 40;

  return (
    <div
      ref={resizableRef}
      className={cn(
        "z-51 bg-white border border-gray-500 shadow-md",
        "hidden sm:block",
        useAbsolutePosition ? "absolute" : "fixed"
      )}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        top: `${position.y}px`,
        left: `${position.x}px`,
        cursor: isDragging.current ? "grabbing" : "default",
      }}
    >
      <div
        className="flex items-center justify-between bg-gray-300 p-2 cursor-move border-b-2 border-gray-400"
        onMouseDown={handleDragStart}
        style={{ height: "30px" }}
      >
        <div className="flex space-x-2">
          <button
            className="hover:bg-yellow-200 p-1 rounded-full"
            onClick={isMinimized ? handleRestore : handleMinimize}
            aria-label="Minimize"
          >
            {isMinimized ? (
              <Maximize size={16} className="text-green-600" />
            ) : (
              <Minimize size={16} className="text-green-600" />
            )}
          </button>
          <button
            className="hover:bg-yellow-200 p-1 rounded-full"
            onClick={handleToggleFixed}
            aria-label="Maximize"
          >
            <ChevronLeft
              size={16}
              className="transform transition-transform text-green-600"
              style={{
                transform: isFixed ? "rotate(180deg)" : "rotate(270deg)",
              }}
            />
          </button>
        </div>
      </div>

      <div
        className={cn("overflow-auto flex flex-col h-full w-full bg-gray-100")}
      >
        {children}
      </div>

      {/* Resizers */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 cursor-ns-resize w-full h-2"
        onMouseDown={handleResizeStart("top")}
      ></div>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-ns-resize w-full h-2"
        onMouseDown={handleResizeStart("bottom")}
      ></div>
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 cursor-ew-resize w-2 h-full"
        onMouseDown={handleResizeStart("left")}
      ></div>
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 cursor-ew-resize w-2 h-full"
        onMouseDown={handleResizeStart("right")}
      ></div>
    </div>
  );
};

export default ResizableDraggable;
