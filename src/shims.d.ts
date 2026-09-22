declare module "react" {
  export type ReactNode = any;
  export type ReactElement = any;
  export interface FormEvent<T = any> {
    preventDefault(): void;
    currentTarget: T;
    target: T;
  }
  export interface DragEvent<T = any> {
    preventDefault(): void;
    stopPropagation(): void;
    dataTransfer: any;
  }
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useRef<T>(initial: T): { current: T };
  const React: any;
  export default React;
}

declare module "react-dom/client" {
  export function createRoot(container: Element | DocumentFragment): { render(children: any): void };
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module "*.css" {
  const content: string;
  export default content;
}
