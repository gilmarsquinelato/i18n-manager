export const getNamespacedActionTypes =
  <T extends string[]>
  (namespace: string, actionTypes: T): {[key: string]: string} =>
    actionTypes.reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: `${namespace}/${curr}`,
      }),
      {},
    );
