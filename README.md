# ![Pushpin](src/img/icon_32.png) Pinned Drops – A [Melvor Idle](https://melvoridle.com) Mod

## Description
Keeps track of drop notifications in a persistent list to easily calculate total XP, item, and currency gains over the duration of a skill training session.

See exactly how much gold you collected during an hour of Thieving, or how many gems dropped over a session of Mining.

### Interface
...


## Design
To record notifications, we add a [patch](https://wiki.melvoridle.com/w/Mod_Creation/Mod_Context_API_Reference#patch(className:_class,_methodOrPropertyName:_string):_MethodPatch_%7C_PropertyPatch) to the `NotificationQueue.add()` function.

**`NotificationQueue.add(notification)`:**
- `notification: QueuedNotify` is a small dictionary that holds the text, quantity, and media URI needed to render the actual notification popup.


Initially, the mod patched the `NotificationsManager.prototype.addNotification(key, notification)` method, which is where notification data is sent immediately before being displayed. But this leads to an issue where some notifications could be missed when several different types of notifications are all fired at once (i.e. when collecting a full buffer of Master Farmer loot), due to the limit set by `NotificationQueue.maxNotifications` (20 by default).



## Changelog

### v1.0 (10/24/24)
- Initial release.


## Resources
### Template
Built using [melvor-idle-mod-boilerplate-ts](https://github.com/CherryMace/melvor-idle-mod-boilerplate-ts).

### Icon
*Pushpin* emoji from the [au by KDDI, Type D-3](https://emojipedia.org/au-kddi/type-d-3/pushpin) set.