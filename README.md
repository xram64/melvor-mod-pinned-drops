# ![Pushpin](src/img/icon_32.png) Pinned Drops – A [Melvor Idle](https://melvoridle.com) Mod

## Description
Keeps track of drop notifications in a persistent list to easily calculate total XP, item, and currency gains over the duration of a skill training session.

See exactly how much gold you collected during an hour of Thieving, or how many gems dropped over a session of Mining.


## Design
To record notifications, we add a [patch](https://wiki.melvoridle.com/w/Mod_Creation/Mod_Context_API_Reference#patch(className:_class,_methodOrPropertyName:_string):_MethodPatch_%7C_PropertyPatch) to the `addNotification()` function.

**`NotificationsManager.prototype.addNotification(key, notification)`:**
- `key` is an object representing the type of notification that was sent and containing info about the action or event the notification originated from.
- `notification` is a small dictionary that holds the text, quantity, and media URI needed to render the actual notification popup.


## Changelog

### v1.0 (10/24/24)
- Initial release.


## Resources
### Template
Built using [melvor-idle-mod-boilerplate-ts](https://github.com/CherryMace/melvor-idle-mod-boilerplate-ts).

### Icon
*Pushpin* emoji from the [au by KDDI, Type D-3](https://emojipedia.org/au-kddi/type-d-3/pushpin) set.