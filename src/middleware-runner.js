/**
 * @typedef Next
 * @type function
 * @param {Object} payload
 */

/**
 * @typedef Payload
 * @type Object
 * @property {Object} event
 * @property {Object} extra
 */

/**
 * @typedef Middleware
 * @type function
 * @param {Payload} payload
 * @param {Object} extra
 */

export class MiddlewareRunner {
  constructor() {
    /** @type {Middleware[]} */
    this._middlewares = [];
  }

  /**
   * @param {Middleware} middleware
   */
  add(middleware) {
    this._middlewares.push(middleware);
  }

  /**
   * Runs all middleware
   *
   * @param {Payload} payload
   * @param {Next} next
   *
   * @return void
   */
  run(payload, next) {
    let curMiddlewareIndex = -1;
    const middlewareCount = this._middlewares.length;

    /** @type {Middleware} */
    const middlewareNext = (curPayload) => {
      curMiddlewareIndex += 1;
      if (curMiddlewareIndex < middlewareCount) {
        this._middlewares[curMiddlewareIndex](curPayload, _next);
      } else {
        next(curPayload);
      }
    };

    /** @type {Next} */
    const _next = middlewareCount > 0 ? middlewareNext : next;

    _next(payload);
  }
}
