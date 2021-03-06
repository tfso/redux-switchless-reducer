import { Reducer, Action } from 'redux'
import { createAction, PayloadAction } from './createAction'
import { createReducer, CaseReducers, CaseReducer } from './createReducer'

/**
 * An action creator atttached to a namespace.
 */
export type NamespaceActionCreator<P> = (P extends void
	? () => Action<string>
	: (payload: P) => PayloadAction<P, string>
) & {type: string}

export interface SwitchlessReducer<
	S = any,
	AP extends { [key: string]: any } = { [key: string]: any }
	> {
	namespace: string
	reducer: Reducer<S>
	actions: { [type in keyof AP]: NamespaceActionCreator<AP[type]> }
}

/**
 * Options for `createSwitchlessReducer()`.
 */
export interface CreateSwitchlessReducerOptions<
	S = any,
	CR extends CaseReducers<S, any> = CaseReducers<S, any>
	> {
	namespace: string
	initialState: S

	/**
	 * A mapping from action types to action-type-specific *case reducer*
	 * functions. For every action type, a matching action creator will be
	 * generated using `createAction()`.
	 */
	reducers?: CR

	/**
	 * A mapping from action types to action-type-specific *case reducer*
	 * functions. These reducers should have existing action types used
	 * as the keys, and action creators will _not_ be generated.
	 */
	extraReducers?: CaseReducers<S, any>

	/**
	 * Invoked *after* the `reducers` if the action dispatched is in the same namespace.
	 * Should not return a new state object unless this reducer produces something to the state.
	 */
	namespaceReducer?: CaseReducer<S, any>

	/**
	 * Invoked *after* `namespaceReducer` and `reducers` for all actions dispatched to redux.
	 * Should not return a new state object unless this reducer produces something to the state.
	 */
	globalReducer?: CaseReducer<S, any>
}

type CaseReducerActionPayloads<CR extends CaseReducers<any, any>> = {
	[T in keyof CR]: CR[T] extends (state: any) => any
	? void
	: (CR[T] extends (state: any, action: PayloadAction<infer P>) => any
		? P
		: void)
}

function enhanceReducer<
	S, TReducer extends Reducer<S>
>(
	namespace: string,
	reducer: TReducer,
	namespaceReducer?: CaseReducer<S, any>,
	globalReducer?: CaseReducer<S, any>
): Reducer<S> {
	if(!namespaceReducer && !globalReducer) return reducer

	// Empty namespace and no globalAction, we can't use a namespaceReducer when namespace is empty, consider throwing error or warning?
	if(!globalReducer && namespace.length === 0) return reducer

	return (state, action) => {
		let nextState = reducer(state, action)
		if(namespaceReducer && namespace.length > 0 && action.type.startsWith(namespace)){
			nextState = namespaceReducer(nextState, action)
		}
		if(globalReducer){
			nextState = globalReducer(nextState, action)
		}
		return nextState
	}
}


function getType(namespace: string, actionKey: string): string {
	return namespace ? `${namespace}.${actionKey}` : actionKey
}

/**
 * A function that accepts an initial state, an object full of reducer
 * functions, a namespace, and automatically generates
 * action creators, and action types that correspond to the
 * reducers and state.
 *
 * The `reducer` argument is passed to `createReducer()`.
 */
export function createSwitchlessReducer<S, CR extends CaseReducers<S, any>>(
	options: CreateSwitchlessReducerOptions<S, CR>
): SwitchlessReducer<S, CaseReducerActionPayloads<CR>> {
	const { namespace, initialState, namespaceReducer, globalReducer } = options
	const reducers = options.reducers || {} as CaseReducers<S, any>
	const extraReducers = options.extraReducers || {}

	const actionKeys = Object.keys(reducers)

	const reducerMap = actionKeys.reduce((map, actionKey) => {
		map[getType(namespace, actionKey)] = reducers[actionKey]
		return map
	}, extraReducers)

	const reducer = enhanceReducer(namespace, createReducer(initialState, reducerMap), namespaceReducer, globalReducer)

	const actions = actionKeys.reduce((map, action) => {
		const type = getType(namespace, action)
		map[action] = createAction(type)
		return map
	}, {} as any)

	return {
		namespace,
		reducer,
		actions
	}
}
