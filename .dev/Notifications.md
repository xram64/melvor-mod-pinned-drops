# Example `addNotification` args
> `addNotification` takes a `key` with detailed info about the logged action, and a `notification` with info specific to rendering the notification (icon, text, quantity).

## `AddItem` :: `AddItemNotification`
### `key`
```js
AddItemNotification {_type: 'AddItem', _item: FoodItem}
    _item: FoodItem
        category: "Cooking"
        emit: ƒ (n,t)
        golbinRaidExclusive: false
        healsFor: 24.2
        ignoreCompletion: false
        modQuery: ModifierQuery {enableCaching: true, set: Set(1), scopeSets: Array(9), caches: Map(0)}
        obtainFromItemLog: false
        off: ƒ (n,t)
        on: ƒ (n,t)
        sellsFor: {currency: GP, quantity: 807}
        stats: StatObject {}
        type: "Food"
        uid: 1442
        _customDescription: undefined
        _events: {all: Map(0), on: ƒ, off: ƒ, emit: ƒ}
        _localID: "Cave_Fish_Perfect"
        _media: "assets/media/bank/cavefish_cooked_perfect.png"
        _name: "Cave Fish (Perfect)"
        _namespace: {name: 'melvorD', displayName: 'Demo', isModded: false}
        altMedia: (...)
        artefactSizeAndLocation: (...)
        description: (...)
        descriptionFromData: (...)
        englishName: (...)
        hasDescription: (...)
        id: (...)
        isArtefact: (...)
        isGenericArtefact: (...)
        isModded: (...)
        localID: (...)
        media: (...)
        modifiedDescription: (...)
        name: (...)
        nameFromData: (...)
        namespace: (...)
        namespaceDisplayName: (...)
        wikiName: (...)
        [[Prototype]]: Item
    _type: "AddItem"
        item: (...)
        type: (...)
    [[Prototype]]: GenericNotification
```
### `notification`
```js
{media: 'chrome-extension://melvor/assets/media/bank/cavefish_cooked_perfect.png', quantity: 1, text: 'Cave Fish (Perfect)', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "chrome-extension://melvor/assets/media/bank/cavefish_cooked_perfect.png"
    quantity: 1
    text: "Cave Fish (Perfect)"
    [[Prototype]]: Object
```

