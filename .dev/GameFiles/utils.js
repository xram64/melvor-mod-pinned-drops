"use strict";

function rollPercentage(chance) {
    if (chance <= 0)
        return false;
    return chance > Math.random() * 100;
}

function rollInteger(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function rollForOffItem(baseChance) {
    return rollPercentage(baseChance * (1 + game.modifiers.offItemChance / 100));
}

function generateGaussianNumber($mean, $stdDev) {
    const $randNumA = Math.random();
    const $randNumB = Math.random();
    const $randNumNorm = Math.sqrt(-2.0 * Math.log($randNumA)) * Math.cos(2.0 * 3.141592653589793238462643383279502884197169399375 * $randNumB);
    return $mean + $stdDev * $randNumNorm;
}

function getMean(numActions, probability) {
    return numActions * probability;
}

function getStdDev(numActions, probability) {
    return Math.sqrt(numActions * probability * (1 - probability));
}

function applyModifier(baseStat, modifier, type = 0) {
    switch (type) {
        case 0:
            return Math.floor(baseStat * (1 + modifier / 100));
        case 1:
            return baseStat + modifier;
        case 2:
            return Math.floor(baseStat * (1 - modifier / 100));
        case 3:
            return Math.floor(baseStat * (modifier / 100));
        case 4:
            return baseStat * (modifier / 100);
        default:
            return baseStat;
    }
}

function binomial_distribution(n, p, epsilon = 0.00001) {
    const marginals = [];
    let sumOfMarginals = 0;
    let marginal = Math.pow(1 - p, n);
    const odds = p / (1 - p);
    sumOfMarginals += marginal;
    marginals.push(marginal);
    for (let k = 1; k <= n; ++k) {
        marginal *= odds;
        marginal *= (n - k + 1) / k;
        sumOfMarginals += marginal;
        marginals.push(marginal);
        if (1 - sumOfMarginals <= epsilon) {
            break;
        }
    }
    return marginals.map((x) => x / sumOfMarginals);
}

function sample_from_binomial(numberTrials, chance) {
    let randNumA = Math.random();
    const binomial = binomial_distribution(numberTrials, chance);
    for (const [index, probabilityMass] of binomial.entries()) {
        randNumA -= probabilityMass;
        if (randNumA < 0) {
            return index;
        }
    }
    return binomial.length;
}

function linearFunction(m, b, x) {
    return m * x + b;
}

function cappedLinearFunction(m, b, cap, x) {
    return Math.min(linearFunction(m, b, x), cap);
}

function deleteKeysFromObject(object) {
    Object.keys(object).forEach((el) => {
        delete object[el];
    });
}

function getRandomArrayElement(array) {
    return array[rollInteger(0, array.length - 1)];
}

function getExclusiveRandomArrayElements(array, numElements) {
    if (numElements > array.length)
        throw new Error('Cannot get more elements than length of array');
    const arrayCopy = [...array];
    const selection = new Set();
    for (let i = 0; i < numElements; i++) {
        const randIndex = rollInteger(0, arrayCopy.length - 1);
        selection.add(arrayCopy[randIndex]);
        arrayCopy.splice(randIndex, 1);
    }
    return selection;
}
const arrSum = (arr) => arr.reduce((a, b) => a + b, 0);

function getAverage(elements = []) {
    return arrSum(elements) / elements.length;
}

function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function setToUppercase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function setToLowercase(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function isAnySetMemberInSet(setA, setB) {
    for (const member of setA) {
        if (setB.has(member))
            return true;
    }
    return false;
}

function addSetToSet(addTo, from) {
    for (const elem of from)
        addTo.add(elem);
}
let updateTooltipsTimer = -1;

function updateTooltips() {
    clearTimeout(updateTooltipsTimer);
    updateTooltipsTimer = window.setTimeout(function() {
        $('[data-toggle="tooltip"]').tooltip({
            sanitize: false,
        });
        $('[data-toggle="popover"]').popover({
            sanitize: false,
        });
    }, 250);
}

function getSortableDelayOnTouch() {
    return location.origin !== 'https://ios.melvoridle.com' && location.origin !== 'https://android.melvoridle.com';
}

function roundToTickInterval(interval) {
    return Math.floor(interval / TICK_INTERVAL) * TICK_INTERVAL;
}
const joinList = (seperator) => (list) => {
    let joined = '';
    if (list.length > 1) {
        joined += `${list.slice(0,-1).join(seperator)} and `;
    }
    joined += list[list.length - 1];
    return joined;
};

function joinAsList(list) {
    const listFormatter = new Intl.ListFormat(new Intl.Locale(setLang), {
        style: 'long',
        type: 'conjunction'
    });
    return listFormatter.format(list);
}

function joinAsOrList(list) {
    const listFormatter = new Intl.ListFormat(new Intl.Locale(setLang), {
        style: 'long',
        type: 'disjunction'
    });
    return listFormatter.format(list);
}

function joinAsLineBreakList(list) {
    return list.join('<br>');
}
const joinAsSuperList = joinList(';');

function getStandardDescTextClass(description, fontWeight) {
    if (description.isDisabled)
        return 'text-disabled';
    if (game.settings.showNeutralAttackModifiers)
        return fontWeight ? 'font-w700 text-warning' : 'text-warning';
    return description.isNegative ? (fontWeight ? 'font-w700 text-danger' : 'text-danger') : 'text-success';
}
const searchDescriptionFormatter = (desc) => desc.text;
const plainDescriptionFormatter = (desc) => {
    if (desc.isDisabled)
        return `<span class="text-disabled">${desc.text}</span>`;
    return desc.text;
};
const getElementHTMLDescriptionFormatter = (tagName, className, fontWeight = true) => (desc) => {
    let textClass = getStandardDescTextClass(desc, fontWeight);
    if (className !== undefined)
        textClass = `${className} ${textClass}`;
    return `<${tagName} class="${textClass}">${desc.text}</${tagName}>`;
};
const spanHTMLDescriptionFormatter = getElementHTMLDescriptionFormatter('span');
const getElementDescriptionFormatter = (tagName, className, fontWeight = true) => (desc) => {
    let textClass = getStandardDescTextClass(desc, fontWeight);
    if (className !== undefined)
        textClass = `${className} ${textClass}`;
    const newEl = createElement(tagName, {
        className: textClass
    });
    newEl.innerHTML = desc.text;
    return newEl;
};
const spanDescriptionFormatter = getElementDescriptionFormatter('span');

function pluralS(number) {
    return number > 1 ? 's' : '';
}

function checkMediaQuery(mediaQuery) {
    const mq = window.matchMedia(mediaQuery);
    if (mq.matches)
        return true;
    return false;
}
const {
    addMediaQueryListener,
    removeMediaQueryListener
} = (() => {
    const queryCache = new Map();

    function addMediaQueryListener(mediaQuery, callbackFn) {
        let mq = queryCache.get(mediaQuery);
        if (mq === undefined) {
            mq = window.matchMedia(mediaQuery);
            queryCache.set(mediaQuery, mq);
        }
        mq.addEventListener('change', callbackFn);
    }

    function removeMediaQueryListener(mediaQuery, callbackFn) {
        const mq = queryCache.get(mediaQuery);
        if (mq === undefined)
            return;
        mq.removeEventListener('change', callbackFn);
    }
    return {
        addMediaQueryListener,
        removeMediaQueryListener
    };
})();

function createElement(tagName, options = {}) {
    const elem = document.createElement(tagName);
    if (options.className !== undefined) {
        elem.className = options.className;
    }
    if (options.classList !== undefined) {
        elem.classList.add(...options.classList);
    }
    if (options.text !== undefined)
        elem.textContent = options.text;
    if (options.innerHTML !== undefined)
        elem.innerHTML = options.innerHTML;
    if (options.children !== undefined)
        elem.append(...options.children);
    if (options.attributes !== undefined)
        options.attributes.forEach(([name, value]) => elem.setAttribute(name, value));
    if (options.id !== undefined)
        elem.id = options.id;
    if (options.parent !== undefined)
        options.parent.appendChild(elem);
    return elem;
}

function hideElement(elem) {
    elem.classList.add('d-none');
}

function showElement(elem) {
    elem.classList.remove('d-none');
}

function hideElements(elems) {
    elems.forEach((elem) => hideElement(elem));
}

function showElements(elems) {
    elems.forEach((elem) => showElement(elem));
}

function createImage(media, imageClass) {
    return createElement('img', {
        className: imageClass,
        attributes: [
            ['src', media]
        ]
    });
}

function toggleDangerSuccess(elem, success) {
    if (success) {
        elem.classList.add('text-success');
        elem.classList.remove('text-danger');
    } else {
        elem.classList.add('text-danger');
        elem.classList.remove('text-success');
    }
}

function removeElementID(elem) {
    elem.removeAttribute('id');
}

function fireBottomToast(text, duration = 2000) {
    Toastify({
        text,
        duration,
        gravity: 'bottom',
        position: 'center',
        backgroundColor: 'transparent',
        stopOnFocus: false,
    }).showToast();
}

function fireTopToast(text, duration = 2000) {
    Toastify({
        text,
        duration,
        gravity: 'top',
        position: 'center',
        backgroundColor: 'transparent',
        stopOnFocus: false,
    }).showToast();
}

function imageNotify(media, message, messageTheme = 'success') {
    fireBottomToast(`<div class="text-center"><img class="notification-img" src="${media}"><span class="badge badge-${messageTheme}">${message}</span></div>`);
}
let itemNotifyToProcess = [];
let isItemNotificationScheduled = false;

function scheduleItemNotification() {
    isItemNotificationScheduled = true;
}

function processScheduledItemNotifications() {
    if (!isItemNotificationScheduled)
        return;
    const reducedArray = [];
    itemNotifyToProcess.forEach((itemQuantity) => {
        const existingIndex = reducedArray.findIndex((existing) => existing.item.id === itemQuantity.item.id);
        if (existingIndex === -1) {
            reducedArray.push(itemQuantity);
        } else {
            reducedArray[existingIndex].quantity += itemQuantity.quantity;
        }
    });
    reducedArray.forEach((itemQuantity) => processItemNotify(itemQuantity.item, itemQuantity.quantity));
    itemNotifyToProcess = [];
    isItemNotificationScheduled = false;
}

function itemNotify(item, quantity) {
    if (game.settings.showItemNotifications) {
        itemNotifyToProcess.push({
            item,
            quantity
        });
        scheduleItemNotification();
    }
}

function processItemNotify(item, quantity) {
    let access = '';
    if (game.settings.enableAccessibility)
        access = ` ${item.name}`;
    let qtyInBank = '';
    if (game.settings.showQuantityInItemNotifications)
        qtyInBank = " <span class='ml-2'>(" + numberWithCommas(game.bank.getQty(item)) + ')</span> ';
    const textClass = quantity > 0 ? 'success' : 'danger';
    const textSymbol = quantity > 0 ? '+' : '';
    if (!game.settings.useLegacyNotifications)
        game.notifications.createItemNotification(item, quantity);
    else
        imageNotify(item.media, `${textSymbol}${numberWithCommas(quantity)}${qtyInBank}${access}`, textClass);
}
let skillXPNotifyTimer = -1;
let skillXPNotifyToProcess = [];

function skillXPNotify(skill, quantity) {
    clearTimeout(skillXPNotifyTimer);
    skillXPNotifyToProcess.push({
        skill,
        quantity
    });
    skillXPNotifyTimer = window.setTimeout(function() {
        for (let i = 0; i < skillXPNotifyToProcess.length; i++)
            processSkillXPNotify(skillXPNotifyToProcess[i].skill, skillXPNotifyToProcess[i].quantity);
        skillXPNotifyToProcess = [];
    }, 50);
}

function processSkillXPNotify(skill, quantity) {
    if (!game.settings.useLegacyNotifications && game.settings.showSkillXPNotifications)
        game.notifications.createSkillXPNotification(skill, quantity);
}
let abyssalXPNotifyTimer = -1;
let abyssalXPNotifyToProcess = [];

function abyssalXPNotify(skill, quantity) {
    clearTimeout(abyssalXPNotifyTimer);
    abyssalXPNotifyToProcess.push({
        skill,
        quantity
    });
    abyssalXPNotifyTimer = window.setTimeout(function() {
        for (let i = 0; i < abyssalXPNotifyToProcess.length; i++)
            processAbyssalXPNotify(abyssalXPNotifyToProcess[i].skill, abyssalXPNotifyToProcess[i].quantity);
        abyssalXPNotifyToProcess = [];
    }, 50);
}

function processAbyssalXPNotify(skill, quantity) {
    if (!game.settings.useLegacyNotifications && game.settings.showAbyssalXPNotifications)
        game.notifications.createAbyssalXPNotification(skill, quantity);
}

function stunNotify(damage) {
    fireBottomToast(`<div class="text-center"><img class="notification-img" src="${assets.getURI("assets/media/skills/thieving/thieving.png")}"><span class="badge badge-warning">${getLangString('TOASTS_STUNNED')} </span> <span class="badge badge-danger"> ${templateLangString('TOASTS_MINUS_HP',{damage:`${damage}`,})}</span></div>`);
}

function bankFullNotify() {
    if (!game.settings.useLegacyNotifications)
        game.notifications.createErrorNotification('BankFull', getLangString('TOASTS_FULL_BANK'));
    else
        imageNotify(assets.getURI('assets/media/main/bank_header.png'), getLangString('TOASTS_FULL_BANK'), 'danger');
}

function levelUpNotify(skill) {
    fireTopToast(`<div class="block block-rounded-double bg-dark p-2">
  <div class="media d-flex align-items-center push">
    <div class="mr-2"><img class="skill-icon-md" src="${skill.media}"></div>
    <div class="media-body text-left">
      <div class="font-w700 font-size-lg text-success">${getLangString('COMPLETION_CONGRATS')}</div>
      <div class="font-size-sm">
        ${templateLangString('TOASTS_SKILL_LEVEL_UP',{skillName:skill.name,level:`${skill.level}`})}
      </div>
    </div>
  </div>
</div>`, 5000);
}

function abyssalLevelUpNotify(skill) {
    fireTopToast(`<div class="block block-rounded-double bg-dark p-2">
  <div class="media d-flex align-items-center push">
    <div class="mr-2"><img class="skill-icon-md" src="${skill.media}"></div>
    <div class="media-body text-left">
      <div class="font-w700 font-size-lg text-success">${getLangString('COMPLETION_CONGRATS')}</div>
      <div class="font-size-sm">
      ${templateLangString('ABYSSAL_LEVEL_UP',{skillName:skill.name,level:`${skill.abyssalLevel}`})}
      </div>
    </div>
  </div>
</div>`, 5000);
}

function level99Notify(skill) {
    imageNotify(skill.media, templateLangString('TOASTS_SKILL_LEVEL_UP', {
        skillName: skill.name,
        level: `${skill.level}`,
    }), 'success');
}

function notifyPreserve(skill) {
    if (game.settings.showItemPreservationNotifications)
        notifyPlayer(skill, getLangString('MISC_STRING_2'), 'info', 1);
}

function notifyPlayer(skill, message, messageTheme = 'success', quantity = 1) {
    let img = '';
    if (skill === -1)
        img = assets.getURI('assets/media/main/xmas_present.png');
    else
        img = skill.media;
    if (!game.settings.useLegacyNotifications) {
        let media = assets.getURI("assets/media/main/question.png");
        switch (messageTheme) {
            case 'danger':
                game.notifications.createErrorNotification(message, message);
                break;
            case 'success':
                if (skill !== -1)
                    media = skill.media;
                game.notifications.createSuccessNotification(message, message, media, quantity);
                break;
            case 'info':
                if (skill !== -1)
                    media = skill.media;
                game.notifications.createInfoNotification(message, message, media, quantity);
                break;
        }
    } else
        imageNotify(img, message, messageTheme);
}

function notifyItemCharges(item) {
    imageNotify(item.media, getLangString('TOASTS_GLOVES_DEGRADED'), 'danger');
}

function tutorialNotify() {
    fireTopToast(`<div class="block block-rounded-double bg-dark p-2">
  <div class="media d-flex align-items-center push">
    <div class="mr-2"><img class="skill-icon-md" src="${assets.getURI('assets/media/main/tutorial_island.png')}"></div>
    <div class="media-body text-left">
      <div class="font-w700 font-size-lg text-success"><lang-string lang-id="TUTORIAL_MISC_3"></lang-string></div>
      <div class="font-size-sm">
        <lang-string lang-id="TUTORIAL_MISC_4"></lang-string>
      </div>
    </div>
  </div>
</div>`, 5000);
}

function currencyNotify(currency, amount) {
    switch (currency.id) {
        case "melvorD:GP":
            if (!game.settings.useLegacyNotifications)
                game.notifications.createGPNotification(amount);
            else
                imageNotify(assets.getURI("assets/media/main/coins.png"), `${amount>=0?'+':''}${formatNumber(amount)}`, amount >= 0 ? 'success' : 'danger');
            break;
        case "melvorD:SlayerCoins":
            if (!game.settings.useLegacyNotifications)
                game.notifications.createSlayerCoinsNotification(amount);
            else
                imageNotify(assets.getURI("assets/media/main/slayer_coins.png"), `${amount>=0?'+':''}${formatNumber(amount)}`, amount >= 0 ? 'success' : 'danger');
            break;
        default:
            game.notifications.createCurrencyNotification(currency, amount);
            break;
    }
}

function notifyMasteryLevelUp(action, newLevel) {
    if (!game.settings.useLegacyNotifications)
        game.notifications.createMasteryLevelNotification(action, newLevel);
    else {
        fireBottomToast(`<div class="text-center"><img class="notification-img" src="${action.media}"><img class="skill-icon-xs" src="${assets.getURI("assets/media/main/mastery_header.png")}"><span class="badge badge-success">${newLevel}</span></div>`);
    }
}

function notify99ItemMastery(action) {
    fireTopToast(`<div class="block block-rounded-double bg-dark p-2">
  <div class="media d-flex align-items-center push">
    <div class="mr-2"><img class="skill-icon-md" src="${assets.getURI("assets/media/main/mastery_header.png")}"></div>
    <div class="media-body text-left">
      <div class="font-w700 font-size-lg text-success">${getLangString('COMPLETION_CONGRATS')}</div>
      <div class="font-size-sm">
        <img class="skill-icon-xs mr-1" src="${action.media}">${templateLangString('COMPLETION_MASTERY_LEVEL_99',{itemName:action.name,})}
      </div>
    </div>
  </div>
</div>`, 5000);
}

function notifyCompletionBaseGame() {
    let html = `<h5 class="font-w600 text-success">${getLangString('MENU_TEXT_ACHIEVED_COMPLETION')}</h5><h5 class="font-w400 font-size-sm">${getLangString('MENU_TEXT_COMPLETION_MESSAGE')}</h5><h5 class="font-w400 font-size-sm">${getLangString('MENU_TEXT_COMPLETION_BUY_CAPE')}</h5>`;
    const stat = game.stats.General.get(GeneralStats.AccountCreationDate);
    if (stat === 0)
        return;
    html += `<h5 class="font-w400 font-size-sm">${templateLangString('COMPLETION_CHARACTER_AGE',{localisedAge:formatAsTimePeriod(new Date().getTime()-stat),})}</h5>`;
    addModalToQueue({
        title: getLangString('COMPLETION_CONGRATS'),
        html: html,
        imageUrl: assets.getURI("assets/media/main/completion_log.png"),
        imageWidth: 128,
        imageHeight: 128,
        imageAlt: getLangString('MENU_TEXT_100_PERCENT_COMPLETION'),
    });
    showFireworks();
}

function notifyCompletionExpansion(namespace) {
    let titleLang = '';
    switch (namespace) {
        case "melvorTotH":
            titleLang = 'MENU_TEXT_ACHIEVED_COMPLETION_TOTH';
            break;
        case "melvorAoD":
            titleLang = 'MENU_TEXT_ACHIEVED_COMPLETION_AOD';
            break;
        case "melvorItA":
            titleLang = 'MENU_TEXT_ACHIEVED_COMPLETION_ITA';
            break;
    }
    let html = `<h5 class="font-w600 text-success">${getLangString(titleLang)}</h5><h5 class="font-w400 font-size-sm">${getLangString('MENU_TEXT_COMPLETION_MESSAGE_TOTH')}</h5>`;
    const stat = game.stats.General.get(GeneralStats.AccountCreationDate);
    if (stat === 0)
        return;
    html += `<h5 class="font-w400 font-size-sm">${templateLangString('COMPLETION_CHARACTER_AGE',{localisedAge:formatAsTimePeriod(new Date().getTime()-stat),})}</h5>`;
    addModalToQueue({
        title: getLangString('COMPLETION_CONGRATS'),
        html: html,
        imageUrl: assets.getURI("assets/media/main/completion_log.png"),
        imageWidth: 128,
        imageHeight: 128,
        imageAlt: getLangString('MENU_TEXT_100_PERCENT_COMPLETION'),
    });
    showFireworks();
}

function notifyCompletionEverything() {
    let html = `<h5 class="font-w600 text-success">${getLangString('MENU_TEXT_ACHIEVED_COMPLETION_ALL')}</h5><h5 class="font-w400 font-size-sm">${getLangString('MENU_TEXT_COMPLETION_MESSAGE_ALL')}</h5><h5 class="font-w400 font-size-sm">${getLangString('MENU_TEXT_COMPLETION_BUY_CAPE_TOTH')}</h5>`;
    const stat = game.stats.General.get(GeneralStats.AccountCreationDate);
    if (stat === 0)
        return;
    html += `<h5 class="font-w400 font-size-sm">${templateLangString('COMPLETION_CHARACTER_AGE',{localisedAge:formatAsTimePeriod(new Date().getTime()-stat),})}</h5>`;
    addModalToQueue({
        title: getLangString('COMPLETION_CONGRATS'),
        html: html,
        imageUrl: assets.getURI("assets/media/main/completion_log.png"),
        imageWidth: 128,
        imageHeight: 128,
        imageAlt: getLangString('MENU_TEXT_100_PERCENT_COMPLETION'),
    });
    showFireworks();
}
let pyroInterval = -1;
let forcePyro = false;

function showFireworks(force = false) {
    forcePyro = force;
    const pyro = `<div class="pyro">
					<div class="before"></div>
					<div class="after"></div>
				</div>`;
    $('body').append(pyro);
    startPyroInterval();
}

function removePyro() {
    $('.pyro').remove();
}

function startPyroInterval() {
    clearInterval(pyroInterval);
    pyroInterval = window.setInterval(function() {
        if (!Swal.isVisible() && !forcePyro) {
            removePyro();
            clearInterval(pyroInterval);
        }
    }, 1000);
}
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
                case 'Stun':
                    stunNotify(...notification.args);
                    break;
                case 'BankFull':
                    bankFullNotify(...notification.args);
                    break;
                case 'LevelUp':
                    levelUpNotify(...notification.args);
                    break;
                case 'AbyssalLevelUp':
                    abyssalLevelUpNotify(...notification.args);
                    break;
                case 'Player':
                    notifyPlayer(...notification.args);
                    break;
                case 'ItemCharges':
                    notifyItemCharges(...notification.args);
                    break;
                case 'Mastery':
                    notifyMasteryLevelUp(...notification.args);
                    break;
                case 'Mastery99':
                    notify99ItemMastery(...notification.args);
                    break;
                case 'Preserve':
                    notifyPreserve(...notification.args);
                    break;
                case 'Currency':
                    currencyNotify(...notification.args);
                    break;
                case 'TutorialTask':
                    tutorialNotify();
                    break;
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
class ExperienceCalculator {
    constructor() {
        this.estConstA = Math.pow(2, 1 / 7);
        this.estConstB = (Math.pow(2, 1 / 7) - 1) / 75;
        this.table = [0];
        this.xpSum = 0;
    }
    equate(level) {
        return Math.floor(level + 300 * Math.pow(2, level / 7));
    }
    computeNextLevelXP(level) {
        this.xpSum += this.equate(level);
        return Math.floor(this.xpSum / 4);
    }
    estimateXPToLevel(xp) {
        return Math.floor(7 * Math.log2(this.estConstA + this.estConstB * xp)) - 1;
    }
    levelToXP(level) {
        if (this.table.length >= level)
            return this.table[level - 1];
        else {
            for (let i = this.table.length; i < level; i++) {
                this.table.push(this.computeNextLevelXP(i));
            }
            return this.table[level - 1];
        }
    }
    level_to_xp(level) {
        return this.levelToXP(level);
    }
    xpToLevel(xp) {
        if (xp <= 0)
            return 1;
        let levelEstimate = this.estimateXPToLevel(xp);
        if (xp > this.levelToXP(levelEstimate + 1)) {
            levelEstimate++;
        }
        return levelEstimate;
    }
}
class AbyssalExperienceCalculator {
    constructor() {
        this.exp = new ExperienceCalculator();
        this.xpOffset = this.exp.levelToXP(99);
        this.levelOffset = 98;
    }
    levelToXP(level) {
        return this.exp.levelToXP(level + this.levelOffset) - this.xpOffset;
    }
    xpToLevel(xp) {
        if (xp <= 0)
            return 1;
        const offsetXP = xp + this.xpOffset;
        const offsetLevel = this.exp.xpToLevel(offsetXP);
        return offsetLevel - this.levelOffset;
    }
}
class OldAbyssalExperienceCalculator extends ExperienceCalculator {
    constructor() {
        super(...arguments);
        this.estConstA = Math.pow(2, 1 / 5);
        this.estConstB = (Math.pow(2, 1 / 5) - 1) / 30000;
    }
    equate(level) {
        return Math.floor((level + 300 * Math.pow(2, level / 5)) * 100);
    }
    computeNextLevelXP(level) {
        this.xpSum += this.equate(level);
        return this.xpSum;
    }
    estimateXPToLevel(xp) {
        return Math.floor(5 * Math.log2(this.estConstA + this.estConstB * xp)) - 1;
    }
}
const exp = new ExperienceCalculator();
const abyssalExp = new AbyssalExperienceCalculator();

function printAbyssalXPTable(upToLevel = 60) {
    let a = ``;
    for (let i = 1; i <= upToLevel; i++)
        a += `${i}\t${numberWithCommas(abyssalExp.levelToXP(i))}\n`;
    console.log(a);
}

function printXPTable(upToLevel = 120) {
    let a = ``;
    for (let i = 1; i <= upToLevel; i++)
        a += `${i}\t${numberWithCommas(exp.levelToXP(i))}\n`;
    console.log(a);
}

function lockedSkillAlert(skill, messageTemplate) {
    SwalLocale.fire({
        icon: 'error',
        title: getLangString('MENU_TEXT_SKILL_LOCKED'),
        html: `<span class='text-dark'>${templateLangString(`MENU_TEXT_${messageTemplate}`,{skillName:skill.name,})}</span>`,
    });
}

function showStunnedNotification() {
    if (!game.settings.showCombatStunNotifications)
        return;
    fireTopToast(`<div class="block block-rounded-double bg-dark p-2">
  <div class="media d-flex align-items-center push">
    <div class="mr-2"><img class="skill-icon-md" src="${assets.getURI('assets/media/main/stunned.png')}"></div>
    <div class="media-body text-left">
      <div class="font-w700 font-size-lg text-danger">${getLangString('TOASTS_STUNNED')}</div>
      <div class="font-size-sm">
        The Enemy deals <span class="font-w600 text-warning">30%</span> extra Damage while you are stunned.
      </div>
      <div class="font-size-sm">
        <small>(You can disable this notification in Settings)</small>
      </div>
    </div>
  </div>
</div>`, 5000);
}

function showSleepNotification() {
    if (!game.settings.showCombatSleepNotifications)
        return;
    fireTopToast(`<div class="block block-rounded-double bg-dark p-2">
  <div class="media d-flex align-items-center push">
    <div class="mr-2"><img class="skill-icon-md" src="${assets.getURI('assets/media/main/sleep.png')}"></div>
    <div class="media-body text-left">
      <div class="font-w700 font-size-lg text-danger">${getLangString('TOASTS_ASLEEP')}</div>
      <div class="font-size-sm">
        The Enemy deals <span class="font-w600 text-warning">20%</span> extra Damage while you are sleeping.
      </div>
      <div class="font-size-sm">
        <small>(You can disable this notification in Settings)</small>
      </div>
    </div>
  </div>
</div>`, 5000);
}

function compareNameValuePairs(currentPairs, oldPairs, onFirstDiff) {
    let firstDiff = true;
    const curPairMap = convertNameValuePairToMap(currentPairs);
    const oldPairMap = convertNameValuePairToMap(oldPairs);
    curPairMap.forEach((curVal, name) => {
        const oldVal = oldPairMap.get(name);
        if (oldVal === undefined) {
            if (firstDiff) {
                console.log(onFirstDiff);
                firstDiff = false;
            }
            console.log(`Current has ${name}, but Old does not.`);
        } else if (curVal !== oldVal) {
            if (firstDiff) {
                console.log(onFirstDiff);
                firstDiff = false;
            }
            console.log(`Value of ${name} is different. Current: ${curVal} Old: ${oldVal}.`);
        }
    });
    oldPairMap.forEach((oldVal, name) => {
        const curVal = curPairMap.get(name);
        if (curVal === undefined) {
            if (firstDiff) {
                console.log(onFirstDiff);
                firstDiff = false;
            }
            console.log(`Old has ${name}, but Current does not.`);
        }
    });
    return !firstDiff;
}

function convertNameValuePairToMap(pairs) {
    const map = new Map();
    pairs.forEach((pair) => {
        if (map.get(pair.name) !== undefined)
            console.warn(`Duplicate pair found: ${pair.name}`);
        map.set(pair.name, pair.value);
    });
    return map;
}

function templateString(string, templateData) {
    return string.replace(/\${(.+?)}/g, (match, p1) => {
        var _a;
        return (_a = templateData[p1]) !== null && _a !== void 0 ? _a : match;
    });
}

function templateLangString(identifier, templateData) {
    return templateString(getLangString(identifier), templateData);
}

function milliToSeconds(ms) {
    return ms / 1000;
}

function multiplyByNumberMultiplier(value) {
    return value * numberMultiplier;
}

function divideByNumberMultiplier(value) {
    return value / numberMultiplier;
}

function animateProgress(div, interval, stayFull = true) {
    resetProgressAnimation(div);
    interval = interval / 1000;
    $(`#${div}`).css('-webkit-animation', 'progressBar ' + interval + 's linear');
    if (stayFull)
        $(`#${div}`).css('-webkit-animation-fill-mode', 'both');
}

function resetProgressAnimation(div) {
    const el = document.getElementById(div);
    el.style.animation = 'none';
    el.offsetHeight;
    $(`#${div}`).css('-webkit-animation-fill-mode', 'none');
    $(`#${div}`).css('width', '0%');
}

function templateLangStringWithNodes(id, nodeData, textData, clone = true) {
    return templateStringWithNodes(getLangString(id), nodeData, textData, clone);
}

function templateStringWithNodes(string, nodeData, textData, clone = true) {
    let nodes = [];
    nodes.push(templateString(string, textData));
    Object.entries(nodeData).forEach(([fillIn, imageNode]) => {
        const newNodes = [];
        nodes.forEach((node) => {
            if (typeof node === 'string') {
                const portions = node.split(`\${${fillIn}}`);
                if (portions.length > 0) {
                    portions.forEach((stringPort, i) => {
                        newNodes.push(stringPort);
                        if (i !== portions.length - 1)
                            newNodes.push(clone ? imageNode.cloneNode(true) : imageNode);
                    });
                } else {
                    newNodes.push(node);
                }
            } else {
                newNodes.push(node);
            }
        });
        nodes = newNodes;
    });
    return nodes;
}
const formatAsOrdinal = (() => {
    const pr = new Intl.PluralRules('en-US', {
        type: 'ordinal'
    });
    const suffixes = new Map([
        ['one', 'st'],
        ['two', 'nd'],
        ['few', 'rd'],
        ['other', 'th'],
    ]);
    return (value) => {
        const rule = pr.select(value);
        const suffix = suffixes.get(rule);
        return `${value}${suffix}`;
    };
})();

function numberWithCommas(number, ignoreSetting = false) {
    if (typeof number === 'string') {
        number = parseFloat(number);
    }
    if (typeof number === 'number') {
        if (ignoreSetting || !game.settings.hideThousandsSeperator) {
            if (number === 0)
                number = 0;
            try {
                return number.toLocaleString(setLang);
            } catch (e) {
                return number.toLocaleString();
            }
        } else {
            return `${number}`;
        }
    } else {
        console.warn('Tried to format non-number.');
        return number;
    }
}

function formatNumber(number, maximumFractionDigits = 0) {
    let prefix = '';
    let postfix = '';
    switch (game.settings.formatNumberSetting) {
        case 0:
            if (number >= 100000 && number < 10000000) {
                number = number / 1000;
                postfix = getLangString('NUM_K');
            } else if (number >= 10000000 && number < 10000000000) {
                number = number / 1000000;
                postfix = getLangString('NUM_M');
            } else if (number >= 10000000000 && number < 10000000000000) {
                number = number / 1000000000;
                postfix = getLangString('NUM_B');
            } else if (number >= 10000000000000 && number < 1000000000000000) {
                number = number / 1000000000;
                postfix = getLangString('NUM_T');
            } else if (number >= 1000000000000000) {
                number = 999;
                postfix = getLangString('NUM_T');
                prefix = '>';
            }
            maximumFractionDigits = 0;
            break;
        case 1:
            if (number >= 100000 && number < 1000000) {
                number = number / 1000;
                postfix = getLangString('NUM_K');
            } else if (number >= 1000000 && number < 1000000000) {
                number = number / 1000000;
                postfix = getLangString('NUM_M');
            } else if (number >= 1000000000 && number < 1000000000000) {
                number = number / 1000000000;
                postfix = getLangString('NUM_B');
            } else if (number >= 1000000000000 && number < 1000000000000000) {
                number = number / 1000000000000;
                postfix = getLangString('NUM_T');
            } else if (number >= 1000000000000000) {
                number = 999;
                postfix = getLangString('NUM_T');
                prefix = '>';
            }
            break;
    }
    const formatted = number.toLocaleString(setLang, {
        maximumFractionDigits,
        useGrouping: !game.settings.hideThousandsSeperator,
        roundingMode: 'trunc',
    });
    return prefix + formatted + postfix;
}

function formatPercent(percent, digits) {
    try {
        if (percent === 0)
            percent = 0;
        return (percent / 100).toLocaleString(setLang, {
            style: 'percent',
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });
    } catch (_a) {
        if (digits !== undefined) {
            return `${percent.toFixed(digits)}%`;
        } else {
            return `${percent}%`;
        }
    }
}

function formatIntegerAlphabetic(int) {
    let alpha = '';
    let remainder = 0;
    while (int >= 0) {
        remainder = int % 26;
        alpha = String.fromCharCode(65 + remainder) + alpha;
        int = (int - remainder) / 26 - 1;
    }
    return alpha;
}

function getIntegerFromAlphabetic(alpha) {
    let int = -1;
    for (let i = 0; i < alpha.length; i++) {
        const remainder = alpha.charCodeAt(i) - 65;
        int = 26 * (int + 1) + remainder;
    }
    return int;
}

function getMSAsTime(time) {
    const msPerUnit = {
        years: 365 * 24 * 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
        hours: 60 * 60 * 1000,
        minutes: 60 * 1000,
        seconds: 1000,
        milliseconds: 1,
    };
    const years = Math.floor(time / msPerUnit.years);
    const days = Math.floor((time % msPerUnit.years) / msPerUnit.days);
    const hours = Math.floor((time % msPerUnit.days) / msPerUnit.hours);
    const minutes = Math.floor((time % msPerUnit.hours) / msPerUnit.minutes);
    const seconds = Math.floor((time % msPerUnit.minutes) / msPerUnit.seconds);
    const milliseconds = Math.floor((time % msPerUnit.seconds) / msPerUnit.milliseconds);
    return {
        years,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
    };
}

function formatAsTimePeriod(timeInMs) {
    const time = getMSAsTime(timeInMs);
    const timePeriods = [];
    if (time.years > 0) {
        if (time.years === 1) {
            timePeriods.push(getLangString('TIME_UNIT_year'));
        } else {
            timePeriods.push(templateLangString('TIME_UNIT_years', {
                years: `${time.years}`
            }));
        }
    }
    if (time.days > 0) {
        if (time.days === 1) {
            timePeriods.push(getLangString('TIME_UNIT_day'));
        } else {
            timePeriods.push(templateLangString('TIME_UNIT_days', {
                days: `${time.days}`
            }));
        }
    }
    if (time.hours > 0) {
        if (time.hours === 1) {
            timePeriods.push(getLangString('TIME_UNIT_hour'));
        } else {
            timePeriods.push(templateLangString('TIME_UNIT_hours', {
                hours: `${time.hours}`
            }));
        }
    }
    if (time.minutes > 0) {
        if (time.minutes === 1) {
            timePeriods.push(getLangString('TIME_UNIT_minute'));
        } else {
            timePeriods.push(templateLangString('TIME_UNIT_minutes', {
                minutes: `${time.minutes}`
            }));
        }
    }
    if (time.seconds === 1) {
        timePeriods.push(getLangString('TIME_UNIT_second'));
    } else {
        timePeriods.push(templateLangString('TIME_UNIT_seconds', {
            seconds: `${time.seconds}`
        }));
    }
    const listFormat = new Intl.ListFormat(new Intl.Locale(setLang), {
        style: 'long',
        type: 'unit'
    });
    return listFormat.format(timePeriods.map((part) => part.replace(' ', '\xa0')));
}

function formatAsShorthandTimePeriod(timeInMs, roundSeconds = false, showMs = false, padding = false) {
    const time = getMSAsTime(timeInMs);
    if (roundSeconds && time.milliseconds >= 500)
        time.seconds++;
    const timePeriods = [];
    if (time.years > 0) {
        timePeriods.push(`${time.years}y`);
    }
    if (time.days > 0) {
        let days = `${time.days}d`;
        if (padding)
            days = days.padStart(4, '0');
        timePeriods.push(days);
    }
    let hours = `${time.hours}h`;
    if (padding)
        hours = hours.padStart(3, '0');
    timePeriods.push(hours);
    let minutes = `${time.minutes}m`;
    if (padding)
        minutes = minutes.padStart(3, '0');
    timePeriods.push(minutes);
    let seconds = `${time.seconds}s`;
    if (padding)
        seconds = seconds.padStart(3, '0');
    timePeriods.push(seconds);
    if (showMs && time.seconds < 1) {
        let milliseconds = `${time.milliseconds}ms`;
        if (padding)
            milliseconds = milliseconds.padStart(5, '0');
        timePeriods.push(milliseconds);
    }
    const listFormat = new Intl.ListFormat(new Intl.Locale(setLang), {
        style: 'narrow',
        type: 'unit'
    });
    return listFormat.format(timePeriods.map((part) => part.replace(' ', '\xa0')));
}

function successSpan(content) {
    return `<span class="text-success">${content}</span>`;
}

function getTemplateElement(templateID) {
    const template = document.getElementById(templateID);
    if (template === null || !(template instanceof HTMLTemplateElement))
        throw new Error('Template does not exist');
    return template;
}

function getTemplateNode(templateID) {
    const templateContent = getTemplateElement(templateID).content;
    return templateContent.cloneNode(true);
}

function getAnyElementFromFragment(fragment, elementID) {
    const elem = fragment.getElementById(elementID);
    if (elem === null)
        throw new Error(`Fragment does not contain element with id: ${elementID}`);
    elem.removeAttribute('id');
    return elem;
}

function getElementFromFragment(fragment, elementID, tagName, preserveID = false) {
    const elem = fragment.getElementById(elementID);
    if (elem === null)
        throw new Error(`Fragment does not contain element with id: ${elementID}`);
    if (elem.tagName !== tagName.toUpperCase())
        throw new Error(`Element with id: ${elementID} does not have the correct tag name`);
    if (!preserveID)
        elem.removeAttribute('id');
    return elem;
}

function formatFixed(num, digits) {
    try {
        if (num === 0)
            num = 0;
        return num.toLocaleString(setLang, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });
    } catch (_a) {
        return num.toFixed(digits);
    }
}

function switchToCategory(tabs) {
    return (categoryToShow) => {
        tabs.forEach((tab, category) => {
            if (category === categoryToShow) {
                showElement(tab);
                if (isOnMobileLayout) {
                    try {
                        window.scrollTo({
                            top: tab.offsetTop,
                            behavior: 'smooth'
                        });
                    } catch (e) {
                        console.warn('Could not scroll to tab element. Error: ' + e);
                    }
                }
            } else
                hideElement(tab);
        });
    };
}

function delayPromise(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

function delayUntilGameEvent(emitter, key) {
    return new Promise((resolve) => {
        const handler = () => {
            emitter.off(key, handler);
            resolve();
        };
        emitter.on(key, handler);
    });
}

function downloadTextFile(fileName, fileText, fileType = 'text/plain') {
    const file = new Blob([fileText], {
        type: fileType
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(file);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(function() {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function removeFromArray(original, remove) {
    return original.filter((value) => !remove.includes(value));
}

function sortByOrder(order, key) {
    const orderMap = new Map(order.map((val, i) => [val, i]));
    return (a, b) => {
        const aPos = orderMap.get(a[key]);
        const bPos = orderMap.get(b[key]);
        if (aPos === undefined) {
            if (bPos === undefined) {
                return 0;
            } else {
                return 1;
            }
        } else if (bPos === undefined) {
            return -1;
        } else {
            return aPos - bPos;
        }
    };
}

function sortByCurrencyValue(ascending, a, b) {
    if (a.currency !== b.currency) {
        return langCollator.compare(a.currency.name, b.currency.name);
    }
    if (ascending) {
        return a.quantity - b.quantity;
    } else {
        return b.quantity - a.quantity;
    }
}

function logConsole(message) {
    if (DEBUGENABLED)
        console.log(message);
}
const unregisteredMessage = (type) => `Error converting old save data. ${type} is not registered.`;
class DataConstructionError extends Error {
    constructor(className, inner, id) {
        let message = `Could not construct ${className}`;
        if (id !== undefined)
            message += ` with id "${id}`;
        message += ': ';
        if (inner !== undefined && inner instanceof Error)
            message += inner.message;
        super(message);
        this.inner = inner;
    }
    get name() {
        return DataConstructionError.name;
    }
}
class DataModificationError extends Error {
    constructor(className, inner, id) {
        let message = `Error modifying ${className}`;
        if (id !== undefined)
            message += ` with id "${id}"`;
        message += ': ';
        if (inner !== undefined && inner instanceof Error)
            message += inner.message;
        super(message);
        this.inner = inner;
    }
    get name() {
        return DataModificationError.name;
    }
}
class UnregisteredConstructionError extends Error {
    constructor(object, unregisteredName, id) {
        super(`Error constructing ${object.constructor.name}. ${unregisteredName} with id: ${id} is not registered.`);
        this.name = this.constructor.name;
    }
}
class UnregisteredDataModError extends Error {
    constructor(unregisteredName, id) {
        super(`Error applying data modification to ${unregisteredName} with id: ${id}. Object is not registered.`);
        this.name = this.constructor.name;
    }
}
class UnregisteredApplyDataModError extends Error {
    constructor(objectBeingModded, unregisteredName, unregisteredID) {
        super(`Error applying data modification to ${objectBeingModded.constructor.name} with id: ${objectBeingModded.id}. ${unregisteredName} with id: ${unregisteredID} is not registered.`);
        this.name = this.constructor.name;
    }
}
const progressBarAttributes = [
    ['role', 'progressbar'],
    ['style', 'width:0%;'],
    ['aria-valuenow', '0'],
    ['aria-valuemin', '0'],
    ['aria-valuemax', '100'],
];

function selectFromWeightedArray(array, totalWeight) {
    const tableRoll = Math.floor(Math.random() * totalWeight);
    let cumWeight = 0;
    const rollIndex = array.findIndex((value) => {
        cumWeight += value.weight;
        return tableRoll < cumWeight;
    });
    return array[rollIndex];
}
class DropTable {
    constructor(game, data) {
        this.totalWeight = 0;
        this.drops = [];
        try {
            this.registerDrops(game, data);
        } catch (e) {
            throw new DataConstructionError(DropTable.name, e);
        }
    }
    get size() {
        return this.drops.length;
    }
    get weight() {
        return this.totalWeight;
    }
    get sortedDropsArray() {
        return [...this.drops].sort((a, b) => b.weight - a.weight);
    }
    registerDrops(game, data) {
        data.forEach((data) => {
            try {
                this.totalWeight += data.weight;
                this.drops.push({
                    item: game.items.getObjectSafe(data.itemID),
                    minQuantity: data.minQuantity,
                    maxQuantity: data.maxQuantity,
                    weight: data.weight,
                });
            } catch (e) {
                throw new DataConstructionError('DropTableElement', e);
            }
        });
    }
    unregisterDrops(data) {
        data.forEach((data) => {
            const dropIndex = this.drops.findIndex((d) => d.item.id === data);
            if (dropIndex < 0) {
                console.warn(`Warning when removing drop from loot table, Item with ID: ${data} does not exist in the loot table.`);
                return;
            }
            this.totalWeight -= this.drops[dropIndex].weight;
            this.drops.splice(dropIndex, 1);
        });
    }
    getDrop() {
        const drop = selectFromWeightedArray(this.drops, this.totalWeight);
        const quantity = rollInteger(drop.minQuantity, drop.maxQuantity);
        return {
            item: drop.item,
            quantity,
        };
    }
    getRawDrop() {
        const drop = selectFromWeightedArray(this.drops, this.totalWeight);
        const quantity = rollInteger(drop.minQuantity, drop.maxQuantity);
        return {
            drop: drop,
            quantity,
        };
    }
    getAverageDropValue() {
        const averages = new SparseNumericMap();
        this.drops.forEach(({
            item,
            weight,
            minQuantity,
            maxQuantity
        }) => {
            const value = (weight * item.sellsFor.quantity * (minQuantity + maxQuantity)) / 2;
            averages.add(item.sellsFor.currency, value);
        });
        averages.forEach((value, currency) => {
            averages.set(currency, value / this.totalWeight);
        });
        return averages;
    }
}
class RandomModifierTable {
    constructor(game, data) {
        this.totalWeight = 0;
        this.drops = [];
        try {
            this.registerModifiers(game, data);
        } catch (e) {
            throw new DataConstructionError(RandomModifierTable.name, e);
        }
    }
    get size() {
        return this.drops.length;
    }
    registerModifiers(game, data) {
        data.forEach((data) => {
            var _a;
            try {
                const modifier = game.modifierRegistry.getObjectSafe(data.id);
                const scoping = modifier.getScopingFromData(data);
                const value = new ModifierValue(modifier, 1, ModifierScope.getScopefromData(data, game, scoping.scopeSource));
                this.drops.push({
                    weight: data.weight,
                    modifier: value,
                    min: data.min,
                    max: data.max,
                    unique: (_a = data.unique) !== null && _a !== void 0 ? _a : false,
                });
                this.totalWeight += data.weight;
            } catch (e) {
                throw new DataConstructionError('RandomModifierTableElement', e);
            }
        });
    }
    getModifier() {
        const roll = selectFromWeightedArray(this.drops, this.totalWeight);
        return this.processRoll(roll);
    }
    processRoll(roll) {
        const newValue = roll.modifier.clone();
        newValue.value = rollInteger(roll.min, roll.max);
        return newValue;
    }
    getExcludedTable(existing) {
        const existingKeys = existing.map((value) => value.toComparisonKey());
        let excludedWeight = 0;
        const excludedDrops = this.drops.filter((drop) => {
            const dropKey = drop.modifier.toComparisonKey();
            const include = !existingKeys.some((eKey) => eKey === dropKey);
            if (include)
                excludedWeight += drop.weight;
            return include;
        });
        return {
            excludedWeight,
            excludedDrops
        };
    }
    getModifierExcludingUnique(existing) {
        const {
            excludedWeight,
            excludedDrops
        } = this.getExcludedTable(existing);
        const roll = selectFromWeightedArray(excludedDrops, excludedWeight);
        return this.processRoll(roll);
    }
    getModifiersExcludingUnique(existing, count) {
        const {
            excludedWeight,
            excludedDrops
        } = this.getExcludedTable(existing);
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.processRoll(selectFromWeightedArray(excludedDrops, excludedWeight)));
        }
        return results;
    }
}
class SparseNumericMap {
    constructor() {
        this.data = new Map();
    }
    get size() {
        return this.data.size;
    }
    get isEmpty() {
        return this.data.size === 0;
    }
    has(key) {
        return this.data.has(key);
    }
    get(key) {
        var _a;
        return (_a = this.data.get(key)) !== null && _a !== void 0 ? _a : 0;
    }
    set(key, value) {
        if (value === 0)
            this.data.delete(key);
        else
            this.data.set(key, value);
    }
    add(key, amount) {
        const newVal = this.get(key) + amount;
        this.set(key, newVal);
    }
    inc(key) {
        this.add(key, 1);
    }
    sub(key, amount) {
        this.add(key, -amount);
    }
    dec(key) {
        this.sub(key, 1);
    }
    mult(key, multiplier) {
        const newVal = this.get(key) * multiplier;
        this.set(key, newVal);
    }
    div(key, divisor) {
        const newVal = this.get(key) / divisor;
        this.set(key, newVal);
    }
    getSum() {
        let total = 0;
        this.data.forEach((value) => {
            total += value;
        });
        return total;
    }
    getSumOfKeys(keys) {
        return keys.reduce((prev, key) => {
            return prev + this.get(key);
        }, 0);
    }
    clear() {
        this.data.clear();
    }
    forEach(callbackfn) {
        this.data.forEach(callbackfn);
    }
    keys() {
        return this.data.keys();
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateComponentClass(tagName) {
    const templateID = `${tagName}-template`;
    const fragment = getTemplateElement(templateID).content;
    const className = `${tagName.split('-').map(setToUppercase).join('')}Element`;
    const idElements = fragment.querySelectorAll('[id]');
    const props = [];
    const getters = [];
    idElements.forEach((element) => {
        const id = element.id;
        const propertyName = id.split('-').map((idPart, i) => {
            if (i === 0)
                return idPart;
            return setToUppercase(idPart);
        }).join('');
        const tagName = element.tagName.toLowerCase();
        props.push(`  private ${propertyName}: ${element.constructor.name};`);
        getters.push(`    this.${propertyName} = getElementFromFragment(this._content, '${id}','${tagName}');`);
    });
    return `class ${className} extends HTMLElement implements CustomElement {
  private _content: DocumentFragment;
${props.join('\n')}
  public constructor() {
    super();
    this._content = new DocumentFragment();
    this._content.append(getTemplateNode('${templateID}'));
${getters.join('\n')}
  }
  public connectedCallback() {
    this.appendChild(this._content);
  }
  // TODO_C: Implement custom rendering functionality
}
window.customElements.define('${tagName}', ${className});`;
}

function getRequirementTextClass(met) {
    return met ? 'text-success' : 'text-danger';
}

function createUnlockElement(costNodes, met) {
    const element = createElement('div', {
        className: getRequirementTextClass(met),
        children: costNodes
    });
    return element;
}

function printUnlockRequirements(requirements) {
    const unlockElements = [];
    requirements.forEach((requirement) => {
        if (game.checkRequirement(requirement))
            return;
        unlockElements.push(createUnlockElement(requirement.getNodes('skill-icon-xs mr-1 ml-1'), game.checkRequirement(requirement)));
    });
    return unlockElements;
}

function printUnlockAllRequirements(requirements) {
    const unlockElements = [];
    requirements.forEach((requirement) => {
        unlockElements.push(createUnlockElement(requirement.getNodes('skill-icon-xs mr-1 ml-1'), game.checkRequirement(requirement)));
    });
    return unlockElements;
}

function printUnlockRequirementsAsHTML(requirements) {
    const unlockElements = [];
    requirements.forEach((requirement) => {
        if (game.checkRequirement(requirement))
            return;
        unlockElements.push(createUnlockElement(requirement.getNodes('skill-icon-xs mr-1 ml-1'), game.checkRequirement(requirement)).outerHTML);
    });
    return unlockElements;
}

function printAllUnlockRequirementsAsHTML(requirements) {
    const unlockElements = [];
    requirements.forEach((requirement) => {
        unlockElements.push(createUnlockElement(requirement.getNodes('skill-icon-xs mr-1 ml-1'), game.checkRequirement(requirement)).outerHTML);
    });
    return unlockElements;
}

function isRequirementMet(requirements) {
    return requirements.every((req) => game.checkRequirement(req));
}

function createCopyOfObject(obj) {
    const type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();

    function cloneObj(obj) {
        const clone = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clone[key] = createCopyOfObject(obj[key]);
            }
        }
        return clone;
    }

    function cloneArr(obj) {
        return obj.map((item) => {
            return createCopyOfObject(item);
        });
    }
    if (type === 'object')
        return cloneObj(obj);
    if (type === 'array')
        return cloneArr(obj);
    return obj;
}

function formatAsSHTimePeriod(timeInMs) {
    const time = getMAsTime(timeInMs);
    const timePeriods = [];
    if (time.years > 0) {
        timePeriods.push(`${time.years}y`);
    }
    if (time.days > 0) {
        timePeriods.push(`${time.days}d`);
    }
    timePeriods.push(`${time.hours}h`);
    timePeriods.push(`${time.minutes}m`);
    timePeriods.push(`${time.seconds}s`);
    const listFormat = new Intl.ListFormat('en', {
        style: 'narrow',
        type: 'unit'
    });
    return listFormat.format(timePeriods.map((part) => part.replace(' ', '\xa0')));
}

function getMAsTime(time) {
    const msPerUnit = {
        years: 365 * 24 * 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
        hours: 60 * 60 * 1000,
        minutes: 60 * 1000,
        seconds: 1000,
        milliseconds: 1,
    };
    const years = Math.floor(time / msPerUnit.years);
    const days = Math.floor((time % msPerUnit.years) / msPerUnit.days);
    const hours = Math.floor((time % msPerUnit.days) / msPerUnit.hours);
    const minutes = Math.floor((time % msPerUnit.hours) / msPerUnit.minutes);
    const seconds = Math.floor((time % msPerUnit.minutes) / msPerUnit.seconds);
    const milliseconds = Math.floor((time % msPerUnit.seconds) / msPerUnit.milliseconds);
    return {
        years,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
    };
}

function addAllNonCombatSkillActionEventListeners(game, actionFunction) {
    var _a, _b, _c, _d;
    game.woodcutting.on('action', actionFunction);
    game.fishing.on('action', actionFunction);
    game.firemaking.on('action', actionFunction);
    game.cooking.on('action', actionFunction);
    game.mining.on('action', actionFunction);
    game.smithing.on('action', actionFunction);
    game.thieving.on('action', actionFunction);
    game.fletching.on('action', actionFunction);
    game.crafting.on('action', actionFunction);
    game.runecrafting.on('action', actionFunction);
    game.herblore.on('action', actionFunction);
    game.agility.on('action', actionFunction);
    game.summoning.on('action', actionFunction);
    game.astrology.on('action', actionFunction);
    game.altMagic.on('action', actionFunction);
    (_a = game.cartography) === null || _a === void 0 ? void 0 : _a.on('survey', actionFunction);
    (_b = game.cartography) === null || _b === void 0 ? void 0 : _b.on('madePaper', actionFunction);
    (_c = game.cartography) === null || _c === void 0 ? void 0 : _c.on('upgradeMap', actionFunction);
    (_d = game.archaeology) === null || _d === void 0 ? void 0 : _d.on('action', actionFunction);
}

function removeAllNonCombatSkillActionEventListeners(game, actionFunction) {
    var _a, _b, _c, _d;
    game.woodcutting.off('action', actionFunction);
    game.fishing.off('action', actionFunction);
    game.firemaking.off('action', actionFunction);
    game.cooking.off('action', actionFunction);
    game.mining.off('action', actionFunction);
    game.smithing.off('action', actionFunction);
    game.thieving.off('action', actionFunction);
    game.fletching.off('action', actionFunction);
    game.crafting.off('action', actionFunction);
    game.runecrafting.off('action', actionFunction);
    game.herblore.off('action', actionFunction);
    game.agility.off('action', actionFunction);
    game.summoning.off('action', actionFunction);
    game.astrology.off('action', actionFunction);
    game.altMagic.off('action', actionFunction);
    (_a = game.cartography) === null || _a === void 0 ? void 0 : _a.off('survey', actionFunction);
    (_b = game.cartography) === null || _b === void 0 ? void 0 : _b.off('madePaper', actionFunction);
    (_c = game.cartography) === null || _c === void 0 ? void 0 : _c.off('upgradeMap', actionFunction);
    (_d = game.archaeology) === null || _d === void 0 ? void 0 : _d.off('action', actionFunction);
}

function reverseCombatTriangle(triangle) {
    const types = ['melee', 'ranged', 'magic'];
    const newTriangle = {
        damageModifier: {},
        reductionModifier: {},
    };
    types.forEach((playerType) => {
        const damageModifier = {};
        const reductionModifier = {};
        types.forEach((enemyType) => {
            damageModifier[enemyType] = triangle.damageModifier[enemyType][playerType];
            reductionModifier[enemyType] = triangle.reductionModifier[enemyType][playerType];
        });
        newTriangle.damageModifier[playerType] = damageModifier;
        newTriangle.reductionModifier[playerType] = reductionModifier;
    });
    return newTriangle;
}
var PushNotificationType;
(function(PushNotificationType) {
    PushNotificationType[PushNotificationType["Unique"] = 0] = "Unique";
    PushNotificationType[PushNotificationType["Other"] = 1] = "Other";
})(PushNotificationType || (PushNotificationType = {}));

function generateMonsterStatsCSV() {
    let a = ``;
    a += `Id\tName\tIs Boss\tCan Slayer\tAttack Type\tCombat Level\tHP Level\tAttack Level\tStrength Level\tDefence Level\tRanged Level\tMagic Level\tCorruption Level\tAttack Speed\tStab Bonus\tSlash Bonus\tBlock Bonus\tRanged Attack Bonus\tMagic Attack Bonus\tMelee Strength Bonus\tMelee Defence Bonus\tRanged Strength Bonus\tRanged Defence Bonus\tMagic Damage Bonus\tMagic Defence Bonus\tDamage Reduction\tAbyssal Resistance\tMax Hit\tDesired Max Hit\tAccuracy\tMelee Evasion\tRanged Evasion\tMagic Evasion\t\n`;
    game.monsters.forEach((monster) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
        a += `${monster.id}\t`;
        a += `${monster.name}\t`;
        a += `${monster.isBoss}\t`;
        a += `${monster.canSlayer}\t`;
        a += `${monster.attackType}\t`;
        a += `${monster.combatLevel}\t`;
        a += `${monster.levels.Hitpoints}\t`;
        a += `${monster.levels.Attack}\t`;
        a += `${monster.levels.Strength}\t`;
        a += `${monster.levels.Defence}\t`;
        a += `${monster.levels.Ranged}\t`;
        a += `${monster.levels.Magic}\t`;
        a += `${(_a=monster.levels.Corruption)!==null&&_a!==void 0?_a:0}\t`;
        a += `${(_c=(_b=monster.equipmentStats.find((stat)=>stat.key==='attackSpeed'))===null||_b===void 0?void 0:_b.value)!==null&&_c!==void 0?_c:''}\t`;
        a += `${(_e=(_d=monster.equipmentStats.find((stat)=>stat.key==='stabAttackBonus'))===null||_d===void 0?void 0:_d.value)!==null&&_e!==void 0?_e:''}\t`;
        a += `${(_g=(_f=monster.equipmentStats.find((stat)=>stat.key==='slashAttackBonus'))===null||_f===void 0?void 0:_f.value)!==null&&_g!==void 0?_g:''}\t`;
        a += `${(_j=(_h=monster.equipmentStats.find((stat)=>stat.key==='blockAttackBonus'))===null||_h===void 0?void 0:_h.value)!==null&&_j!==void 0?_j:''}\t`;
        a += `${(_l=(_k=monster.equipmentStats.find((stat)=>stat.key==='rangedAttackBonus'))===null||_k===void 0?void 0:_k.value)!==null&&_l!==void 0?_l:''}\t`;
        a += `${(_o=(_m=monster.equipmentStats.find((stat)=>stat.key==='magicAttackBonus'))===null||_m===void 0?void 0:_m.value)!==null&&_o!==void 0?_o:''}\t`;
        a += `${(_q=(_p=monster.equipmentStats.find((stat)=>stat.key==='meleeStrengthBonus'))===null||_p===void 0?void 0:_p.value)!==null&&_q!==void 0?_q:''}\t`;
        a += `${(_s=(_r=monster.equipmentStats.find((stat)=>stat.key==='rangedStrengthBonus'))===null||_r===void 0?void 0:_r.value)!==null&&_s!==void 0?_s:''}\t`;
        a += `${(_u=(_t=monster.equipmentStats.find((stat)=>stat.key==='magicDamageBonus'))===null||_t===void 0?void 0:_t.value)!==null&&_u!==void 0?_u:''}\t`;
        a += `${(_w=(_v=monster.equipmentStats.find((stat)=>stat.key==='meleeDefenceBonus'))===null||_v===void 0?void 0:_v.value)!==null&&_w!==void 0?_w:''}\t`;
        a += `${(_y=(_x=monster.equipmentStats.find((stat)=>stat.key==='rangedDefenceBonus'))===null||_x===void 0?void 0:_x.value)!==null&&_y!==void 0?_y:''}\t`;
        a += `${(_0=(_z=monster.equipmentStats.find((stat)=>stat.key==='magicDefenceBonus'))===null||_z===void 0?void 0:_z.value)!==null&&_0!==void 0?_0:''}\t`;
        a += `${(_1=monster.equipmentStats.find((stat)=>stat.key==='resistance'&&stat.damageType.id==="melvorD:Normal"))!==null&&_1!==void 0?_1:''}\t`;
        a += `${(_2=monster.equipmentStats.find((stat)=>stat.key==='resistance'&&stat.damageType.id==="melvorItA:Abyssal"))!==null&&_2!==void 0?_2:''}\t`;
        const e = new Enemy(game.combat, game);
        e.setNewMonster(monster);
        a += `${e.stats.maxHit}\t`;
        a += `${e.stats.maxHit}\t`;
        a += `${e.stats.accuracy}\t`;
        a += `${e.stats.evasion.melee}\t`;
        a += `${e.stats.evasion.ranged}\t`;
        a += `${e.stats.evasion.magic}\t`;
        a += `\n`;
    });
}

function generateEquipmentStatsCSV() {
    let a = ``;
    a += `Name\tattackSpeed\tstabAttackBonus\tslashAttackBonus\tblockAttackBonus\trangedAttackBonus\tmagicAttackBonus\tmeleeStrengthBonus\trangedStrengthBonus\tmagicDamageBonus\tmeleeDefenceBonus\trangedDefenceBonus\tmagicDefenceBonus\tsummoningMaxhit\tdamageReduction\tabyssalResistance\n`;
    game.items.forEach((item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
        if (item.id.includes('melvorItA')) {
            if (item instanceof EquipmentItem) {
                a += `${item.name}\t`;
                a += `${(_b=(_a=item.equipmentStats.find((stat)=>stat.key==='attackSpeed'))===null||_a===void 0?void 0:_a.value)!==null&&_b!==void 0?_b:''}\t`;
                a += `${(_d=(_c=item.equipmentStats.find((stat)=>stat.key==='stabAttackBonus'))===null||_c===void 0?void 0:_c.value)!==null&&_d!==void 0?_d:''}\t`;
                a += `${(_f=(_e=item.equipmentStats.find((stat)=>stat.key==='slashAttackBonus'))===null||_e===void 0?void 0:_e.value)!==null&&_f!==void 0?_f:''}\t`;
                a += `${(_h=(_g=item.equipmentStats.find((stat)=>stat.key==='blockAttackBonus'))===null||_g===void 0?void 0:_g.value)!==null&&_h!==void 0?_h:''}\t`;
                a += `${(_k=(_j=item.equipmentStats.find((stat)=>stat.key==='rangedAttackBonus'))===null||_j===void 0?void 0:_j.value)!==null&&_k!==void 0?_k:''}\t`;
                a += `${(_m=(_l=item.equipmentStats.find((stat)=>stat.key==='magicAttackBonus'))===null||_l===void 0?void 0:_l.value)!==null&&_m!==void 0?_m:''}\t`;
                a += `${(_p=(_o=item.equipmentStats.find((stat)=>stat.key==='meleeStrengthBonus'))===null||_o===void 0?void 0:_o.value)!==null&&_p!==void 0?_p:''}\t`;
                a += `${(_r=(_q=item.equipmentStats.find((stat)=>stat.key==='rangedStrengthBonus'))===null||_q===void 0?void 0:_q.value)!==null&&_r!==void 0?_r:''}\t`;
                a += `${(_t=(_s=item.equipmentStats.find((stat)=>stat.key==='magicDamageBonus'))===null||_s===void 0?void 0:_s.value)!==null&&_t!==void 0?_t:''}\t`;
                a += `${(_v=(_u=item.equipmentStats.find((stat)=>stat.key==='meleeDefenceBonus'))===null||_u===void 0?void 0:_u.value)!==null&&_v!==void 0?_v:''}\t`;
                a += `${(_x=(_w=item.equipmentStats.find((stat)=>stat.key==='rangedDefenceBonus'))===null||_w===void 0?void 0:_w.value)!==null&&_x!==void 0?_x:''}\t`;
                a += `${(_z=(_y=item.equipmentStats.find((stat)=>stat.key==='magicDefenceBonus'))===null||_y===void 0?void 0:_y.value)!==null&&_z!==void 0?_z:''}\t`;
                a += `${(_1=(_0=item.equipmentStats.find((stat)=>stat.key==='summoningMaxhit'))===null||_0===void 0?void 0:_0.value)!==null&&_1!==void 0?_1:''}`;
                a += `${(_2=item.equipmentStats.find((stat)=>stat.key==='resistance'&&stat.damageType.id==="melvorD:Normal"))!==null&&_2!==void 0?_2:''}\t`;
                a += `${(_3=item.equipmentStats.find((stat)=>stat.key==='resistance'&&stat.damageType.id==="melvorItA:Abyssal"))!==null&&_3!==void 0?_3:''}\t`;
                a += `\n`;
            }
        }
    });
    console.log(a);
}

function generateLangModifierCustomDescriptionForItem(item) {
    let text = `ITEM_DESCRIPTION_${item.localID}`;
    LANGS.forEach((lang) => {
        if (lang === 'carrot' || lang === 'lemon')
            return;
        setLang = lang;
        if (item.modifiers !== undefined || item.combatEffects !== undefined) {
            if (item.fitsInSlot("melvorD:Passive")) {
                text += `,${getLangString('MISC_STRING_0')} ${StatObject.formatAsPlainList(item)}`;
            } else {
                text += `,${StatObject.formatAsPlainList(item)}`;
            }
        }
    });
    console.log(text);
}
let isOnMobileLayout = false;
const MOBILE_UI_ELEMENT_SHIFTS = [{
    element: 'combat-corruption-settings',
    destination: 'combat-menu-0',
}, {
    element: 'combat-attack-styles',
    destination: 'combat-menu-0',
}, {
    element: 'combat-player-stats',
    destination: 'combat-menu-4',
}, {
    element: 'combat-slayer-task-menu',
    destination: 'combat-menu-5',
}, ];
const DESKTOP_UI_ELEMENT_SHIFTS = [{
    element: 'combat-player-stats',
    destination: 'desktop-combat-menus',
}, {
    element: 'combat-slayer-task-menu',
    destination: 'desktop-combat-menus',
}, {
    element: 'combat-corruption-settings',
    destination: 'desktop-combat-menus',
}, {
    element: 'combat-attack-styles',
    destination: 'desktop-combat-menus',
}, ];

function shiftUIElement(shift) {
    const element = document.getElementById(shift.element);
    const destination = document.getElementById(shift.destination);
    if (!element || !destination) {
        console.warn(`Could not shift element "${shift.element}" to "${shift.destination}".`);
        return;
    }
    destination.append(element);
}

function shiftToMobileLayout() {
    MOBILE_UI_ELEMENT_SHIFTS.forEach(shiftUIElement);
    isOnMobileLayout = true;
}

function shiftToDesktopLayout() {
    DESKTOP_UI_ELEMENT_SHIFTS.forEach(shiftUIElement);
    if (selectedCombatMenu === 4 || selectedCombatMenu === 5) {
        changeCombatMenu(0);
    }
    isOnMobileLayout = false;
}

function onMobileScreenWidthChange(event) {
    if (event.matches) {
        shiftToMobileLayout();
    } else {
        shiftToDesktopLayout();
    }
}
checkFileVersion('?11770')