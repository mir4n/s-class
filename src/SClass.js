import createEventEmitter from "./EventEmitter";

function createSClass(Fn) {
  return class SClass extends createEventEmitter(Fn) {
    constructor() {
      super(...arguments);

      const handler = {
        get(target, p, receiver) {
          return target.get.call(self, target, p, receiver);
        },
        set(target, p, value, receiver) {
          return target.set.call(self, target, p, value, receiver);
        },
        deleteProperty(target, p) {
          return target.deleteProperty.call(self, target, p);
        },
      };

      const self = new Proxy(this, handler);
      return self;
    }

    deleteProperty(target, p) {
      const oldValue = Object.assign(Fn(), target);

      if (Reflect.deleteProperty(target, p)) {
        const newValue = Object.assign(Fn(), target);

        target.onChange.call(target, newValue, oldValue);

        return true;
      } else return true;
    }
    get(target, p, receiver) {
      return Reflect.get(target, p, receiver);
    }
    onChange(newValue, oldValue) {
      this.emit("onChange", newValue, oldValue);
    }
    set(target, p, value, receiver) {
      const oldValue = Object.assign(Fn(), target);

      if (Reflect.set(target, p, value, receiver)) {
        const newValue = Object.assign(Fn(), target);

        target.onChange.call(target, newValue, oldValue);

        return true;
      } else return true;
    }
  };
}

export default Object.assign(createSClass, {
  Array: createSClass(Array),
  Boolean: createSClass(Boolean),
  Number: createSClass(Number),
  Object: createSClass(Object),
  String: createSClass(String),
});
