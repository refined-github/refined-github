// Export as functions because of the g flag
// https://stackoverflow.com/questions/1520800/why-regexp-with-global-flag-in-javascript-give-wrong-results
export const getURLRegex = () => /(http(s)?(:\/\/))(www\.)?[a-zA-Z0-9-_.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_+.~#?&//=]*)/g;
export const getIssueRegex = () => /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/g;
