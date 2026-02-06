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
