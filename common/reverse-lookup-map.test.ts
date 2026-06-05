import { describe, it, expect, beforeEach } from "bun:test";
import {
  ReverseLookupFieldMap,
  ReverseLookupdMap,
} from "./reverse-lookup-map";

// ---------------------------------------------------------------------------
// ReverseLookupdMap
// ---------------------------------------------------------------------------

describe("ReverseLookupdMap", () => {
  describe("constructor", () => {
    it("initialises empty", () => {
      const m = new ReverseLookupdMap<number, string>();
      expect(m.size).toBe(0);
    });

    it("initialises from iterable and builds reverse map", () => {
      const m = new ReverseLookupdMap<number, string>([
        [1, "a"],
        [2, "b"],
      ]);
      expect(m.size).toBe(2);
      expect(m.reverseGet("a")).toBe(1);
      expect(m.reverseGet("b")).toBe(2);
    });
  });

  describe("set", () => {
    it("adds a new entry and makes it reverse-accessible", () => {
      const m = new ReverseLookupdMap<number, string>();
      m.set(1, "hello");
      expect(m.get(1)).toBe("hello");
      expect(m.reverseGet("hello")).toBe(1);
    });

    it("updating a key removes the old reverse entry", () => {
      const m = new ReverseLookupdMap<number, string>();
      m.set(1, "old");
      m.set(1, "new");
      expect(m.reverseHas("old")).toBe(false);
      expect(m.reverseGet("new")).toBe(1);
    });

    it("is chainable (returns this)", () => {
      const m = new ReverseLookupdMap<number, string>();
      const returned = m.set(1, "x");
      expect(returned).toBe(m);
    });
  });

  describe("delete", () => {
    it("removes the forward and reverse entries", () => {
      const m = new ReverseLookupdMap<number, string>([[1, "a"]]);
      expect(m.delete(1)).toBe(true);
      expect(m.has(1)).toBe(false);
      expect(m.reverseHas("a")).toBe(false);
    });

    it("returns false for a non-existent key", () => {
      const m = new ReverseLookupdMap<number, string>();
      expect(m.delete(99)).toBe(false);
    });
  });

  describe("clear", () => {
    it("empties both forward and reverse maps", () => {
      const m = new ReverseLookupdMap<number, string>([
        [1, "a"],
        [2, "b"],
      ]);
      m.clear();
      expect(m.size).toBe(0);
      expect(m.reverseHas("a")).toBe(false);
      expect(m.reverseHas("b")).toBe(false);
    });
  });

  describe("reverseGet", () => {
    it("returns the key for a known value", () => {
      const m = new ReverseLookupdMap<number, string>([[42, "answer"]]);
      expect(m.reverseGet("answer")).toBe(42);
    });

    it("returns undefined for an unknown value", () => {
      const m = new ReverseLookupdMap<number, string>();
      expect(m.reverseGet("missing")).toBeUndefined();
    });
  });

  describe("reverseHas", () => {
    it("returns true when the value is present", () => {
      const m = new ReverseLookupdMap<number, string>([[1, "x"]]);
      expect(m.reverseHas("x")).toBe(true);
    });

    it("returns false when the value is absent", () => {
      const m = new ReverseLookupdMap<number, string>();
      expect(m.reverseHas("x")).toBe(false);
    });
  });

  describe("reverseDelete", () => {
    it("deletes by value and removes forward entry", () => {
      const m = new ReverseLookupdMap<number, string>([[5, "five"]]);
      expect(m.reverseDelete("five")).toBe(true);
      expect(m.has(5)).toBe(false);
      expect(m.reverseHas("five")).toBe(false);
    });

    it("returns false when the value does not exist", () => {
      const m = new ReverseLookupdMap<number, string>();
      expect(m.reverseDelete("nope")).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// ReverseLookupFieldMap
// ---------------------------------------------------------------------------

interface User {
  id: string;
  name: string;
}

describe("ReverseLookupFieldMap", () => {
  describe("constructor", () => {
    it("initialises empty", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      expect(m.size).toBe(0);
    });

    it("initialises from iterable and builds reverse index on the specified field", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id", [
        [1, { id: "u1", name: "Alice" }],
        [2, { id: "u2", name: "Bob" }],
      ]);
      expect(m.size).toBe(2);
      expect(m.reverseGetKey("u1")).toBe(1);
      expect(m.reverseGetKey("u2")).toBe(2);
    });
  });

  describe("set", () => {
    it("adds a new entry and indexes it", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      m.set(1, { id: "u1", name: "Alice" });
      expect(m.get(1)).toEqual({ id: "u1", name: "Alice" });
      expect(m.reverseGetKey("u1")).toBe(1);
    });

    it("replacing a key removes the old field index entry", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      m.set(1, { id: "old-id", name: "Alice" });
      m.set(1, { id: "new-id", name: "Alice Updated" });
      expect(m.reverseHas("old-id")).toBe(false);
      expect(m.reverseGetKey("new-id")).toBe(1);
    });

    it("is chainable (returns this)", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      const returned = m.set(1, { id: "u1", name: "Alice" });
      expect(returned).toBe(m);
    });
  });

  describe("delete", () => {
    it("removes the forward and reverse field index entries", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id", [
        [1, { id: "u1", name: "Alice" }],
      ]);
      expect(m.delete(1)).toBe(true);
      expect(m.has(1)).toBe(false);
      expect(m.reverseHas("u1")).toBe(false);
    });

    it("returns false for a non-existent key", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      expect(m.delete(99)).toBe(false);
    });
  });

  describe("clear", () => {
    it("empties both forward and reverse field index", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id", [
        [1, { id: "u1", name: "Alice" }],
        [2, { id: "u2", name: "Bob" }],
      ]);
      m.clear();
      expect(m.size).toBe(0);
      expect(m.reverseHas("u1")).toBe(false);
      expect(m.reverseHas("u2")).toBe(false);
    });
  });

  describe("reverseGetKey", () => {
    it("returns the map key for a known field value", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id", [
        [7, { id: "u7", name: "Carol" }],
      ]);
      expect(m.reverseGetKey("u7")).toBe(7);
    });

    it("returns undefined for an unknown field value", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      expect(m.reverseGetKey("ghost")).toBeUndefined();
    });
  });

  describe("reverseGet", () => {
    it("returns the full value for a known field value", () => {
      const user: User = { id: "u3", name: "Dave" };
      const m = new ReverseLookupFieldMap<number, User, "id">("id", [
        [3, user],
      ]);
      expect(m.reverseGet("u3")).toEqual(user);
    });

    it("returns undefined for an unknown field value", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      expect(m.reverseGet("ghost")).toBeUndefined();
    });
  });

  describe("reverseHas", () => {
    it("returns true when the field value is indexed", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id", [
        [1, { id: "u1", name: "Alice" }],
      ]);
      expect(m.reverseHas("u1")).toBe(true);
    });

    it("returns false when the field value is not indexed", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      expect(m.reverseHas("nobody")).toBe(false);
    });
  });

  describe("reverseDelete", () => {
    it("deletes by field value and removes forward entry", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id", [
        [4, { id: "u4", name: "Eve" }],
      ]);
      expect(m.reverseDelete("u4")).toBe(true);
      expect(m.has(4)).toBe(false);
      expect(m.reverseHas("u4")).toBe(false);
    });

    it("returns false when the field value does not exist", () => {
      const m = new ReverseLookupFieldMap<number, User, "id">("id");
      expect(m.reverseDelete("ghost")).toBe(false);
    });
  });

  describe("works with non-string lookup fields", () => {
    interface Item {
      code: number;
      label: string;
    }
    it("indexes a numeric field correctly", () => {
      const m = new ReverseLookupFieldMap<string, Item, "code">("code", [
        ["alpha", { code: 100, label: "Alpha" }],
      ]);
      expect(m.reverseGetKey(100)).toBe("alpha");
      expect(m.reverseGet(100)).toEqual({ code: 100, label: "Alpha" });
    });
  });
});
