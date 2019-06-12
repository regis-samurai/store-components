import { partition, path,compose, gt, flip } from 'ramda'
import { Machine } from 'xstate'
import { interpret } from 'xstate/lib/interpreter'
import hash from 'object-hash'
import { isColor } from './utils'
import { useMemo } from 'react'

const getSkuPrice = path(['sellers', '0', 'commertialOffer', 'Price'])
const isSkuAvailable = compose(flip(gt)(0), path(['sellers', '0', 'commertialOffer', 'AvailableQuantity']))

const getDifferentVariation = (stateA, stateB) => {
  let counter = 0
  let differentVariation = null

  Object.keys(stateA).forEach(variation => {
    if (stateA[variation] !== stateB[variation]) {
      counter++
      differentVariation = variation
    }
  })

  if (counter === 1) return differentVariation
}

const useStateMachine = (skus, variations, skuSelected) => {
  const stateMachine = useMemo(() => {
    console.log('testa STATE MACHINE!!!')
    const [visualVariations, standardVariations] = partition(isColor, Object.keys(variations))
    const stateMachine = {
      id: 'SKUSelector',
      states: {},
      transitions: {},
    }
    const { states, transitions } = stateMachine
    const bitMaskLimit = 1 << standardVariations.length
    skus.forEach(sku => {
      for (let bitMask = 0; bitMask < bitMaskLimit; bitMask++) {
        const state = { variations: {} }

        visualVariations.forEach(
          variation => (state.variations[variation] = sku[variation])
        )
        standardVariations.forEach((variation, variationIndex) => {
          if ((1 << variationIndex) & bitMask)
            state.variations[variation] = sku[variation]
          else state.variations[variation] = null
        })
        const stateKey = hash(state.variations)

        if (bitMask === 0 && !stateMachine.initial)
          stateMachine.initial = stateKey

        if (!states[stateKey] || !states[stateKey].available) {
          if (!states[stateKey]) states[stateKey] = {}

          states[stateKey].variations = state.variations
          states[stateKey].skuId = sku.itemId
          states[stateKey].available = isSkuAvailable(sku)
          states[stateKey].images = sku.images
        }

        if (isSkuAvailable(sku)) {
          const skuPrice = getSkuPrice(sku)
          if (states[stateKey].price) {
            const { value, notUnique } = states[stateKey].price

            states[stateKey].price.notUnique =
              notUnique || skuPrice !== value

            states[stateKey].price.value = Math.min(value, skuPrice)
          } else {
            states[stateKey].price = { value: skuPrice }
          }
        }
      }
    })
    Object.keys(states).forEach(keyA => {
      states[keyA].on = {}

      Object.keys(states).forEach(keyB => {
        const stateA = states[keyA].variations
        const stateB = states[keyB].variations

        const differentVariation = getDifferentVariation(stateA, stateB)
        if (!differentVariation) return

        const action = {
          variation: differentVariation,
          label: stateB[differentVariation],
        }

        const actionHash = hash(action)
        transitions[actionHash] = action
        states[keyA].on[actionHash] = keyB
      })    
    })
    const selectedVariations = skuSelected && Object.keys(variations).reduce((acc, variationName) => {
      return {
        ...acc,
        [variationName]: skuSelected[variationName] ? skuSelected[variationName] : null,
      }
    }, {})
    if (selectedVariations) {
      stateMachine.initial = hash(selectedVariations)
    }
    
    const machine = Machine(stateMachine)
    stateMachine.interpret = interpret(machine)
    return stateMachine
    }, [skus, variations])

  return { stateMachine, initialHash: stateMachine.initial }
}

export default useStateMachine
