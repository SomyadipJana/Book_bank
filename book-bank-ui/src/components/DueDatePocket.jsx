import React from 'react'

/**
 * DueDatePocket
 *
 * The signature motif: a die-cut library card pocket, rounded top,
 * outlined in ochre, peeking from behind the bottom-right corner
 * of a book card. Shows:
 *   — "ACCESSION" label
 *   — a hairline divider
 *   — the accession number in IBM Plex Mono ochre
 *
 * Usage:
 *   Parent must be position:relative and have overflow:visible on bottom.
 *   <DueDatePocket accession="BB-0042" />
 */
export function DueDatePocket({ accession = 'BB-0000' }) {
  return (
    <div className="due-date-pocket" aria-label={`Accession number ${accession}`}>
      <span className="due-date-pocket__label">Accession</span>
      <div className="due-date-pocket__divider" />
      <span className="due-date-pocket__number">{accession}</span>
    </div>
  )
}
