// Modules
import { Notif, Drops, DropsPanel, DropsPanelItem, DropsProps, ExtraParams } from '../components/Drops/Drops';

import debounce from 'lodash.debounce';

// Styles (relative to this file)
import '../css/styles.css';
import '../css/styles-mobile.css';

// Images (relative to this file)
import '../img/icon.png';
import '../img/pd-icon-dark.png';
import '../img/pd-icon-light.png';

// Global function references
declare function numberWithCommas(number: number, ignoreSetting?: boolean): string;  // From `assets/js/built/utils.js`
declare function cdnMedia(baseURI: string): string;  // From `assets/js/built/assets.js` (equivalent to `assets.getURI()`)

// Game asset paths
const icon_MasteryLevel = "assets/media/main/mastery_header.png";

export async function setup(ctx: Modding.ModContext) {
  // Initialize props to pass down to components.
  const props: DropsProps = {
    label: "Pinned Drops",
    context: ctx,
    sticky: false,
    capturePaused: false,
    dropdownOptions: {'session': 'Session', 'window': 'Window'},  // TODO: [Dropdown View Menu]
    dropdownOptionActive: 'session',                              // TODO: [Dropdown View Menu]
  };

  // Create a store to hold running counts for all drops, shared between components.
  const dropStore = ui.createStore({
    dropCounts: [] as Array<Notif>,

    addDrop(notif: Notif) {
      // If an empty object was passed, ignore this drop.
      if (notif === undefined || !('id' in notif))
        return;

      // If capture is currently paused, ignore this drop.
      if (props.capturePaused)
        return;

      let newDropId = notif.id;

      let newDropIndex = this.dropCounts.findIndex((n: Notif) => n.id === newDropId);

      // If this drop ID has already been recorded, update the existing drop's quantity.
      if (newDropIndex !== -1) {
        this.dropCounts[newDropIndex].qty += notif.qty;
      }
      // If this is a new drop ID, add a new element for this drop.
      else {
        newDropIndex = this.dropCounts.push(notif) - 1;
      }

      // For either case, update the printable `qtyText` to match the new quantity.
      let qtyPrefix = (notif.type === 'Mastery' ? '+': '');  // Insert a `+` prefix for Mastery levels

      let qtyExact = this.dropCounts[newDropIndex].qty;

      // Show Decimals: On
      if (ctx.settings.section('Panel').get('show-decimals')) {
        this.dropCounts[newDropIndex].qtyText = `${qtyPrefix}${numberWithCommas(qtyExact)}`;
      }
      // Show Decimals: Off
      else {
        // Since skill XP values in `qty` may be fractional, round down `qtyText` before adding to the list.
        this.dropCounts[newDropIndex].qtyText = `${qtyPrefix}${numberWithCommas(Math.floor(qtyExact))}`;
      }
    },

    // Remove a drop from the store.
    removeDrop(dropId: string) {
      // Find the index of this drop in the store by its ID.
      let dropIndex = this.dropCounts.findIndex((n: Notif) => n.id === dropId);

      // If this drop ID cannot be found, ignore this request.
      if (dropIndex == -1)
        return;

      // If the ID was found, remove its entry from the array.
      this.dropCounts.splice(dropIndex, 1);
    },

    // Reset the list
    clearAllDrops() {
      delete this.dropCounts;
      this.dropCounts = [] as Array<Notif>;
    },

    // Force Vue to redraw the panel by quickly mutating the drops array.
    forceRefresh() {
      this.dropCounts.push(0);
      this.dropCounts.pop();
    },
  });

  // Initialize settings menu (must be before components are created).
  createSettings(ctx, dropStore);

  // Create UI (after offline progress is calculated and all base game UI elements are created).
  ctx.onInterfaceReady(() => {
    // Add styles for rendering pin button icon.
    createIconCSS(ctx);
    // Create button and panel components and position them according to settings.
    initializeComponents(props, dropStore);
    // Register patch to catch and handle notifications.
    captureNotifications(ctx, props, dropStore);
  });
}

