import PropTypes from 'prop-types'
import React, { useCallback, useMemo, memo } from 'react'

import Variation from './Variation'
import hash from 'object-hash'

import styles from '../styles.css'
import { variationShape } from '../utils/proptypes'

/** Renders the main and the secondary variation, if it exists. */
const SKUSelector = ({
  seeMoreLabel,
  maxItems,
  variations,
  stateMachine,
  currentStateHash,
}) => {
  const { states: stateMachineStates } = stateMachine
  const stateMachineState = stateMachineStates[currentStateHash]
  const { on: transitions, variations: selectedVariations } = stateMachineState

  const onSelectItem = useCallback(actionHash => () => stateMachine.interpret.send(actionHash), [stateMachine])
  const variationsWithOptions = useMemo(() => Object.keys(variations).map((variationName) => { 
    const selectedItem = selectedVariations[variationName]
    const options = variations[variationName].reduce(
      (accumulator, label) => {
        const selected = selectedItem === label

        const actionHash = hash({
          variation: variationName,
          label: selected ? null : label,
        })

        const nextStateHash = transitions[actionHash]

        if (nextStateHash || selected) {
          const available = selected
            ? stateMachineState.available
            : stateMachineStates[nextStateHash].available

          const images = selected ? stateMachineState.images : stateMachineStates[nextStateHash].images

          accumulator.push({
            label,
            available,
            images,
            onSelectItem: onSelectItem(actionHash),
          })
        }
        return accumulator
      },
      []
    )
    return {
      name: variationName,
      options,
    }
  }), [variations, currentStateHash, stateMachine])

  return (
    <div className={styles.skuSelectorContainer}>
      {variationsWithOptions.map((variationOption, index) => {
        const selectedItem = selectedVariations[variationOption.name]
        return (
          <Variation
            key={`${variationOption.name}-${index}`}
            variation={variationOption}
            selectedItem={selectedItem}
            maxItems={maxItems}
            seeMoreLabel={seeMoreLabel}
          />
        )
      })}
    </div>
  )
}

SKUSelector.propTypes = {
  /** Function to go to the product page of a given sku */
  onSelectSKU: PropTypes.func.isRequired,
  /** Max price find on the sku list */
  maxSkuPrice: PropTypes.number,
  seeMoreLabel: PropTypes.string,
  maxItems: PropTypes.number,
  // Variations object
  variations: variationShape,
  // State machine
  stateMachine: PropTypes.object,
  // Hash of current state of state machine
  currentStateHash: PropTypes.string,
}

export default memo(SKUSelector)
