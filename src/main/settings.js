import { extensionSettings, saveSettingsDebounced } from './st-context.js';

/**
 * Loads setting states and handles the creation/migration
 * of the settings object.
 */
export async function loadSettings() {
    if (!extensionSettings.adv_tc) {
        extensionSettings.adv_tc = {
            tc_payload: '',
            tc_enabled: false,
            tc_override: false,
            tc_presets: {},
        };
    }

    if (!extensionSettings.adv_tc.tc_payload) {
        extensionSettings.adv_tc.tc_payload = '';
    }

    if (!extensionSettings.adv_tc.tc_presets) {
        extensionSettings.adv_tc.tc_presets = {};
    }

    saveSettingsDebounced();

    $('#tcrequest_input').val(extensionSettings.adv_tc.tc_payload).trigger('input');
    $('#tcrequest_enabled').prop('checked', extensionSettings.adv_tc.tc_enabled || false);
    $('#tcrequest_override').prop('checked', extensionSettings.adv_tc.tc_override || false);
}
