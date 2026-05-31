import { appConfig } from '../config/app.js';

export function getConfig() {
  const { logo, startPopup, defaultMaterials, ui, branding } = appConfig;

  return {
    logo,
    start_popup: {
      show: String(startPopup.show),
      title: startPopup.title,
      items: startPopup.items,
    },
    default_materials: defaultMaterials,
    ui: {
      show_pro_button: String(ui.showProButton),
    },
    additional: {
      copyright: {
        type: 'text',
        show: String(branding.copyright.show),
        text: branding.copyright.text,
      },
      terms: {
        type: 'text',
        show: String(branding.terms.show),
        text: branding.terms.text,
        href: branding.terms.href,
      },
    },
  };
}
