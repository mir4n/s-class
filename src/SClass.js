import createEventEmitter from "./EventEmitter";

function createSClass(Fn) {
  return class SClass extends createEventEmitter(Fn) {
    constructor() {
      super(...arguments);

      var oldValue,
        newValue = Fn();

      const handler = {
        get(target, p, receiver) {
          for (
            var obj = target;
            Boolean(obj);
            obj = Object.getPrototypeOf(obj)
          ) {
            const desc = Object.getOwnPropertyDescriptor(obj, p);

            if ("get" in Object(desc)) return desc.get.call(target);
          }

          return target.get.call(self, target, p, receiver);
        },
        set(target, p, value, receiver) {
          var result;

          oldValue = newValue;

          for (
            var obj = target;
            Boolean(obj);
            obj = Object.getPrototypeOf(obj)
          ) {
            const desc = Object.getOwnPropertyDescriptor(obj, p);

            if ("set" in Object(desc))
              if (desc.set.call(target, value)) {
                result = true;
                break;
              } else return true;
          }

          if (!result)
            result = target.set.call(self, target, p, value, receiver);

          if (result) {
            newValue = Object.assign(Fn(), target);

            target.emit("onChange", newValue, oldValue);
            target.onChange.call(self, newValue, oldValue);

            return result;
          } else return true;
        },

        deleteProperty(target, p) {
          oldValue = newValue;

          if (target.deleteProperty.call(self, target, p)) {
            newValue = Object.assign(Fn(), target);

            target.emit("onChange", newValue, oldValue);
            target.onChange.call(self, newValue, oldValue);

            return true;
          } else return true;
        },
      };

      const self = new Proxy(this, handler);
      return self;
    }

    deleteProperty(target, p) {
      return Reflect.deleteProperty(target, p);
    }
    get(target, p, receiver) {
      return Reflect.get(target, p, receiver);
    }
    onChange(listener) {
      if (typeof listener == "function")
        return this.addListener("onChange", listener);
    }
    set(target, p, value, receiver) {
      return Reflect.set(target, p, value, receiver);
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
