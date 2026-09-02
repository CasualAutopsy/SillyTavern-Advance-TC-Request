import './style.css';
import ext_settingsMenu from './settings.html'

const {
    extensionSettings,
    eventSource, eventTypes,
    saveSettingsDebounced,
    uuidv4
} = SillyTavern.getContext()

const YAML = SillyTavern.libs.yaml

const EXT_NAME = 'Advance-TC-Request'
const EXT_DIR = `SillyTavern-${EXT_NAME}`;
const EXT_PATH = `scripts/extensions/third-party/${EXT_DIR}`;

/**
 * @import {} from '../globals.js'
 */

/**
 * @typedef {import('../../../../custom-request.js').TextCompletionPayload} TextCompletionPayload
 */

/**
 * Loads setting states and handles the creation/migration
 * of the settings object.
 */
async function loadSettings() {
    if (!extensionSettings.adv_tc) {
        extensionSettings.adv_tc = {
            tc_payload: `
timestamp: ${Date.now()}
request_id: ${uuidv4()}
            `.trim(),
            tc_enabled: false,
            tc_override: false
        }
    }

    if (!extensionSettings.adv_tc.tc_payload) {
        extensionSettings.adv_tc.tc_payload = `
timestamp: ${Date.now()}
request_id: ${uuidv4()}
        `.trim()
    }

    saveSettingsDebounced();

    $('#tcrequest_input').val(extensionSettings.adv_tc.tc_payload).trigger('input');
    $('#tcrequest_enabled').prop('checked', extensionSettings.adv_tc.tc_enabled || false);
    $('#tcrequest_override').prop('checked', extensionSettings.adv_tc.tc_override || false);
}

/**
 * Registers the listeners for the extension's settings menu.
 */
async function registerListeners() {
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
 * Injects the custom payload parameters into the original TC payload.
 *
 * @param {TextCompletionPayload} args - Original TC payload.
 */
function setTCSettings(args) {
    let key_keep = [
        "prompt",         "stream",            "num_ctx",
        "num_predict",    "n_predict",         "api_server",
        "api_type",       "truncation_length", "max_tokens",
        "max_new_tokens"
    ]

    let new_tc_req = {}

    if (extensionSettings.adv_tc.tc_enabled !== true) {
        return;
    }

    if (extensionSettings.adv_tc.tc_override) {
        for (const key in args) {
            if (!key_keep.includes(key)) {
                delete args[key];
            }
        }
    }

    try {
        Object.assign(args, YAML.parse(extensionSettings.adv_tc.tc_payload));
    } catch {
        console.warn(`[${EXT_NAME}] Malformed yaml. Skipping payload injection.`);
    }
}

/**
 * Registers functions to SillyTavern event emitters.
 */
async function registerEvents() {
    eventSource.on(eventTypes.TEXT_COMPLETION_SETTINGS_READY, setTCSettings);
}

jQuery(async () => {
    $('#extensions_settings').append(ext_settingsMenu);

    loadSettings();

    registerListeners();

    registerEvents();
});