## `SkillXP` :: `SkillXPNotification`
### `key`
```js
SkillXPNotification {_type: 'SkillXP', _skill: Cooking}
    _skill: Cooking
        BASE_CORRUPT_CHANCE: 5
        abyssalLevelCapButtons: [level-cap-purchase-button.d-none]
        abyssalMilestones: []
        acionItemQueryCache: Map(1) {CookingRecipe => ModifierQuery}
        actionMastery: Map(14) {CookingRecipe => {…}, CookingRecipe => {…}, CookingRecipe => {…}, CookingRecipe => {…}, CookingRecipe => {…}, …}
        actionQueryCache: Map(3) {CookingRecipe => ModifierQuery, CookingRecipe => ModifierQuery, CookingRecipe => ModifierQuery}
        actionTimer: Timer {type: 'Skill', _ticksLeft: 143, _maxTicks: 176, active: true, action: ƒ}
        actions: NamespaceRegistry {rootNamespaceMap: NamespaceMap, className: 'CookingRecipe', namespaceMaps: Map(2), registeredObjects: Map(32), dummyObjects: Map(0), …}
        activeCookingCategory: CookingCategory {_namespace: {…}, _localID: 'Fire', uid: 1785, realm: Realm, skill: Cooking, …}
        ancientRelicSets: Map(0) {size: 0}
        baseInterval: 0
        categories: NamespaceRegistry {rootNamespaceMap: NamespaceMap, className: 'CookingCategory', namespaceMaps: Map(1), registeredObjects: Map(3), dummyObjects: Map(0), …}
        currentRealm: Realm {_namespace: {…}, _localID: 'Melvor', uid: 2, unlockRequirements: Array(0), _name: 'Melvor Realm', …}
        equipMilestones: []
        game: Game {_events: {…}, loopInterval: 1272, loopStarted: true, on: ƒ, off: ƒ, …}
        header: skill-header
        headerItemCharges: [EquipmentItem]
        headerUpgradeChains: []
        ingredientRecipeMap: Map(20) {Item => CookingRecipe, Item => CookingRecipe, Item => CookingRecipe, Item => CookingRecipe, Item => CookingRecipe, …}
        isActive: true
        isGatingAbyssalLevelCapPurchases: false
        isGatingLevelCapPurchases: false
        itemQueryCache: Map(0) {size: 0}
        levelCapButtons: [level-cap-purchase-button.d-none]
        masteryLevelBonuses: (3) [MasteryLevelBonus, MasteryLevelBonus, MasteryLevelBonus]
        masteryLevelUnlocks: (11) [MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock, MasteryLevelUnlock]
        masteryPoolBonuses: Map(1) {Realm => Array(4)}
        masteryTokens: Map(1) {Realm => Array(1)}
        milestones: (32) [CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, SkillMasteryMilestone]
        minibarOptions: {defaultItems: Set(7), upgrades: Array(1), pets: Array(1)}
        modQuery: ModifierQuery {enableCaching: true, set: Set(1), scopeSets: Array(9), caches: Map(1)}
        off: ƒ (n,t)
        on: ƒ (n,t)
        passiveCookTimers: Map(0) {size: 0}
        pets: (2) [Pet, Pet]
        productRecipeMap: Map(64) {FoodItem => CookingRecipe, FoodItem => CookingRecipe, FoodItem => CookingRecipe, FoodItem => CookingRecipe, FoodItem => CookingRecipe, …}
        providedStats: StatProvider {modifiers: ModifierTable, enemyModifiers: ModifierTable, conditionalModifiers: Array(0), equipmentStats: Array(0), combatEffects: Array(0)}
        rareDrops: (3) [{…}, {…}, {…}]
        realmLoadFailed: false
        renderQueue: CookingRenderQueue {xp: false, level: false, xpCap: false, levelCapPurchase: false, abyssalLevelCapPurchase: false, …}
        selectedRecipes: Map(3) {CookingCategory => CookingRecipe, CookingCategory => CookingRecipe, CookingCategory => CookingRecipe}
        shouldResetAction: false
        skillTrees: NamespaceRegistry {rootNamespaceMap: NamespaceMap, className: 'SkillTree', namespaceMaps: Map(0), registeredObjects: Map(0), dummyObjects: Map(0), …}
        sortedMasteryActions: (31) [CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe, CookingRecipe]
        stockpileItems: Map(0) {size: 0}
        subcategories: NamespaceRegistry {rootNamespaceMap: NamespaceMap, className: 'CookingSubcategory', namespaceMaps: Map(1), registeredObjects: Map(2), dummyObjects: Map(0), …}
        timeToLevelPercentStart: 0
        timeToLevelTicks: 12411
        timeToLevelTracker: Map(0) {size: 0}
        toStrang: Pet {_namespace: {…}, _localID: 'Saki', uid: 2309, realms: Set(0), _name: 'Saki', …}
        totalMasteryActions: CompletionMap {data: Map(2)}
        totalMasteryActionsInRealm: SparseNumericMap {data: Map(1)}
        totalUnlockedMasteryActions: 29
        totalUnlockedMasteryActionsInRealm: SparseNumericMap {data: Map(1)}
        uid: 27
        unlockRequirements: []
        unlockUnlisteners: []
        _abyssalLevel: 1
        _abyssalXP: 0
        _currentAbyssalLevelCap: -1
        _currentLevelCap: -1
        _events: {emit: ƒ}
        _hasAbyssalLevels: false
        _level: 89
        _localID: "Cooking"
        _masteryPoolXP: SparseNumericMap {data: Map(1)}
        _media: "assets/media/skills/cooking/cooking.png"
        _namespace: {name: 'melvorD', displayName: 'Demo', isModded: false}
        _sortedMasteryActionsPerRealm: Map(0) {size: 0}
        _totalCurrentMasteryLevel: CompletionMap {data: Map(2)}
        _totalCurrentMasteryLevelInRealm: SparseNumericMap {data: Map(1)}
        _unlocked: true
        _xp: 5007158.200001983
        abyssalLevel: (...)
        abyssalLevelCapSet: (...)
        abyssalLevelCompletionBreakdown: (...)
        abyssalXP: (...)
        actionInterval: (...)
        actionLevel: (...)
        actionRewards: (...)
        activePotion: (...)
        activeRecipe: (...)
        activeSkills: (...)
        availableRealmCount: (...)
        canStop: (...)
        currentAbyssalLevelCap: (...)
        currentActionInterval: (...)
        currentLevelCap: (...)
        hasAbyssalLevels: (...)
        hasAncientRelics: (...)
        hasMastery: (...)
        hasMinibar: (...)
        hasSkillTree: (...)
        id: (...)
        isAnyMastery99: (...)
        isCombat: (...)
        isModded: (...)
        isUnlocked: (...)
        level: (...)
        levelCapSet: (...)
        levelCompletionBreakdown: (...)
        localID: (...)
        masteryAction: (...)
        masteryLevelCap: (...)
        masteryModifiedInterval: (...)
        masteryPoolCapPercent: (...)
        masteryTokenChance: (...)
        maxAbyssalLevelCap: (...)
        maxLevelCap: (...)
        media: (...)
        name: (...)
        namespace: (...)
        namespaceDisplayName: (...)
        nextAbyssalLevelProgress: (...)
        nextLevelProgress: (...)
        noCostsMessage: (...)
        noPassiveCostsMessage: (...)
        shouldShowAbyssalLevels: (...)
        shouldShowStandardLevels: (...)
        startingAbyssalLevel: (...)
        startingLevel: (...)
        totalCurrentMasteryLevel: (...)
        totalMasteryXP: (...)
        trueMaxTotalMasteryLevel: (...)
        trueTotalMasteryActions: (...)
        tutorialLevelCap: (...)
        virtualAbyssalLevel: (...)
        virtualLevel: (...)
        xp: (...)
        [[Prototype]]: CraftingSkill
    _type: "SkillXP"
    skill: Cooking
    type: "SkillXP"
    [[Prototype]]: GenericNotification
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/skills/cooking/cooking.png', quantity: 269, text: 'Cooking Skill XP', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/skills/cooking/cooking.png"
    quantity: 269
    text: "Cooking Skill XP"
    [[Prototype]]: Object
```

