import { extension_settings } from '../../../extensions.js';
import {
    eventSource,
    event_types,
    saveSettingsDebounced,
} from '../../../../script.js';

import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';

import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';

import { SlashCommandEnumValue } from '../../../slash-commands/SlashCommandEnumValue.js';

import { uuidv4 } from '../../../utils.js';

const extensionName = 'SillyTavern-Advance-TC-Request';
const extensionFolder = `scripts/extensions/third-party/${extensionName}`;

let ephemeral_settings = {};

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


function setTCSettings(args) {
    Object.assign(args, settings.tc_array);

    Object.assign(args, ephemeral_settings);
    ephemeral_settings = {}
}

//Listeners

function registerListeners() {
    $('#tcrequest_save').off('click').on('click', tcReqSaveClick());
}

function registerEvents() {
    eventSource.on(event_types.TEXT_COMPLETION_SETTINGS_READY, setTCSettings);
}

// Callback

async function tcEphemeralCallback(args,value) {
    let dict = JSON.parse(args.dict);
    //let samp = args.sampler;
    
    Object.assign(ephemeral_settings, dict);

    return ephemeral_settings; 
}

// Slash Command

SlashCommandParser.addCommandObject(SlashCommand.fromProps({
    name: 'tc-ephemeral',
    callback: tcEphemeralCallback,
    namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
            name: 'dict',
            description: 'Dictionary containing sampler setting changes',
            typeList: [ARGUMENT_TYPE.DICTIONARY],
            isRequired: false,
        }),
        SlashCommandNamedArgument.fromProps({
            name: 'sampler',
            description: 'String of sampler setting variable name(Not implemented)',
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: false,
        }),
    ],
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({
            description: 'sampler setting value(Not implemented)',
            typeList: [ARGUMENT_TYPE.NUMBER,ARGUMENT_TYPE.STRING,ARGUMENT_TYPE.BOOLEAN,ARGUMENT_TYPE.LIST,ARGUMENT_TYPE.DICTIONARY],
            isRequired: false,
        }),
    ],
    returns:'Current ephemeral TC Dictionary',
    helpString: `
    <div>
        Set sampler settings that revert back after a generation.
    </div>
    <div>
        The most recent usage of this cmd wil not remove changes of the previous.
    </div>
    <div>
        The order of importance from highest to lowest is: <strong>Ephemeral TC</strong> > <strong>Advance TC</strong> > <strong>TC Preset</strong>.
    </div>
    <div>
        <strong>Example:</strong>
        <ul>
            <li>
                <pre><code>/tc-ephemeral sampler="temperature" 1.3</code></pre>
            </li>
            <li>
                <pre><code>/tc-ephemeral dict={"min_p":0.025,"top_k":120}</code></pre>
            </li>
        </ul>
    </div>
    `,
}));

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