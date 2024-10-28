// Modules
import { ItemCounts, Drops, DropsPanel, DropsPanelItem, DropsProps, NotifTag } from '../components/Drops/Drops';

// Styles (relative to this file)
import '../css/styles.css';

// Images (relative to this file)
import '../img/icon.png';
import '../img/pd-icon-dark.png';
import '../img/pd-icon-light.png';

// Global function references
declare function numberWithCommas(number: number, ignoreSetting?: boolean): string;  // `assets/js/built/utils.js`

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
 *    - Whether to show decimals in combat XP gains (or round).
 *    - Change font size.
 *  - Properly handle MasteryLevel, SummoningMark, and other notification types.
 *    - For MasteryLevel, make sure levels aren't accumulated (since notifications are sent as total current level).
 *  ? Also keep track of other info like gained Levels, Mastery XP, Mastery Pool XP, removed items (e.g. raw fish while cooking)?
 *  - Also keep track of actions done, like number of successful Thieving attempts (add setting to enable?)?
 *  - Adjust formatting for drops list.
 *    - Put `overflow-y-auto` class and `max-height: 60vh;` style on panel div to limit its size.
 *    ? Change z-index of panel?
 *    - Display a faint highlight or border around each line on hover.
 *    ✓ Embed icons in drops panel list to match ones used by notifications.
 *    ✓ Remove dots from <li> rows.
 *    ✓ Add commas to large numbers.
 *    ? Handle +/- signs in front of numbers (use function from `utils.js`)?
 *    ? Add visual groups for drops (Items, XP, Currency, ...)?
 *  - Show a small 'x' button next to each list item on hover which will clear that drop type from the list.
 *  - Make a `dev` branch and start pushing updates there.
 *  - Test with "Legacy Notifications" or note incompatibility in description.
 *  ? Replace `mouseenter`-type events with `pointerenter`-type events?
 *  ? Handle order/sorting for drops in panel list?
 *    - Sort options: Default (in first drop order), Alphabetical, By Type, By Amount
 *  ✓ Add icon to button, and a second icon (or modify the first) when button is clicked (sticky).
 *  ✓ Expand `dropCounts` to include more info, like icons (make object into a full class?).
 *  ✓ Refactor `dropCounts` to use a generated unique identifier as the index to each list entry, instead of relying on the `text` field?
 *    ✓ Use some operation like `Fishing Skill XP` -> `fishing-skill-xp`?
 */

/*  [ ISSUES ]
 *  - When too many notifications happen at once (e.g. when collecting a large buffer of combat loot), some of them are not displayed,
 *    and it seems that `addNotification` is also not fired for these, causing the mod to miss drops.
 */


