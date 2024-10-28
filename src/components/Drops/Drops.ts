export declare const enum NotifTag {
  CURRENCY = 'c',
  SKILL = 's',
  LEVEL = 'l',
  MASTERY = 'm',
  POOLXP = 'p',
  ITEM = 'i',
  MARK = 'mk',
  ERROR = 've',
  SUCCESS = 'vs',
  INFO = 'vi',
  UNKNOWN = 'x',
}

export type MouseEventHandler = {
  (event: PointerEvent|MouseEvent, action?: string): void;
};
export type MouseEventCallback = {
  (eventType: string, action: string, props: DropsProps, store: any): void;
};

interface Item {
  label: string;            // `notification.text` (usually)
  type: NotificationType;   // `key.type`
  icon: string;             // `notification.media`
  qty: number;              // `notification.quantity`
  qtyText: string;          // `numberWithCommas(qty)`
}
export interface ItemCounts {
  [index: string]: Item;    // `id`
}

export interface DropsProps {
  readonly label: string;
  sticky: boolean;
}

interface Drops {
  props: DropsProps;
  store: any;
  clickTopbarPinButton: MouseEventHandler;
  mouseEnterTopbarPinButton: MouseEventHandler;
  mouseLeaveTopbarPinButton: MouseEventHandler;
}

interface DropsPanel{
  props: DropsProps;
  store: any;
  clickPanelHeaderButton: MouseEventHandler;
}

interface DropsPanelItem{
  props: DropsProps;
  store: any;
}

export function Drops(template: string, props: DropsProps, store: any, callback: MouseEventCallback): Component<Drops> {
  return {
    $template: template,
    props,
    store,

    // Handle clicks for pin button
    clickTopbarPinButton(event, action) {
      // Remove focus from button for visuals
      // document.getElementById("pd__topbar-button").blur();

      // Run callback
      callback(event.type, action, props, store);
    },

    // Handle mouseenters for pin button
    mouseEnterTopbarPinButton(event, action) {
      // Run callback
      callback(event.type, action, props, store);
    },
    // Handle mouseleaves for pin button
    mouseLeaveTopbarPinButton(event, action) {
      // Run callback
      callback(event.type, action, props, store);
    },
  };
}

export function DropsPanel(template: string, props: DropsProps, store: any, callback: MouseEventCallback): Component<DropsPanel> {
  return {
    $template: template,
    props,
    store,

    // Handle clicks for panel button
    clickPanelHeaderButton(event, action) {
      // Run callback
      callback(event.type, action, props, store);
    },
  }
}

export function DropsPanelItem(template: string, props: DropsProps, store: any): Component<DropsPanelItem> {
  return {
    $template: template,
    props,
    store,
  }
}