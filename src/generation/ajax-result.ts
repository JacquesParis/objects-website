import {values} from 'lodash-es';
export class AjaxResult {
  public headerScripts: {[scriptId: string]: string} = {};
  public footerScripts: {[scriptId: string]: string} = {};
  public css: {[cssId: string]: string} = {};
  public body = '';
  public headerScriptsArray() {
    return values(this.headerScripts);
  }
  public footerScriptsArray() {
    return values(this.footerScripts);
  }
  public cssArray() {
    return values(this.css);
  }
  public hasHeaderScripts(): boolean {
    return this.headerScripts && 0 < Object.keys(this.headerScripts).length;
  }
  public hasFooterScripts(): boolean {
    return this.footerScripts && 0 < Object.keys(this.footerScripts).length;
  }
  public hasCss(): boolean {
    return this.css && 0 < Object.keys(this.css).length;
  }
}
