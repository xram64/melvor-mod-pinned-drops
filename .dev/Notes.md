# Todo

```ts
/*
 *  [Settings]
 *    - Make panel background transparent. Or, toggle setting opacity (~75%) when panel is unfocused.
 *    - Checkboxes for what to track (toggle global filtering for different categories). [ Items | Equipment | Currency | XP | Mastery Levels ]
 *    - Set default mode dropdown menu option (Session/Window).
 *    - "Panel Location": [Top Bar - Normal] | [Top Bar - Sticky] | [Sidebar] | [Floating]
 *      - [Top Bar - Normal]: Panel in normal position (top-right), fixed to the top bar.
 *      - [Top Bar - Sticky]: Panel in normal position (top-right), but scrolls with page. (Use `position: sticky`?)
 *      - [Sidebar]: Inline sidebar list (list height setting? category positioning setting? collapsable?).
 *      - [Floating]: Floating pane that can be dragged and resized.
 *    ? Set panel horizontal position.
 *    ? Toggle sticky/float mode (absolute positioning for panel so that it scrolls with the page)
 *    ? Toggles for showing/hiding certain drop types in the list (filters).
 *    ? Change font size.
 *    ? Different button/panel location options (similar to HandyDandyNotebook)?
 *    ? Show/hide delete ('x') buttons on list rows.
 * 
 *  [Formatting]
 *    - Move panel or add setting to allow for adjusting panel position.
 *    - When sorted "By Category", add small section header lines above each category.
 *      - Add a new `Notif`s field "firstInSection" to flag the first element of each category in `dropCounts`,
 *        then assign an extra 'class' or 'id' to the tags for those list element so the headers can be placed before them?
 *    ? Add visual grouping for drops (Items, XP, Currency, ...)?
 * 
 *  [Dropdown View Menu]
 *    - (Use Firemaking log selection dropdown classes: Add `dropdown-item pointer-enabled` to dropdown items.)
 *    - An "Session" view to hold all drops received across a whole session.
 *    - A "Window" view to hold drops received within a specified time window (1min, 5min, 10min, ...).
 *    ? A "Skill" view to hold drops reveived within or relevant to the active skill.
 * 
 *  [Other]
 *    - To fix Mastery level issue: Consider adding a `before()` patch that checks the initial Mastery level.
 *    - Test with "Legacy Notifications" or note incompatibility in description.
 *    ? Also keep track of actions done, like number of successful Thieving attempts (add setting to enable?)?
 *    ? Replace `mouseenter`-type events with `pointerenter`-type events?
 * 
 *  [Done!]
 *    ✓ Add functionality to start/stop/reset drop collection.
 *    ✓ Make a `dev` branch and start pushing updates there.
 *    ✓ Add icon to button, and a second icon (or modify the first) when button is clicked (sticky).
 *    ✓ Expand `dropCounts` to include more info, like icons (make object into a full class?).
 *    ✓ Refactor `dropCounts` to use a generated unique identifier as the index to each list entry, instead of relying on the `text` field?
 *      ✓ Use some operation like `Fishing Skill XP` -> `fishing-skill-xp`?
 *    ✓ Show a small 'x' button next to each list item on hover which will clear that drop type from the list.
 *  Settings
 *    ✓ Click behavior for pin button: "Stay pinned until second click" / "Close when UI is clicked"
 *    ✓ List sorting options: "By Order Received", "By Category", "By Value", "Alphabetical".
 *    ✓ Whether to show decimals in combat XP gains (or round).
 *  Formatting
 *    ✓ Display a faint highlight or border around each line on hover.
 *    ✓ Put `overflow-y-auto` class and `max-height: 60vh;` style on panel div to limit its size.
 *    ✓ Embed icons in drops panel list to match ones used by notifications.
 *    ✓ Remove dots from <li> rows.
 *    ✓ Add commas to large numbers.
 *    ✓ [BUG] Panel goes off-screen on mobile.
*/
```

## Known Issues
```ts
/*
 *  - Equipped items fire notifications when unequipped as if they were new drops, so they also get picked up in the drops list.
 *  - If multiple Mastery Levels are gained at once (i.e. when spending Mastery Pool XP), only a '+1' will be recorded.
*/
```

-----------------------------------------------------------------------------------------------------------------------

# Mod Updates
> Checklist for pushing an update.
- *Push in-testing changes to `dev` branch, and merge to `master` branch when update is ready.*
- Increment version in `package.json` and run `npm install` to force-refresh `package-lock.json`.
- Run `npm buildzip` to generate a build in `/dist`, and a corresponding zip package in `/package`.
- Add a new entry to the changelog in `README.md`.
- Upload new version to **Mod.io**.
  1. Open the mod's [admin panel](https://mod.io/g/melvoridle/m/pinned-drops/admin/settings).
  2. In *Files*, upload the zip package from `/package` (via *Add a new file*).
  3. For the other boxes, enter the version number and **the body of the current changelog entry** only.
  4. In *Mod profile*, edit the Description to append the new changelog entry (copy from `README.md`).