## `AddGP` :: `GenericNotification`
### `key`
```js
GenericNotification {_type: 'AddGP'}
    _type: "AddGP"
    type: "AddGP"
    [[Prototype]]: Object
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/main/coins.png', quantity: 4, text: '', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/main/coins.png"
    quantity: 4
    text: ""
    [[Prototype]]: Object
```

## `RemoveGP` :: `GenericNotification`
### `key`
```js
GenericNotification {_type: 'RemoveGP'}
    _type: "RemoveGP"
    type: "RemoveGP"
    [[Prototype]]: Object
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/main/coins.png', quantity: -800, text: '', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/main/coins.png"
    quantity: -800
    text: ""
    [[Prototype]]: Object
```

## `AddSlayerCoins` :: `GenericNotification`
### `key`
```js
GenericNotification {_type: 'AddSlayerCoins'}
    _type: "AddSlayerCoins"
    type: (...)
    [[Prototype]]: Object
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/main/slayer_coins.png', quantity: 48000, text: '', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/main/slayer_coins.png"
    quantity: 48000
    text: ""
    [[Prototype]]: Object
```

## `MasteryLevel` :: `MasteryLevelNotification`
### `key`
```js
MasteryLevelNotification {_type: 'MasteryLevel', _action: FiremakingLog}
    _action: FiremakingLog {_namespace: {…}, _localID: 'Yew_Logs', uid: 1782, realm: Realm, baseExperience: 195, …}
        abyssalLevel: 0
        baseAbyssalExperience: 0
        baseBonfireInterval: 80000
        baseExperience: 195
        baseInterval: 7000
        baseOilInterval: 100000
        bonfireCost: 10
        bonfireXPBonus: 35
        level: 60
        log: Item {_namespace: {…}, _localID: 'Yew_Logs', uid: 871, _events: {…}, on: ƒ, …}
        oilCost: 10
        oilItems: []
        primaryProducts: (2) [Item, BoneItem]
        realm: Realm {_namespace: {…}, _localID: 'Melvor', uid: 2, unlockRequirements: Array(0), _name: 'Melvor Realm', …}
        secondaryProducts: [OpenableItem]
        uid: 1782
        _localID: "Yew_Logs"
        _namespace: {name: 'melvorD', displayName: 'Demo', isModded: false}
        hasAbyssalBonfire: (...)
        id: (...)
        isModded: (...)
        localID: (...)
        media: (...)
        name: (...)
        namespace: (...)
        namespaceDisplayName: (...)
        [[Prototype]]: BasicSkillRecipe
    _type: "MasteryLevel"
    action: FiremakingLog
    type: "MasteryLevel"
    [[Prototype]]: GenericNotification
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/main/mastery_header.png', quantity: 56, text: '<img class="newNotification-img compact" src="chro…tension://melvor/assets/media/bank/logs_yew.png">', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/main/mastery_header.png"
    quantity: 56
    text: "<img class=\"newNotification-img compact\" src=\"chrome-extension://melvor/assets/media/bank/logs_yew.png\">"
    [[Prototype]]: Object
```

