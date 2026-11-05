// The OST subjects and the resources listed on each subject's page.
//
// A resource is { title, description } plus either `to` (a page on this site) or
// `href` (an outside link or a file in public/).
//
// `releasedItems` turns on the released-items viewer at /ost/<subject>/released-items.
// Its data comes from a separate project via `npm run sync:<subject>`; see
// scripts/sync-released-items.mjs.
export const subjects = {
  algebra: {
    name: 'Algebra I',
    blurb: 'Resources for the Algebra I end-of-course test.',
    releasedItems: null,
    resources: [],
  },
  geometry: {
    name: 'Geometry',
    blurb: 'Resources for the Geometry end-of-course test.',
    releasedItems: {
      load: () => import('./data/geometry.json'),
      assetBase: '/released-items/geometry/',
    },
    resources: [
      {
        title: 'Released items by standard',
        description:
          'Every released Geometry OST question since 2016, grouped by the standard it tests, with answers and scoring guidelines.',
        to: '/ost/geometry/released-items',
      },
    ],
  },
}

export const subjectOrder = ['algebra', 'geometry']
