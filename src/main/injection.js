import {
    YAML,
    extensionSettings,
} from './st-context.js';

let show_warning = true;

/**
 * @typedef {import('../../../../custom-request.js').TextCompletionPayload} TextCompletionPayload
 */

/**
 * Injects the custom payload parameters into the original TC payload.
 *
 * @param {TextCompletionPayload} args - Original TC payload.
 */
export function setTCSettings(args) {
    let key_keep = [
        "prompt",         "stream",            "num_ctx",
        "num_predict",    "n_predict",         "api_server",
        "api_type",       "truncation_length", "max_tokens",
        "max_new_tokens"
    ]

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

        if (!show_warning) {
            toastr.success('[Adv. TC Req.] The YAML is now correct. Samplers will be injected.')
            show_warning = true;
        }
    } catch {
        if (show_warning) {
            toastr.warn('[Adv. TC Req.] The request YAML is malformed. Sampler injection will be skipped.');
            show_warning = false;
        }
    }
}