//#region Callbacks

// Callback function to handle click and mouseover events on the pin button.
function callbackTopbarPinButton(eventType: string, action: string, props: DropsProps, store: any) {
  if (eventType === 'click') {
    // Use 'sticky' flag to override mouseover toggles when button has been clicked.
    props.sticky = !props.sticky;
    document.getElementById("pd__topbar-panel").classList.toggle('show', props.sticky);
    document.getElementById("pd__topbar-button").classList.toggle('sticky', props.sticky);

    // If the panel is now open and the `panel-pinned-behavior` setting is set to `pin-until-unfocus`,
    //  register an event handler on the next click outside of the panel to close it.
    if (props.sticky && props.context.settings.section('Panel').get('panel-pinned-behavior') === 'pin-until-unfocus') {
      _handleClicksOutsidePanel(props);
    }
  }

  else if (eventType === 'mouseenter') {
    // Show drops panel (if 'sticky' flag is not set)
    if (!props.sticky)
      document.getElementById("pd__topbar-panel").classList.toggle('show', true);
  }

  else if (eventType === 'mouseleave') {
    // Hide drops panel (if 'sticky' flag is not set)
    if (!props.sticky)
      document.getElementById("pd__topbar-panel").classList.toggle('show', false);
  }
}
// Event listener on `document` to catch clicks outside of drops panel.
function _handleClicksOutsidePanel(props: DropsProps) {
  setTimeout(() => {
    document.addEventListener("click", function _handleOutsideClick(event) {
      const target = event.target as HTMLElement;

      // Click landed outside panel (`closest` returned `null`)
      if (target.closest(".pinned-drops.dropdown-menu") === null) {
        // Note: This block will run even when the panel is manually closed by clicking the pin button,
        //  ensuring the listener will be cleaned up when the panel is hidden.

        // Hide panel
        props.sticky = false;
        document.getElementById("pd__topbar-panel").classList.toggle('show', props.sticky);
        document.getElementById("pd__topbar-button").classList.toggle('sticky', props.sticky);
        
        // Self cleanup
        document.removeEventListener("click", _handleOutsideClick);
      }
    });
  }, 0);  // Delay attaching the listener until the next event loop cycle to prevent firing on the click that opened the panel.
}

// Callback function to handle clicks on panel buttons.
function callbackPanelButtons(eventType: string, action: string, props: DropsProps, store: any) {
  if (eventType === 'click') {
    switch (action) {
      // Pause button
      case 'pause':
        props.capturePaused = !props.capturePaused;
        const pauseBtn = document.getElementById("pd__panel-header-button-pause");
        pauseBtn.classList.toggle('btn-light');     // On initially
        pauseBtn.classList.toggle('btn-warning');   // Off initially
        pauseBtn.classList.toggle('paused');        // Off initially
        break;
      // Reset button
      case 'reset':
        store.clearAllDrops();
        break;
      default:
        console.error(`[${props.label}] Unknown button name '${action}'`);
    }
  }
}

// Callback function to handle clicks on panel items.
function callbackPanelItem(eventType: string, action: string, props: DropsProps, store: any, extraParams: ExtraParams) {
  if (eventType === 'click') {
    switch (action) {
      // Delete button ('x')
      case 'delete':
        // If an empty object was somehow passed, ignore the event.
        if (extraParams === undefined || !('id' in extraParams))
          break;

        // Delete the corresponding drop from the drop store.
        store.removeDrop(extraParams.id);

        break;
      default:
        console.error(`[${props.label}] Unknown item action '${action}'`);
    }
  }
}

