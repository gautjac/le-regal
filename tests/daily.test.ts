// Run with `npm test` (Node's built-in runner; Node ≥ 22.18 strips the types).
import assert from "node:assert/strict";
import { test } from "node:test";
import { servedToday } from "../src/daily.ts";
import type { Regal, Settings } from "../src/types.ts";

const DAY = 20_724; // 2026-09-28, local day index
const regal: Regal = {
  domain: "peinture",
  title: "Les Ménines",
  attribution: "Diego Velázquez, 1656",
  theThing: "…",
  pourquoi: "…",
  geste: "…",
  mediaQuery: "Las Meninas Velázquez",
};
const served: Settings = { id: 1, onboarded: true, lang: "fr", lastServedDay: DAY, lastServed: regal };

test("same-day reload reuses the served régal (no fetch)", () => {
  assert.equal(servedToday(served, DAY), regal);
});

test("a new day fetches a fresh régal", () => {
  assert.equal(servedToday(served, DAY + 1), null);
});

test("nothing served yet → fetch", () => {
  assert.equal(servedToday({ id: 1, onboarded: true, lang: "fr" }, DAY), null);
});

test("a settings row from before the régal was stored (day only) → fetch", () => {
  assert.equal(servedToday({ id: 1, onboarded: true, lang: "fr", lastServedDay: DAY }, DAY), null);
});
