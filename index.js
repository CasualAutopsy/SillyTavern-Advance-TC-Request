// @ts-nocheck
const {
    extensionSettings,
    eventSource, eventTypes,
    saveSettingsDebounced,
    uuidv4
} = SillyTavern.getContext()

const YAML = SillyTavern.libs.yaml

const extensionName = 'SillyTavern-Advance-TC-Request';
const extensionFolder = `scripts/extensions/third-party/${extensionName}`;

async function loadSettings()
{
    if ( ! extensionSettings.adv_tc )
        extensionSettings.adv_tc = {
            "tc_json": {
                "timestamp": Date.now(),
                "request_id": uuidv4(),
            },
            "tc_enabled": false,
            "tc_override": false
        };


    saveSettingsDebounced();

    $('#tcrequest_input').val(YAML.stringify(extensionSettings.adv_tc.tc_json)).trigger('input');
    $('#tcrequest_enabled').prop('checked', extensionSettings.adv_tc.tc_enabled || false);
    $('#tcrequest_override').prop('checked', extensionSettings.adv_tc.tc_override || false);
}

//Listener Functions

function tcReqSaveClick() {
    return function () {
        try {
            const value = $('#tcrequest_input').val();

            extensionSettings.adv_tc.tc_json = YAML.parse(value);

            saveSettingsDebounced();
        }
        catch {
            console.log('[Advance TC Request]: Invalid JSON');
        }
    };
}


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

    Object.assign(args, extensionSettings.adv_tc.tc_json);
}

//Listeners

function registerListeners() {
    $('#tcrequest_save').off('click').on('click', tcReqSaveClick());
    $('#tcrequest_enabled').on('click', function() {
        extensionSettings.adv_tc.tc_enabled = $('#tcrequest_enabled').prop('checked');
        saveSettingsDebounced();
    });
    $('#tcrequest_override').on('click', function() {
        extensionSettings.adv_tc.tc_override = $('#tcrequest_override').prop('checked');
        saveSettingsDebounced();
    });
}

function registerEvents() {
    eventSource.on(eventTypes.TEXT_COMPLETION_SETTINGS_READY, setTCSettings);
}

jQuery(async () => {
    // JQuery settings panel
    const settingsHtml = await $.get(`${extensionFolder}/settings.html`);
    $('#extensions_settings').append(settingsHtml);

    // JQuery listeners
    registerListeners();

    // JQuery Events
    registerEvents();

    // Load settings
    loadSettings();

});
