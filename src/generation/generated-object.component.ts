import {values} from 'lodash-es';
import {AjaxGeneratedResult} from './ajax-generated-result';
import {AjaxResult} from './ajax-result';
import {ObjectTreeImpl, ObjectNodeImpl, ObjectNodesService, ObjectTreesService} from '@jacquesparis/objects-client';

export class GenericObjectComponent {
  protected ajaxResult: AjaxResult = new AjaxResult();
  public siteTree: ObjectTreeImpl;
  public siteNode: ObjectNodeImpl;
  public templateTree: ObjectTreeImpl;
  public templateNode: ObjectNodeImpl;
  public dataTree: ObjectTreeImpl;
  public dataNode: ObjectNodeImpl;
  public pageTree: ObjectTreeImpl;
  public pageNode: ObjectNodeImpl;
  public siteTemplateTree: ObjectTreeImpl;
  public siteTemplateNode: ObjectNodeImpl;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public ctrl: any;
  constructor() {}

  public async loadAjax(dataTree: ObjectTreeImpl, templateTree: ObjectTreeImpl): Promise<string> {
    const ajaxGeneratedResult: AjaxGeneratedResult = new AjaxGeneratedResult();

    ajaxGeneratedResult.init(this.siteTree.id, this.pageTree.id, this.dataTree.id, this.templateTree.id);

    const loadedAjax = await ajaxGeneratedResult.generate();
    for (const scriptId of Object.keys(loadedAjax.headerScripts)) {
      this.ajaxResult.headerScripts[scriptId] = loadedAjax.headerScripts[scriptId];
    }
    for (const scriptId of Object.keys(loadedAjax.footerScripts)) {
      this.ajaxResult.footerScripts[scriptId] = loadedAjax.footerScripts[scriptId];
    }
    for (const cssId of Object.keys(loadedAjax.css)) {
      this.ajaxResult.css[cssId] = loadedAjax.css[cssId];
    }
    return loadedAjax.body;
  }

  public getPageHref(page: ObjectTreeImpl): string {
    return '#/view/' + this.siteTree.id + '/' + (page ? page.treeNode.id : 'default');
  }

  public getAdminHref(page: ObjectTreeImpl): string {
    return (
      '#/admin/owner/' +
      page.ownerType +
      '/' +
      page.ownerName +
      '/namespace/' +
      page.namespaceType +
      '/' +
      page.namespaceName
    );
  }

  public async getObjectNode(nodeId: string): Promise<ObjectNodeImpl> {
    return ObjectNodesService.getService().getCachedOrRemoteObjectById(nodeId);
  }

  public async getObjectTree(treeId: string): Promise<ObjectTreeImpl> {
    return ObjectTreesService.getService().getCachedOrRemoteObjectById(treeId);
  }

  public getImgSrc(controlValue: {base64?: string; type?: string; uri?: string}): string {
    return controlValue?.base64 && controlValue.type
      ? 'data:' + controlValue.type + ';base64,' + controlValue.base64
      : (controlValue?.uri as string);
  }

  public getImgBackground(controlValue: {base64?: string; type?: string; uri?: string}): string {
    return controlValue?.base64 && controlValue?.type
      ? "url('" + 'data:' + controlValue.type + ';base64,' + controlValue.base64 + "')"
      : "url('" + controlValue?.uri + "')";
  }

  public getColSizes(
    minWidth: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12,
    maxWith: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12,
    breakSize: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    keepProportion = false,
  ) {
    const sizes = {
      xs: 576,
      sm: 768,
      md: 992,
      lg: 1200,
      xl: 1400,
    };
    const breakingSize =
      'none' === breakSize ? sizes.xs : Math.min(...values(sizes).filter(size => size > sizes[breakSize]));
    const returnedSizes: {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    } = {};
    for (const size in sizes) {
      if (sizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] < breakingSize) {
        returnedSizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] = 12;
      } else {
        returnedSizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] = Math.round(
          minWidth +
            ((maxWith - minWidth) * (sizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] - breakingSize)) /
              (sizes.xl - breakingSize),
        );
        if (keepProportion) {
          returnedSizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] =
            Math.round((returnedSizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] as number) / maxWith) * maxWith;
        }
      }
    }
    return returnedSizes;
  }

  public getColClass(
    minWidth: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12,
    maxWith: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12,
    breakSize: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    keepProportion = false,
  ) {
    const colSizes = this.getColSizes(minWidth, maxWith, breakSize, keepProportion);
    const returnedClasses = [];
    for (const size in colSizes) {
      returnedClasses.push('col-' + size + '-' + colSizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl']);
    }
    return returnedClasses.join(' ').replace('col-xs', 'col');
  }

  public getColFloatClass(
    minWidth: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12,
    maxWith: 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12,
    breakSize: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    side = 'left',
    keepProportion = false,
  ) {
    const colSizes = this.getColSizes(minWidth, maxWith, breakSize, keepProportion);
    const returnedClasses = [];
    for (const size in colSizes) {
      const sizeClass = 'xs' === size ? '' : '-' + size;
      returnedClasses.push(
        'col' +
          sizeClass +
          '-' +
          colSizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] +
          (colSizes[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] !== 12 ? ' float' + sizeClass + '-' + side : ''),
      );
    }
    return returnedClasses.join(' ');
  }
}
