import { inject, provide, Ref, ref } from '@vue/composition-api';
import { WatchOptions } from 'vue';
import { Store } from 'vuex';

const StoreSymbol = Symbol('store');

export function provideStore<T>(store: Store<T>) {
  provide(StoreSymbol, store);
}

export function useStore(): Store<any> {
  const store = inject<Store<any>>(StoreSymbol);
  if (!store) {
    throw new Error('Store not provided');
  }

  return store;
}

export function useNamespace(namespace: string) {
  const normalizedNamespace = namespace + '/';
  const store = useStore();

  return {
    useState<T>(name: string, options?: WatchOptions) {
      return useNamespacedState<T>(store, normalizedNamespace, name, options);
    },
    useGetter<T>(name: string) {
      return useNamespacedGetter<T>(store, normalizedNamespace, name);
    },
    useAction(name: string) {
      return (payload?: any) => useNamespacedAction(store, normalizedNamespace, name, payload);
    },
    useMutation(name: string) {
      return (payload?: any) => useNamespacedMutation(store, normalizedNamespace, name, payload);
    },
  };
}

function useNamespacedState<T>(
  store: Store<any>,
  namespace: string,
  name: string,
  options?: WatchOptions,
): Ref<T> {
  return useStoreWatcher(
    store,
    () => getStoreNamespaceModule(store, namespace).state[name],
    options,
  );
}

function useNamespacedGetter<T>(
  store: Store<any>,
  namespace: string,
  name: string,
  options?: WatchOptions,
): Ref<T> {
  return useStoreWatcher(
    store,
    () => getStoreNamespaceModule(store, namespace).context.getters[name],
    options,
  );
}

function useStoreWatcher<T>(store: Store<any>, valueFn: () => T, options?: WatchOptions): Ref<T> {
  const state = ref<T>(null as any);

  store.watch(valueFn, value => (state.value = value), { immediate: true, ...options });

  return state;
}

function useNamespacedAction(store: Store<any>, namespace: string, name: string, payload?: any) {
  getStoreNamespaceModule(store, namespace).context.dispatch(name, payload);
}

function useNamespacedMutation(store: Store<any>, namespace: string, name: string, payload?: any) {
  getStoreNamespaceModule(store, namespace).context.commit(name, payload);
}

function getStoreNamespaceModule(store: Store<any>, namespace: string) {
  return (store as any)['_modulesNamespaceMap'][namespace];
}
