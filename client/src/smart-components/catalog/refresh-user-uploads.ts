import { planner } from '../../initR2D';

/**
 * Reloads the user's uploads into the engine after one is added or deleted, and tells the
 * panels: the toolbar's uploads button shows or hides, and catalog grids reload.
 */
export async function refreshUserUploads() {
  const userUpload = await planner.scene.categoryDataLoad(
    `${R2D.URL.DOMAIN + R2D.URL.URL_CATALOG_SEARCH}&category_tag&my=1`
  );
  planner.setUserUpload(userUpload);
  planner.apiScene.dispatchEvent(
    new Event(planner.apiScene.USER_UPLOAD_BUTTON, { status: userUpload?.length > 0 })
  );
  planner.scene.dispatchEvent(new Event(planner.scene.PRODUCTS_UPDATED, {}));
}
