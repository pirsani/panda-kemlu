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
import React, { MouseEvent, use, useEffect, useRef, useState } from "react";

interface ResizableDraggableProps {
  children?: React.ReactNode;
}

const ResizableDraggable: React.FC<ResizableDraggableProps> = ({
  children,
}) => {
  const [position, setPosition] = useState({ x: 850, y: 100 });
  const [size, setSize] = useState({ width: 750, height: 600 });
  const [isFixed, setIsFixed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const resizableRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeSide = useRef<string | null>(null);
  const initialMousePosition = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 750, height: 600 });
  const initialPosition = useRef({ x: 500, y: 100 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle Drag Start
  const handleDragStart = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    initialMousePosition.current = { x: e.clientX, y: e.clientY };
    initialPosition.current = { ...position };
  };

  // Handle Mouse Move
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      const deltaX = e.clientX - initialMousePosition.current.x;
      const deltaY = e.clientY - initialMousePosition.current.y;

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
            76,
            Math.min(
              window.scrollY + window.innerHeight - size.height - 20,
              initialPosition.current.y + deltaY
            )
          ),
        }));
      }
    } else if (isResizing.current && resizeSide.current) {
      const deltaX = e.clientX - initialMousePosition.current.x;
      const deltaY = e.clientY - initialMousePosition.current.y;

      switch (resizeSide.current) {
        case "right":
          setSize((prevSize) => ({
            width: Math.max(prevSize.width + deltaX, 50),
            height: prevSize.height,
          }));
          initialMousePosition.current = { x: e.clientX, y: e.clientY };
          break;
        case "bottom":
          setSize((prevSize) => ({
            width: prevSize.width,
            height: Math.max(prevSize.height + deltaY, 50),
          }));
          initialMousePosition.current = { x: e.clientX, y: e.clientY };
          break;
        case "left":
          setSize((prevSize) => ({
            width: Math.max(prevSize.width - deltaX, 50),
            height: prevSize.height,
          }));
          setPosition((prevPosition) => ({
            x: Math.min(
              prevPosition.x + deltaX,
              window.innerWidth - size.width - 20
            ),
            y: prevPosition.y,
          }));
          initialMousePosition.current = { x: e.clientX, y: e.clientY };
          break;
        case "top":
          setSize((prevSize) => ({
            width: prevSize.width,
            height: Math.max(prevSize.height - deltaY, 50),
          }));
          setPosition((prevPosition) => ({
            x: prevPosition.x,
            y: Math.min(
              prevPosition.y + deltaY,
              window.scrollY + window.innerHeight - size.height - 20
            ),
          }));
          initialMousePosition.current = { x: e.clientX, y: e.clientY };
          break;
        default:
          break;
      }
    }
  };

  // Handle Mouse Up
  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
    resizeSide.current = null;
  };

  // Handle Resize Start
  const handleResizeStart =
    (side: string) => (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;
      resizeSide.current = side;
      initialMousePosition.current = { x: e.clientX, y: e.clientY };
      initialSize.current = { ...size };
      initialPosition.current = { ...position };
    };

  // Handle Minimize
  const handleMinimize = () => {
    setIsMinimized(true);
    setIsFixed(false);
    setSize({ width: 600, height: 750 }); // Set minimized size
    setPosition({ x: 850, y: 80 });
  };

  // Handle Restore to Normal Size
  const handleRestore = () => {
    setIsFixed(false);
    setIsMinimized(false);
    setSize({
      width: window.innerWidth - 200,
      height: window.innerHeight - 100,
    });
    setPosition({ x: 100, y: 80 });
  };

  const handleFix = () => {
    setIsFixed(true);
    setIsMinimized(false);
    setSize({ width: window.innerWidth - 200, height: 350 }); // Set minimized size
    setPosition({ x: 100, y: 80 });
  };

  const handleSmall = () => {
    setIsFixed(false);
    setIsMinimized(true);
    setSize({ width: 300, height: 250 }); // Set minimized size

    setPosition({ x: 850, y: 80 });
  };

  // Attach React event handlers
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (isDragging.current || isResizing.current) {
        handleMouseMove(e);
      }
    };

    const handleDocumentMouseUp = () => {
      handleMouseUp();
    };

    document.addEventListener(
      "mousemove",
      handleDocumentMouseMove as unknown as EventListener
    );
    document.addEventListener(
      "mouseup",
      handleDocumentMouseUp as unknown as EventListener
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        handleDocumentMouseMove as unknown as EventListener
      );
      document.removeEventListener(
        "mouseup",
        handleDocumentMouseUp as unknown as EventListener
      );
    };
  }, [size, position]);

  useEffect(() => {
    handleMinimize();
  }, []);

  // If not on client, don't render anything
  if (!isClient) {
    return null;
  }

  // Determine if the component should use fixed positioning
  const shouldUseAbsolutePosition =
    (!isFixed && size.width >= window.innerWidth - 40) ||
    size.height >= window.innerHeight - 40;

  return (
    <div
      ref={resizableRef}
      className={`bg-white border border-gray-500 shadow-md ${
        shouldUseAbsolutePosition ? "absolute" : "fixed"
      }`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        top: shouldUseAbsolutePosition
          ? `${Math.max(
              76,
              window.scrollY + window.innerHeight - size.height - 20
            )}px`
          : `${position.y}px`,
        left: shouldUseAbsolutePosition
          ? `${Math.min(10, window.innerWidth - size.width - 20)}px`
          : `${position.x}px`,
        margin: "10px",
        cursor: isDragging.current ? "grabbing" : "default",
      }}
    >
      {/* Draggable Header with Buttons */}
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
            onClick={() => (isFixed ? handleRestore() : handleFix())}
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
          <button
            className="hover:bg-yellow-200 p-1 rounded-full"
            onClick={() => (handleSmall(), console.log("small"))}
            aria-label="Maximize"
          >
            <Minus
              size={16}
              className="transform transition-transform text-green-600"
            />
          </button>
        </div>
      </div>

      {/* Resizable Content Area */}
      <div
        className={cn("overflow-auto flex flex-col h-full w-full bg-gray-100")}
      >
        {children}
        {/* <div
          className={cn(
            "overflow-auto bg-gray-400 h-8 text-green-400 -mt-10",
            { " ": isMinimized },
            { "flex flex-auto ": isFixed }
          )}
        >
          {isFixed ? "fixed" : " "} {isMinimized ? "minimized" : " "}
        </div> */}
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
