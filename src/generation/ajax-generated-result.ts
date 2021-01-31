import {parse as cssParse, Rule, stringify as cssStringify, Stylesheet} from 'css';
import {AjaxResult} from './ajax-result';
import {GenericObjectComponent} from './generated-object.component';
import * as Mustache from 'mustache';
import {IObjectTree, IObjectNode} from '@jacquesparis/objects-model';

export class AjaxGeneratedResult extends GenericObjectComponent {
  constructor() {
    super(AjaxGeneratedResult);
  }

  public async init(
    objectTreesService: {getCachedOrRemoteObjectById: (treeId: string) => Promise<IObjectTree>},
    objectNodesService: {getCachedOrRemoteObjectById: (nodeId: string) => Promise<IObjectNode>},
    hrefBuilder: {
      getPageHref: (page: IObjectTree) => string;

      getAdminHref: (page: IObjectTree) => string;
    },
    siteTreeId: string,
    pageTreeId?: string,
    dataTreeId?: string,
    templateTreeId?: string,
  ): Promise<void> {
    this.objectTreeService = objectTreesService;
    this.objectNodeService = objectNodesService;
    this.hrefBuilder = hrefBuilder;
    await this.initObject(siteTreeId, pageTreeId, dataTreeId, templateTreeId);
  }
  public async initObject(
    siteTreeId: string,
    pageTreeId?: string,
    dataTreeId?: string,
    templateTreeId?: string,
  ): Promise<void> {
    this.siteTree = await this.getObjectTree(siteTreeId);

    this.siteNode = await this.getObjectNode(this.siteTree.treeNode.id);

    if (!this.siteNode.webSiteObjectTreeId) {
      throw Error('unable to init template');
    }
    this.siteTemplateTree = await this.getObjectTree(this.siteNode.webSiteObjectTreeId);
    if (!this.siteTemplateTree?.treeNode?.id) {
      throw Error('unable to init template');
    }
    this.siteTemplateNode = await this.getObjectNode(this.siteTemplateTree.treeNode.id);

    pageTreeId = pageTreeId ? pageTreeId : (this.siteTree.welcomePageId as string);
    this.pageTree = await this.getObjectTree(pageTreeId);

    this.pageNode = await this.getObjectNode(this.pageTree.treeNode.id);

    dataTreeId = dataTreeId ? dataTreeId : this.siteTree.id;
    this.dataTree = await this.getObjectTree(dataTreeId);

    this.dataNode = await this.getObjectNode(this.dataTree.treeNode.id);

    templateTreeId = templateTreeId ? templateTreeId : (this.siteTemplateTree.id as string);
    this.templateTree = await this.getObjectTree(templateTreeId);

    this.templateNode = await this.getObjectNode(this.templateTree.treeNode.id);
  }

  public async generate(): Promise<AjaxResult> {
    const controller =
      this.templateNode.contentGenericTemplate?.controller ||
      `function newFunction() {
        return {
          ctrl: undefined,
          async init(ctrl) {
            this.ctrl = ctrl;
            void this.backGroundInit();
          },
          async backGroundInit() {},
        };
      }
      newFunction();
      `;
    try {
      const ctrl = eval(controller);
      if (!ctrl.init) {
        ctrl.init = async (component: GenericObjectComponent): Promise<void> => {};
      }
      ctrl.ctrl = this;
      this.ctrl = ctrl;

      // eslint-disable-next-line no-empty
    } catch (error) {}

    if (this.ctrl.initMustache) {
      await this.ctrl.initMustache();
    }

    const mustache = this.templateNode.contentGenericTemplate.templateMustache
      ? this.templateNode.contentGenericTemplate.templateMustache
      : 'missing mustache for ' + this.templateNode.name;

    this.ajaxResult.body =
      '<div class="template_' +
      this.templateNode.name +
      '">' +
      Mustache.render(
        mustache,
        this,
        this.templateNode.contentGenericTemplate.templatesMustache
          ? this.templateNode.contentGenericTemplate.templatesMustache
          : {},
      ) +
      '</div>';

    if (this.templateNode.contentGenericTemplate.css && '' !== this.templateNode.contentGenericTemplate.css) {
      const cssObject: Stylesheet = cssParse(this.templateNode.contentGenericTemplate.css);
      if (cssObject.stylesheet) {
        for (const oneRule of cssObject.stylesheet.rules) {
          const rule = oneRule as Rule;
          if (rule.selectors) {
            for (const index in rule.selectors) {
              rule.selectors[index] = '.template_' + this.templateNode.name + ' ' + rule.selectors[index];
            }
          }
        }
      }
      this.ajaxResult.css['template_' + this.templateNode.name] = cssStringify(cssObject);
    }

    if (
      this.templateNode.contentGenericTemplate.headerScript &&
      '' !== this.templateNode.contentGenericTemplate.headerScript
    ) {
      this.ajaxResult.headerScripts[
        'template_' + this.templateNode.name
      ] = this.templateNode.contentGenericTemplate.headerScript;
    }

    if (
      this.templateNode.contentGenericTemplate.footerScript &&
      '' !== this.templateNode.contentGenericTemplate.footerScript
    ) {
      this.ajaxResult.footerScripts[
        'template_' + this.templateNode.name
      ] = this.templateNode.contentGenericTemplate.footerScript;
    }

    return this.ajaxResult;
  }
}
