"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
] as const;

const SECRET_WORD = "enzo";

type EasterEggListenerProps = {
  enabled?: boolean;
};

export function EasterEggListener({ enabled = true }: EasterEggListenerProps) {
  const router = useRouter();
  const konamiIndex = useRef(0);
  const typedBuffer = useRef("");
  const unlocked = useRef(false);

  const unlock = useCallback(() => {
    if (unlocked.current) return;
    unlocked.current = true;
    router.push("/vault");
  }, [router]);

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.code === KONAMI[konamiIndex.current]) {
        konamiIndex.current += 1;
        if (konamiIndex.current === KONAMI.length) {
          konamiIndex.current = 0;
          unlock();
        }
      } else {
        konamiIndex.current = event.code === KONAMI[0] ? 1 : 0;
      }

      if (event.key.length === 1 && /[a-z]/i.test(event.key)) {
        typedBuffer.current = (
          typedBuffer.current + event.key.toLowerCase()
        ).slice(-SECRET_WORD.length);
        if (typedBuffer.current === SECRET_WORD) {
          typedBuffer.current = "";
          unlock();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, unlock]);

  return null;
}
