import {
    extensionSettings, saveSettingsDebounced,
    eventSource, eventTypes
} from './st-context.js';

import { setTCSettings } from './injection.js';

/**
 * Registers the listeners for the extension's settings menu.
 */
export async function registerListeners() {
    /** @type {Number} */
    const inactivityInterval = 800;
    /** @type {NodeJS.Timeout} */
    let typingTimer;

    $('#tcrequest_input').on('input', () => {
        clearTimeout(typingTimer);

        typingTimer = setTimeout(() => {
            extensionSettings.adv_tc.tc_payload = $('#tcrequest_input').val();
            saveSettingsDebounced();
        }, inactivityInterval);
    });



    $('#tcrequest_enabled').on('click', () => {

        extensionSettings.adv_tc.tc_enabled = $('#tcrequest_enabled').prop('checked');
        saveSettingsDebounced();
    });

    $('#tcrequest_override').on('click', () => {

        extensionSettings.adv_tc.tc_override = $('#tcrequest_override').prop('checked');
        saveSettingsDebounced();
    });
}

/**
 * Registers functions to SillyTavern event emitters.
 */
export async function registerEvents() {
    eventSource.on(eventTypes.TEXT_COMPLETION_SETTINGS_READY, setTCSettings);
}
