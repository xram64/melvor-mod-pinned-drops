//@ts-nocheck

// Original version of `captureNotifications` function from `setup.ts`.
// Replaced with a patch to the `add()` function of `NotificationQueue` in v0.5.0 (10/29/24).

function captureNotifications(ctx: Modding.ModContext, props: DropsProps, dropStore: any) {
    // Values for `key.type` are defined in `NotificationType` (`src\ts\types\gameTypes\notifications.d.ts`) as a base,
    //  and extended by classes in `/assets/js/built/notifications.js`:
    const keyTypesAll = ['AddItem', 'RemoveItem', 'AddGP', 'RemoveGP', 'AddSlayerCoins', 'RemoveSlayerCoins', 'SummoningMark', 'Error', 'Success', 'Info', 'AddCurrency', 'RemoveCurrency', 'SkillXP', 'AbyssalXP', 'MasteryLevel'];
    const keyTypesSkills = ['AddItem', 'AddGP', 'AddSlayerCoins', 'SummoningMark', 'Error', 'Success', 'Info', 'AddCurrency', 'SkillXP', 'AbyssalXP', 'MasteryLevel'];

    ctx.patch(NotificationsManager, "addNotification").after(
      // This patch function receives the return value `_` (void for this function), and the `key` and `notification` args of any call to `addNotification`.
      function(_, key, notification) {

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


// Original version of `formatUniqueId` utility function from `setup.ts`.

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