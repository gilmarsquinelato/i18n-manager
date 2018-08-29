import { ReducerMap } from 'redux-actions';
import Immutable from 'immutable';


export type ReducerHandlerKey =
  (state: Immutable.Map<string, any>, payload: any) => Immutable.Map<string, any>;

export type ReducerHandler = ReducerMap<Immutable.Map<string, any>, any>;