/*  TODO: [Dropdown View Menu]
function callbackDropdownMenu(eventType: string, action: string, props: DropsProps, store: any) {

  // [PLANNING]
  // To display drops received in a certain window (1min, 5min, ...),
  //   timestamps have to be recorded for each incoming drop.
  // But this also means every drop must be recorded separately so the 
  //   sum of their quantities can be calculated for the given window.

  if (eventType === 'click') {
    switch (action) {
      case 'session':
        //
        break;
      case 'window':
        //
        break;
      default:
        console.error(`[${props.label}] Unknown dropdown menu option '${action}'`);
    }
  }
}
*/


// Initialize DOM elements and call the appropriate function to place them.
function initializeComponents(props: DropsProps, dropStore: any) {

  /* || Button || */
	// Create mod button
	ui.create(Drops("#pd__T__topbar", props, dropStore, callbackTopbarPinButton), document.body);
	const pinnedDropsDiv = document.getElementById("pd__topbar-container");
	const pinnedDropsButton = document.getElementById("pd__topbar-button");

  /* || Panel || */
  // Create drops panel (will not show until activated by mod button)
  ui.create(DropsPanel("#pd__T__topbar-panel", props, dropStore, callbackPanelButtons), document.body);
	const pinnedDropsPanel = document.getElementById("pd__topbar-panel");
  pinnedDropsPanel.classList.toggle('show', false);  // Make sure `show` is initially off for panel
  // Append the panel to the parent pinned-drops div
  pinnedDropsDiv.appendChild(pinnedDropsPanel);

  /* || Panel List || */
  // Create the list element as a child of the panel
  const pinnedDropsPanelItemlist = document.getElementById("pd__topbar-panel-itemlist");
  ui.create(DropsPanelItem("#pd__T__topbar-panel-item", props, dropStore, callbackPanelItem), pinnedDropsPanelItemlist);


  // TODO: Check conditions here (including defaults and settings)
  //       to determine where the components should be placed.

  // HACK: (TEMPORARY) Force "topbar" mode.
  placeComponentsInTopbar(props, dropStore, pinnedDropsDiv, true)  // 'init' = true

}

// Adapted from [HandyDandyNotebook](https://github.com/WesCook/HandyDandyNotebook/blob/main/src/button.mjs)
function placeComponentsInTopbar(props: DropsProps, dropStore: any, pinnedDropsDiv: HTMLElement, init: boolean = false): any {
  // Define two positions for the top bar pin button, depending on device width:
  //  - Desktop (≥ 372px): Top-right button row in header, just left of potions button.
  //  - Mobile  (< 372px): Far left of second header row, opposite to 'cloud save' elements.

  // Note: On creation, the `pinnedDropsDiv` element is appended to `document.body`, and only moved into position
  //       by a `insertBefore()` call. In any case, `insertBefore()` *moves* the element from one parent to another,
  //       so no duplicate elements are made when calling this function multiple times.

  // If the 'init' flag is set, add an event listener to watch the width of the window.
  if (init) {
    const _debouncedResizeHandler = debounce(placeComponentsInTopbar, 250, { 'leading': true, 'trailing': true });
    window.addEventListener("resize", () => { _debouncedResizeHandler(props, dropStore, pinnedDropsDiv) });
  }

  // Desktop
  if (window.innerWidth >= 372) {
    // If the button is already in this position, don't try to move it again.
    if (pinnedDropsDiv.getAttribute('device-mode') == 'desktop') return

    const potionsDiv = document.getElementById("page-header-potions-dropdown").parentNode;
    const topBarDivForDesktop = potionsDiv.parentNode;
    topBarDivForDesktop.insertBefore(pinnedDropsDiv, potionsDiv);  // Move `pinnedDropsDiv` to immediate left of potions button
    pinnedDropsDiv.setAttribute('device-mode', 'desktop')
  }
  // Mobile
  else {
    // If the button is already in this position, don't try to move it again.
    if (pinnedDropsDiv.getAttribute('device-mode') == 'mobile') return

    const cloudSaveTimeSpan = document.getElementById("header-cloud-save-time");
    const topBarDivForMobile = cloudSaveTimeSpan.parentNode;
    topBarDivForMobile.insertBefore(pinnedDropsDiv, cloudSaveTimeSpan);  // Move `pinnedDropsDiv` to far left of cloud save row
    pinnedDropsDiv.setAttribute('device-mode', 'mobile')
  }

}

