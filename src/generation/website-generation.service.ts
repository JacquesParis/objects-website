import {IObjectNode, IObjectTree} from '@jacquesparis/objects-model';
import {AjaxResult} from './ajax-result';
import {AjaxGeneratedResult} from './ajax-generated-result';
export class WebsiteGenerationService {
  private static _instance = new WebsiteGenerationService();
  public static get(): WebsiteGenerationService {
    return WebsiteGenerationService._instance;
  }
  private constructor() {}

  public async getAjaxContent(
    objectTreesService: {getCachedOrRemoteObjectById: (treeId: string) => Promise<IObjectTree>},
    objectNodesService: {getCachedOrRemoteObjectById: (nodeId: string) => Promise<IObjectNode>},
    siteTreeId: string,
    pageTreeId?: string,
    dataTreeId?: string,
    templateTreeId?: string,
  ): Promise<AjaxResult> {
    const genericObject: AjaxGeneratedResult = new AjaxGeneratedResult();

    try {
      await genericObject.init(
        objectTreesService,
        objectNodesService,
        siteTreeId,
        pageTreeId,
        dataTreeId,
        templateTreeId,
      );
    } catch (error) {
      throw Error('unable to init template');
    }

    return genericObject.generate();
  }

  public async getTamplateContent(
    objectTreesService: {getCachedOrRemoteObjectById: (treeId: string) => Promise<IObjectTree>},
    objectNodesService: {getCachedOrRemoteObjectById: (nodeId: string) => Promise<IObjectNode>},
    siteTreeId: string,
    pageTreeId?: string,
    dataTreeId?: string,
    templateTreeId?: string,
  ): Promise<string> {
    const ajaxResult: AjaxResult = await this.getAjaxContent(
      objectTreesService,
      objectNodesService,
      siteTreeId,
      pageTreeId,
      dataTreeId,
      templateTreeId,
    );
    if (ajaxResult.hasCss()) {
      for (const cssId in ajaxResult.css) {
        if (!document.querySelector('style[data-template-id="css.' + cssId + '"]')) {
          const style = document.createElement('style');
          style.setAttribute('data-template-id', 'css.' + cssId);
          style.setAttribute('type', 'text/css');
          style.appendChild(document.createTextNode(ajaxResult.css[cssId]));
          document.head.appendChild(style);
        }
      }
    }
    if (ajaxResult.hasHeaderScripts()) {
      for (const scriptId in ajaxResult.headerScripts) {
        if (!document.querySelector('script[data-template-id="script.header.' + scriptId + '"]')) {
          const script = document.createElement('script');
          script.setAttribute('data-template-id', 'script.header.' + scriptId);
          script.setAttribute('type', 'text/javascript');
          script.appendChild(document.createTextNode(ajaxResult.headerScripts[scriptId]));
          document.head.appendChild(script);
        }
      }
    }
    if (ajaxResult.hasFooterScripts()) {
      for (const scriptId in ajaxResult.footerScripts) {
        if (!document.querySelector('script[data-template-id="script.footer.' + scriptId + '"]')) {
          const script = document.createElement('script');
          script.setAttribute('data-template-id', 'script.footer.' + scriptId);
          script.setAttribute('type', 'text/javascript');
          script.appendChild(document.createTextNode(ajaxResult.footerScripts[scriptId]));
          document.body.appendChild(script);
        }
      }
    }
    return ajaxResult.body;
  }
}
