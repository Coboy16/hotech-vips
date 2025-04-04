/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { lazy } from "react";

// Helper para simplificar importaciones lazy preservando los tipos
export function lazyImport<
  T extends React.ComponentType<any>,
  I extends { [K in N]: T },
  N extends keyof I
>(factory: () => Promise<I>, name: N): I {
  return Object.create({
    [name]: lazy(() => factory().then((module) => ({ default: module[name] }))),
  });
}
