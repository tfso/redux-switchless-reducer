import { AnyAction, Action, Reducer } from 'redux'

/**
 * Defines a mapping from action types to corresponding action object shapes.
 */
export type Actions<T extends keyof any = string> = Record<T, Action>

/**
 * An *case reducer* is a reducer function for a speficic action type. Case
 * reducers can be composed to full reducers using `createReducer()`.
 *
 * Unlike a normal Redux reducer, a case reducer is never called with an
 * `undefined` state to determine the initial state. Instead, the initial
 * state is explicitly specified as an argument to `createReducer()`.
 */
export type CaseReducer<S = any, A extends Action = AnyAction> = (
	state: Readonly<S>,
	action: A
) => S

/**
 * A mapping from action types to case reducers for `createReducer()`.
 */
export type CaseReducers<S, AS extends Actions> = {
	[T in keyof AS]: AS[T] extends Action ? CaseReducer<S, AS[T]> : void
}

/**
 * A utility function that allows defining a reducer as a mapping from action
 * type to *case reducer* functions that handle these action types. The
 * reducer's initial state is passed as the first argument.
 *
 * @param initialState The initial state to be returned by the reducer.
 * @param actionsMap A mapping from action types to action-type-specific
 *   case redeucers.
 */
export function createReducer<
	S,
	CR extends CaseReducers<S, any> = CaseReducers<S, any>
>(initialState: S, actionsMap: CR): Reducer<S> {
	return function (state = initialState, action): S {
		const caseReducer = actionsMap[action.type]
		return caseReducer ? caseReducer(state, action) : state
	}
}
