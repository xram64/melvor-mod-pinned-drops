import SortRules from './SortRules';

// Possible values of `notification.type` given by the `type` field of each type under `QueuedNotify` in `utils.d.ts`.
export type QueuedNotifTypes = 'Item' | 'Stun' | 'BankFull' | 'LevelUp' | 'Player' | 'ItemCharges' | 'Mastery' | 'Mastery99' | 'Preserve' | 'Currency' | 'TutorialTask' | 'SkillXP' | 'AbyssalXP' | 'AbyssalLevelUp';

// This interface represents an individual notification event.
export interface Notif {
  id: string;               // `notification.type:notification.args[0]['localID']`
  label: string;            // `notification.args[0]['name']`
  type: QueuedNotifTypes;   // `notification.type`
  icon: string;             // `notification.args[0]['media']`
  extraIcon?: string;       // Optional extra icon file (e.g. Mastery icon)
  qty: number;              // `notification.args[1]`
  qtyText: string;          // `numberWithCommas(qty)`
  dropsPerHour?: string;
}

// Generic type for extra params returned to event handlers, as an object (dict) with arbitrary string keys.
export interface ExtraParams {
  [key: string]: any;
}

export type MouseEventHandler = {
  (event: PointerEvent|MouseEvent, action: string, extraParams?: ExtraParams): void;
};
export type MouseEventCallback = {
  (eventType: string, action: string, props: DropsProps, store: any, extraParams?: ExtraParams): void;
};

export interface DropsProps {
  readonly label: string;
  context: Modding.ModContext;
  sticky: boolean;
  capturePaused: boolean;
  readonly dropdownOptions: object;   // TODO: [Dropdown View Menu]
  dropdownOptionActive: string;       // TODO: [Dropdown View Menu]
  startTime: number;
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
  clickPanelItem: MouseEventHandler;
  process: {(dropCounts: Notif[]): Notif[]};
}

interface DropsPanelDropdown{
  props: DropsProps;
  store: any;
  clickDropdownMenu: MouseEventHandler;
}

export function Drops(template: string, props: DropsProps, store: any, callback: MouseEventCallback): Component<Drops> {
  return {
    $template: template,
    props,
    store,

    // Handle clicks for pin button
    clickTopbarPinButton(event, action) {
      callback(event.type, action, props, store);
    },

    // Handle mouseenters for pin button
    mouseEnterTopbarPinButton(event, action) {
      callback(event.type, action, props, store);
    },
    // Handle mouseleaves for pin button
    mouseLeaveTopbarPinButton(event, action) {
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
      callback(event.type, action, props, store);
    },
  }
}

export function DropsPanelItem(template: string, props: DropsProps, store: any, callback: MouseEventCallback): Component<DropsPanelItem> {
  return {
    $template: template,
    props,
    store,

    // Handle clicks on panel items (e.g. delete button)
    clickPanelItem(event, action, extraParams) {
      callback(event.type, action, props, store, extraParams);
    },

    // Handle sorting, filtering and adding drop counts per hour
    process(dropCounts) {
      let panelSettings = props.context.settings.section('Panel');

      if (panelSettings.get('show-drops-per-hour')) {
        const elapsedTimeInHours = (Date.now() - props.startTime) / (1000 * 60 * 60);

        dropCounts.forEach((drop) => {
          const formatter = new Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          });
          drop.dropsPerHour = formatter.format(drop.qty / elapsedTimeInHours);
        })
      }

      let sortRule;
      switch (panelSettings.get('panel-sorting')) {
        case 'by-category':
          sortRule = SortRules.sortByCategory;
          break;
        case 'by-quantity-desc':
          sortRule = SortRules.sortByQuantityDesc;
          break;
        case 'by-quantity-asc':
          sortRule = SortRules.sortByQuantityAsc;
          break;
        case 'by-alpha-asc':
          sortRule = SortRules.sortByAlphaAsc;
          break;
        case 'by-alpha-desc':
          sortRule = SortRules.sortByAlphaDesc;
          break;
        default:  // includes 'by-order-received'
          return dropCounts;  // Pass back unsorted array.
      }

      // Make a shallow copy of the drops array to sort and return to the list.
      // This allows a sort without reordering elements in the original array and without duplicating Notif objects.
      let dropCountsSorted = Array.from(dropCounts);
      dropCountsSorted.sort(sortRule);
      
      return dropCountsSorted;
    },
  }
}

export function DropsPanelDropdown(template: string, props: DropsProps, store: any, callback: MouseEventCallback): Component<DropsPanelDropdown> {
  return {
    $template: template,
    props,
    store,
    clickDropdownMenu(event, action) {
      callback(event.type, action, props, store);
    },
  }
}