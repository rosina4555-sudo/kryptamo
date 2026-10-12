export const TRANSFER_STATES = [
  'FUNDING_PENDING',
  'FUNDED',
  'ONRAMP_EXECUTING',
  'ONCHAIN_TRANSFER',
  'OFFRAMP_EXECUTING',
  'PAYOUT_INITIATED',
  'PAID_OUT',
]

export const STATE_LABELS = {
  FUNDING_PENDING: 'Awaiting payment',
  FUNDED: 'Payment received',
  ONRAMP_EXECUTING: 'Preparing your transfer',
  ONCHAIN_TRANSFER: 'Preparing your transfer',
  OFFRAMP_EXECUTING: 'Preparing your transfer',
  CONVERTING_OFFRAMP: 'Preparing your transfer',
  PAYOUT_INITIATED: 'Sending to Mobile Money',
  PAID_OUT: 'Delivered',
  FAILED: 'Transfer failed',
}

export const HUMAN_STEPS = [
  { label: 'Payment received' },
  { label: 'Preparing your transfer' },
  { label: 'Sending to Mobile Money' },
  { label: 'Delivered' },
]

const STEP_INDEX = {
  FUNDING_PENDING: -1,
  FUNDED: 0,
  ONRAMP_EXECUTING: 1,
  ONCHAIN_TRANSFER: 1,
  OFFRAMP_EXECUTING: 1,
  CONVERTING_OFFRAMP: 1,
  PAYOUT_INITIATED: 2,
  PAID_OUT: 3,
  FAILED: -2,
}

export function stepIndex(state) {
  return STEP_INDEX[state] ?? -1
}

export function stateLabel(state) {
  return STATE_LABELS[state] ?? 'In progress'
}

export function isTerminal(state) {
  return state === 'PAID_OUT' || state === 'FAILED'
}

export function isFailed(state) {
  return state === 'FAILED'
}

export function stepStatus(state, index) {
  if (state === 'FAILED') return index === 0 ? 'now' : 'waiting'
  const current = stepIndex(state)
  if (current === -1) return 'waiting'
  if (index < current) return 'done'
  if (index === current) return 'now'
  return 'waiting'
}
