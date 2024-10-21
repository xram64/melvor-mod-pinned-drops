export declare const enum MouseEvent {
  CLICK = 0,
  MOUSEENTER = 1,
  MOUSELEAVE = 2,
}
export type EventCallback = {
  (event: MouseEvent, props: DropsProps, store: any): void;
};

export interface Counts {
  [index: string]: number;
}

export interface DropsProps {
  readonly label: string;
  sticky: boolean;
}

interface Drops {
  props: DropsProps;
  store: any;
  clickButton: EventCallback;
  mouseEnterButton: EventCallback;
  mouseLeaveButton: EventCallback;
}

interface DropsPanel{
  props: DropsProps;
}

interface DropsPanelItem{
  props: DropsProps;
  store: any;
}

export function Drops(template: string, props: DropsProps, store: any, callback: EventCallback): Component<Drops> {
  return {
    $template: template,
    props,
    store,

    // Handle clicks for mod button
    clickButton() {
      // Remove focus from button for visuals
      document.getElementById("pd__topbar-button").blur();

      // Run callback
      callback(MouseEvent.CLICK, props, store);
    },

    // Handle mouseenters for mod button
    mouseEnterButton() {
      // Run callback
      callback(MouseEvent.MOUSEENTER, props, store);
    },
    // Handle mouseleaves for mod button
    mouseLeaveButton() {
      // Run callback
      callback(MouseEvent.MOUSELEAVE, props, store);
    },
  };
}

export function DropsPanel(template: string, props: DropsProps): Component<DropsPanel> {
  return {
    $template: template,
    props,
  }
}

export function DropsPanelItem(template: string, props: DropsProps, store: any): Component<DropsPanelItem> {
  return {
    $template: template,
    props,
    store,
  }
}