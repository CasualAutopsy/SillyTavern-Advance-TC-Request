import {
    SlashCommandParser, SlashCommand,
    SlashCommandArgument,
    ARGUMENT_TYPE,
    extensionSettings, saveSettingsDebounced
} from './st-context.js';

const { commonEnumProviders } = (await import(/* webpackIgnore: true */'/scripts/slash-commands/SlashCommandCommonEnumsProvider.js'));

/**
 * @typedef {import('../../../../../slash-commands/SlashCommand.js').NamedArguments} NamedArguments
 * @typedef {import('../../../../../slash-commands/SlashCommand.js').UnnamedArguments} UnnamedArguments
 */


/**
 * Callback for setting the active state of the adv. TC req. extension.
 *
 * @param {NamedArguments} _
 * @param {UnnamedArguments} val
 */
async function stateTCSlashCMD(_, val) {
    const set_toggle = val === 'on'
        ? true
        : false;

    extensionSettings.adv_tc.tc_enabled = set_toggle;
    $('#tcrequest_enabled').prop('checked', extensionSettings.adv_tc.tc_enabled || false);

    saveSettingsDebounced();

    return _._scope.pipe;
}

/**
 * Callback for setting the override state of the adv. TC req. extension.
 *
 * @param {NamedArguments} _
 * @param {UnnamedArguments} val
 * @returns
 */
async function overrideStateTCSlashCMD(_, val) {
    const set_toggle = val === 'on'
        ? true
        : false;

    extensionSettings.adv_tc.tc_override = set_toggle;
    $('#tcrequest_override').prop('checked', extensionSettings.adv_tc.tc_override || false);

    saveSettingsDebounced();

    return _._scope.pipe;
}

/**
 * Callback for setting the TC payload of the adv. TC req. extension.
 *
 * @param {NamedArguments} _
 * @param {UnnamedArguments} val
 */
async function setTCSlashCMD(_, val) {
    const tc_input = typeof val == 'string'
        ? val
        : '';

    $('#tcrequest_input').val(tc_input).trigger('input');

    return _._scope.pipe;
}

/**
 * Initializes the slash commands for the adv. TC req. extension.
 */
export async function initSlashCMDs() {
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'atcr-state',
        // @ts-expect-error - Base ST typing error.
        callback: stateTCSlashCMD,
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'Whether to enable or disable the adv. TC req.',
                typeList: [ARGUMENT_TYPE.BOOLEAN],
                enumProvider: commonEnumProviders.boolean('onOff'),
                forceEnum: true,
                isRequired: true,
                acceptsMultiple: false,
            }),
        ],
        splitUnnamedArgument: false,
        helpString: 'Turn the advanced TC request extension on or off.',
        returns: 'void'
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'atcr-override-toggle',
        // @ts-expect-error - Base ST typing error.
        callback: overrideStateTCSlashCMD,
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'Whether to enable or disable the adv. TC req. override mode.',
                typeList: [ARGUMENT_TYPE.BOOLEAN],
                enumProvider: commonEnumProviders.boolean('onOff'),
                forceEnum: true,
                isRequired: true,
                acceptsMultiple: false,
            }),
        ],
        splitUnnamedArgument: false,
        helpString: 'Toggle whether to override the TC payload.',
        returns: 'void'
    }));

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'atcr-set',
        // @ts-expect-error - Base ST typing error.
        callback: setTCSlashCMD,
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'The YAML payload to set the adv. TC req. to.',
                typeList: [ARGUMENT_TYPE.STRING],
                isRequired: true,
                acceptsMultiple: false,
            }),
        ],
        splitUnnamedArgument: false,
        helpString: 'Set the YAML sampler payload for Adv. TC Req.',
        returns: 'void',
    }));
}

