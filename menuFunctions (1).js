function updateLocalTimeAndDate() {
    const now = new Date();
    const timeEl = document.getElementById('time-since-release');
    const dateEl = document.getElementById('date-display');

    if (timeEl) {
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        timeEl.textContent = `${hours}:${minutes} ${ampm}`;
    }

    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
}

updateLocalTimeAndDate();
setInterval(updateLocalTimeAndDate, 1_000);

window.postCallback = async function postCallback(name, data = {}) {
    try {
        const resourceName = new URLSearchParams(window.location.search).get('ResourceName')?.trim();
        if (!resourceName) {
            throw new Error('ResourceName is empty or undefined');
        }
        const url = `https://${resourceName}/${name}`;
        console.log(`POST ${url} with data:`, data);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return await response.json();
        } else {
            const text = await response.text();
            console.log(`Non-JSON response from ${url}:`, text);
            return text;
        }
    } catch (error) {
        console.error(`NUI Callback Error (${name}):`, error.message);
        return null;
    }
};

let selectedIndex = 0;
let previousIndex = 0;
let currentTab = 0;
let currentSubTab = 0;
let previousTab = 0;
let previousSubTab = 0; 
let menuVisible = true;

const menuWrapper = document.querySelector('.menu-wrapper');
const mainTabs = document.querySelectorAll('#menu-tabs .menu-tab');
const playerTabs = document.querySelectorAll('#player-tabs .menu-tab');
const miscTabs = document.querySelectorAll('#misc-tabs .menu-tab');
const scriptsTabs = document.querySelectorAll('#scripts-tabs .menu-tab');
const vehicleTabs = document.querySelectorAll('#vehicle-tabs .menu-tab');
const teleportTabs = document.querySelectorAll('#teleport-tabs .menu-tab');
const weaponsTabs = document.querySelectorAll('#weapons-tabs .menu-tab');
const modelTabs = document.querySelectorAll('#model-tabs .menu-tab');
const outfitsTabs = document.querySelectorAll('#outfits-tabs .menu-tab');
const worldTabs = document.querySelectorAll('#world-tabs .menu-tab');
const serverTabs = document.querySelectorAll('#server-tabs .menu-tab');
const forceTabs = document.querySelectorAll('#Force-tabs .menu-tab');

const containers = [
    document.getElementById('main-items'),
    document.getElementById('scripts-items'),
    document.getElementById('settings-items'),
    document.getElementById('player-options-items'),
    document.getElementById('misc-options-items'),
    document.getElementById('scripts-options-items'),
    document.getElementById('vehicle-options-items'),
    document.getElementById('teleport-options-items'),
    document.getElementById('weapons-options-items'),
    document.getElementById('model-options-items'),
    document.getElementById('outfits-options-items'),
    document.getElementById('world-options-items'),
    document.getElementById('server-options-items'),
    document.getElementById('Force-options-items')
];

const subContainers = [
    document.getElementById('player-main-items'),
    document.getElementById('player-movement-items'),
    document.getElementById('misc-main-items'),
    document.getElementById('misc-extra-items'),
    document.getElementById('scripts-main-items'),
    document.getElementById('misc-Built-items'),
    document.getElementById('scripts-misc-items'),
    document.getElementById('vehicle-main-items'),
    document.getElementById('vehicle-spawner-items'),
    document.getElementById('teleport-main-items'),
    document.getElementById('teleport-player-items'),
    document.getElementById('weapons-main-items'),
    document.getElementById('weapons-spawner-items'),
    document.getElementById('model-main-items'),
    document.getElementById('outfits-main-items'),
    document.getElementById('outfits-upper-items'),
    document.getElementById('outfits-lower-items'),
    document.getElementById('world-main-items'),
    document.getElementById('world-atmosphere-items'),
    document.getElementById('server-main-items'),
    document.getElementById('server-destroyer-items'),
    document.getElementById('Force-main-items')
];

