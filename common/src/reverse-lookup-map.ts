export class ReverseLookupFieldMap<K, V, L extends keyof V> extends Map<K, V> {
  private _reverseMap: Map<V[L], K>;
  private _reverseLookupField: L;

  constructor(
    reverseLookupField: L,
    ...args: ConstructorParameters<typeof Map<K, V>>
  ) {
    // _reverseMap must be assigned before super() processes any initial
    // entries, because super() calls our overridden set() which uses it.
    const reverseMap = new Map<V[L], K>();
    super();
    this._reverseMap = reverseMap;
    this._reverseLookupField = reverseLookupField;
    const [entries] = args;
    if (entries) {
      for (const [key, value] of entries as Iterable<[K, V]>) {
        this.set(key, value);
      }
    }
  }

  set(key: K, value: V): this {
    const existing = this.get(key);
    if (existing != undefined) {
      this._reverseMap.delete(existing[this._reverseLookupField]);
    }
    this._reverseMap.set(value[this._reverseLookupField], key);
    return super.set(key, value);
  }

  delete(key: K): boolean {
    const existing = this.get(key);
    if (existing !== undefined && existing !== null) {
      this._reverseMap.delete(existing[this._reverseLookupField]);
    }
    return super.delete(key);
  }

  clear(): void {
    this._reverseMap.clear();
    super.clear();
  }

  reverseGetKey(fieldValue: V[L]): K | undefined {
    return this._reverseMap.get(fieldValue);
  }

  reverseGet(fieldValue: V[L]): V | undefined {
    const key = this._reverseMap.get(fieldValue);
    if (key === undefined) return undefined;
    return this.get(key) ?? undefined;
  }

  reverseHas(fieldValue: V[L]): boolean {
    return this._reverseMap.has(fieldValue);
  }

  reverseDelete(fieldValue: V[L]): boolean {
    const key = this._reverseMap.get(fieldValue);
    if (key === undefined) return false;
    this._reverseMap.delete(fieldValue);
    return super.delete(key);
  }
}

export class ReverseLookupdMap<K, V> extends Map<K, V> {
  private _reverseMap: Map<V, K>;

  constructor(...args: ConstructorParameters<typeof Map<K, V>>) {
    // _reverseMap must be assigned before super() processes any initial
    // entries, because super() calls our overridden set() which uses it.
    const reverseMap = new Map<V, K>();
    super();
    this._reverseMap = reverseMap;
    const [entries] = args;
    if (entries) {
      for (const [key, value] of entries as Iterable<[K, V]>) {
        this.set(key, value);
      }
    }
  }

  set(key: K, value: V): this {
    const existing = this.get(key);
    if (existing != undefined) {
      this._reverseMap.delete(existing);
    }
    this._reverseMap.set(value, key);
    return super.set(key, value);
  }

  delete(key: K): boolean {
    const existing = this.get(key);
    if (existing != null) {
      this._reverseMap.delete(existing);
    }
    return super.delete(key);
  }

  clear(): void {
    this._reverseMap.clear();
    super.clear();
  }

  reverseGet(v: V): K | undefined {
    return this._reverseMap.get(v);
  }

  reverseHas(v: V): boolean {
    return this._reverseMap.has(v);
  }

  reverseDelete(v: V): boolean {
    const k = this._reverseMap.get(v);
    if (k === undefined) return false;
    this._reverseMap.delete(v);
    return super.delete(k);
  }
}
