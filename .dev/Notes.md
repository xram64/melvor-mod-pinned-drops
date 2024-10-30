# Webpack Reference

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

## Location
Melvor Idle DevTools: `/assets/js/built/notifications.js`
`GameNotificationElement`

## Class
```js
class GameNotificationElement extends HTMLElement {
    constructor() {
        super();
        this._content = new DocumentFragment();
        this._content.append(getTemplateNode('game-notification-template'));
        this.container = getElementFromFragment(this._content, 'container', 'div');                 // ??
        this.media = getElementFromFragment(this._content, 'media', 'img');                         // Image thumbnail of item or skill icon
        this.quantity = getElementFromFragment(this._content, 'quantity', 'span');                  // ?Main quantity being added/subtracted?
        this.divQuantity = getElementFromFragment(this._content, 'div-quantity', 'div');            // ?Whether quantity is + or -?
        this.text = getElementFromFragment(this._content, 'text', 'span');                          // Text label for the item/skill (if enabled)
        this.inBank = getElementFromFragment(this._content, 'in-bank', 'span');                     // ?Total quantity in bank for items (right side)?
        this.iconImportant = getElementFromFragment(this._content, 'icon-important', 'div');        // ?Tag indicating an important (sticky) notification?
        this.splashContainer = getElementFromFragment(this._content, 'splash-container', 'div');    // ??
    }
    get isCompact() {
        return this.container.classList.contains('compact');
    }
    connectedCallback() {
        this.appendChild(this._content);
        this.initSplashManager();
    }
    initSplashManager() {
        this.splashManager = new SplashManager(this.splashContainer);
    }
    setNotification(key, notification, game) {
        this.media.src = notification.media;
        this.setQuantity(notification, key.type);
        if (game.settings.showItemNamesInNotifications)
            this.setText(notification.text);
        this.toggleCompact();
    }
    setImportance(key, notification, game) {
        if (notification.isImportant) {
            this.container.style.pointerEvents = 'all';
            this.container.classList.add('pointer-enabled');
            this.iconImportant.classList.remove('d-none');
            this.container.onclick = ()=>{
                game.notifications.removeNotification(key);
            }
            ;
        } else {
            this.container.style.pointerEvents = 'none';
            this.container.classList.remove('pointer-enabled');
            this.iconImportant.classList.add('d-none');
            this.container.onclick = ()=>{}
            ;
        }
    }
    setTextMinWidth(width) {}
    setText(text) {
        this.text.innerHTML = text;
    }
    setInBankText(text) {
        this.inBank.textContent = text;
    }
    toggleCompact() {
        if (game.settings.useCompactNotifications) {
            this.container.classList.add('compact');
            this.media.classList.add('compact');
            this.quantity.classList.add('font-size-sm');
        } else {
            this.container.classList.remove('compact');
            this.media.classList.remove('compact');
            this.quantity.classList.remove('font-size-sm');
        }
    }
    setQuantity(notification, type) {
        if (notification.quantity === 0)
            this.divQuantity.classList.add('d-none');
        else
            this.divQuantity.classList.remove('d-none');
        const textClass = notification.quantity > 0 && !notification.isError ? 'text-success' : 'text-danger';
        const textSymbol = notification.quantity > 0 && !notification.isError && type !== 'MasteryLevel' ? '+' : '';
        this.quantity.classList.add(textClass);
        let qty = `${textSymbol}${numberWithCommas(notification.quantity)}`;
        if (notification.isError) {
            for (let i = 3; i < notification.quantity; i += 3) {
                if (i % 12 === 0)
                    qty = `${textSymbol}${numberWithCommas(notification.quantity)}`;
                qty += `?`;
            }
        }
        this.quantity.textContent = qty;
    }
    setBorder(colour) {
        this.container.style.border = `1px solid ${colour}`;
    }
    setBottomPos(pos) {
        this.container.style.bottom = `${pos}px`;
    }
    setHorizontalPos(posType) {
        switch (posType) {
        case 0:
            this.container.style.left = window.innerWidth >= 992 ? '245px' : '5px';
            this.container.style.marginRight = '60px';
            this.container.style.marginLeft = '';
            this.container.style.right = 'unset';
            this.container.style.transform = 'translateX(0%)';
            break;
        case 2:
            this.container.style.right = '0px';
            this.container.style.marginLeft = '10%';
            this.container.style.marginRight = '60px';
            this.container.style.left = 'unset';
            this.container.style.transform = 'translateX(0%)';
            break;
        case 1:
            this.container.style.left = '50%';
            this.container.style.marginRight = '-40%';
            this.container.style.marginLeft = '';
            this.container.style.right = 'unset';
            this.container.style.transform = 'translateX(-50%)';
        }
    }
    addPulse() {
        this.divQuantity.classList.add('pulseNotification');
    }
    removePulse() {
        this.divQuantity.classList.remove('pulseNotification');
    }
}

window.customElements.define('game-notification', GameNotificationElement);
```


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