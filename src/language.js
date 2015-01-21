var getLanguage = function() {
    return navigator && ((navigator.languages && navigator.languages[0]) ||
        navigator.language || navigator.userLanguage);
};

module.exports = {
    language: getLanguage()
};
