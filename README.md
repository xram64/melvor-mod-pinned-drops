# ![Pushpin](src/img/icon_32.png) Pinned Drops – A [Melvor Idle](https://melvoridle.com) Mod

## Description
Stores drop notifications in a persistent list to easily track total XP, item, and currency gains over the duration of a skill training session.

**Use Pinned Drops to see:**
- The exact amount of GP you collected during an hour of Thieving.
- How many Slayer Coins you gained during a Slayer task.
- The number of each type of gem dropped over a session of Mining.
- How much Attack or Strength XP you gained in a dungeon.

### Features
- Adds a Pin button to the top bar (next to the Potions menu button).
- Hover over the Pin button to momentarily show the drops Panel, or click to pin the Panel in place.
- Use the buttons at the top of the Panel to 'Pause' drop collection or 'Reset' and clear the list.
- Sort the Panel by category, quantity, name, or order received (see Mod Settings).
- Toggle whether to show the exact decimal values of XP gains or the usual rounded values (see Mod Settings).


## Changelog

### `v1.0.0` (11/2/24)
- Initial release.


## Design
To record notifications, we add a [patch](https://wiki.melvoridle.com/w/Mod_Creation/Mod_Context_API_Reference#patch(className:_class,_methodOrPropertyName:_string):_MethodPatch_%7C_PropertyPatch) to the `NotificationQueue.add()` function. Any item drops, currency flow, XP gains, or info messages that will eventually become notifications (including some that won't) are processed by this function first.

The patch captures any relevant notification objects and adds them to a global [store](https://wiki.melvoridle.com/w/Mod_Creation/Reusable_Components_with_PetiteVue#ui.createStore(props:_Record%3Cstring,_unknown%3E):_ComponentStore).

Using a PetiteVue template with a [`v-for`](https://vuejs.org/guide/essentials/list.html#v-for) directive, list items are generated for each drop and dynamically added to the drops panel as they're captured in the store.

### `NotificationQueue.add(notification)`
> Defined in the base game file `assets/js/built/utils.js`.
- `notification: QueuedNotify` is an object that typically contains two properties: `type` and `args`.
  - `notification.type` is a string indicating the type or category of the drop (`Item`, `SkillXP`, `Currency`, `BankFull`, etc).
  - `notification.args` is an array typically containing 2 elements, but may contain up to 4.
    - `notification.args[0]` An object holding more detailed info about the event (e.g. `Cooking`, `FoodItem`, `GP`, `Summoning`).
    - `notification.args[1]` is either a number indicating the quantity/amount of what was received, or in some cases a string message (for `Info`/`Success`/`Error` type notifications).

### Development Note:
*Initially, the mod patched the `NotificationsManager.prototype.addNotification(key, notification)` method, which is where notification data is sent immediately before being displayed. But this leads to an issue where some notifications could be missed when several different types of notifications are all fired at once (i.e. when collecting a full buffer of Master Farmer loot), due to the limit set by `NotificationQueue.maxNotifications` (20 by default).*


## Resources
### Template
Built using [melvor-idle-mod-boilerplate-ts](https://github.com/CherryMace/melvor-idle-mod-boilerplate-ts).

### Icon
*Pushpin* emoji from the [au by KDDI, Type D-3](https://emojipedia.org/au-kddi/type-d-3/pushpin) set.
