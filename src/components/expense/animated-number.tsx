"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

/**
 * Smoothly counts from the previous value to the next value using a spring.
 * Rendered via a motion value so re-renders are cheap.
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness: 90, damping: 20, mass: 0.8 });
  const display = useTransform(spring, (v) =>
    format ? format(v) : Math.round(v).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
