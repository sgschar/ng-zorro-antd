import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit, Optional,
  QueryList,
  Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import { NzUpdateHostClassService } from '../core/services/update-host-class.service';
import { NzSizeLDSType } from '../core/types/size';
import { isEmpty } from '../core/util/check';
import { toBoolean } from '../core/util/convert';
import { findFirstNotEmptyNode, findLastNotEmptyNode } from '../core/util/dom';
import { NzWaveConfig, NzWaveDirective, NZ_WAVE_GLOBAL_CONFIG } from '../core/wave/nz-wave.directive';
import { NzIconDirective } from '../icon/nz-icon.directive';

export type NzButtonType = 'primary' | 'dashed' | 'danger';
export type NzButtonShape = 'circle' | null ;

@Component({
  selector           : '[nz-button]',
  providers          : [ NzUpdateHostClassService ],
  preserveWhitespaces: false,
  changeDetection    : ChangeDetectionStrategy.OnPush,
  encapsulation      : ViewEncapsulation.None,
  templateUrl        : './nz-button.component.html'
})
export class NzButtonComponent implements AfterContentInit, OnInit, OnDestroy {
  readonly el: HTMLElement = this.elementRef.nativeElement;
  @ViewChild('contentElement') contentElement: ElementRef;
  @ContentChildren(NzIconDirective, { read: ElementRef }) listOfIconElement: QueryList<ElementRef>;
  @HostBinding('attr.nz-wave') nzWave = new NzWaveDirective(this.ngZone, this.elementRef, this.waveConfig);

  @Input()
  set nzBlock(value: boolean) {
    this._block = toBoolean(value);
    this.setClassMap();
  }

  get nzBlock(): boolean {
    return this._block;
  }

  @Input()
  set nzGhost(value: boolean) {
    this._ghost = toBoolean(value);
    this.setClassMap();
  }

  get nzGhost(): boolean {
    return this._ghost;
  }

  @Input()
  set nzSearch(value: boolean) {
    this._search = toBoolean(value);
    this.setClassMap();
  }

  get nzSearch(): boolean {
    return this._search;
  }

  @Input()
  set nzType(value: NzButtonType) {
    this._type = value;
    this.setClassMap();
  }

  get nzType(): NzButtonType {
    return this._type;
  }

  @Input()
  set nzShape(value: NzButtonShape) {
    this._shape = value;
    this.setClassMap();
  }

  get nzShape(): NzButtonShape {
    return this._shape;
  }

  @Input()
  set nzSize(value: NzSizeLDSType) {
    this._size = value;
    this.setClassMap();
  }

  get nzSize(): NzSizeLDSType {
    return this._size;
  }

  @Input()
  set nzLoading(value: boolean) {
    this._loading = toBoolean(value);
    this.setClassMap();
    this.updateIconDisplay(value);
  }

  get nzLoading(): boolean {
    return this._loading;
  }

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef, private renderer: Renderer2,
              private nzUpdateHostClassService: NzUpdateHostClassService, private ngZone: NgZone,
              @Optional() @Inject(NZ_WAVE_GLOBAL_CONFIG) private waveConfig: NzWaveConfig) {
  }

  private _ghost = false;
  private _search = false;
  private _type: NzButtonType;
  private _shape: NzButtonShape;
  private _size: NzSizeLDSType;
  private _loading = false;
  private _block = false;
  private iconElement: HTMLElement;
  private iconOnly = false;
  private prefixCls = 'ant-btn';
  private sizeMap = { large: 'lg', small: 'sm' };

  updateIconDisplay(value: boolean): void {
    if (this.iconElement) {
      this.renderer.setStyle(this.iconElement, 'display', value ? 'none' : 'inline-block');
    }
  }

  /** temp solution since no method add classMap to host https://github.com/angular/angular/issues/7289 */
  setClassMap(): void {
    const classMap = {
      [ `${this.prefixCls}` ]                               : true,
      [ `${this.prefixCls}-${this.nzType}` ]                : this.nzType,
      [ `${this.prefixCls}-${this.nzShape}` ]               : this.nzShape,
      [ `${this.prefixCls}-${this.sizeMap[ this.nzSize ]}` ]: this.sizeMap[ this.nzSize ],
      [ `${this.prefixCls}-loading` ]                       : this.nzLoading,
      [ `${this.prefixCls}-icon-only` ]                     : this.iconOnly,
      [ `${this.prefixCls}-background-ghost` ]              : this.nzGhost,
      [ `${this.prefixCls}-block` ]                         : this.nzBlock,
      [ `ant-input-search-button` ]                         : this.nzSearch
    };
    this.nzUpdateHostClassService.updateHostClass(this.el, classMap);
  }

  checkContent(): void {
    const hasIcon = this.listOfIconElement && this.listOfIconElement.length;
    if (hasIcon) {
      this.moveIcon();
    }
    this.renderer.removeStyle(this.contentElement.nativeElement, 'display');
    /** https://github.com/angular/angular/issues/12530 **/
    if (isEmpty(this.contentElement.nativeElement)) {
      this.renderer.setStyle(this.contentElement.nativeElement, 'display', 'none');
      this.iconOnly = !!hasIcon;
    } else {
      this.renderer.removeStyle(this.contentElement.nativeElement, 'display');
      this.iconOnly = false;
    }
    this.setClassMap();
    this.updateIconDisplay(this.nzLoading);
    this.cdr.detectChanges();
  }

  moveIcon(): void {
    if (this.listOfIconElement && this.listOfIconElement.length) {
      const firstChildElement = findFirstNotEmptyNode(this.contentElement.nativeElement);
      const lastChildElement = findLastNotEmptyNode(this.contentElement.nativeElement);
      if (firstChildElement && (firstChildElement === this.listOfIconElement.first.nativeElement)) {
        this.renderer.insertBefore(this.el, firstChildElement, this.contentElement.nativeElement);
        this.iconElement = firstChildElement as HTMLElement;
      } else if (lastChildElement && (lastChildElement === this.listOfIconElement.last.nativeElement)) {
        this.renderer.appendChild(this.el, lastChildElement);
      }
    }
  }

  ngAfterContentInit(): void {
    this.checkContent();
  }

  ngOnInit(): void {
    this.setClassMap();
    this.nzWave.ngOnInit();
  }

  ngOnDestroy(): void {
    this.nzWave.ngOnDestroy();
  }
}
