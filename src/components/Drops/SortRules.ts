import { Notif, QueuedNotifTypes } from './Drops';


/**** By Category ****/
const notifTypeOrder: QueuedNotifTypes[] = [
  'Currency',
  'Item',
  'SkillXP', 'AbyssalXP',
  'LevelUp', 'AbyssalLevelUp',
  'Mastery', 'Mastery99',
  'Player', 'Preserve', 'ItemCharges',
  'Stun', 'BankFull', 'TutorialTask'
];
const sortByCategory = (a: Notif, b: Notif) => {
  // Convert the type of each item into its index in the `notifTypeOrder`.
  const aTypeIndex = notifTypeOrder.findIndex((type: QueuedNotifTypes) => type === a.type);
  const bTypeIndex = notifTypeOrder.findIndex((type: QueuedNotifTypes) => type === b.type);

  // Compare indices and sort types earlier in the order first.
  // Items with the same type (returning 0) will be kept in their original order (by order received).
  return aTypeIndex - bTypeIndex;
};

/**** By Quantity (Highest first) ****/
const sortByQuantityDesc = (a: Notif, b: Notif) => b.qty - a.qty;

/**** By Quantity (Lowest first) ****/
const sortByQuantityAsc = (a: Notif, b: Notif) => a.qty - b.qty;

/**** Alphabetically (A-Z) ****/
const sortByAlphaAsc = (a: Notif, b: Notif) => a.label == b.label ? 0 : (a.label.replace(/[()]/g, '') > b.label.replace(/[()]/g, '') ? 1 : -1);

/**** Alphabetically (Z-A) ****/
const sortByAlphaDesc = (a: Notif, b: Notif) => a.label == b.label ? 0 : (a.label.replace(/[()]/g, '') < b.label.replace(/[()]/g, '') ? 1 : -1);


const SortRules = {
  'sortByCategory': sortByCategory,
  'sortByQuantityDesc': sortByQuantityDesc,
  'sortByQuantityAsc': sortByQuantityAsc,
  'sortByAlphaAsc': sortByAlphaAsc,
  'sortByAlphaDesc': sortByAlphaDesc,
};
export default SortRules;