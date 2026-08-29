import React from 'react'

/**
 * Tag / Chip
 *
 * variant:
 *   "default"   — oxblood bg-10 / oxblood text (genre/topic tags)
 *   "on-loan"   — oxblood solid / paper text
 *   "reserved"  — ochre bg-20 / ochre-darker text
 *   "available" — ink bg-10 / ink text
 *
 * Design rules:
 *   4px radius, no shadows, font-mono, uppercase, small.
 */

const tagBase = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.625rem',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  lineHeight: 1,
  padding: '5px 9px',
  borderRadius: '4px',
  border: '1px solid transparent',
  userSelect: 'none',
  whiteSpace: 'nowrap',
}

const tagVariants = {
  default: {
    backgroundColor: 'var(--color-oxblood-10)',
    borderColor: 'rgba(122,46,39,0.25)',
    color: 'var(--color-oxblood)',
  },
  'on-loan': {
    backgroundColor: 'var(--color-oxblood)',
    borderColor: 'var(--color-oxblood)',
    color: 'var(--color-paper)',
  },
  reserved: {
    backgroundColor: 'var(--color-ochre-20)',
    borderColor: 'rgba(198,138,46,0.35)',
    color: '#8A5E18',
  },
  available: {
    backgroundColor: 'var(--color-ink-10)',
    borderColor: 'var(--color-ink-20)',
    color: 'var(--color-ink)',
  },
}

export function Tag({ variant = 'default', children, style = {}, ...props }) {
  const v = tagVariants[variant] ?? tagVariants.default
  return (
    <span
      style={{ ...tagBase, ...v, ...style }}
      {...props}
    >
      {children}
    </span>
  )
}
