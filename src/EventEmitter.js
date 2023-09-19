function createEventEmitter(Fn) {
  return class EventEmitter extends Fn {
    constructor() {
      super(...arguments);

      Object.defineProperty(this, "_events", {
        enumerable: false,
        value: {},
      });
    }

    addEventListener(eventType, listener) {
      const self = this;

      if (!Array.isArray(self._events[eventType])) self._events[eventType] = [];

      listener.remove = function remove() {
        self.removeListener(eventType, listener);
      };

      self._events[eventType].push(listener);

      return listener;
    }
    emit(eventType, ...args) {
      (this._events[eventType] || []).forEach((listener) => listener(...args));
    }
    removeEventListener(eventType, target) {
      const start = (this._events[eventType] || []).indexOf(target);
      (this._events[eventType] || []).splice(start, 1);

      if (!Boolean(this._events[eventType].length))
        delete this._events[eventType];
    }
  };
}

export default Object.assign(createEventEmitter, {
  Array: createEventEmitter(Array),
  Boolean: createEventEmitter(Boolean),
  Number: createEventEmitter(Number),
  Object: createEventEmitter(Object),
  String: createEventEmitter(String),
});
