export default class DiscordRESTError extends Error {
    public readonly code: any;
    public readonly message: string;

    constructor(public readonly req, public readonly res, public readonly response, public readonly stack) {
        super();

        this.code = +response.code || -1;

        let message = this.name + ": " + (response.message || "Unknown error");
        if (response.errors) {
            message += "\n  " + this.flattenErrors(response.errors).join("\n  ");
        } else {
            const errors = this.flattenErrors(response);
            if (errors.length > 0) {
                message += "\n  " + errors.join("\n  ");
            }
        }
        this.message = message;

        if (stack) {
            this.stack = this.message + "\n" + stack;
        } else {
            Error.captureStackTrace(this, DiscordRESTError);
        }
    }

    get name() {
        return `${this.constructor.name} [${this.code}]`;
    }

    public flattenErrors(errors: any, keyPrefix?: string) {
        keyPrefix = keyPrefix || "";

        let messages = [];
        for (const fieldName in errors) {
            if (fieldName === "message" || fieldName === "code") {
                continue;
            }
            if (errors[fieldName]._errors) {
                messages = messages.concat(
                    errors[fieldName]._errors.map((obj) => `${keyPrefix + fieldName}: ${obj.message}`),
                );
            } else if (Array.isArray(errors[fieldName])) {
                messages = messages.concat(errors[fieldName].map((str) => `${keyPrefix + fieldName}: ${str}`));
            } else if (typeof errors[fieldName] === "object") {
                messages = messages.concat(this.flattenErrors(errors[fieldName], keyPrefix + fieldName + "."));
            }
        }
        return messages;
    }
}
