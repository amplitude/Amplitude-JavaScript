export default class WorkerStorage {
  constructor() {
    this.map = new Map();
    this.length = 0;
  }

  key(index) {
    const keys = Array.from(this.map.keys());
    const key = keys[index];
    return this.map.get(key);
  }

  getItem(key) {
    return this.map.get(key);
  }

  setItem(key, value) {
    if (!this.map.has(key)) {
      this.length += 1;
    }
    this.map.set(key, value);
  }

  removeItem(key) {
    if (this.map.has(key)) {
      this.length -= 1;
      this.map.delete(key);
    }
  }

  clear() {
    this.map.clear();
    this.length = 0;
  }
}