const mainTabsEl = document.getElementById('menu-tabs');
const playerTabsEl = document.getElementById('player-tabs');
const miscTabsEl = document.getElementById('misc-tabs');
const scriptsTabsEl = document.getElementById('scripts-tabs');
const vehicleTabsEl = document.getElementById('vehicle-tabs');
const teleportTabsEl = document.getElementById('teleport-tabs');
const weaponsTabsEl = document.getElementById('weapons-tabs');
const modelTabsEl = document.getElementById('model-tabs');
const outfitsTabsEl = document.getElementById('outfits-tabs');
const worldTabsEl = document.getElementById('world-tabs');
const serverTabsEl = document.getElementById('server-tabs');
const forceTabsEl = document.getElementById('Force-tabs');

const scrollbarContainer = document.querySelector('.scrollbar-container');
const scrollbarThumb = document.getElementById('scrollbar-thumb');
const menuCounter = document.getElementById('menu-counter');
const playerToggle = document.getElementById('player-options-toggle');
const miscToggle = document.getElementById('misc-options-toggle');
const scriptsToggle = document.getElementById('scripts-options-toggle');
const vehicleToggle = document.getElementById('vehicle-options-toggle');
const teleportToggle = document.getElementById('teleport-options-toggle');
const weaponsToggle = document.getElementById('weapons-options-toggle');
const modelToggle = document.getElementById('model-options-toggle');
const outfitsToggle = document.getElementById('outfits-options-toggle');
const worldToggle = document.getElementById('world-options-toggle');
const serverToggle = document.getElementById('server-options-toggle');
const forceToggle = document.getElementById('Force-options-toggle');

const infoBox = document.getElementById("info-notification-box");
const infoTextContainer = infoBox.querySelector(".text-container");
let infoTimer = null;

function showInfo(text) {
    if (infoTimer) clearTimeout(infoTimer);
    if (text) {
        infoTextContainer.textContent = text;
        infoBox.classList.add("active");
    }
}

function hideInfo() {
    infoBox.classList.remove("active");
}

function updateslidervalue(dir) {
    const items = getMenuItems();
    const item = items[selectedIndex];
    if (!item || !item.classList.contains('slider')) return;

    const s = item._slider;
    const stepDirection = dir === 'left' || dir === -1 ? -1 : 1;
    s.value = Math.min(s.max, Math.max(s.min, s.value + stepDirection * s.step));

    const pct = (s.value - s.min) / (s.max - s.min);
    const fillEl = s.fill || s.sliderFill;
    const valueEl = s.valueSpan;

    if (fillEl) fillEl.style.width = (pct * 100) + '%';
    if (valueEl) valueEl.textContent = s.value.toFixed(1);

    const px1 = 2 + pct * 3, px2 = 5 + pct * 5, px3 = 9 + pct * 9;

    const callback = item.dataset.callback;
    if (callback) {
        postCallback(callback, {
            value: s.value,
            state: item.classList.contains('toggled')
        });
    }

    if (item.hasAttribute('data-info')) {
        showInfo(item.getAttribute('data-info'));
    }
}

function getMenuItems() {
    if (currentTab <= 2) {
        return Array.from(containers[currentTab].querySelectorAll('.menu-item'))
            .filter(i => i.offsetParent !== null);
    }
    const subIndexMap = {
        3: 0, 4: 2, 5: 4, 6: 7, 7: 9, 8: 11,
        9: 13, 10: 16, 11: 17, 12: 20, 13: 22,
        14: 24
    };
    const start = subIndexMap[currentTab] || 0;
    return Array.from(subContainers[start + currentSubTab].querySelectorAll('.menu-item'))
        .filter(i => i.offsetParent !== null);
}

const menuContainer = document.querySelector('.menu');
if (menuContainer) {
    menuContainer.addEventListener('mouseenter', (e) => {
        const item = e.target.closest('.menu-item[data-info]');
        if (item) {
            showInfo(item.getAttribute('data-info'));
        }
    }, true);

    menuContainer.addEventListener('mouseleave', (e) => {
        const item = e.target.closest('.menu-item[data-info]');
        if (item && !item.classList.contains('selected')) {
            hideInfo();
        }
    }, true);
}