## `Success` :: `SuccessNotification` (Mastery Pool XP, from using tokens)
### `key`
```js
SuccessNotification {_type: 'Success', _customID: '9,000 Mastery Pool XP granted.'}
    _customID: "9,000 Mastery Pool XP granted."
    _type: "Success"
    customID: "9,000 Mastery Pool XP granted."
    type: "Success"
    [[Prototype]]: GenericNotification
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/skills/firemaking/firemaking.png', quantity: 0, text: '9,000 Mastery Pool XP granted.', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/skills/firemaking/firemaking.png"
    quantity: 0
    text: "9,000 Mastery Pool XP granted."
    [[Prototype]]: Object
```

## `Error` :: `ErrorNotification` (Attempted craft when out of resources)
### `key`
```js
ErrorNotification {_type: 'Error', _customID: "You don't have the required materials to Smith that."}
    _customID: "You don't have the required materials to Smith that."
    _type: "Error"
    customID: "You don't have the required materials to Smith that."
    type: "Error"
    [[Prototype]]: GenericNotification
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/main/error.png', quantity: 1, text: "You don't have the required materials to Smith that.", isImportant: false, isError: true}
    isError: true
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/main/error.png"
    quantity: 1
    text: "You don't have the required materials to Smith that."
    [[Prototype]]: Object
```

## `Success` :: `SuccessNotification` (Prayer points, from burying bones)
### `key`
```js
SuccessNotification {_type: 'Success', _customID: 'Prayer Points'}
    _customID: "Prayer Points"
    _type: "Success"
    customID: "Prayer Points"
    type: "Success"
    [[Prototype]]: GenericNotification
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/skills/prayer/prayer.png', quantity: 21, text: 'Prayer Points', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/skills/prayer/prayer.png"
    quantity: 21
    text: "Prayer Points"
    [[Prototype]]: Object
```

