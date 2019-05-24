import { createTypedHooks } from 'easy-peasy';
import { IStoreModel } from './types';

export const {
  useAction,
  useActions,
  useDispatch,
  useStore,
} = createTypedHooks<IStoreModel>();