function updateMenuSelection(dir) {
    const items = getMenuItems();
    if (!items.length) {
        hideInfo();
        return;
    }

    const oldItem = items[selectedIndex];
    if (oldItem) {
        oldItem.classList.remove('selected');
        const input = oldItem.querySelector('input[type="text"]');
        if (input) input.blur();
    }
    selectedIndex = (selectedIndex + dir + items.length) % items.length;

    const newItem = items[selectedIndex];
    newItem.classList.add('selected');
    newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (newItem.hasAttribute('data-info')) {
        showInfo(newItem.getAttribute('data-info'));
    } else {
        hideInfo();
    }

    const max = scrollbarContainer.clientHeight - scrollbarThumb.clientHeight;
    const step = items.length > 1 ? max / (items.length - 1) : 0;
    scrollbarThumb.style.top = `${selectedIndex * step}px`;

    menuCounter.textContent = `${selectedIndex + 1}/${items.length}`;
}

function clearSelection() {
    document.querySelectorAll('.menu-item.selected').forEach(el => el.classList.remove('selected'));
    hideInfo();
}

function updateTabUI(tabIdx, reset = true) {
    if (tabIdx !== currentTab) {
        previousTab = currentTab;
        previousSubTab = currentSubTab;
    }

    currentTab = tabIdx;
    clearSelection();

    if (reset) {
        if (tabIdx === previousTab) {
            selectedIndex = previousIndex;
        } else {
            previousIndex = selectedIndex;
            selectedIndex = 0;
        }
    }

    const groups = [
        document.getElementById('menu-tabs'),
        document.getElementById('player-tabs'),
        document.getElementById('misc-tabs'),
        document.getElementById('scripts-tabs'),
        document.getElementById('vehicle-tabs'),
        document.getElementById('teleport-tabs'),
        document.getElementById('weapons-tabs'),
        document.getElementById('model-tabs'),
        document.getElementById('outfits-tabs'),
        document.getElementById('world-tabs'),
        document.getElementById('server-tabs'),
        document.getElementById('Force-tabs')
    ];
    groups.forEach(g => {
        if (g) {
            g.style.display = 'none';
        }
    });

    const displayMap = {
        0: 0, 1: 0, 2: 0,
        3: 1, 4: 2, 5: 3,
        6: 4, 7: 5, 8: 6,
        9: 7, 10: 8, 11: 9,
        12: 10, 13: 11,
        14: 12 
    };
    const groupToShow = groups[displayMap[tabIdx]];
    if (groupToShow) {
        groupToShow.style.display = 'flex';
    }

    mainTabs.forEach((t, i) => t.classList.toggle('selected', tabIdx <= 2 && i === tabIdx));
    [playerTabs, miscTabs, scriptsTabs, vehicleTabs, teleportTabs, weaponsTabs, modelTabs, outfitsTabs, worldTabs, serverTabs, forceTabs]
        .forEach((arr, idx) => arr.forEach((t, i) => t.classList.toggle('selected', tabIdx === idx + 3 && i === currentSubTab)));

    containers.forEach((c, i) => {
        if (c) {
            c.style.display = i === tabIdx ? 'block' : 'none';
        }
    });
    updateMenuSelection(0);
    updateScrollbarHeight();

    subContainers.forEach(c => { if (c) c.style.display = 'none'; });
    const countMap = {
        3: 2, 4: 2, 5: 3,
        6: 2, 7: 2, 8: 2,
        9: 3, 10: 1, 11: 3,
        12: 2, 13: 2,
        14: 1 
    };

    const startMap = {
        3: 0, 4: 2, 5: 4,
        6: 7, 7: 9, 8: 11,
        9: 13, 10: 16, 11: 17,
        12: 20, 13: 22,
        14: 24 
    };

    if (startMap[tabIdx] !== undefined) { 
        const cCount = countMap[tabIdx] || 1;
        for (let i = 0; i < cCount; i++) {
            const subContainer = subContainers[startMap[tabIdx] + i];
            if (subContainer) {
                subContainer.style.display = i === currentSubTab ? 'block' : 'none';
            }
        }
    }

    updateMenuSelection(0);
    updateScrollbarHeight();
}

