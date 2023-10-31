function CEE(C) {
  return class extends C {
    constructor() {
      super(...arguments);

      Object.defineProperty(this, "_events", {
        enumerable: false,
        value: {},
      });
    }

    addListener(eventType, listener) {
      const self = this;

      listener.remove = function remove() {
        self.removeListener(eventType, listener);
      };

      if (this._events[eventType] instanceof Array) {
        self._events[eventType].push(listener);
      } else self._events[eventType] = [listener];

      return listener;
    }
    emit(eventType, ...args) {
      for (const listener of this._events[eventType] || []) listener(...args);
    }
    removeAllListener(eventType) {
      delete this._events[eventType];
    }
    removeListener(eventType, listener) {
      if (this._events[eventType] instanceof Array) {
        const start = this._events[eventType].indexOf(listener);
        this._events[eventType].splice(start, 1);

        if (!Boolean(this._events[eventType].length)) {
          delete this._events[eventType];
        }
      }
    }
  };
}

export default Object.assign(CEE, {
  Array: CEE(Array),
  Boolean: CEE(Boolean),
  Number: CEE(Number),
  Object: CEE(Object),
  String: CEE(String),
});
