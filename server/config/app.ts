export const appConfig = {
  // TODO: MOVE TO FE — logo is purely presentational, belongs in the React app,
  //       not served from the backend. Remove once FE owns branding assets.
  logo: {
    type: 'image' as const,
    src: '/files/sites/theme/icons/9JrfXu0Vo4qgDrT.png',
    href: '/',
    target: '_blank' as const,
  },

  // TODO: MOVE TO FE — start popup config is UI-only, no backend logic needed.
  //       Drive it from a FE config or feature flags once FE owns the startup flow.
  startPopup: {
    show: true,
    title: "Choose how you'd like to start",
    items: {
      startFromScratch: { name: '', preview: '' },
      uploadPlan:       { name: '', preview: '' },
      myProjects:       { name: '', preview: '' },
    },
  },

  // TODO: MOVE TO DB — these product/material IDs should be stored in a settings
  //       table so they can be changed without a deploy. Schema: settings(key, value).
  //       Seed with these defaults. Service reads from DB at runtime.
  defaultMaterials: {
    wall:    { matId: '2013',    addMatId: '' },
    cover:   { matId: '2525',    addMatId: '' },
    ceiling: { matId: '2013',    addMatId: '' },
    cap:     { matId: '#606b67', addMatId: '41803' },
    plinth:  { entityId: 42624,  matId: '#ffffff', addMatId: '41804' },
    molding: { entityId: 42632,  matId: '#ffffff', addMatId: '41804' },
  },

  // TODO: MOVE TO DB — feature flags belong in a settings/feature-flags table.
  ui: {
    showProButton: false,
  },

  // TODO: MOVE TO FE — copyright, terms, and branding are presentational.
  //       Remove from backend once FE renders these directly.
  branding: {
    copyright: { show: true, text: '2024 © ArcForm' },
    terms:     { show: false, text: '', href: '' },
  },
};
