// Possible values of `notification.type` given by the `type` field of each type under `QueuedNotify` in `utils.d.ts`.
export type QueuedNotifTypes = 'Item' | 'Stun' | 'BankFull' | 'LevelUp' | 'Player' | 'ItemCharges' | 'Mastery' | 'Mastery99' | 'Preserve' | 'Currency' | 'TutorialTask' | 'SkillXP' | 'AbyssalXP' | 'AbyssalLevelUp';

// This interface represents an individual notification event.
export interface Notif {
  id: string;               // Copy of the `NotifCounts` unique ID
  label: string;            // `notification.args[0]['name']`
  type: QueuedNotifTypes;   // `notification.type`
  icon: string;             // `notification.args[0]['media']`
  extraIcon?: string;       // Optional extra icon file (e.g. Mastery icon)
  qty: number;              // `notification.args[1]`
  qtyText: string;          // `numberWithCommas(qty)`
}
// This interface represents an object mapping unique `notifID`s to `Notif` event objects.
export interface NotifCounts {
  [index: string]: Notif;    // `notification.type:notification.args[0]['localID']`
}

export type MouseEventHandler = {
  (event: PointerEvent|MouseEvent, action?: string): void;
};
export type MouseEventCallback = {
  (eventType: string, action: string, props: DropsProps, store: any): void;
};

export interface DropsProps {
  readonly label: string;
  sticky: boolean;
  capturePaused: boolean;
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