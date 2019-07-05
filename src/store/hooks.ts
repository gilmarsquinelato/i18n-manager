import { useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ActionCreator, bindActionCreators } from 'redux';

import { IStoreState } from './types';


export const useStoreState = <TSelected>(selector: (state: IStoreState) => TSelected): TSelected =>
  useSelector(selector, shallowEqual);

export const useAction = <A, C extends ActionCreator<A>>(actions: C, deps?: any[]) => {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators(actions, dispatch),
    deps ? [dispatch, ...deps] : deps);
};