## `Info` :: `InfoNotification` (Preserved resources)
### `key`
```js
InfoNotification {_type: 'Info', _customID: 'You managed to preserve your resources'}
    _customID: "You managed to preserve your resources"
    _type: "Info"
    customID: "You managed to preserve your resources"
    type: "Info"
    [[Prototype]]: GenericNotification
```
### `notification`
```js
{media: 'https://cdn2-main.melvor.net/assets/media/skills/runecrafting/runecrafting.png', quantity: 1, text: 'You managed to preserve your resources', isImportant: false, isError: false}
    isError: false
    isImportant: false
    media: "https://cdn2-main.melvor.net/assets/media/skills/runecrafting/runecrafting.png"
    quantity: 1
    text: "You managed to preserve your resources"
    [[Prototype]]: Object
```

## `SummoningMark` :: `SummoningMarkNotification`
### `key`
```js
SummoningMarkNotification {_type: 'SummoningMark', _mark: SummoningRecipe}
    _mark: SummoningRecipe
        abyssalLevel: 0
        baseAbyssalExperience: 0
        baseExperience: 19
        baseQuantity: 25
        category: SummoningCategory
            realm: Realm {_namespace: {…}, _localID: 'Melvor', uid: 2, unlockRequirements: Array(0), _name: 'Melvor Realm', …}
            skill: Summoning {_namespace: {…}, _localID: 'Summoning', uid: 37, game: Game, providedStats: StatProvider, …}
            type: "Tablet"
            uid: 2009
            _localID: "TabletsFamiliars"
            _media: "assets/media/skills/summoning/summoning.png"
            _name: "Tablets/Familiars"
            _namespace: {name: 'melvorD', displayName: 'Demo', isModded: false}
            id: (...)
            isModded: (...)
            localID: (...)
            media: (...)
            name: (...)
            namespace: (...)
            namespaceDisplayName: (...)
            [[Prototype]]: SkillCategory
        currencyCosts: []
        itemCosts: (2) [{…}, {…}]
        level: 35
        maxMarkLevel: 6
        nonShardItemCosts: (6) [RuneItem, RuneItem, RuneItem, RuneItem, RuneItem, RuneItem]
        product: EquipmentItem {_namespace: {…}, _localID: 'Summoning_Familiar_Crow', uid: 2768, _events: {…}, on: ƒ, …}
        realm: Realm {_namespace: {…}, _localID: 'Melvor', uid: 2, unlockRequirements: Array(0), _name: 'Melvor Realm', …}
        skill: Summoning {_namespace: {…}, _localID: 'Summoning', uid: 37, game: Game, providedStats: StatProvider, …}
        skills: [Runecrafting]
        tier: 2
        uid: 3747
        _localID: "Crow"
        _markMedia: "assets/media/skills/summoning/mark_10_256.png"
        _namespace: {name: 'melvorF', displayName: 'Full Version', isModded: false}
        id: (...)
        isModded: (...)
        localID: (...)
        markMedia: (...)
        media: (...)
        name: (...)
        namespace: (...)
        namespaceDisplayName: (...)
        [[Prototype]]: CategorizedArtisanRecipe
    _type: "SummoningMark"
    mark: SummoningRecipe
    type: "SummoningMark"
    [[Prototype]]: GenericNotification
```
### `notification`
```js
{media: 'chrome-extension://melvor/assets/media/skills/summoning/mark_10_256.png', quantity: 1, text: 'Mark of the Crow Discovered! (Level 2)', isImportant: true, isError: false}
    isError: false
    isImportant: true
    media: "chrome-extension://melvor/assets/media/skills/summoning/mark_10_256.png"
    quantity: 1
    text: "Mark of the Crow Discovered! (Level 2)"
    [[Prototype]]: Object
```






## `TYPE` :: `CLASS`
### `key`
```js

```
### `notification`
```js

```


## Fix formatting of copied DevTools objects
**Find/replace:** `\n: \n` with `: `