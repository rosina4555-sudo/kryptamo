import { describe, expect, it } from 'vitest'
import { HUMAN_STEPS, isFailed, isTerminal, stateLabel, stepIndex, stepStatus } from './states'

describe('transfer state machine', () => {
  it('maps each backend state to a plain progress label', () => {
    expect(stateLabel('FUNDING_PENDING')).toBe('Awaiting payment')
    expect(stateLabel('ONCHAIN_TRANSFER')).toBe('Preparing your transfer')
    expect(stateLabel('PAID_OUT')).toBe('Delivered')
    expect(stateLabel('FAILED')).toBe('Transfer failed')
  })

  it('collapses the on/off-ramp states into one human step', () => {
    expect(stepIndex('ONRAMP_EXECUTING')).toBe(1)
    expect(stepIndex('ONCHAIN_TRANSFER')).toBe(1)
    expect(stepIndex('OFFRAMP_EXECUTING')).toBe(1)
  })

  it('does not count payment until the transfer is funded', () => {
    expect(stepIndex('FUNDING_PENDING')).toBe(-1)
    expect(stepIndex('FUNDED')).toBe(0)
    expect(stepIndex('PAYOUT_INITIATED')).toBe(2)
    expect(stepIndex('PAID_OUT')).toBe(3)
  })

  it('describes four human steps', () => {
    expect(HUMAN_STEPS).toHaveLength(4)
    expect(HUMAN_STEPS[3].label).toBe('Delivered')
  })

  it('marks step status relative to the current state', () => {
    expect(stepStatus('OFFRAMP_EXECUTING', 0)).toBe('done')
    expect(stepStatus('OFFRAMP_EXECUTING', 1)).toBe('now')
    expect(stepStatus('OFFRAMP_EXECUTING', 3)).toBe('waiting')
  })

  it('reports terminal and failed states', () => {
    expect(isTerminal('PAID_OUT')).toBe(true)
    expect(isTerminal('FAILED')).toBe(true)
    expect(isTerminal('FUNDED')).toBe(false)
    expect(isFailed('FAILED')).toBe(true)
    expect(isFailed('PAID_OUT')).toBe(false)
  })
})
