import * as React from 'react'

/**
 * Orientation of the stepper.
 */
export type StepperOrientation = 'horizontal' | 'vertical'

/**
 * Size of the stepper.
 */
export type StepperSize = 'sm' | 'md' | 'lg'

/**
 * Placement of the step labels.
 */
export type StepperLabelPlacement = 'below' | 'side'

/**
 * Configuration for a single step.
 *
 * - `label` is always required and is announced to assistive tech.
 * - `icon` can be a React node, a string (treated as text), or a string URL (treated as an image).
 * - `completedIcon` overrides the completed indicator for this step.
 */
export type StepConfig = {
  label: string
  icon?: React.ReactNode | string
  completedIcon?: React.ReactNode
  completed?: boolean
  color?: string
  completedColor?: string
  skipped?: boolean
  disabled?: boolean
}

/**
 * State of a single step.
 */
export type StepState = {
  index: number
  isActive: boolean
  isCompleted: boolean
  isPassed: boolean
  isSkipped: boolean
  isDisabled: boolean
}

export type StepperClassNames = Partial<{
  root: string
  list: string
  step: string
  stepInner: string
  stepButton: string
  stepIndicator: string
  stepLabel: string
  connector: string
  activeStep: string
  completedStep: string
  skippedStep: string
  disabledStep: string
}>

/**
 * Props for the `Stepper` component.
 *
 * Accessibility notes:
 * - The step list supports keyboard navigation (Arrow keys, Home/End).
 * - Each step is rendered as a button when `onStepClick` is provided.
 * - The currently active step uses `aria-current="step"`.
 */
export type StepperProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  steps: StepConfig[]
  activeStep: number
  orientation?: StepperOrientation
  size?: StepperSize
  labelPlacement?: StepperLabelPlacement
  color?: string
  stepColor?: string
  completedColor?: string
  completedStepColor?: string
  connectorColor?: string
  connectorCompletedColor?: string
  completedIcon?: React.ReactNode
  skipIcon?: React.ReactNode
  skippedSteps?: number[]
  disabled?: boolean
  onStepClick?: (index: number) => void
  classNames?: StepperClassNames
  style?: StepperStyle
}

/**
 * Style object for the stepper.
 */
type StepperStyle = React.CSSProperties & {
  ['--stepper-active']?: string
  ['--stepper-complete']?: string
  ['--stepper-connector']?: string
  ['--stepper-connector-complete']?: string
  ['--stepper-disabled']?: string
  ['--stepper-text']?: string
  ['--stepper-muted']?: string
  ['--stepper-border']?: string
  ['--stepper-surface']?: string
}

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(' ')
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function isFocusableStep(state: StepState) {
  return !state.isDisabled
}

function getNextFocusableIndex(states: StepState[], from: number, dir: 1 | -1) {
  const total = states.length
  if (total === 0) return -1

  let i = from
  for (let tries = 0; tries < total; tries++) {
    i = (i + dir + total) % total
    if (isFocusableStep(states[i]!)) return i
  }

  return -1
}

