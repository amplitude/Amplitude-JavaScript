var getLanguage = function () {
  return (
    (typeof navigator !== 'undefined' &&
      ((navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage)) ||
    ''
  );
};

export default {
  getLanguage,
};
