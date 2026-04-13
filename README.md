# react-stepper-lite

Lightweight, production-friendly React stepper.

What you get:

- **Good defaults**: works out of the box.
- **Accessible**: roving focus + keyboard navigation.
- **Easy to customize**: CSS variables, `classNames`, and per-step overrides.

## Screenshots

Horizontal

![Horizontal stepper](https://raw.githubusercontent.com/prathmesh-jain/react-stepper-lite/main/assets/stepper-horizontal.png)

Vertical

![Vertical stepper](https://raw.githubusercontent.com/prathmesh-jain/react-stepper-lite/main/assets/stepper-vertical.png)

## Install

```bash
npm i react-stepper-lite
```

Peer deps:

- `react`
- `react-dom`

## Quick start

```tsx
import { useState } from 'react'
import { Stepper, type StepConfig } from 'react-stepper-lite'

const steps: StepConfig[] = [{ label: 'Login' }, { label: 'Address' }, { label: 'Payment' }]

export function Example() {
  const [activeStep, setActiveStep] = useState(0)

  return <Stepper steps={steps} activeStep={activeStep} onStepClick={setActiveStep} />
}
```

`Stepper` is controlled: you own `activeStep`, and `onStepClick` is optional.

## Examples

### 1) Basic (non-clickable)

Useful when you have your own “Next” / “Back” buttons and just want a visual indicator.

```tsx
import { useState } from 'react'
import { Stepper, type StepConfig } from 'react-stepper-lite'

const steps: StepConfig[] = [{ label: 'Login' }, { label: 'Address' }, { label: 'Payment' }]

export function NonClickable() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Stepper steps={steps} activeStep={activeStep} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setActiveStep((s) => Math.max(0, s - 1))}>
          Back
        </button>
        <button type="button" onClick={() => setActiveStep((s) => Math.min(steps.length, s + 1))}>
          Next
        </button>
      </div>
    </div>
  )
}
```

### 2) Clickable steps

When you pass `onStepClick`, step buttons become interactive (click + Enter/Space).

```tsx
import { useState } from 'react'
import { Stepper, type StepConfig } from 'react-stepper-lite'

const steps: StepConfig[] = [{ label: 'Login' }, { label: 'Address' }, { label: 'Payment' }]

export function Clickable() {
  const [activeStep, setActiveStep] = useState(1)

  return <Stepper steps={steps} activeStep={activeStep} onStepClick={setActiveStep} />
}
```

### 3) Vertical stepper

```tsx
import { useState } from 'react'
import { Stepper, type StepConfig } from 'react-stepper-lite'

const steps: StepConfig[] = [{ label: 'Account' }, { label: 'Profile' }, { label: 'Done' }]

export function Vertical() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <Stepper
      steps={steps}
      activeStep={activeStep}
      onStepClick={setActiveStep}
      orientation="vertical"
      labelPlacement="side"
    />
  )
}
```

### 4) Prev / Next / Skip

“Skipped” is different from “not completed”. Future steps are not completed, but they are not skipped.

```tsx
import { useMemo, useState } from 'react'
import { Stepper, type StepConfig } from 'react-stepper-lite'

export function SkipExample() {
  const steps = useMemo<StepConfig[]>(
    () => [{ label: 'Login' }, { label: 'Address' }, { label: 'Payment' }, { label: 'Confirm' }],
    [],
  )

  const [activeStep, setActiveStep] = useState(0)
  const [skippedSteps, setSkippedSteps] = useState<number[]>([])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Stepper
        steps={steps}
        activeStep={activeStep}
        skippedSteps={skippedSteps}
        labelPlacement="below"
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setActiveStep((s) => Math.max(0, s - 1))}>
          Prev
        </button>
        <button type="button" onClick={() => setActiveStep((s) => Math.min(steps.length, s + 1))}>
          Next
        </button>
        <button
          type="button"
          onClick={() => {
            setSkippedSteps((prev) => (prev.includes(activeStep) ? prev : [...prev, activeStep]))
            setActiveStep((s) => Math.min(steps.length, s + 1))
          }}
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveStep(0)
            setSkippedSteps([])
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
```

### 5) Icons + per-step overrides

You can set icons and override colors per step.

`icon` can be:

- a React node
- a string (treated as text)
- a string URL/path (treated as an image)

```tsx
import { useState } from 'react'
import { Stepper, type StepConfig } from 'react-stepper-lite'

const steps: StepConfig[] = [
  { label: 'Login', icon: '1', color: '#2563eb' },
  { label: 'Address', icon: '2', completedColor: '#16a34a' },
  { label: 'Payment', icon: 'https://raw.githubusercontent.com/prathmesh-jain/react-stepper-lite/main/assets/stepper-horizontal.png' },
  { label: 'Confirm', disabled: true },
]

export function IconsAndOverrides() {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <Stepper
      steps={steps}
      activeStep={activeStep}
      onStepClick={setActiveStep}
      completedIcon="✓"
      skipIcon="↷"
    />
  )
}
```

### 6) Styling via CSS variables

```tsx
import { Stepper } from 'react-stepper-lite'

export function ColorsExample({ steps, activeStep }: { steps: { label: string }[]; activeStep: number }) {
  return (
    <Stepper
      steps={steps}
      activeStep={activeStep}
      style={{
        ['--stepper-active' as any]: '#7c3aed',
        ['--stepper-complete' as any]: '#059669',
      }}
    />
  )
}
```

For strict CSP environments, prefer external CSS classes instead of inline `style`:

```css
.checkoutStepper {
  --stepper-active: #2563eb;
  --stepper-complete: #059669;
  --stepper-connector: #d1d5db;
  --stepper-connector-complete: #059669;
}
```

```tsx
<Stepper steps={steps} activeStep={activeStep} className="checkoutStepper" />
```

### 7) `classNames` (optional)

Use `classNames` to attach your own classes to internal elements.

```tsx
import { useState } from 'react'
import { Stepper, type StepConfig } from 'react-stepper-lite'

const steps: StepConfig[] = [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]

export function ClassNamesExample() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <Stepper
      steps={steps}
      activeStep={activeStep}
      onStepClick={setActiveStep}
      classNames={{
        list: 'myList',
        stepButton: 'myStepButton',
        activeStep: 'myStep--active',
      }}
    />
  )
}
```

## Styling contract

Use this as a stable guide for customizing the component.

`classNames` key to element mapping:

- `root`: outer container. Use for global variables, width, spacing around the whole stepper.
- `list`: the `<ol>` wrapper. Use for layout-level spacing/alignment of all steps.
- `step`: each `<li>` step item. Use for per-step container spacing/positioning.
- `stepInner`: inner step wrapper around button/label structure.
- `stepButton`: clickable/focusable step button. Use for padding, hover, focus visuals.
- `stepIndicator`: the circle/icon node. Use for size, border, bg, icon alignment.
- `stepLabel`: label wrapper next to/below the indicator.
- `connector`: connector line element between steps.
- `activeStep`: extra class added when step is active.
- `completedStep`: extra class added when step is completed.
- `skippedStep`: extra class added when step is skipped.
- `disabledStep`: extra class added when step is disabled.

Built-in classes/state selectors you can target:

- `.stepper--horizontal`: horizontal layout rules.
- `.stepper--vertical`: vertical layout rules.
- `.stepper--sm`, `.stepper--md`, `.stepper--lg`: size variants (indicator/typography/gaps).
- `.stepper--label-below`: label-under-indicator layout.
- `.stepper--label-side`: label-next-to-indicator layout.
- `.stepper__step--active`: active step colors/label emphasis.
- `.stepper__step--completed`: completed step indicator/label visuals.
- `.stepper__step--passed`: step whose connector segment should look completed.
- `.stepper__step--skipped`: skipped step muted visuals.
- `.stepper__step--disabled`: disabled step visuals and tone.

Quick example (what to edit for common needs):

- Indicator size/border: target `classNames.stepIndicator` or `.stepper__indicator`.
- Active label color: target `classNames.activeStep` with `.stepper__labelText`.
- Connector thickness/color: target `classNames.connector` or `.stepper__connector`.
- Disabled step tone: target `classNames.disabledStep`.

CSS variables supported by default styles:

- `--stepper-active`
- `--stepper-complete`
- `--stepper-connector`
- `--stepper-connector-complete`
- `--stepper-disabled`
- `--stepper-text`
- `--stepper-muted`
- `--stepper-border`
- `--stepper-surface`

## Styling notes

The default styles are plain CSS and are applied automatically.

If you prefer to bring your own styles:

- use `classNames` to attach your own classes

## API (quick reference)

Main exports:

- `Stepper`
- `useStepperState`

Most used props:

- `steps: StepConfig[]`
- `activeStep: number`
- `onStepClick?: (index: number) => void`
- `orientation?: 'horizontal' | 'vertical'`
- `size?: 'sm' | 'md' | 'lg'`
- `labelPlacement?: 'below' | 'side'`
- `color?: string`
- `stepColor?: string`
- `completedColor?: string`
- `completedStepColor?: string`
- `connectorColor?: string`
- `connectorCompletedColor?: string`
- `completedIcon?: ReactNode`
- `skipIcon?: ReactNode`
- `skippedSteps?: number[]`
- `disabled?: boolean`
- `classNames?: StepperClassNames`

## CSP guidance

- CSP-safe default: component styling is class-based, with no internal inline style generation.
- With default usage (`steps`, `activeStep`, optional orientation/size/labelPlacement), no inline style attributes are emitted by the library.
- Recommended for strict CSP: theme via external CSS classes and CSS variables.
- Inline styles are emitted only when user override props are passed:
- `style` prop
- root color override props (`color`, `stepColor`, `completedColor`, `completedStepColor`, `connectorColor`, `connectorCompletedColor`)
- per-step overrides (`step.color`, `step.completedColor`)
- If your CSP forbids inline styles, prefer className/classNames + external CSS variables.

`StepConfig`:

- `label: string` (required)
- `icon?: ReactNode | string`
- `completedIcon?: ReactNode`
- `completed?: boolean`
- `color?: string`
- `completedColor?: string`
- `skipped?: boolean`
- `disabled?: boolean`

## Accessibility

- Roving focus (Arrow keys)
- `Home` / `End` move to first/last enabled step
- `Enter` / `Space` activates a step when `onStepClick` is provided
- Active step uses `aria-current="step"`
