// Tools listed on /tools, in display order. Each one gets its own page at
// /tools/<slug>; add the page's route in src/App.jsx.
export const tools = [
  {
    slug: 'transformation-maker',
    name: 'Coordinate Rule Transformation Explorer',
    icon: '↻',
    blurb: 'Plot a shape and its image under any coordinate rule — translations, reflections, rotations, and dilations.',
  },
  {
    slug: 'transformation-challenge',
    name: 'Transformation Challenge',
    icon: '★',
    blurb: 'Predict where a triangle lands after reflections and rotations, then watch it move. Five in a row earns a badge.',
  },
  {
    slug: 'transformation-explorer',
    name: 'Reflection / Rotation Explorer',
    icon: '⇋',
    blurb: 'Drag a shape and watch its image move under rotations and reflections about the origin, with the coordinates side by side.',
  },
  {
    slug: 'dilation-explorer',
    name: 'Dilation Explorer',
    icon: '⤢',
    blurb: 'Drag a shape and a center of dilation, enter any scale factor, and watch the image grow, shrink, or flip with exact coordinates.',
  },
]
