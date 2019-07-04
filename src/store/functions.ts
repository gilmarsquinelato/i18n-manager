import _ from 'lodash/fp';
import { Action } from 'redux-actions';

export const defaultSetReducer = <TState extends object>(property: keyof TState & string) =>
  (state: TState, {payload}: Action<any>) => _.set(property, payload, state);
