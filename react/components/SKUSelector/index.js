import PropTypes from 'prop-types'
import React, { useState, useEffect, useMemo, memo } from 'react'
import { useRuntime } from 'vtex.render-runtime'

import SKUSelector from './components/SKUSelector'
import { skuShape } from './utils/proptypes'
import {
  parseSku,
} from './utils'

import useStateMachine from './useStateMachine'

/**
 * Display a list of SKU items of a product and its specifications.
 */
const SKUSelectorContainer = ({
  skuItems = [],
  onSKUSelected,
  seeMoreLabel,
  maxItems,
  variations,
  skuSelected,
}) => {
  const [currentStateHash, setCurrentHash] = useState(null)

  const { setQuery } = useRuntime()
  const redirectToSku = (skuId) => {
    setQuery(
      { skuId },
      {
        replace: true,
      }
    )
  }

  const parsedItems = useMemo(() => skuItems.map(parseSku), [skuItems])
  const parsedSkuSelected = useMemo(() => (skuSelected && parseSku(skuSelected)), [skuSelected])

  const { stateMachine, initialHash } = useStateMachine(parsedItems, variations, parsedSkuSelected)

  const handleStateTransition = state => {
    const stateMachineStateHash = state.value
    setCurrentHash(stateMachineStateHash)

    if (!skuSelected) {
      return
    }

    const stateMachineState = stateMachine.states[stateMachineStateHash]
    const { skuId } = stateMachineState

    if (onSKUSelected) {
      onSKUSelected(skuId)
    } else {
      redirectToSku(skuId)
    }
  }

  useEffect(() => {
    setCurrentHash(initialHash)
    stateMachine.interpret.onTransition(handleStateTransition).start()
  }, [])

  if (!currentStateHash) {
    return null
  }

  return (
    <SKUSelector
      variations={variations}
      seeMoreLabel={seeMoreLabel}
      maxItems={maxItems}
      stateMachine={stateMachine}
      currentStateHash={currentStateHash}
    />
  )
}

SKUSelectorContainer.propTypes = {
  /** SKU selected */
  skuSelected: skuShape,
  /** List of SKU Items */
  skuItems: PropTypes.arrayOf(skuShape).isRequired,
  /** Callback that is called when an SKU is selected */
  onSKUSelected: PropTypes.func,
  seeMoreLabel: PropTypes.string,
  maxItems: PropTypes.number,

  /** Object with dynamic keys, with keys being the name of variations and its values being an array of possible values.
   * Example: { "size": ["small", "medium", "large"], "color": ["blue", "yellow"] }
   */
  variations: PropTypes.object,

  skuSelected: skuShape,
}

SKUSelectorContainer.defaultProps = {
  maxItems: 10,
}

export default memo(SKUSelectorContainer)