function updateTabSelection(dir) {
    if (currentTab >= 3 && currentTab <= 14) {
        const arrs = [
            playerTabs, miscTabs, scriptsTabs, vehicleTabs, teleportTabs,
            weaponsTabs, modelTabs, outfitsTabs, worldTabs, serverTabs, forceTabs
        ];
        const arr = arrs[currentTab - 3];
        if (arr) {
            currentSubTab = (currentSubTab + dir + arr.length) % arr.length;
        }
    } else {
        currentTab = (currentTab + dir + mainTabs.length) % mainTabs.length;
    }

    selectedIndex = 0;
    updateTabUI(currentTab, true);
    updateMenuSelection(0);
    updateScrollbarHeight();
}

[playerToggle, miscToggle, scriptsToggle, vehicleToggle,
teleportToggle, weaponsToggle, modelToggle, outfitsToggle, worldToggle, serverToggle, forceToggle]
    .forEach((el, i) => el.addEventListener('click', () => { currentSubTab = 0; updateTabUI(i + 3); }));

function goBack() {
    if (currentTab >= 3 && currentSubTab > 0) {
        currentSubTab = 0;
        selectedIndex = 0;
        updateTabUI(currentTab, true);
        updateScrollbarHeight();
    } else if (currentSubTab !== previousSubTab) {
        currentSubTab = previousSubTab;
        selectedIndex = previousIndex;
        updateTabUI(currentTab, true);
        updateScrollbarHeight();
    } else if (currentTab !== previousTab) {
        currentTab = previousTab;
        selectedIndex = previousIndex;
        currentSubTab = 0;
        updateTabUI(currentTab, true);
        updateScrollbarHeight();
    } else if (currentTab === previousTab && currentTab === 0) {
        menuVisible = false;
        menuWrapper.style.display = 'none';
        updateScrollbarHeight();
    } else {
        currentTab = 0;
        previousTab = 0;
        currentSubTab = 0;
        previousIndex = 0;
        selectedIndex = 0;
        updateTabUI(currentTab, true);
        updateMenuSelection(0);
        updateScrollbarHeight();
    }
}

window.addEventListener('message', ({ data }) => {
    let msg = typeof data === 'string' ? JSON.parse(data) : data;

    switch (msg.type) {
        case 'toggleMenu':
            menuVisible = !!msg.data.visible;
            if (!menuVisible) {
                if (menuWrapper) menuWrapper.style.display = 'none';
                clearSelection();
                hideInfo();
                return;
            }
            if (menuWrapper) menuWrapper.style.display = 'flex';
            updateTabUI(currentTab, false);
            const selectedItem = getMenuItems()[selectedIndex];
            if (selectedItem && selectedItem.hasAttribute('data-info')) {
                showInfo(selectedItem.getAttribute('data-info'));
            }
            break;

        case 'navigate':
            updateMenuSelection(msg.data.direction === 'up' ? -1 : 1);
            break;

        case 'tab':
            updateTabSelection(msg.data.direction === 'left' ? -1 : 1);
            break;

        case 'slide':
            updateslidervalue(msg.data.direction === 'left' ? -1 : 1);
            break;

        case 'select':
            getMenuItems()[selectedIndex]?.click();
            break;

        case 'back':
            goBack();
            break;

        case 'toggleCheckboxById':
            const itemToToggle = document.querySelector(`[data-bind-id="${msg.data.bindId}"]`);
            if (itemToToggle && (itemToToggle.classList.contains('checkbox') || itemToToggle.classList.contains('slidercb'))) {
                itemToToggle.classList.toggle('toggled', msg.data.state);
                const thumb = itemToToggle.querySelector('.toggle-thumb');
                if (thumb) {
                    thumb.classList.add('stretch');
                    setTimeout(() => thumb.classList.remove('stretch'), 200);
                }
                const input = itemToToggle.querySelector('input[type="checkbox"]');
                if (input) {
                    input.checked = msg.data.state;
                }
                if (itemToToggle.hasAttribute('data-info')) {
                    showInfo(itemToToggle.getAttribute('data-info'));
                }
            }
            break;
    }
});

function updateScrollbarHeight() {
    const menuItemsContainer = document.querySelector('.menu-items-container');
    const scrollbarContainer = document.querySelector('.scrollbar-container');
    const containerHeight = Math.min(menuItemsContainer.scrollHeight, 400);
    scrollbarContainer.style.height = `${containerHeight}px`;
}