function isLikelyImageSrc(value: string) {
  const v = value.trim()
  if (v.startsWith('http://') || v.startsWith('https://')) return true
  if (v.startsWith('/')) return true
  if (v.includes('data:image/')) return true
  return /\.(svg|png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(v)
}

function toIconNode(icon: StepConfig['icon']) {
  if (typeof icon === 'string') {
    if (isLikelyImageSrc(icon)) {
      return <img src={icon} alt="" style={{ width: '1em', height: '1em' }} />
    }
    return icon
  }
  return icon
}

/**
 * Computes derived state for each step (active/completed/skipped/disabled).
 *
 * `activeStep` represents the current step index.
 * Steps with index `< activeStep` are treated as completed (unless skipped).
 */
export function useStepperState(params: {
  steps: StepConfig[]
  activeStep: number
  skippedSteps?: number[]
  disabled?: boolean
}) {
  const { steps, activeStep, skippedSteps, disabled } = params

  return React.useMemo(() => {
    const lastIndex = Math.max(0, steps.length - 1)
    const completedUntil = clamp(activeStep, 0, steps.length)
    let safeActive = clamp(completedUntil, 0, lastIndex)

    const isDisabledAt = (index: number) => Boolean(disabled || steps[index]?.disabled)
    if (steps.length > 0 && completedUntil < steps.length && isDisabledAt(safeActive)) {
      let found = -1
      for (let i = safeActive; i >= 0; i--) {
        if (!isDisabledAt(i)) {
          found = i
          break
        }
      }
      if (found === -1) {
        for (let i = safeActive + 1; i < steps.length; i++) {
          if (!isDisabledAt(i)) {
            found = i
            break
          }
        }
      }
      if (found >= 0) safeActive = found
    }

    const hasActive = steps.length > 0 && completedUntil < steps.length

    const skippedSet = new Set<number>(skippedSteps ?? [])
    const states: StepState[] = steps.map((step, index) => {
      const isDisabled = Boolean(disabled || step.disabled)
      const isSkipped = Boolean(step.skipped || skippedSet.has(index))
      const isCompletedExplicit = Boolean(step.completed)
      const isPassed = !isSkipped && index < completedUntil
      return {
        index,
        isActive: hasActive ? index === safeActive : false,
        isCompleted: !isSkipped && (isCompletedExplicit || index < completedUntil),
        isPassed,
        isSkipped,
        isDisabled,
      }
    })

    return { activeIndex: safeActive, states }
  }, [steps, activeStep, skippedSteps, disabled])
}

/**
 * Lightweight stepper component.
 *
 * Styling:
 * - By default it injects its CSS once (via the `import './stepper.css'` in the package entry).
 * - `color` / `completedColor` map to CSS variables `--stepper-active` and `--stepper-complete`.
 */
export function Stepper(props: StepperProps) {
  const {
    steps,
    activeStep,
    orientation = 'horizontal',
    size = 'md',
    labelPlacement = orientation === 'horizontal' ? 'below' : 'side',
    color,
    stepColor,
    completedColor,
    completedStepColor,
    connectorColor,
    connectorCompletedColor,
    completedIcon,
    skipIcon,
    skippedSteps,
    disabled,
    onStepClick,
    className,
    classNames,
    style,
    ...divProps
  } = props

  const { activeIndex, states } = useStepperState({
    steps,
    activeStep,
    skippedSteps,
    disabled,
  })

  // We keep a ref per step button to implement roving tabIndex and arrow-key navigation.
  const baseId = React.useId()
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const stepButtonRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  const isClickable = Boolean(onStepClick) && !disabled

  const tabbableIndex = React.useMemo(() => {
    const active = states[activeIndex]
    if (active && isFocusableStep(active)) return activeIndex
    return states.findIndex(isFocusableStep)
  }, [states, activeIndex])

  const setStepButtonRef = React.useCallback((index: number) => {
    return (node: HTMLButtonElement | null) => {
      stepButtonRefs.current[index] = node
    }
  }, [])

  const focusStep = React.useCallback(
    (index: number) => {
      stepButtonRefs.current[index]?.focus()
    },
    [stepButtonRefs],
  )

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const activeEl = document.activeElement
    if (activeEl && root.contains(activeEl)) {
      if (tabbableIndex >= 0) focusStep(tabbableIndex)
    }
  }, [tabbableIndex, focusStep])

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const key = event.key

      // Enter/Space activates the focused step when the stepper is clickable.
      if ((key === 'Enter' || key === ' ') && isClickable) {
        const focusedIndex = stepButtonRefs.current.findIndex((el) => el === document.activeElement)
        if (focusedIndex >= 0) {
          const targetState = states[focusedIndex]
          if (targetState && !targetState.isDisabled) {
            event.preventDefault()
            onStepClick?.(focusedIndex)
          }
        }
        return
      }

      const isHorizontal = orientation === 'horizontal'
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp'
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown'

      if (key !== prevKey && key !== nextKey && key !== 'Home' && key !== 'End') {
        return
      }

      const focusedIndex = stepButtonRefs.current.findIndex((el) => el === document.activeElement)
      const baseIndex = focusedIndex >= 0 ? focusedIndex : activeIndex
      const current = clamp(baseIndex, 0, states.length - 1)
      let next = current

      if (key === prevKey) next = getNextFocusableIndex(states, current, -1)
      if (key === nextKey) next = getNextFocusableIndex(states, current, 1)
      if (key === 'Home') next = states.findIndex(isFocusableStep)
      if (key === 'End') {
        for (let i = states.length - 1; i >= 0; i--) {
          if (isFocusableStep(states[i]!)) {
            next = i
            break
          }
        }
      }

      if (next < 0 || next === current) return

      event.preventDefault()
      focusStep(next)
    },
    [activeIndex, states, orientation, focusStep, isClickable, onStepClick],
  )

  const rootStyle: StepperStyle = {
    ...(style as StepperStyle),
    ...((stepColor ?? color) ? { ['--stepper-active']: stepColor ?? color } : null),
    ...((completedStepColor ?? completedColor)
      ? { ['--stepper-complete']: completedStepColor ?? completedColor }
      : null),
    ...(connectorColor ? { ['--stepper-connector']: connectorColor } : null),
    ...((connectorCompletedColor ?? completedStepColor ?? completedColor)
      ? {
          ['--stepper-connector-complete']:
            connectorCompletedColor ?? completedStepColor ?? completedColor,
        }
      : null),
  }

  const activeLabel = steps[activeIndex]?.label ?? ''
  const useCssContinuityConnectors =
    (orientation === 'horizontal' && labelPlacement === 'below') || orientation === 'vertical'

  return (
    <div
      {...divProps}
      ref={rootRef}
      className={
        cx(
          'stepper',
          `stepper--${orientation}`,
          `stepper--${size}`,
          `stepper--label-${labelPlacement}`,
          useCssContinuityConnectors && 'stepper--continuity',
          className,
          classNames?.root,
        )
      }
      style={rootStyle}
    >
      <div className="stepper__srOnly" aria-live="polite" aria-atomic="true">
        {activeLabel ? `Current step: ${activeLabel}` : ''}
      </div>

      <ol
        className={cx('stepper__list', classNames?.list)}
        role="list"
        aria-orientation={orientation}
        onKeyDown={onKeyDown}
      >
        {steps.map((step, index) => {
          const state = states[index]!
          const stepId = `${baseId}-step-${index}`
          const labelId = `${baseId}-label-${index}`

          const stepActiveColor = step.color
          const stepCompleteColor = step.completedColor ?? step.color
          const stepVars =
            stepActiveColor || stepCompleteColor
              ? ({
                  ['--stepper-step-active']: stepActiveColor,
                  ['--stepper-step-complete']: stepCompleteColor,
                } as React.CSSProperties)
              : undefined

          const stepClassName = cx(
            'stepper__step',
            state.isActive && 'stepper__step--active',
            state.isCompleted && 'stepper__step--completed',
            state.isPassed && 'stepper__step--passed',
            state.isSkipped && 'stepper__step--skipped',
            state.isDisabled && 'stepper__step--disabled',
            state.isActive && classNames?.activeStep,
            state.isCompleted && classNames?.completedStep,
            state.isSkipped && classNames?.skippedStep,
            state.isDisabled && classNames?.disabledStep,
            classNames?.step,
          )

          const indicator = state.isCompleted
            ? (step.completedIcon ?? completedIcon ?? '✓')
            : state.isSkipped
              ? (skipIcon ?? step.icon)
              : step.icon
                ? toIconNode(step.icon)
                : index + 1

          const defaultIndicator = (
            <span
              className={cx('stepper__indicator', classNames?.stepIndicator)}
              aria-hidden="true"
            >
              {indicator}
            </span>
          )

          const defaultLabel = (
            <span className={cx('stepper__label', classNames?.stepLabel)}>
              <span id={labelId} className="stepper__labelText">
                {step.label}
              </span>
            </span>
          )

          const canClickThis = Boolean(onStepClick) && !disabled && !state.isDisabled
          const isStepDisabled = Boolean(disabled || state.isDisabled)

          const defaultButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
            type: 'button',
            id: stepId,
            'aria-current': state.isActive ? 'step' : undefined,
            'aria-disabled': isStepDisabled ? true : undefined,
            onClick: canClickThis ? () => onStepClick?.(index) : undefined,
            tabIndex: index === tabbableIndex ? 0 : -1,
          }

          const buttonRef = setStepButtonRef(index)

          const connectorNeeded = index < steps.length - 1
          const nextState = connectorNeeded ? states[index + 1]! : undefined

          const connectorVars =
            step.color || step.completedColor
              ? ({
                  ...(step.color ? { ['--stepper-connector']: step.color } : null),
                  ...((step.completedColor ?? step.color)
                    ? {
                        ['--stepper-connector-complete']: step.completedColor ?? step.color,
                      }
                    : null),
                } as React.CSSProperties)
              : undefined

          const connectorSlotProps: React.HTMLAttributes<HTMLDivElement> = {
            className: 'stepper__connectorSlot',
            'aria-hidden': true,
            style: connectorVars,
          }

          const defaultConnectorClassName = cx('stepper__connector', classNames?.connector)

          const defaultConnectorProps: React.HTMLAttributes<HTMLDivElement> = {
            className: defaultConnectorClassName,
            'aria-hidden': true,
          }

          const defaultConnector = (
            <div
              {...defaultConnectorProps}
              className={cx(
                defaultConnectorClassName,
                state.isPassed && 'stepper__connector--completed',
              )}
            />
          )

          return (
            <React.Fragment key={index}>
              <li
                className={stepClassName}
                role="listitem"
                aria-labelledby={labelId}
                style={stepVars}
              >
                <div
                  className={cx('stepper__stepInner', classNames?.stepInner)}
                >
                  <button
                    {...defaultButtonProps}
                    ref={buttonRef}
                    className={cx('stepper__button', classNames?.stepButton)}
                  >
                    {defaultIndicator}
                    {defaultLabel}
                  </button>
                </div>
              </li>

              {connectorNeeded && nextState && !useCssContinuityConnectors ? (
                <div {...connectorSlotProps}>
                  {defaultConnector}
                </div>
              ) : null}
            </React.Fragment>
          )
        })}
      </ol>
    </div>
  )
}
