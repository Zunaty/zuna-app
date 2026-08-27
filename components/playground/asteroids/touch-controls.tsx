"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import type { VirtualButtons } from "@/lib/game-canvas/input";

type TouchControlsProps = {
  onChange: (buttons: VirtualButtons) => void;
};

const IDLE: VirtualButtons = { left: false, right: false, up: false, fireHeld: false };

export function TouchControls({ onChange }: TouchControlsProps) {
  const [held, setHeld] = useState<VirtualButtons>(IDLE);

  const setButton = useCallback(
    (key: keyof VirtualButtons, value: boolean) => {
      setHeld((current) => {
        const next = { ...current, [key]: value };
        onChange(next);
        return next;
      });
    },
    [onChange],
  );

  return (
    <div className="grid grid-cols-2 gap-2 md:hidden">
      <div className="flex gap-2">
        <HoldButton label="Rotate left" pressed={held.left} onPress={(value) => setButton("left", value)}>
          ←
        </HoldButton>
        <HoldButton label="Rotate right" pressed={held.right} onPress={(value) => setButton("right", value)}>
          →
        </HoldButton>
      </div>
      <div className="flex gap-2">
        <HoldButton label="Thrust" pressed={held.up} onPress={(value) => setButton("up", value)}>
          Thrust
        </HoldButton>
        <HoldButton label="Fire" pressed={held.fireHeld} onPress={(value) => setButton("fireHeld", value)}>
          Fire
        </HoldButton>
      </div>
    </div>
  );
}

type HoldButtonProps = {
  label: string;
  pressed: boolean;
  onPress: (value: boolean) => void;
  children: string;
};

function HoldButton({ label, pressed, onPress, children }: HoldButtonProps) {
  return (
    <Button
      type="button"
      variant={pressed ? "default" : "outline"}
      className="h-12 flex-1 touch-none select-none"
      aria-label={label}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress(true);
      }}
      onPointerUp={() => onPress(false)}
      onPointerCancel={() => onPress(false)}
    >
      {children}
    </Button>
  );
}
