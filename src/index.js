import { loadSettings } from './main/settings.js';
import { registerEvents, registerListeners } from './main/events.js';
import { initSlashCMDs } from './main/cmds.js';

import './ui/settings.css';
import ext_settingsMenu from './ui/settings.html';

/**
 * @import {} from '../global'
 */

jQuery(async () => {
    $('#extensions_settings').append(ext_settingsMenu);

    loadSettings();

    registerListeners();
    registerEvents();

    initSlashCMDs();
});