updateScrollbarHeight();

function assignBindIds() {
    const mainMenuIndexMap = { 'Main': 1, 'Scripts': 2, 'Settings': 3 };
    const subTabIndexCounters = { 'Main': 1, 'Scripts': 1, 'Settings': 1 };
    const itemIndexCounters = {};

    const processPanel = (panel, parentLabel, subTabIndex) => {
        if (!panel) return;
        const menuId = panel.id;
        if (!itemIndexCounters[menuId]) {
            itemIndexCounters[menuId] = 1;
        }

        panel.querySelectorAll('.menu-item.checkbox, .menu-item.slidercb').forEach(item => {
            if (!item.dataset.bindId) {
                const mainMenuIndex = mainMenuIndexMap[parentLabel];
                const itemIndex = itemIndexCounters[menuId];
                
                if (mainMenuIndex !== undefined && subTabIndex !== undefined) {
                    const bindId = `${mainMenuIndex}:${subTabIndex}:${itemIndex}`;
                    item.dataset.bindId = bindId;
                }
                itemIndexCounters[menuId]++;
            }
        });
    };

    const subTabCreationOrder = [
        { parent: 'Main', panels: ['#player-main-items', '#player-movement-items'] },
        { parent: 'Main', panels: ['#vehicle-main-items', '#vehicle-spawner-items'] },
        { parent: 'Main', panels: ['#teleport-main-items', '#teleport-player-items'] },
        { parent: 'Main', panels: ['#weapons-main-items', '#weapons-spawner-items'] },
        { parent: 'Main', panels: ['#model-main-items'] },
        { parent: 'Main', panels: ['#outfits-main-items', '#outfits-upper-items', '#outfits-lower-items'] },
        { parent: 'Main', panels: ['#world-main-items', '#world-atmosphere-items'] },
        { parent: 'Main', panels: ['#server-main-items', '#server-destroyer-items'] },
        { parent: 'Scripts', panels: ['#scripts-main-items', '#misc-Built-items', '#scripts-misc-items'] },
        { parent: 'Scripts', panels: ['#Force-main-items'] },
        { parent: 'Settings', panels: ['#misc-main-items', '#misc-extra-items'] }
    ];

    subTabCreationOrder.forEach(group => {
        group.panels.forEach(panelSelector => {
            const panel = document.querySelector(panelSelector);
            const subTabIndex = subTabIndexCounters[group.parent]++;
            processPanel(panel, group.parent, subTabIndex);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.postCallback !== 'function') {
        console.error('postCallback function is not defined. Ensure menuFunctions.js is loaded correctly.');
        return;
    }

    document.querySelectorAll('.menu-item[info]').forEach((item) => {
        item.addEventListener('mouseenter', () => {
            if (item.hasAttribute('info')) {
                showInfo(item.getAttribute('info'));
            }
        });
        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('selected')) {
                hideInfo();
            }
        });
    });

    assignBindIds();

    document.querySelectorAll('.menu-item.checkbox:not(.slider)').forEach((item) => {
        const text = item.textContent.trim();
        item.textContent = '';
        const label = document.createElement('span');
        label.textContent = text;
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.style.display = 'none';
        const toggleTrack = document.createElement('div');
        toggleTrack.className = 'toggle-track';
        const toggleThumb = document.createElement('div');
        toggleThumb.className = 'toggle-thumb';
        toggleTrack.appendChild(toggleThumb);
        item.append(label, input, toggleTrack);

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            item.classList.toggle('toggled');
            toggleThumb.classList.add('stretch');
            setTimeout(() => toggleThumb.classList.remove('stretch'), 200);
            input.checked = item.classList.contains('toggled');
            const callback = item.dataset.callback;
            if (callback) {
                window.postCallback(callback, {
                    state: item.classList.contains('toggled')
                }).then((response) => {
                    if (response === 'ok') {
                        if (item.hasAttribute('data-info')) {
                            showInfo(item.getAttribute('data-info'));
                        }
                    } else {
                        console.warn(`Unexpected response for callback ${callback}:`, response);
                        showInfo('Error: Invalid response from server');
                    }
                }).catch((error) => {
                    console.error(`Error triggering callback ${callback}:`, error);
                    showInfo('Error: Failed to execute action');
                });
            } else {
                console.warn('No callback defined for checkbox menu item:', text);
                showInfo('Error: No callback defined');
            }
        });
    });

    document.querySelectorAll('.menu-item.checkbox.slider').forEach((item) => {
        const text = item.textContent.trim();
        item.textContent = '';
        const label = document.createElement('span');
        label.textContent = text;
        const controlsWrapper = document.createElement('div');
        controlsWrapper.style.display = 'flex';
        controlsWrapper.style.alignItems = 'center';
        controlsWrapper.style.gap = '15px';
        const min = Number(item.dataset.min) || 0;
        const max = Number(item.dataset.max) || 100;
        const step = Number(item.dataset.step) || 1;
        let value = Number(item.dataset.value) || min;
        const sliderTrack = document.createElement('div');
        sliderTrack.className = 'slider-track';
        const sliderFill = document.createElement('div');
        sliderFill.className = 'slider-fill';
        const valueSpan = document.createElement('span');
        valueSpan.className = 'value';
        sliderTrack.append(sliderFill, valueSpan);
        const toggleTrack = document.createElement('div');
        toggleTrack.className = 'toggle-track';
        const toggleThumb = document.createElement('div');
        toggleThumb.className = 'toggle-thumb';
        toggleTrack.appendChild(toggleThumb);
        controlsWrapper.append(sliderTrack, toggleTrack);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.style.display = 'none';
        item.append(label, controlsWrapper, input);
        item._slider = { min, max, step, value, valueSpan, sliderFill };

        const render = () => {
            const s = item._slider;
            if (!s) return;
            const pct = (s.max - s.min) > 0 ? (s.value - s.min) / (s.max - s.min) : 0;
            s.sliderFill.style.width = `${pct * 100}%`;
            s.valueSpan.textContent = s.value.toFixed(s.step < 1 ? 1 : 0);
        };
        render();

        item.addEventListener('click', (e) => {
            if (e.target.closest('.slider-track')) return;
            e.stopPropagation();
            item.classList.toggle('toggled');
            toggleThumb.classList.add('stretch');
            setTimeout(() => toggleThumb.classList.remove('stretch'), 200);
            input.checked = item.classList.contains('toggled');
            const callback = item.dataset.callback;
            if (callback) {
                window.postCallback(callback, {
                    state: item.classList.contains('toggled'),
                    value: item._slider.value
                }).then((response) => {
                    if (response === 'ok') {
                        if (item.hasAttribute('data-info')) {
                            showInfo(item.getAttribute('data-info'));
                        }
                    } else {
                        console.warn(`Unexpected response for callback ${callback}:`, response);
                        showInfo('Error: Invalid response from server');
                    }
                }).catch((error) => {
                    console.error(`Error triggering callback ${callback}:`, error);
                    showInfo('Error: Failed to execute action');
                });
            } else {
                console.warn('No callback defined for slider-checkbox menu item:', text);
                showInfo('Error: No callback defined');
            }
        });

        sliderTrack.addEventListener('click', (e) => {
            const rect = sliderTrack.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const s = item._slider;
            s.value = Math.round((s.min + pct * (s.max - s.min)) / s.step) * s.step;
            s.value = Math.max(s.min, Math.min(s.max, s.value));
            render();
            const callback = item.dataset.callback;
            if (callback) {
                window.postCallback(callback, {
                    state: item.classList.contains('toggled'),
                    value: s.value
                }).then((response) => {
                    if (response === 'ok') {
                        if (item.hasAttribute('data-info')) {
                            showInfo(item.getAttribute('data-info'));
                        }
                    } else {
                        console.warn(`Unexpected response for callback ${callback}:`, response);
                        showInfo('Error: Invalid response from server');
                    }
                }).catch((error) => {
                    console.error(`Error triggering callback ${callback}:`, error);
                    showInfo('Error: Failed to execute action');
                });
            } else {
                console.warn('No callback defined for slider-checkbox menu item:', text);
                showInfo('Error: No callback defined');
            }
        });
    });

    document.querySelectorAll('.menu-item:not(.checkbox):not(.slider)').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const callback = item.dataset.callback;
            if (callback) {
                window.postCallback(callback, {}).then((response) => {
                    if (response === 'ok') {
                        item.classList.add('clicked');
                        setTimeout(() => item.classList.remove('clicked'), 200);
                        if (item.hasAttribute('data-info')) {
                            showInfo(item.getAttribute('data-info'));
                        }
                    } else {
                        console.warn(`Unexpected response for callback ${callback}:`, response);
                        showInfo('Error: Invalid response from server');
                    }
                }).catch((error) => {
                    console.error(`Error triggering callback ${callback}:`, error);
                    showInfo('Error: Failed to execute action');
                });
            } else {
                console.warn('No callback defined for menu item:', item.textContent.trim());
                showInfo('Error: No callback defined');
            }
        });
    });

    document.querySelectorAll('.menu-item.slider:not(.checkbox)').forEach((item) => {
        const min = Number(item.dataset.min) || 0;
        const max = Number(item.dataset.max) || 100;
        const step = Number(item.dataset.step) || 1;
        let value = Number(item.dataset.value) || min;
        const labelText = item.textContent.trim();
        item.textContent = '';
        const label = document.createElement('span');
        label.textContent = labelText;
        const track = document.createElement('div');
        track.className = 'slider-track';
        const fill = document.createElement('div');
        fill.className = 'slider-fill';
        const valueSpan = document.createElement('span');
        valueSpan.className = 'value';
        track.appendChild(fill);
        track.appendChild(valueSpan);
        item.append(label, track);
        item._slider = { min, max, step, value, valueSpan, fill };

        const render = () => {
            const s = item._slider;
            if (!s) return;
            const pct = (s.max - s.min) > 0 ? (s.value - s.min) / (s.max - s.min) : 0;
            s.fill.style.width = `${pct * 100}%`;
            s.valueSpan.textContent = s.value.toFixed(s.step < 1 ? 1 : 0);
        };
        render();

        track.addEventListener('click', (e) => {
            const rect = track.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const s = item._slider;
            s.value = Math.round((s.min + pct * (s.max - s.min)) / s.step) * s.step;
            s.value = Math.max(s.min, Math.min(s.max, s.value));
            render();
            const callback = item.dataset.callback;
            if (callback) {
                window.postCallback(callback, {
                    state: true,
                    value: s.value
                }).then((response) => {
                    if (response === 'ok') {
                        if (item.hasAttribute('data-info')) {
                            showInfo(item.getAttribute('data-info'));
                        }
                    } else {
                        console.warn(`Unexpected response for callback ${callback}:`, response);
                        showInfo('Error: Invalid response from server');
                    }
                }).catch((error) => {
                    console.error(`Error triggering callback ${callback}:`, error);
                    showInfo('Error: Failed to execute action');
                });
            } else {
                console.warn('No callback defined for slider menu item:', labelText);
                showInfo('Error: No callback defined');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (!menuVisible) {
            console.log('Menu is not visible, keydown ignored:', e.key);
            return;
        }
        switch (e.key) {
            case 'ArrowUp':
                updateMenuSelection(-1);
                break;
            case 'ArrowDown':
                updateMenuSelection(1);
                break;
            case 'Q':
            case 'q':
                updateTabSelection(-1);
                break;
            case 'E':
            case 'e':
                updateTabSelection(1);
                break;
            case 'ArrowLeft':
                updateslidervalue(-1);
                break;
            case 'ArrowRight':
                updateslidervalue(1);
                break;
            case 'Enter':
            case 'NumpadEnter':
                const selectedItem = getMenuItems()[selectedIndex];
                if (selectedItem) {
                    console.log('Enter pressed, clicking item:', selectedItem.textContent.trim());
                    selectedItem.click();
                } else {
                    console.warn('No item selected for Enter key');
                }
                break;
            case 'Backspace':
            case 'Escape':
                goBack();
                break;
        }
    });
    updateTabUI(0);
});