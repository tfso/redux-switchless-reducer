import { createSwitchlessReducer } from './createSwitchlessReducer'
import { createAction } from './createAction'

describe('createSwitchlessReducer', () => {
    describe('when passing namespace', () => {
        const { actions, reducer } = createSwitchlessReducer({
            reducers: {
                increment: state => state + 1,
                foo: (_state, action: {bar: string}) => action.bar.length
            },
            initialState: 0,
            namespace: 'cool'
        })

        it('should create increment action', () => {
            expect(actions.hasOwnProperty('increment')).toBe(true)
        })

        it('should set type on actions', () => {
            expect(actions.foo.type).toBe('cool.foo')
            expect(actions.increment.type).toBe('cool.increment')
        })

        it('should have the correct action for increment', () => {
            expect(actions.increment()).toEqual({
                type: 'cool.increment',
                payload: undefined
            })
        })

        it('should return the correct value from reducer', () => {
            expect(reducer(undefined, actions.increment())).toEqual(1)
        })
    })

    describe('when passing extra reducers', () => {
        const addMore = createAction('ADD_MORE')

        const { reducer } = createSwitchlessReducer({
            namespace: 'foo',
            reducers: {
                increment: state => state + 1,
                multiply: (state, action) => state * action.payload
            },
            extraReducers: {
                [addMore.type]: (state, action) => state + action.payload.amount
            },
            initialState: 0
        })

        it('should call extra reducers when their actions are dispatched', () => {
            const result = reducer(10, addMore({ payload: { amount: 5 } }))

            expect(result).toBe(15)
        })
    })

    describe('when providing namespaceReducer', () => {
        const { reducer, actions } = createSwitchlessReducer({
            namespace: 'foo',
            initialState: 0,
            reducers: {
                increment: (state, _action: {payload: {factor: number}}) => state + 1
            },
            namespaceReducer: (state, {payload}) => state + payload.factor
        })

        it('should invoke namespaceReducer for all actions in the namespace', () => {
            const result = reducer(0, actions.increment({payload: {factor: 0.1}}))

            expect(result).toBe(1.1)
        })

        it('should not invoke namespaceReducer for actions not in the namespace', () => {
            const result = reducer(0, {type: 'bar'})
            
            expect(result).toBe(0) // could've been 0.1 if namespaceReducer was invoked
        })
    })

    describe('when providing globalReducer', () => {
        const {reducer} = createSwitchlessReducer({
            namespace: 'foo',
            initialState: {
                value: 0,
                globalInvoked: false
            },
            reducers: {},
            globalReducer: (state, action) => {
                if(action.foo){
                    return {...state, globalInvoked: true, value: 42}
                }
                return {...state, globalInvoked: true}
            }
        })

        it('should invoke globalReducer for all actions', () => {
            const result = reducer({value: 0, globalInvoked: false}, {type: 'anyaction', foo: true})
            expect(result.globalInvoked).toBe(true)
        })
    })
})
