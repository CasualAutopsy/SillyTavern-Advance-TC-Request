import { extension_settings, renderExtensionTemplateAsync } from '../../../extensions.js';
import {
    eventSource,
    event_types,
    saveSettingsDebounced,
} from '../../../../script.js';
import { uuidv4 } from '../../../utils.js';

const extensionName = 'SillyTavern-Advance-TC-Request';
const extensionFolder = `scripts/extensions/third-party/${extensionName}`;

const tcrequest_settings = {
    'tc_array':{
        'timestamp': Date.now(),
        'request_id': uuidv4(),
    },
};

let settings = extension_settings[extensionName];

//Settings loader

async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};

    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(
            extension_settings[extensionName],
            tcrequest_settings,
        );
    }
    settings = extension_settings[extensionName];

    $('#tcrequest_input').val(JSON.stringify(settings.tc_array)).trigger('input');
}

//Listener Functions

function tcReqSaveClick() {
    return function () {
        try {
            const value = $('#tcrequest_input').val();

            settings.tc_array = JSON.parse(value);

            saveSettingsDebounced();
        }
        catch {
            console.log('[Advance TC Request]: Invalid Array');
            return;
        }
    };
}

//Listeners

function registerListeners() {
    $('#tcrequest_save').off('click').on('click', tcReqSaveClick());
}


eventSource.on(event_types.TEXT_COMPLETION_SETTINGS_READY, (args) =>{
    Object.assign(args, settings.tc_array);
});

//JQuery

jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolder}/settings.html`);

    $('#extensions_settings').append(settingsHtml);

    registerListeners();
    loadSettings();
    
});