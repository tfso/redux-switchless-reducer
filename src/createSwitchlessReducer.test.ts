import { createSwitchlessReducer } from './createSwitchlessReducer'
import { createAction } from './createAction'

describe('createSwitchlessReducer', () => {
    describe('when passing namespace', () => {
        const { actions, reducer } = createSwitchlessReducer({
            reducers: {
                increment: state => state + 1
            },
            initialState: 0,
            namespace: 'cool'
        })

        it('should create increment action', () => {
            expect(actions.hasOwnProperty('increment')).toBe(true)
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
})
