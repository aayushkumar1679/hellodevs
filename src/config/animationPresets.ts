import type { Variants } from "framer-motion";

export type AnimationTrigger = "load" | "scroll" | "hover" | "tap";

export interface AnimationConfig {
  id: string; // unique id for list management
  preset: string; // matches a key in PRESETS
  trigger: AnimationTrigger;
  duration?: number;
  delay?: number;
  repeat?: boolean;
}

export type AnimationPreset = {
  id: string;
  name: string;
  description: string;
  variants: Variants;
};

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  "fade-in": {
    id: "fade-in",
    name: "Fade In",
    description: "Simple opacity fade",
    variants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  "fade-up": {
    id: "fade-up",
    name: "Fade Up",
    description: "Fades in while sliding up",
    variants: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    },
  },
  "slide-in-left": {
    id: "slide-in-left",
    name: "Slide In Left",
    description: "Slide in from the left",
    variants: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
  },
  "slide-in-right": {
    id: "slide-in-right",
    name: "Slide In Right",
    description: "Slide in from the right",
    variants: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
    },
  },
  "scale-up": {
    id: "scale-up",
    name: "Scale Up",
    description: "Scales up from smaller size",
    variants: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
  },
  "blur-in": {
    id: "blur-in",
    name: "Blur In",
    description: "Fades in while unblurring",
    variants: {
      hidden: { opacity: 0, filter: "blur(10px)" },
      visible: { opacity: 1, filter: "blur(0px)" },
    },
  },
  "rotate-in": {
    id: "rotate-in",
    name: "Rotate In",
    description: "Spins and fades in",
    variants: {
      hidden: { opacity: 0, rotate: -15, scale: 0.9 },
      visible: { opacity: 1, rotate: 0, scale: 1 },
    },
  },
  "hover-float": {
    id: "hover-float",
    name: "Float (Hover)",
    description: "Floats up on hover",
    variants: {
      hover: { y: -8, transition: { type: "spring", stiffness: 300 } },
    },
  },
  "hover-scale": {
    id: "hover-scale",
    name: "Scale (Hover)",
    description: "Grows slightly on hover",
    variants: {
      hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    },
  },
  "hover-glow": {
    id: "hover-glow",
    name: "Glow (Hover)",
    description: "Adds a subtle shadow glow",
    variants: {
      hover: { 
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)", 
        y: -2,
        transition: { type: "tween", duration: 0.2 } 
      },
    },
  },
  "tap-shrink": {
    id: "tap-shrink",
    name: "Shrink (Tap)",
    description: "Shrinks slightly when clicked",
    variants: {
      tap: { scale: 0.95 },
    },
  },
  "stagger-children": {
    id: "stagger-children",
    name: "Stagger Children",
    description: "Base stagger container for children",
    variants: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
  },
};
