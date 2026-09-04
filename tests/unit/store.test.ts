import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePeriodStore } from "../../stores/store";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("store — defaults", () => {
  it("starts with the single demo period", () => {
    const store = usePeriodStore();
    expect(store.periods).toHaveLength(1);
    expect(store.loaded).toBe(false);
    expect(store.beforeLastDeletion).toEqual([]);
  });
});

describe("store — addLedger", () => {
  it("appends a fresh, uniquely-identified period", () => {
    const store = usePeriodStore();
    store.addLedger();
    expect(store.periods).toHaveLength(2);
    const added = store.periods[1];
    expect(added.ledger).toBe("New Ledger\n");
    expect(added.budget).toEqual({});
    expect(added.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(added.id).not.toBe(store.periods[0].id);
  });
});

describe("store — getLedgerById", () => {
  it("finds an existing period", () => {
    const store = usePeriodStore();
    const id = store.periods[0].id;
    expect(store.getLedgerById(id)).toBe(store.periods[0]);
  });

  it("returns undefined for an unknown id", () => {
    const store = usePeriodStore();
    expect(store.getLedgerById("nope")).toBeUndefined();
  });
});

describe("store — delete + undo", () => {
  it("deletes a period by id and stashes the previous state", () => {
    const store = usePeriodStore();
    const victim = store.periods[0];
    store.deleteLedger(victim);
    expect(store.periods).toHaveLength(0);
    expect(store.beforeLastDeletion).toHaveLength(1);
  });

  it("undo restores the last deletion and clears the stash", () => {
    const store = usePeriodStore();
    const victim = store.periods[0];
    store.deleteLedger(victim);
    store.undo();
    expect(store.periods).toEqual([victim]);
    expect(store.beforeLastDeletion).toHaveLength(0);
  });

  it("undo is a no-op when nothing was deleted", () => {
    const store = usePeriodStore();
    const before = store.periods.slice();
    store.undo();
    expect(store.periods).toEqual(before);
  });

  it("only the most recent deletion is undoable (single-level undo)", () => {
    const store = usePeriodStore();
    store.addLedger();
    store.addLedger(); // now 3 periods: [p0, p1, p2]
    const [p0, p1, p2] = store.periods;

    store.deleteLedger(p1); // -> [p0, p2]
    store.deleteLedger(p0); // -> [p2]; stash is [p0, p2]
    store.undo(); // restores stash -> [p0, p2]; p1 stays gone

    expect(store.periods.map((p) => p.id)).toEqual([p0.id, p2.id]);
  });
});