/* ~~~~ WIP ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function placeComponentsInSidebar(props: DropsProps, dropStore: any): any {

	// Add a custom category to the sidebar, just above the Combat section.
  sidebar.category('Pinned Drops', {
    name: '',
    before: 'Combat',  // TODO: Change to insert before/after another section, since "Into The Abyss" section is before Combat when expac is installed.
    toggleable: true,
    categoryClass: 'd-none',  // Hide category header label
  });
  // Add a button to the sidebar under the new category.
	sidebar.category('Pinned Drops').item('Pinned Drops', {
		nameClass: "pinned-drops-sidebar",
		icon: props.context.getResourceUrl("img/pd-icon-dark.png"),
		onClick() {
      // TODO: Replicate button behavior to open panel...
    },
	});
}
~~~~ WIP ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function captureNotifications(ctx: Modding.ModContext, props: DropsProps, dropStore: any) {
    const allNotifTypes = ['Item', 'Stun', 'BankFull', 'LevelUp', 'Player', 'ItemCharges', 'Mastery', 'Mastery99', 'Preserve', 'Currency', 'TutorialTask', 'SkillXP', 'AbyssalXP', 'AbyssalLevelUp'];

    ctx.patch(NotificationQueue, "add").after(
      // This patch function receives the return value `_` (void) and the `notification` arg of any call to `NotificationQueue.add`.
      function(_, notification) {

        // The `TutorialNotify` type only has a `type` field ('TutorialTask') and no `args` field, so skip it entirely.
        if (notification.type === 'TutorialTask')
          return;

        // Determine the type of notification and generate a `Notif` object with the relevant notification data.
        let notif: Notif;
        switch (notification.type) {
          case 'Item':
            notif = _handleItem(notification);
            break;
          case 'Stun':
            notif = _handleIgnore();  // Ignore
            break;
          case 'BankFull':
            notif = _handleIgnore();  // Ignore
            break;
          case 'LevelUp':
            notif = _handleLevelUp(notification);   // TODO: Needs testing
            break;
          case 'AbyssalLevelUp':
            notif = _handleLevelUp(notification);   // TODO: Needs testing
            break;
          case 'Player':
            notif = _handlePlayer(notification);    // TODO: Needs testing
            break;
          case 'ItemCharges':
            notif = _handleIgnore();  // Ignore
            break;
          case 'Mastery':
            notif = _handleMastery(notification);
            break;
          case 'Mastery99':
            notif = _handleMastery(notification);
            break;
          case 'Preserve':
            notif = _handleIgnore();  // Ignore
            break;
          case 'Currency':
            notif = _handleCurrency(notification);
            break;
          case 'SkillXP':
            notif = _handleXP(notification);
            break;
          case 'AbyssalXP':
            notif = _handleXP(notification);        // TODO: Needs testing
            break;
          default:
            notif = _handleIgnore();
        }
        
        dropStore.addDrop(notif);

      });
}

//#region Notifs
function _handleItem(notification: ItemNotify): Notif {
  /* [ Notes ]
   * `args[1]`: Quantity of item received (should always be an integer).
   * `args[0]['name']`: The name of the item.
   * `args[0]['category']`: For items received from skills, this is the name of the skill. (Not defined for all items.)
  */

  // Unique identifier for this type of drop. (e.g. `Item:Air_Rune`)
  let notifId = `${notification.type}:${notification.args[0]['localID']}`;

  return { id: notifId, label: notification.args[0]['name'], type: notification.type, icon: notification.args[0]['media'], qty: notification.args[1], qtyText: '' };
}
function _handleLevelUp(notification: LevelUpNotify | AbyssalLevelUp): Notif {
  return;  // TODO: Ignore for now.
}
function _handlePlayer(notification: PlayerNotify): Notif {
  return;  // TODO: Ignore for now.
}
function _handleMastery(notification: MasteryNotify | Mastery99Notify): Notif {
  /* [ Notes ]
   * `args[1]`: Contains the new Mastery level, so the quantity for these events should be overwritten, not accumulated.
   * `args[0]['name']`: The name of the action/item in a skill that has gained a Mastery level.
   * `args[0]['skill']['localID']`: The name of the skill associated with this action/item.
  */

  // Ignore `Mastery99` notifications
  if (notification.type === 'Mastery99') return;

  // Unique identifier for this type of drop. (e.g. `Currency:GP`)
  let notifId = `${notification.type}:${notification.args[0]['localID']}`;

  // Construct a label. The `extraIcon` will indicate this is a Mastery Level, so just add the full action name in parentheses here.
  let notifLabel = `(${notification.args[0]['name']})`;

  // For Mastery Levels, the regular `icon` is set to the Mastery Level icon (`mastery_header.png`), and the `extraIcon` is set to the action/item icon.
  // HACK: Setting `qty` to 1 to indicate +1 Mastery level will undercount if multiple levels are gained at once (i.e. when spending Mastery Pool XP).
  return { id: notifId, label: notifLabel, type: notification.type, icon: cdnMedia(icon_MasteryLevel), extraIcon: notification.args[0]['media'], qty: 1, qtyText: '' };
}
function _handleCurrency(notification: CurrencyNotify): Notif {
  /* [ Notes ]
   * `args[1]`: Amount of currency gained.
   * `args[0]['name']`: The name of the currency (GP, Slayer Coins, etc).
  */

  // Unique identifier for this type of drop. (e.g. `Currency:GP`)
  //@ts-ignore  (Type definitions under `CurrencyNotify` are incomplete and don't properly accommodate `args`)
  let notifId = `${notification.type}:${notification.args[0]['localID']}`;
  //@ts-ignore
  return { id: notifId, label: notification.args[0]['name'], type: notification.type, icon: notification.args[0]['media'], qty: notification.args[1], qtyText: '' };
}
function _handleXP(notification: SkillXPNotify | AbyssalXPNotify): Notif {
  /* [ Notes ]
   * `args[1]`: Amount of XP gained, as an exact decimal.
   * `args[0]['name']`: The name of the skill that gained XP.
  */

  // Unique identifier for this type of drop. (e.g. `SkillXP:Fishing`)
  let notifId = `${notification.type}:${notification.args[0]['localID']}`;

  // Construct a label. Skill XP `name` fields only contain the name of the skill, so "XP" should be appended.
  let notifLabel = `${notification.args[0]['name']} XP`;

  return { id: notifId, label: notifLabel, type: notification.type, icon: notification.args[0]['media'], qty: notification.args[1], qtyText: '' };
}
function _handleIgnore(): Notif {
  // Ignore this notification type
  return;
}
//#endregion


