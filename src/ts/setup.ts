// Modules
import { Notif, NotifCounts, Drops, DropsPanel, DropsPanelItem, DropsProps } from '../components/Drops/Drops';

// Styles (relative to this file)
import '../css/styles.css';

// Images (relative to this file)
import '../img/icon.png';
import '../img/pd-icon-dark.png';
import '../img/pd-icon-light.png';

// Global function references
declare function numberWithCommas(number: number, ignoreSetting?: boolean): string;  // From `assets/js/built/utils.js`
declare function cdnMedia(baseURI: string): string;  // From `assets/js/built/assets.js` (equivalent to `assets.getURI()`)

// Game asset paths
const icon_MasteryLevel = "assets/media/main/mastery_header.png";

/* *********************************************************************************************************************************************** */

/*  [ TODO ]
 *  - Add a dropdown list (or tabs?) to the drops panel to switch between different sections.
 *    - Use Firemaking log selection dropdown classes: Add `dropdown-item pointer-enabled` to dropdown items.
 *    - An "Overall" section to hold all drops received across a whole session.
 *    - A "Session" section to hold drops received after the player presses a Start button (include buttons at top of tab?).
 *      - Add a timer to also keep track of the elapsed time in a session (compute averages/hr?).
 *  - Add functionality to start/stop/reset drop collection.
 *  - Settings:
 *    - Different button/dropdown location options (similar to HandyDandyNotebook)?
 *    - Toggles for showing/hiding certain drop types in the list.
 *    - List sorting options: "By Order Received", "By Category", "By Value", "Alphabetical".
 *    - Whether to show decimals in combat XP gains (or round).
 *    - Change font size.
 *  - Adjust formatting for drops list.
 *    - Display a faint highlight or border around each line on hover.
 *    ? Add visual grouping for drops (Items, XP, Currency, ...)?
 *    ? Change z-index of panel?
 *    ✓ Put `overflow-y-auto` class and `max-height: 60vh;` style on panel div to limit its size.
 *    ✓ Embed icons in drops panel list to match ones used by notifications.
 *    ✓ Remove dots from <li> rows.
 *    ✓ Add commas to large numbers.
 *  - Show a small 'x' button next to each list item on hover which will clear that drop type from the list.
 *  - Test with "Legacy Notifications" or note incompatibility in description.
 *  ? Also keep track of actions done, like number of successful Thieving attempts (add setting to enable?)?
 *  ? Replace `mouseenter`-type events with `pointerenter`-type events?
 *  ✓ Make a `dev` branch and start pushing updates there.
 *  ✓ Add icon to button, and a second icon (or modify the first) when button is clicked (sticky).
 *  ✓ Expand `dropCounts` to include more info, like icons (make object into a full class?).
 *  ✓ Refactor `dropCounts` to use a generated unique identifier as the index to each list entry, instead of relying on the `text` field?
 *    ✓ Use some operation like `Fishing Skill XP` -> `fishing-skill-xp`?
*/

/*  [ KNOWN ISSUES ]
 *  - When an item is unequipped or replaced with a newly equipped item, a notification is fired as if it was received as a new drop.
 *  - If multiple Mastery Levels are gained at once (i.e. when spending Mastery Pool XP), only a '+1' will be recorded.
 *    (This could be fixed by adding a `before()` patch that checks the initial Mastery Level?)
*/

/* *********************************************************************************************************************************************** */