## Webpack Reference
- All filepaths used for resources (images) should be relative to the copy of `manifest.json` emitted by webpack (not the source copy), except filepaths used in `import` statements in `.ts` source files.

- [Modules](https://webpack.js.org/configuration/module/)
- [Modules - Assets](https://webpack.js.org/guides/asset-modules)

-----------------------------------------------------------------------------------------------------------------------

# `NotificationsManager`

## Notification Types (`notification.text` :: `key.type`)
- +X Fishing Skill XP :: `SkillXP`
- +X Raw Carp :: `AddItem`
- X Mastery Token (Fishing) :: `AddItem`
- You managed to preserve your resources :: `Info`
- A crop is ready to harvest :: `Success`
- `<img class="newNotification-img compact" src="__ICON_FOR_LEVELED_ACTION__">` :: `MasteryLevel`
- You don't have the required materials to craft that. :: `Error`
- +X Mark of the Goblin Thief Discovered! (Level Y) :: `SummoningMark`

### Notes
- Level up notifications are not handled by `NotificationsManager` (e.g. +1 Farming Level), since they show up in their own modal at the top.
- Combat skills (Strength, Hitpoints, Prayer, etc) can get fractional XP gains (0.82), but these are handled differently by `addNotification` (how?).
- Currencies other than GP and Slayer Coins (SC) use the generic `AddCurrencyNotification`/`RemoveCurrencyNotification` types, currently including Abyssal Pieces (AP), Abyssal Slayer Coins (ASC), and Raid Coins (RC).
- Numbers in notifications use `text-success` (green) for positive qtys, and `text-danger` (red) for negative qtys. All numbers also use `font-w700` (font-weight: 700).

## Currencies
> Currency notifications don't include any fields that identify their currency type, except for the image URI passed to `notification.media`.
> See: `utils.js:currencyNotify()`, `currency.js:AbyssalPieces|AbyssalSlayerCoins|RaidCoins`
- **GP**: `assets/media/main/coins.png`
- **SC**: `assets/media/main/slayer_coins.png`
- **AP**: `assets/media/main/abyssal_pieces.png`
- **ASC**: `assets/media/main/abyssal_slayer_coins.png`
- **RC**: `assets/media/main/raid_coins.png`


# `NotificationQueue`

- The `NotificationQueue` class, defined in `utils.js`, puts incoming notifications into a queue.
- This class limits the number of notifications that can be displayed at once with `maxNotifications`.
  - If the limit is exceeded, notifications are dropped from the queue starting with the oldest (`queue[0]`).
  - Dropped notifications apparently don't make it to `addNotification`.
  - The limit is set to `20` when the queue is initialized (`this.notifications = new NotificationQueue(20);` in `baseManager.js`).
- The `BaseManager` class (`baseManager.js`) creates a `NotificationQueue` instance, which holds the `queue` array.
  - When a `BaseManager.render()` is performed, the `NotificationQueue.notify()` function is called, which fires a notification function depending on the type of event (e.g. `itemNotify`). The `queue` is then cleared.
  - Events are added to the queue by `NotificationQueue.add()` (also responsible for dropping notifications if the limit is exceeded).
  - Classes like `Player` (`player.js`) and `Skill` (`skill.js`) receive `game` and `manager` objects as arguments, which contain references to the `NotificationQueue` instance, in `game.combat.notifications` and `manager.notifications`.
    - `NotificationQueue.add()` is only called by functions in these classes. This seems to be the original source of all notifications.
    - Hooking `NotificationQueue.add()` may also give more information on the notification's source that can be used to filter out certain types (e.g. equip/unequip items).
    - The `add()` function fires for every item collected from combat loot, but summing each item's quantity will give the correct total.
    - All `SkillXP` events added to the queue have quantities provided in exact decimal form, not rounded as they are when they reach `addNotification()`.
    - Example `Player` events:
      - `{type: 'Player', args: [<Crafting>, "You don't have the required materials to Craft that.", "danger"]}`

## `NotificationQueue.add(notification)`
### `notification`
- The `notification` argument contains an object of type `QueuedNotify` with two fields: `{type: string, args: Array(2)}`.
  - `type`: A string indicating the type of event (e.g. `SkillXP`, `Item`, `Currency`, `Preserve`).
  - `args`: A 2-element array.
    - `args[0]`: An object holding more detailed info about the event (e.g. `Cooking`, `FoodItem`, `GP`, `Summoning`).
    - `args[1]`: A number containing the quantity (in most cases) or a message (for `Info`/`Success`/`Error` notifications).
- One type of notification, `TutorialNotify`, is missing the `args` field and only has a `type`.
- The pair (`notification.type`, `notification.args[0]['localID']`) seems to be unique for each differentiable notification type.
- For some event types (like `Player`), `args` can contain up to 4 elements.


```js
class NotificationQueue {
    constructor(maxNotifications) {
        this.maxNotifications = maxNotifications;
        this.queue = [];
        this.disableQueueLimit = false;
    }
    notify() {
        this.queue.forEach((notification) => {
            switch (notification.type) {
                case 'Item':
                    itemNotify(...notification.args);
                    break;
                ...
                case 'SkillXP':
                    skillXPNotify(...notification.args);
                    break;
                case 'AbyssalXP':
                    abyssalXPNotify(...notification.args);
                    break;
            }
        });
        this.queue = [];
    }
    add(notification) {
        if (this.queue.length === this.maxNotifications && !this.disableQueueLimit) {
            this.queue.splice(0, 1);
        }
        this.queue.push(notification);
    }
    clear() {
        this.queue = [];
    }
    disableMaxQueue() {
        this.disableQueueLimit = true;
    }
    enableMaxQueue() {
        this.disableQueueLimit = false;
    }
}
```

-----------------------------------------------------------------------------------------------------------------------

# `game-notification`

## Examples:

```html
<game-notification>
    <div class="newNotification overlay-container overlay-top overlay-right compact" style="z-index: 1000; bottom: 5px; border: 1px solid rgb(27, 159, 18); left: 50%; margin-right: -40%; right: unset; transform: translateX(-50%); pointer-events: none;">
        <div class="flex-notify">
            <img class="newNotification-img compact" src="https://cdn2-main.melvor.net/assets/media/bank/summoning_tablet_ent.png">
            <div class="mr-2">
                <div class="position-relative font-size-sm font-w600 text-info"></div>
                <div class=""><span class="font-w700 text-success font-size-sm">+200</span></div>
            </div>
            <span class="text-white font-size-xs justify-vertical-center mr-1">Ent</span>
            <span class="text-warning font-size-xs justify-vertical-center">200</span>
        </div>
        <div class="overlay-item text-warning d-none"><i class="fa fa-exclamation-circle"></i></div>
    </div>
</game-notification>
```

```html
<game-notification>
    <div class="newNotification overlay-container overlay-top overlay-right compact" style="z-index: 1000; bottom: 71px; border: 1px solid rgb(92, 172, 229); left: 50%; margin-right: -40%; right: unset; transform: translateX(-50%); pointer-events: none;">
        <div class="flex-notify">
            <img class="newNotification-img compact" src="https://cdn2-main.melvor.net/assets/media/skills/thieving/thieving.png">
            <div class="mr-2">
                <div class="position-relative font-size-sm font-w600 text-info"><div class="splash-animation text-success splash-shadow" style="left: 100%;">30</div></div>
                <div class=""><span class="font-w700 text-success font-size-sm">+60</span></div>
            </div>
            <span class="text-white font-size-xs justify-vertical-center mr-1">Thieving Skill XP</span>
            <span class="text-warning font-size-xs justify-vertical-center"></span>
        </div>
        <div class="overlay-item text-warning d-none"><i class="fa fa-exclamation-circle"></i></div>
    </div>
</game-notification>
```

```html
<game-notification>
    <div class="newNotification overlay-container overlay-top overlay-right compact" style="z-index: 1000; bottom: 5px; border: 1px solid yellow; left: 50%; margin-right: -40%; right: unset; transform: translateX(-50%); pointer-events: none;">
        <div class="flex-notify">
            <img class="newNotification-img compact" src="https://cdn2-main.melvor.net/assets/media/main/coins.png">
            <div class="mr-2">
                <div class="position-relative font-size-sm font-w600 text-info"></div>
                <div><span class="font-w700 text-success font-size-sm">+431</span></div>
            </div>
            <span class="text-white font-size-xs justify-vertical-center mr-1"></span>
            <span class="text-warning font-size-xs justify-vertical-center"></span>
        </div>
        <div class="overlay-item text-warning d-none"><i class="fa fa-exclamation-circle"></i></div>
    </div>
</game-notification>
```

-----------------------------------------------------------------------------------------------------------------------

# Snippets

## Sidebar button
Part of initial `melvor-idle-mod-boilerplate-ts` template, in the `setup()` function of `setup.ts`.
```ts
// Add a button for the mod under the 'Modding' section of the sidebar.
sidebar.category('Modding').item('Pinned Drops', {
    icon: ctx.getResourceUrl('img/icon.png'),
    onClick() {
        // Code to run when the sidebar button is clicked.
    },
});
```