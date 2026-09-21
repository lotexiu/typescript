import { FunctionUtils } from '@tsn-function/utils';
import { TChanges, TComponentKey, TComponentValue } from './types';

abstract class Component {
  protected abstract onChange(changes: TChanges<this>): void

  constructor() {
    let pendingChanges: TChanges<any> = {}
    const scheduleUpdate = FunctionUtils.scheduleOnce(() => {
      const snapshot = pendingChanges
      pendingChanges = {}
      this.onChange(snapshot)
    })

    return new Proxy(this, {
      set(target, prop: TComponentKey, value: TComponentValue) {
        const oldValue = target[prop]

        if (oldValue !== value) {
          target[prop] = value
          pendingChanges[prop] = { oldValue, value }
          scheduleUpdate()
        }

        return true
      },
    })
  }
}

export { Component };