/* ~~~~ WIP ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export function placeNotebookButton(cb, newValue) {
  cleanupUI();

  // Get notebook button position
  let buttonPosition;
  if (newValue) { // If receiving update from settings change callback
    buttonPosition = newValue;
  } else { // Otherwise fall back to saved value
    const ctx = mod.getContext(import.meta);
    const sectionInterface = ctx.settings.section("Interface");
    buttonPosition = sectionInterface.get("button-position");
  }

  switch (buttonPosition) {
    case "topbar": placeButtonInTopbar(cb); break;
    case "minibar": placeButtonInMinibar(cb); break;
    case "sidebar": placeButtonInSidebar(cb); break;
    default: console.error("Invalid notebook button position"); break;
  }
}

// Remove old buttons, tooltips, and sidebar entries
function cleanupUI() {
const notebook = document.getElementById("notebook");

// Destroy tooltip if it exists
if (notebook && notebook._tippy) {
  notebook._tippy.destroy();
}

// Delete node
if (notebook) {
  notebook.remove();
}

// Remove sidebar entry if it exists
sidebar.category("").item("Handy Dandy Notebook").remove();
}

~~~~ WIP ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


//#region Settings
function createSettings(ctx: Modding.ModContext, dropStore: any) {

  /**** General ****/
	const sectionGeneral = ctx.settings.section("General");

  /* ~~~~ WIP ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // [Dropdown] Pin button position
  sectionGeneral.add({
		type: "dropdown",
		name: "pin-button-position",
		label: "Pin Button Position",
    hint: "Where notebook button is placed in interface.",
    options: [
      { value: "topbar", display: "Top Bar" },
      { value: "sidebar", display: "Sidebar" },
    ],
    default: "topbar",
		onChange: (newValue: string) => {
      Button.placeNotebookButton(openNotebook, newValue);
		},
	});
  ~~~~ WIP ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  /**** Panel ****/
	const sectionPanel = ctx.settings.section("Panel");

  // [Dropdown] Panel sorting options
	sectionPanel.add({
		type: "dropdown",
		name: "panel-sorting",
		label: "Panel Sorting",
    hint: "How should drops be sorted as they're added to the panel?",
		options: [
      { value: "by-order-received", display: "By Order Received (No sorting)" },
			{ value: "by-category", display: "By Category" },
			{ value: "by-quantity-desc", display: "By Quantity (Highest first)" },
			{ value: "by-quantity-asc", display: "By Quantity (Lowest first)" },
			{ value: "by-alpha-asc", display: "Alphabetically (A-Z)" },
			{ value: "by-alpha-desc", display: "Alphabetically (Z-A)" },
		],
    default: "by-order-received",
    onChange: (newValue: string) => {
      // Redraw panel immediately to reflect new sort order.
      dropStore.forceRefresh();
    },
	});

	// [Dropdown] Click behavior for pin button
	sectionPanel.add({
		type: "dropdown",
		name: "panel-pinned-behavior",
		label: "Pinned Panel Behavior",
    hint: "Keep the panel open until manually closed or just until another part of the UI is clicked?",
		options: [
      { value: "pin-until-toggle", display: "Stay pinned until toggled off" },
			{ value: "pin-until-unfocus", display: "Stay pinned until unfocused" },
		],
    default: "pin-until-toggle",
	});

	// [Switch] Show decimal XP gains
	sectionPanel.add({
    type: "switch",
		name: "show-decimals",
		label: "Show Decimal XP Gains?",
		hint: "Raw skill XP gains are often decimal numbers which are rounded before being displayed in-game.",
		default: false,
    onChange: (newValue: boolean) => {
      // FIX: This change is not immediate and will only apply when XP is added (`forceRefresh` doesn't work).
    },
	});


  /* TODO: [Dropdown View Menu]
  // [Dropdown] Default panel view
  sectionPanel.add({
    type: "dropdown",
    name: "panel-default-view",
    label: "Default Panel View",
    hint: "Which panel view should be shown first when the game is loaded?",
    options: [
      { value: "view-last", display: "(Keep last view)" },
      { value: "view-session", display: "Session" },
      { value: "view-window", display: "Window" },
    ],
    default: "view-last",
  });
  */
}

// Adapted from [HandyDandyNotebook](https://github.com/WesCook/HandyDandyNotebook/blob/main/src/button.mjs)
function createIconCSS(ctx: Modding.ModContext) {
  // Create styles pointing to icon URLs, which are applied to the button in `styles.css`.
	document.head.insertAdjacentHTML("beforeend",
	`<style>
	.pinned-drops {
		--icon-light: url("${ctx.getResourceUrl("img/pd-icon-light.png")}");
		--icon-dark: url("${ctx.getResourceUrl("img/pd-icon-dark.png")}");
	}
	</style>`);
}