export async function setup(ctx: Modding.ModContext) {
  // Because we're loading our templates.min.html file via the manifest.json, the templates aren't available until after the setup() function runs.
  ctx.onInterfaceReady(() => {
    // Add styles for rendering pin button icon.
    createIconCSS(ctx);

    // Create a store to hold running counts for all drops, shared between components.
    const dropStore = ui.createStore({
      dropCounts: {} as NotifCounts,

      addDrop(notif: Notif) {
        // If an empty object was passed, ignore this drop.
        if (notif === undefined || !('id' in notif))
          return;

        // If capture is currently paused, ignore this drop.
        if (props.capturePaused)
          return;

        let id = notif.id;

        // If this drop type has already been seen, update its value in the map.
        if (id in this.dropCounts) {
          this.dropCounts[id].qty += notif.qty;
        }
        // If this is a new drop type, add an entry to the map.
        else {
          this.dropCounts[id] = notif;
        }

        // For either case, update the printable `qtyText` to match the new quantity:

        // Insert a `+` prefix into the `qtyText` string for certain notification types.
        let qtyPrefix = '';
        if (notif.type === 'Mastery')
          qtyPrefix = '+';

        // Since skill XP values may be fractional, `qty` will hold the exact value, but `qtyText` will be rounded down first.
        let qtyRounded = Math.floor(this.dropCounts[id].qty);
        this.dropCounts[id].qtyText = `${qtyPrefix}${numberWithCommas(qtyRounded)}`;
      },

      clearAllDrops() {
        delete this.dropCounts;
        this.dropCounts = {} as NotifCounts;
      },

    });

    // Initialize props to pass down to components.
    const props: DropsProps = { label: "Pinned Drops", sticky: false, capturePaused: false };

    // Create button and panel components and add them to the top bar.
    placeComponentsInTopbar(props, dropStore);

    // Register patch to catch and handle notifications.
    captureNotifications(ctx, props, dropStore);

  });
}


// Callback function to handle click and mouseover events on the pin button.
function callbackTopbarPinButton(eventType: string, action: string, props: DropsProps, store: any) {
  if (eventType === 'click') {
    // Use 'sticky' flag to override mouseover toggles when button has been clicked
    props.sticky = !props.sticky;
    document.getElementById("pd__topbar-panel").classList.toggle('show', props.sticky);
    document.getElementById("pd__topbar-button").classList.toggle('sticky', props.sticky);
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
        console.log('ERROR');
    }
  }
}

// Adapted from [HandyDandyNotebook](https://github.com/WesCook/HandyDandyNotebook/blob/main/src/button.mjs)
function placeComponentsInTopbar(props: DropsProps, dropStore: any) {

  /* | Button | */
	// Create mod button
	ui.create(Drops("#pd__T__topbar", props, dropStore, callbackTopbarPinButton), document.body);
	const pinnedDropsDiv = document.getElementById("pd__topbar-container");
	const pinnedDropsButton = document.getElementById("pd__topbar-button");
  
	// Insert div before the 'potions' icon in the top bar
	const potionsDiv = document.getElementById("page-header-potions-dropdown").parentNode;
	const topBarFlexDiv = potionsDiv.parentNode;
  topBarFlexDiv.insertBefore(pinnedDropsDiv, potionsDiv);
  
  /* | Panel | */
  // Create drops panel (will not show until activated by mod button)
  ui.create(DropsPanel("#pd__T__topbar-panel", props, dropStore, callbackPanelButtons), document.body);
	const pinnedDropsPanel = document.getElementById("pd__topbar-panel");
  pinnedDropsPanel.classList.toggle('show', false);  // Make sure `show` is initially off for panel

  // Append the panel to the parent pinned-drops div
  pinnedDropsDiv.appendChild(pinnedDropsPanel);

  /* | Panel List | */
  const pinnedDropsPanelItemlist = document.getElementById("pd__topbar-panel-itemlist");
  ui.create(DropsPanelItem("#pd__T__topbar-panel-item", props, dropStore), pinnedDropsPanelItemlist);
}

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
            notif = _handleLevelUp(notification);  // TODO: Needs testing
            break;
          case 'AbyssalLevelUp':
            notif = _handleLevelUp(notification);  // TODO: Needs testing
            break;
          case 'Player':
            notif = _handlePlayer(notification);  // TODO: Needs testing
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
            notif = _handleXP(notification);  // TODO: Needs testing
            break;
          default:
            notif = _handleIgnore();
        }

        // ---- TEST ----
        // console.log(notification);
        // console.log(notif);

        // Add the returned `notif` object to the `dropStore`.
        dropStore.addDrop(notif);

      });
}

//#region Notification Handlers
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

  // Ignore `Mastery99` notifications.
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
  //@ts-ignore
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
  // Ignore this notification type.
  return;
}
//#endregion


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