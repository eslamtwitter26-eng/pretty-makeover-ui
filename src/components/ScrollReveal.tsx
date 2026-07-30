import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

export type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  duration?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "section";
  id?: string;
}

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

const variants: Variants = {
  hidden: (direction: RevealDirection) => ({
    opacity: direction === "scale" ? 0 : 0,
    y: direction === "up" ? 28 : direction === "down" ? -28 : 0,
    x: direction === "left" ? 28 : direction === "right" ? -28 : 0,
    scale: direction === "scale" ? 0.94 : 1,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.55,
  once = true,
  amount = 0.18,
  as = "div",
}: ScrollRevealProps) {
  const Component = motion[as];
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      custom={direction}
      transition={{ duration, delay, ease: easeOutExpo }}
      className={className}
    >
      {children}
    </Component>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
  amount?: number;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  once = true,
  amount = 0.18,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
}

const itemVariants: Variants = {
  hidden: (direction: RevealDirection) => ({
    opacity: 0,
    y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
    x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
    scale: direction === "scale" ? 0.95 : 1,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
};

export function StaggerItem({
  children,
  className,
  direction = "up",
}: StaggerItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      custom={direction}
      transition={{ duration: 0.45, ease: easeOutExpo }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
