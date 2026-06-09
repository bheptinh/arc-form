export const createProjectUrl = (hash) => {
  const siteKey = R2D.URL.MERCHANT_SITE_KEY ? `?site_key=${R2D.URL.MERCHANT_SITE_KEY}` : '';
  return `${R2D.URL.REACT_BASEPATH}${hash ? '/project/' + hash : ''}${siteKey}`;
};
