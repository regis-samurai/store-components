import PropTypes from 'prop-types'
import React, { useCallback, useMemo, memo, Fragment } from 'react'

import Variation from './Variation'
import { variationShape } from '../utils/proptypes'
import hash from 'object-hash'

import styles from '../styles.css'

/** Renders the main and the secondary variation, if it exists. */
const SKUSelector = ({
  seeMoreLabel,
  maxItems,
  variations,
  stateMachine,
  currentStateHash,
}) => {
  console.log('testa SKUSelector RENDER')
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

  console.log('teste variationsWithOptions: ', variationsWithOptions)

  return (
    <Fragment>
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
    </Fragment>
  )
}

SKUSelector.propTypes = {
  /** Function to go to the product page of a given sku */
  onSelectSKU: PropTypes.func.isRequired,
  /** Name and list of options of the main variation */
  mainVariation: variationShape,
  /** Name and list of options of the secondary variation */
  secondaryVariation: variationShape,
  /** Max price find on the sku list */
  maxSkuPrice: PropTypes.number,
  /** If true, show secondary options (if present), even when main variation is not picked yet */
  alwaysShowSecondary: PropTypes.bool,
  seeMoreLabel: PropTypes.string,
  maxItems: PropTypes.number,
}

export default memo(SKUSelector)
