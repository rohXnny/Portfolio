/**
 * Shared runtime state for the single-page site.
 * Pages announce themselves through `onPage`, so feature modules stay decoupled
 * from the router.
 */
import { site } from "../data/site";

export const FORM_ENDPOINT: string = site.formEndpoint;
export const MY_EMAIL: string = site.email;
export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const fine = matchMedia("(pointer: fine)").matches;

export type PageId = "home" | "work" | "beyond" | "hire" | "contact";
export const state: { current: PageId } = { current: "home" };

type PageListener = (id: PageId) => void;
const listeners: PageListener[] = [];

/** Run `fn` every time the visible page changes. */
export function onPage(fn: PageListener): void {
  listeners.push(fn);
}

/** Called by the router after it swaps pages. */
export function emitPage(id: PageId): void {
  for (const fn of listeners) fn(id);
}
