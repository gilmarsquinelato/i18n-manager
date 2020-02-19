import { Ref } from '@vue/composition-api';

export type ComponentEmit = (event: string, ...args: any[]) => void;

// override ref to get better code completion
declare module '@vue/composition-api' {
  export function ref<T>(raw: T): Ref<T>;
}
