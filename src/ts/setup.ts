// Modules
// You can import script modules and have full type completion
import { Counts, Drops, DropsPanel, DropsPanelItem, DropsProps, MouseEvent, EventCallback } from '../components/Drops/Drops';

// Data
// Game data for registration
import ModData from '../data/data.json';  // TODO: ????

// Styles
// Will automatically load your styles upon loading the mod
import '../css/styles.css';

// Images
// To bundle your mod's icon
import '../img/icon.png';
// Reference images using `ctx.getResourceUrl`
import LargeIcon from '../img/icon_large.png';


/*  [ TODO ]
 *  - Add icon to button, and a second icon (or modify the first) when button is clicked (sticky).
 *  - Properly handle MasteryLevel, SummoningMark, and other notification types properly.
 *    - For MasteryLevel, make sure levels aren't accumulated (since notifications are sent as total current level).
 *  - Expand `dropCounts` to include more info, like icons (make object into a full class?).
 *  - Fix formatting for drops list.
 *    - Embed icons in drops panel list to match ones used by notifications.
 *    - Remove dots from <li> rows.
 *    - Handle +/- signs in front of numbers. (Find npm package?)
 *    - Add commas to large numbers. (Find npm package?)
 *  - Handle order/sorting for drops in panel list.
 *  - Add settings. Include different button/dropdown location options?
 *  - Add functionality to start/stop/reset drop collection.
 *    - Alternatively, add "tabs" to drops panel for different sections.
 *    - An "Overall" section to hold all drops received across a whole session.
 *    - A "Session" section to hold drops received after the player presses a Start button (include buttons at top of tab?).
 *  - Clean up `DropsPanelItem` component/template layout.
 *  - Add CSS styles.
 *  - Move some functions out of `setup.ts`?
 *  - Also keep track of other info like Mastery XP, Mastery Pool XP, removed items (e.g. raw fish while cooking)?
*/


export async function setup(ctx: Modding.ModContext) {
  // Register our GameData
  await ctx.gameData.addPackage(ModData);

  // Because we're loading our templates.min.html file via the manifest.json,
  // the templates aren't available until after the setup() function runs
  ctx.onInterfaceReady(() => {
    // Create a store to hold running counts for all drops, shared between components.
    const dropStore = ui.createStore({
      dropCounts: {} as Counts,

      addDrop(text: string, quantity: number) {
        // If this drop type has already been seen, update its value in the map.
        if (text in this.dropCounts)
          this.dropCounts[text] += quantity;
        // If this is a new drop type, add an entry to the map.
        else
          this.dropCounts[text] = quantity;
      }
    });

    // Add a button for the mod under the 'Modding' section of the sidebar.
    sidebar.category('Modding').item('Pinned Drops', {
      icon: ctx.getResourceUrl('img/icon.png'),
      onClick() {
        // TODO: Remove this code from `onClick`/sidebar and only run once, or add cleanup functionality.

        // Build props to pass down to Drops components
        const props: DropsProps = { label: "Pinned Drops", sticky: false }

        // Create button and panel components and add them to the top bar
        placeComponentsInTopbar(buttonCallback, props, dropStore);

        captureNotifications(ctx, props, dropStore);
      },
    });

  });
}


// Callback function to handle results of click and mouseover events on the mod button.
function buttonCallback(event: MouseEvent, props: DropsProps, store: any) {
  if (event === MouseEvent.CLICK) {
    // Use 'sticky' flag to override mouseover toggles when button has been clicked
    props.sticky = !props.sticky;
    document.getElementById("pd__topbar-panel").classList.toggle('show', props.sticky);
  }

  else if (event === MouseEvent.MOUSEENTER) {
    // Show drops panel (if 'sticky' flag is not set)
    if (!props.sticky)
      document.getElementById("pd__topbar-panel").classList.toggle('show', true);
  }

  else if (event === MouseEvent.MOUSELEAVE) {
    // Hide drops panel (if 'sticky' flag is not set)
    if (!props.sticky)
      document.getElementById("pd__topbar-panel").classList.toggle('show', false);
  }
}

// Adapted from [HandyDandyNotebook](https://github.com/WesCook/HandyDandyNotebook/blob/main/src/button.mjs)
function placeComponentsInTopbar(callback: EventCallback, props: DropsProps, dropStore: any) {

  /* | Button | */
	// Create mod button
	ui.create(Drops("#pd__T__topbar", props, dropStore, callback), document.body);
	const pinnedDropsDiv = document.getElementById("pd__topbar-container");
	const pinnedDropsButton = document.getElementById("pd__topbar-button");
  
	// Insert div before the 'potions' icon in the top bar
	const potionsDiv = document.getElementById("page-header-potions-dropdown").parentNode;
	const topBarFlexDiv = potionsDiv.parentNode;
  topBarFlexDiv.insertBefore(pinnedDropsDiv, potionsDiv);
  
  /* | Panel | */
  // Create drops panel (will not show until activated by mod button)
  ui.create(DropsPanel("#pd__T__topbar-panel", props), document.body);
	const pinnedDropsPanel = document.getElementById("pd__topbar-panel");
  pinnedDropsPanel.classList.toggle('show', false);  // Make sure `show` is initially off for panel

  // Append the panel to the parent pinned-drops div
  pinnedDropsDiv.appendChild(pinnedDropsPanel);

  /* | Panel List | */
  const pinnedDropsPanelItemlist = document.getElementById("pd__topbar-panel-itemlist");
  ui.create(DropsPanelItem("#pd__T__topbar-panel-item", props, dropStore), pinnedDropsPanelItemlist);
}

function captureNotifications(ctx: Modding.ModContext, props: DropsProps, dropStore: any) {

  // Only patch if we haven't already
  if (!ctx.isPatched(NotificationsManager, "addNotification")) {

    // `this.activeNotifications` contains a list of all notifications currently being displayed on the screen.

    // Values for `key.type` are defined in `NotificationType` (`src\ts\types\gameTypes\notifications.d.ts`) as a base,
    //  and extended by classes in `/assets/js/built/notifications.js`:
    const keyTypesAll = ['AddItem', 'RemoveItem', 'AddGP', 'RemoveGP', 'AddSlayerCoins', 'RemoveSlayerCoins', 'SummoningMark', 'Error', 'Success', 'Info', 'AddCurrency', 'RemoveCurrency', 'SkillXP', 'AbyssalXP', 'MasteryLevel'];
    const keyTypesSkills = ['AddItem', 'AddGP', 'AddSlayerCoins', 'SummoningMark', 'Error', 'Success', 'Info', 'AddCurrency', 'SkillXP', 'AbyssalXP', 'MasteryLevel'];

    ctx.patch(NotificationsManager, "addNotification").after(
      function(_, key, notification) {
        
        // HACK: Ignore `MasteryLevel` and other notifications until they're handled properly:
        if (key.type in ['MasteryLevel', 'Error', 'Success', 'Info'])
          return;
        
        // Whenever a new drop notification is triggered, capture it in the store.
        dropStore.addDrop(notification.text, notification.quantity);
      });

  }

}
