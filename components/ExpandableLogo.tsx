"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ExpandableLogo({ size = 30, isMobile: externalIsMobile }: { size?: number; isMobile?: boolean }) {
  // Increase the visible logo by 20% compared to the provided `size` prop
  const effectiveSize = Math.round(size * 0.8);
  const [hovered, setHovered] = useState(false);
  const [labelWidth, setLabelWidth] = useState(0);
  const labelMeasureRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

  useEffect(() => {
    // Measure the label width using a visually-hidden offscreen element
    if (labelMeasureRef.current) {
      const w = Math.ceil(labelMeasureRef.current.getBoundingClientRect().width);
      setLabelWidth(w);
    }
  }, []);

  // collapsed inner padding for the logo slot
  const collapsedInnerPadding = 3;
  const pillExtraHeight = 0;
  const logoSlotWidth = effectiveSize + collapsedInnerPadding * 8;
  const logoSlotHeight = effectiveSize + collapsedInnerPadding * 2 + pillExtraHeight;

  // Display image slightly larger
  const displayedImageSize = Math.round(size * 1.0);
  // Compute adjusted inner padding
  let adjustedInnerPadding = Math.floor((logoSlotWidth - displayedImageSize) / 2);
  if (adjustedInnerPadding < 2) adjustedInnerPadding = 2;

  // width needed for the text area when expanded (including spacing)
  const spacingBetween = 8;
  const textRightPadding = 20;
  const expandedTextWidth = spacingBetween + labelWidth + textRightPadding;

  const baseGlow = "0 0 0 1px rgba(255, 255, 255, 0.1)";
  const hoverGlow = "0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 10px rgba(255,255,255,0.1)";

  const [internalIsMobile, setInternalIsMobile] = useState(false);
  const isMobile = externalIsMobile ?? internalIsMobile;

  useEffect(() => {
    if (externalIsMobile !== undefined) return;
    const checkMobile = () => {
      setInternalIsMobile(window.matchMedia("(hover: none)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [externalIsMobile]);

  return (
    <Link href="/" className="pointer-events-auto inline-flex outline-none ring-0 border-none">
      <motion.div
        ref={containerRef}
        onHoverStart={() => !isMobile && setHovered(true)}
        onHoverEnd={() => !isMobile && setHovered(false)}
        onFocus={() => !isMobile && setHovered(true)}
        onBlur={() => !isMobile && setHovered(false)}
        className="inline-flex items-center rounded-full bg-white/5 backdrop-blur-sm"
        initial={false}
        animate={
          isMobile
            ? undefined
            : {
              boxShadow: hovered ? hoverGlow : baseGlow,
            }
        }
        transition={isMobile ? { duration: 0 } : spring}
        style={{
          borderRadius: 9999,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,0.10)",
          overflow: "hidden",
        }}
      >
        {/* Left: fixed logo slot */}
        <div
          style={{
            width: 50,
            height: 40,
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src="/navbar-logo.svg"
            alt="RIVONE Logo"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>

        {/* Right: animate only this text container's width */}
        <motion.div
          initial={false}
          animate={
            isMobile
              ? undefined
              : {
                width: hovered ? expandedTextWidth : 0,
                backgroundColor: hovered ? "rgba(255,255,255,0.05)" : "transparent",
              }
          }
          transition={isMobile ? { duration: 0 } : spring}
          style={{ overflow: "hidden", alignItems: "center" }}
          className="hidden md:flex"
        >
          <div style={{ paddingLeft: spacingBetween, paddingRight: textRightPadding }}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={hovered ? { opacity: 1 } : { opacity: 0 }}
              transition={{ ...spring, duration: 0.25 }}
              className="text-white font-bold tracking-widest whitespace-nowrap text-sm"
              style={{ pointerEvents: "none" }}
            >
              RIVONE
            </motion.span>
          </div>
        </motion.div>

        {/* Hidden measuring span */}
        <span
          ref={labelMeasureRef}
          aria-hidden
          style={{
            position: "absolute",
            visibility: "hidden",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            left: -9999,
            top: -9999,
            fontWeight: "bold",
            letterSpacing: "0.1em",
            fontSize: "0.875rem" // text-sm
          }}
        >
          RIVONE
        </span>
      </motion.div>
    </Link>
  );
}