export async function setup(ctx: Modding.ModContext) {
  // Because we're loading our templates.min.html file via the manifest.json, the templates aren't available until after the setup() function runs.
  ctx.onInterfaceReady(() => {
    // Add styles for button icon.
    createIconCSS(ctx);

    // Create a store to hold running counts for all drops, shared between components.
    const dropStore = ui.createStore({
      dropCounts: {} as ItemCounts,

      addDrop(id: string, label: string, type: NotificationType, icon: string, qty: number) {
        // If this drop type has already been seen, update its value in the map.
        if (id in this.dropCounts) {
          this.dropCounts[id].qty += qty;
          this.dropCounts[id].qtyText = numberWithCommas(this.dropCounts[id].qty)
        }
        // If this is a new drop type, add an entry to the map.
        else {
          this.dropCounts[id] = { label: label, type: type, icon: icon, qty: qty, qtyText: numberWithCommas(qty) }
        }
      },

      clearAllDrops() {
        delete this.dropCounts;
        this.dropCounts = {} as ItemCounts;
      },

    });

    // Build props to pass down to Drops components.
    const props: DropsProps = { label: "Pinned Drops", sticky: false };

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

  const actionMap = new Map([['start', 2], ['stop', 4], ['reset', 6]]);

  // TEST
  if (eventType === 'click') {
    switch (action) {
      case 'start':
        console.log('start');
        break;
      case 'stop':
        console.log('stop');
        break;
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
    // Values for `key.type` are defined in `NotificationType` (`src\ts\types\gameTypes\notifications.d.ts`) as a base,
    //  and extended by classes in `/assets/js/built/notifications.js`:
    const keyTypesAll = ['AddItem', 'RemoveItem', 'AddGP', 'RemoveGP', 'AddSlayerCoins', 'RemoveSlayerCoins', 'SummoningMark', 'Error', 'Success', 'Info', 'AddCurrency', 'RemoveCurrency', 'SkillXP', 'AbyssalXP', 'MasteryLevel'];
    const keyTypesSkills = ['AddItem', 'AddGP', 'AddSlayerCoins', 'SummoningMark', 'Error', 'Success', 'Info', 'AddCurrency', 'SkillXP', 'AbyssalXP', 'MasteryLevel'];

    ctx.patch(NotificationsManager, "addNotification").after(
      // Note: `this.activeNotifications` contains a list of all notifications currently being displayed on the screen.

      // This patch function receives the return value `_` (void for this function), and the `key` and `notification` args of any call to `addNotification`.
      function(_, key, notification) {  // `addNotification(key, notification) -> _`

        // ==== TEST ====
        if (['MasteryLevel', 'AddGP', 'RemoveGP', 'AddSlayerCoins', 'RemoveSlayerCoins', 'AddCurrency', 'RemoveCurrency', 'SummoningMark', 'Error', 'Success', 'Info'].includes(key.type)) {
          // console.log(key);
          // console.log(notification);
        }

        // Create a unique identifier that will keep track of this drop type in the list.
        let notifId = '';
        // Some notifications don't populate the `notification.text` field, so process the notification types to determine a final label.
        let notifLabel = '';

        // Handle GP
        if (['AddGP', 'RemoveGP'].includes(key.type)) {
          notifId = `${NotifTag.CURRENCY}:gp`;
          notifLabel = 'GP';
        }
        // Handle SC
        else if (['AddSlayerCoins', 'RemoveSlayerCoins'].includes(key.type)) {
          notifId = `${NotifTag.CURRENCY}:sc`;
          notifLabel = 'SC';
        }
        // Handle other currencies (AC, ASC, RC)
        else if (['AddCurrency', 'RemoveCurrency'].includes(key.type)) {
          // Since other currencies don't provide a `notification.text` or any other identification, infer the currency type from the `media` URI.
          const mediaName = notification.media.match(/main\/([\w]+)\.png/)[1];  // e.g. `https://[URL]/assets/media/main/abyssal_pieces.png`
          switch (mediaName) {
            case 'abyssal_pieces':
              notifId = `${NotifTag.CURRENCY}:ap`;
              notifLabel = 'AP';
              break;
            case 'abyssal_slayer_coins':
              notifId = `${NotifTag.CURRENCY}:asc`;
              notifLabel = 'ASC';
              break;
            case 'raid_coins':
              notifId = `${NotifTag.CURRENCY}:rc`;
              notifLabel = 'RC';
              break;
            default:
              notifId = `${NotifTag.CURRENCY}:unknown`;
              notifLabel = '';
              console.error(`[Pinned Drops] Currency type '${mediaName}' not recognized, from path '${notification.media}'.`);
          }
        }
        // Handle Mastery Levels
        else if (key.type == 'MasteryLevel') {
          // TODO: `notification.quantity` gives the total current mastery level, so it cannot be accumulated the same way as other drops.
          //       This will need to be changed in the `addDrop` definition if mastery level gains are included in the drop list.
          // HACK: Ignore for now.
          return;
        }
        // Handle info messages
        else if (['Error', 'Success', 'Info'].includes(key.type)) {
          // HACK: Ignore for now.
          return;
        }
        // Handle all other drop types ('AddItem', 'RemoveItem', 'SkillXP', 'AbyssalXP', 'SummoningMark')
        else {
          // Determine the correct tag for this notification type.
          let tag = NotifTag.UNKNOWN;
          if (['AddItem', 'RemoveItem'].includes(key.type)) tag = NotifTag.ITEM;
          else if (['SkillXP', 'AbyssalXP'].includes(key.type)) tag = NotifTag.SKILL;
          else if (['SummoningMark'].includes(key.type)) tag = NotifTag.MARK;
          
          notifLabel = notification.text;
          notifId = `${tag}:${formatUniqueId(notifLabel)}`;
        }
        
        // Whenever a new drop notification is triggered, capture it in the store.
        dropStore.addDrop(notifId, notifLabel, key.type, notification.media, notification.quantity);
      });
}

function formatUniqueId(label: string): string {
  // Format notification text strings into unique IDs.
  let id;

  id = label.toLowerCase()              // Convert to lowercase
            .replace(/\s/g, '-')        // Replace all spaces with dashes
            .replace(/[^\w\s-]/g, '');  // Remove any symbols (`+`, `!`, `.`, `()`)


  /* TODO: Possible formatting for `SummoningMark`s?
  id = label.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\d/g, '')
            .trim()
            .replace(/\s/g, '-');
  */

  return id;
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