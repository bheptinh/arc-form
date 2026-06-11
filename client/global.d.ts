import sunEditor from 'suneditor';
import lang from 'suneditor/src/lang';
import plugins from 'suneditor/src/plugins';

export {};

declare global {
  var R2D: any;
  var WC: any;
  
  var __APP_VERSION__: string;
  
  var sunEditor: typeof sunEditor;
  var sunEditorPlugins: typeof plugins;
  var sunEditorLanguages: typeof lang;
}
