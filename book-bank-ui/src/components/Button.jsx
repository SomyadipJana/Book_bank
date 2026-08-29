import React from 'react'

/**
 * Button
 *
 * variant:
 *   "primary"   — ink bg / paper text
 *   "secondary" — ink outline / ink text / paper bg
 *   "danger"    — oxblood outline / oxblood text
 *   "ochre"     — ochre bg / paper text (reserve CTA)
 *
 * Design rules:
 *   4px border-radius, no shadows, no gradients.
 *   Hover: primary fills ochre; secondary fills ink-10; danger fills oxblood-10.
 *   Disabled: 40% opacity, no pointer events.
 */

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.01em',
  lineHeight: 1,
  padding: '10px 20px',
  borderRadius: 'var(--radius-btn)',
  border: '1.5px solid transparent',
  cursor: 'pointer',
  transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease, opacity 140ms ease',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
}

const variants = {
  primary: {
    idle: {
      backgroundColor: 'var(--color-ink)',
      borderColor: 'var(--color-ink)',
      color: 'var(--color-paper)',
    },
    hover: {
      backgroundColor: 'var(--color-ochre)',
      borderColor: 'var(--color-ochre)',
      color: 'var(--color-paper)',
    },
  },
  secondary: {
    idle: {
      backgroundColor: 'transparent',
      borderColor: 'var(--color-ink)',
      color: 'var(--color-ink)',
    },
    hover: {
      backgroundColor: 'var(--color-ink-10)',
      borderColor: 'var(--color-ink)',
      color: 'var(--color-ink)',
    },
  },
  danger: {
    idle: {
      backgroundColor: 'transparent',
      borderColor: 'var(--color-oxblood)',
      color: 'var(--color-oxblood)',
    },
    hover: {
      backgroundColor: 'var(--color-oxblood-10)',
      borderColor: 'var(--color-oxblood)',
      color: 'var(--color-oxblood)',
    },
  },
  ochre: {
    idle: {
      backgroundColor: 'var(--color-ochre)',
      borderColor: 'var(--color-ochre)',
      color: 'var(--color-paper)',
    },
    hover: {
      backgroundColor: '#A6711A',
      borderColor: '#A6711A',
      color: 'var(--color-paper)',
    },
  },
}

export function Button({
  variant = 'primary',
  children,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const [hovered, setHovered] = React.useState(false)

  const v = variants[variant] ?? variants.primary
  const stateStyle = hovered && !disabled ? v.hover : v.idle

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        ...stateStyle,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
