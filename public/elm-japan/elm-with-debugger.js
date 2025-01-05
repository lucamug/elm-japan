// elm-watch hot {"version":"2.0.0-beta.3","targetName":"with-debugger","webSocketConnection":8003}
"use strict";
(() => {
  // node_modules/tiny-decoders/index.mjs
  function boolean(value) {
    if (typeof value !== "boolean") {
      throw new DecoderError({ tag: "boolean", got: value });
    }
    return value;
  }
  function number(value) {
    if (typeof value !== "number") {
      throw new DecoderError({ tag: "number", got: value });
    }
    return value;
  }
  function string(value) {
    if (typeof value !== "string") {
      throw new DecoderError({ tag: "string", got: value });
    }
    return value;
  }
  function stringUnion(mapping) {
    return function stringUnionDecoder(value) {
      const str = string(value);
      if (!Object.prototype.hasOwnProperty.call(mapping, str)) {
        throw new DecoderError({
          tag: "unknown stringUnion variant",
          knownVariants: Object.keys(mapping),
          got: str
        });
      }
      return str;
    };
  }
  function unknownArray(value) {
    if (!Array.isArray(value)) {
      throw new DecoderError({ tag: "array", got: value });
    }
    return value;
  }
  function unknownRecord(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new DecoderError({ tag: "object", got: value });
    }
    return value;
  }
  function array(decoder) {
    return function arrayDecoder(value) {
      const arr = unknownArray(value);
      const result = [];
      for (let index = 0; index < arr.length; index++) {
        try {
          result.push(decoder(arr[index]));
        } catch (error) {
          throw DecoderError.at(error, index);
        }
      }
      return result;
    };
  }
  function record(decoder) {
    return function recordDecoder(value) {
      const object = unknownRecord(value);
      const keys = Object.keys(object);
      const result = {};
      for (const key of keys) {
        if (key === "__proto__") {
          continue;
        }
        try {
          result[key] = decoder(object[key]);
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      return result;
    };
  }
  function fields(callback, { exact = "allow extra", allow = "object" } = {}) {
    return function fieldsDecoder(value) {
      const object = allow === "array" ? unknownArray(value) : unknownRecord(value);
      const knownFields = /* @__PURE__ */ Object.create(null);
      function field(key, decoder) {
        try {
          const result2 = decoder(object[key]);
          knownFields[key] = null;
          return result2;
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      const result = callback(field, object);
      if (exact !== "allow extra") {
        const unknownFields = Object.keys(object).filter((key) => !Object.prototype.hasOwnProperty.call(knownFields, key));
        if (unknownFields.length > 0) {
          throw new DecoderError({
            tag: "exact fields",
            knownFields: Object.keys(knownFields),
            got: unknownFields
          });
        }
      }
      return result;
    };
  }
  function fieldsAuto(mapping, { exact = "allow extra" } = {}) {
    return function fieldsAutoDecoder(value) {
      const object = unknownRecord(value);
      const keys = Object.keys(mapping);
      const result = {};
      for (const key of keys) {
        if (key === "__proto__") {
          continue;
        }
        const decoder = mapping[key];
        try {
          result[key] = decoder(object[key]);
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      if (exact !== "allow extra") {
        const unknownFields = Object.keys(object).filter((key) => !Object.prototype.hasOwnProperty.call(mapping, key));
        if (unknownFields.length > 0) {
          throw new DecoderError({
            tag: "exact fields",
            knownFields: keys,
            got: unknownFields
          });
        }
      }
      return result;
    };
  }
  function fieldsUnion(key, mapping) {
    return fields(function fieldsUnionFields(field, object) {
      const tag = field(key, string);
      if (Object.prototype.hasOwnProperty.call(mapping, tag)) {
        const decoder = mapping[tag];
        return decoder(object);
      }
      throw new DecoderError({
        tag: "unknown fieldsUnion tag",
        knownTags: Object.keys(mapping),
        got: tag,
        key
      });
    });
  }
  function multi(mapping) {
    return function multiDecoder(value) {
      if (value === void 0) {
        if (mapping.undefined !== void 0) {
          return mapping.undefined(value);
        }
      } else if (value === null) {
        if (mapping.null !== void 0) {
          return mapping.null(value);
        }
      } else if (typeof value === "boolean") {
        if (mapping.boolean !== void 0) {
          return mapping.boolean(value);
        }
      } else if (typeof value === "number") {
        if (mapping.number !== void 0) {
          return mapping.number(value);
        }
      } else if (typeof value === "string") {
        if (mapping.string !== void 0) {
          return mapping.string(value);
        }
      } else if (Array.isArray(value)) {
        if (mapping.array !== void 0) {
          return mapping.array(value);
        }
      } else {
        if (mapping.object !== void 0) {
          return mapping.object(value);
        }
      }
      throw new DecoderError({
        tag: "unknown multi type",
        knownTypes: Object.keys(mapping),
        got: value
      });
    };
  }
  function optional(decoder, defaultValue) {
    return function optionalDecoder(value) {
      if (value === void 0) {
        return defaultValue;
      }
      try {
        return decoder(value);
      } catch (error) {
        const newError = DecoderError.at(error);
        if (newError.path.length === 0) {
          newError.optional = true;
        }
        throw newError;
      }
    };
  }
  function chain(decoder, next) {
    return function chainDecoder(value) {
      return next(decoder(value));
    };
  }
  function formatDecoderErrorVariant(variant, options) {
    const formatGot = (value) => {
      const formatted = repr(value, options);
      return (options === null || options === void 0 ? void 0 : options.sensitive) === true ? `${formatted}
(Actual values are hidden in sensitive mode.)` : formatted;
    };
    const stringList = (strings) => strings.length === 0 ? "(none)" : strings.map((s) => JSON.stringify(s)).join(", ");
    const got = (message, value) => value === DecoderError.MISSING_VALUE ? message : `${message}
Got: ${formatGot(value)}`;
    switch (variant.tag) {
      case "boolean":
      case "number":
      case "string":
        return got(`Expected a ${variant.tag}`, variant.got);
      case "array":
      case "object":
        return got(`Expected an ${variant.tag}`, variant.got);
      case "unknown multi type":
        return `Expected one of these types: ${variant.knownTypes.length === 0 ? "never" : variant.knownTypes.join(", ")}
Got: ${formatGot(variant.got)}`;
      case "unknown fieldsUnion tag":
        return `Expected one of these tags: ${stringList(variant.knownTags)}
Got: ${formatGot(variant.got)}`;
      case "unknown stringUnion variant":
        return `Expected one of these variants: ${stringList(variant.knownVariants)}
Got: ${formatGot(variant.got)}`;
      case "exact fields":
        return `Expected only these fields: ${stringList(variant.knownFields)}
Found extra fields: ${formatGot(variant.got).replace(/^\[|\]$/g, "")}`;
      case "tuple size":
        return `Expected ${variant.expected} items
Got: ${variant.got}`;
      case "custom":
        return got(variant.message, variant.got);
    }
  }
  var DecoderError = class extends TypeError {
    constructor({ key, ...params }) {
      const variant = "tag" in params ? params : { tag: "custom", message: params.message, got: params.value };
      super(`${formatDecoderErrorVariant(
        variant,
        { sensitive: true }
      )}

For better error messages, see https://github.com/lydell/tiny-decoders#error-messages`);
      this.path = key === void 0 ? [] : [key];
      this.variant = variant;
      this.nullable = false;
      this.optional = false;
    }
    static at(error, key) {
      if (error instanceof DecoderError) {
        if (key !== void 0) {
          error.path.unshift(key);
        }
        return error;
      }
      return new DecoderError({
        tag: "custom",
        message: error instanceof Error ? error.message : String(error),
        got: DecoderError.MISSING_VALUE,
        key
      });
    }
    format(options) {
      const path = this.path.map((part) => `[${JSON.stringify(part)}]`).join("");
      const nullableString = this.nullable ? " (nullable)" : "";
      const optionalString = this.optional ? " (optional)" : "";
      const variant = formatDecoderErrorVariant(this.variant, options);
      return `At root${path}${nullableString}${optionalString}:
${variant}`;
    }
  };
  DecoderError.MISSING_VALUE = Symbol("DecoderError.MISSING_VALUE");
  function repr(value, { recurse = true, maxArrayChildren = 5, maxObjectChildren = 3, maxLength = 100, recurseMaxLength = 20, sensitive = false } = {}) {
    const type = typeof value;
    const toStringType = Object.prototype.toString.call(value).replace(/^\[object\s+(.+)\]$/, "$1");
    try {
      if (value == null || type === "number" || type === "boolean" || type === "symbol" || toStringType === "RegExp") {
        return sensitive ? toStringType.toLowerCase() : truncate(String(value), maxLength);
      }
      if (type === "string") {
        return sensitive ? type : truncate(JSON.stringify(value), maxLength);
      }
      if (typeof value === "function") {
        return `function ${truncate(JSON.stringify(value.name), maxLength)}`;
      }
      if (Array.isArray(value)) {
        const arr = value;
        if (!recurse && arr.length > 0) {
          return `${toStringType}(${arr.length})`;
        }
        const lastIndex = arr.length - 1;
        const items = [];
        const end = Math.min(maxArrayChildren - 1, lastIndex);
        for (let index = 0; index <= end; index++) {
          const item = index in arr ? repr(arr[index], {
            recurse: false,
            maxLength: recurseMaxLength,
            sensitive
          }) : "<empty>";
          items.push(item);
        }
        if (end < lastIndex) {
          items.push(`(${lastIndex - end} more)`);
        }
        return `[${items.join(", ")}]`;
      }
      if (toStringType === "Object") {
        const object = value;
        const keys = Object.keys(object);
        const { name } = object.constructor;
        if (!recurse && keys.length > 0) {
          return `${name}(${keys.length})`;
        }
        const numHidden = Math.max(0, keys.length - maxObjectChildren);
        const items = keys.slice(0, maxObjectChildren).map((key2) => `${truncate(JSON.stringify(key2), recurseMaxLength)}: ${repr(object[key2], {
          recurse: false,
          maxLength: recurseMaxLength,
          sensitive
        })}`).concat(numHidden > 0 ? `(${numHidden} more)` : []);
        const prefix = name === "Object" ? "" : `${name} `;
        return `${prefix}{${items.join(", ")}}`;
      }
      return toStringType;
    } catch (_error) {
      return toStringType;
    }
  }
  function truncate(str, maxLength) {
    const half = Math.floor(maxLength / 2);
    return str.length <= maxLength ? str : `${str.slice(0, half)}\u2026${str.slice(-half)}`;
  }

  // src/Helpers.ts
  function join(array2, separator) {
    return array2.join(separator);
  }
  function pad(number2) {
    return number2.toString().padStart(2, "0");
  }
  function formatDate(date) {
    return join(
      [pad(date.getFullYear()), pad(date.getMonth() + 1), pad(date.getDate())],
      "-"
    );
  }
  function formatTime(date) {
    return join(
      [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())],
      ":"
    );
  }

  // src/TeaProgram.ts
  async function runTeaProgram(options) {
    return new Promise((resolve, reject) => {
      const [initialModel, initialCmds] = options.init;
      let model = initialModel;
      const msgQueue = [];
      let killed = false;
      const dispatch = (dispatchedMsg) => {
        if (killed) {
          return;
        }
        const alreadyRunning = msgQueue.length > 0;
        msgQueue.push(dispatchedMsg);
        if (alreadyRunning) {
          return;
        }
        for (const msg of msgQueue) {
          const [newModel, cmds] = options.update(msg, model);
          model = newModel;
          runCmds(cmds);
        }
        msgQueue.length = 0;
      };
      const runCmds = (cmds) => {
        for (const cmd of cmds) {
          options.runCmd(
            cmd,
            mutable,
            dispatch,
            (result) => {
              cmds.length = 0;
              killed = true;
              resolve(result);
            },
            (error) => {
              cmds.length = 0;
              killed = true;
              reject(error);
            }
          );
          if (killed) {
            break;
          }
        }
      };
      const mutable = options.initMutable(
        dispatch,
        (result) => {
          killed = true;
          resolve(result);
        },
        (error) => {
          killed = true;
          reject(error);
        }
      );
      runCmds(initialCmds);
    });
  }

  // src/Types.ts
  var AbsolutePath = fieldsAuto({
    tag: () => "AbsolutePath",
    absolutePath: string
  });
  var CompilationMode = stringUnion({
    debug: null,
    standard: null,
    optimize: null
  });
  var BrowserUiPosition = stringUnion({
    TopLeft: null,
    TopRight: null,
    BottomLeft: null,
    BottomRight: null
  });

  // client/css.ts
  async function reloadAllCssIfNeeded(originalStyles) {
    const results = await Promise.allSettled(
      Array.from(
        document.styleSheets,
        (styleSheet) => reloadCssIfNeeded(originalStyles, styleSheet)
      )
    );
    return results.some(
      (result) => result.status === "fulfilled" && result.value
    );
  }
  async function reloadCssIfNeeded(originalStyles, styleSheet) {
    if (styleSheet.href === null) {
      return false;
    }
    const url = makeUrl(styleSheet.href);
    if (url === void 0 || url.host !== window.location.host) {
      return false;
    }
    const response = await fetch(url, { cache: "reload" });
    if (!response.ok) {
      return false;
    }
    const newCss = await response.text();
    let newStyleSheet;
    const isFirefox = "MozAppearance" in document.documentElement.style;
    if (isFirefox) {
      if (/@import\b/i.test(newCss)) {
        console.warn(
          "elm-watch: Reloading CSS with @import is not possible in Firefox (not even in a comment or string). Style sheet:",
          url.href
        );
        return false;
      }
      newStyleSheet = new CSSStyleSheet();
      await newStyleSheet.replace(newCss);
    } else {
      const importUrls = getAllCssImports(url, styleSheet);
      await Promise.allSettled(
        importUrls.map((importUrl) => fetch(importUrl, { cache: "reload" }))
      );
      newStyleSheet = await parseCssWithImports(newCss);
    }
    return newStyleSheet === void 0 ? false : updateStyleSheetIfNeeded(originalStyles, styleSheet, newStyleSheet);
  }
  async function parseCssWithImports(css) {
    return new Promise((resolve) => {
      const style = document.createElement("style");
      style.media = "print";
      style.textContent = css;
      style.onerror = style.onload = () => {
        resolve(style.sheet ?? void 0);
        style.remove();
      };
      document.head.append(style);
    });
  }
  function makeUrl(urlString, base) {
    try {
      return new URL(urlString, base);
    } catch {
      return void 0;
    }
  }
  function getAllCssImports(styleSheetUrl, styleSheet) {
    return Array.from(styleSheet.cssRules).flatMap((rule) => {
      if (rule instanceof CSSImportRule) {
        const url = makeUrl(rule.href, styleSheetUrl);
        if (url !== void 0 && url.host === styleSheetUrl.host) {
          return [url, ...getAllCssImports(url, rule.styleSheet)];
        }
      }
      return [];
    });
  }
  function updateStyleSheetIfNeeded(originalStyles, oldStyleSheet, newStyleSheet) {
    let changed = false;
    const length = Math.min(
      oldStyleSheet.cssRules.length,
      newStyleSheet.cssRules.length
    );
    let index = 0;
    for (; index < length; index++) {
      const oldRule = oldStyleSheet.cssRules[index];
      const newRule = newStyleSheet.cssRules[index];
      if (oldRule instanceof CSSStyleRule && newRule instanceof CSSStyleRule) {
        if (oldRule.selectorText !== newRule.selectorText) {
          oldRule.selectorText = newRule.selectorText;
          changed = true;
        }
        let originals = originalStyles.get(oldRule);
        if (originals === void 0) {
          originals = oldRule.style.cssText;
          originalStyles.set(oldRule, originals);
        }
        if (originals !== newRule.style.cssText) {
          oldStyleSheet.deleteRule(index);
          oldStyleSheet.insertRule(newRule.cssText, index);
          originalStyles.set(
            oldStyleSheet.cssRules[index],
            newRule.style.cssText
          );
          changed = true;
        } else {
          const nestedChanged = updateStyleSheetIfNeeded(
            originalStyles,
            oldRule,
            newRule
          );
          if (nestedChanged) {
            changed = true;
            oldRule.selectorText = oldRule.selectorText;
          }
        }
      } else if (oldRule instanceof CSSImportRule && newRule instanceof CSSImportRule && oldRule.cssText === newRule.cssText) {
        const nestedChanged = updateStyleSheetIfNeeded(
          originalStyles,
          oldRule.styleSheet,
          newRule.styleSheet
        );
        if (nestedChanged) {
          changed = true;
          oldRule.media = oldRule.media;
        }
      } else if (oldRule instanceof CSSConditionRule && newRule instanceof CSSConditionRule && oldRule.conditionText === newRule.conditionText || oldRule instanceof CSSLayerBlockRule && newRule instanceof CSSLayerBlockRule && oldRule.name === newRule.name || oldRule instanceof CSSPageRule && newRule instanceof CSSPageRule && oldRule.selectorText === newRule.selectorText) {
        const nestedChanged = updateStyleSheetIfNeeded(
          originalStyles,
          oldRule,
          newRule
        );
        if (nestedChanged) {
          changed = true;
        }
      } else if (oldRule.cssText !== newRule.cssText) {
        oldStyleSheet.deleteRule(index);
        oldStyleSheet.insertRule(newRule.cssText, index);
        changed = true;
      }
    }
    while (index < oldStyleSheet.cssRules.length) {
      oldStyleSheet.deleteRule(index);
      changed = true;
    }
    for (; index < newStyleSheet.cssRules.length; index++) {
      const newRule = newStyleSheet.cssRules[index];
      oldStyleSheet.insertRule(newRule.cssText, index);
      changed = true;
    }
    return changed;
  }

  // src/NonEmptyArray.ts
  function NonEmptyArray(decoder) {
    return chain(array(decoder), (array2) => {
      if (isNonEmptyArray(array2)) {
        return array2;
      }
      throw new DecoderError({
        message: "Expected a non-empty array",
        value: array2
      });
    });
  }
  function isNonEmptyArray(array2) {
    return array2.length >= 1;
  }

  // client/WebSocketMessages.ts
  var FocusedTabAcknowledged = fieldsAuto({
    tag: () => "FocusedTabAcknowledged"
  });
  var OpenEditorError = fieldsUnion("tag", {
    EnvNotSet: fieldsAuto({
      tag: () => "EnvNotSet"
    }),
    CommandFailed: fieldsAuto({
      tag: () => "CommandFailed",
      message: string
    })
  });
  var OpenEditorFailed = fieldsAuto({
    tag: () => "OpenEditorFailed",
    error: OpenEditorError
  });
  var ErrorLocation = fieldsUnion("tag", {
    FileOnly: fieldsAuto({
      tag: () => "FileOnly",
      file: AbsolutePath
    }),
    FileWithLineAndColumn: fieldsAuto({
      tag: () => "FileWithLineAndColumn",
      file: AbsolutePath,
      line: number,
      column: number
    }),
    Target: fieldsAuto({
      tag: () => "Target",
      targetName: string
    })
  });
  var CompileError = fieldsAuto({
    title: string,
    location: optional(ErrorLocation),
    htmlContent: string
  });
  var StaticFilesChanged = fieldsAuto({
    tag: () => "StaticFilesChanged",
    changedFileUrlPaths: NonEmptyArray(string)
  });
  var StaticFilesMayHaveChangedWhileDisconnected = fieldsAuto({
    tag: () => "StaticFilesMayHaveChangedWhileDisconnected"
  });
  var StatusChanged = fieldsAuto({
    tag: () => "StatusChanged",
    status: fieldsUnion("tag", {
      AlreadyUpToDate: fieldsAuto({
        tag: () => "AlreadyUpToDate",
        compilationMode: CompilationMode,
        browserUiPosition: BrowserUiPosition
      }),
      Busy: fieldsAuto({
        tag: () => "Busy",
        compilationMode: CompilationMode,
        browserUiPosition: BrowserUiPosition
      }),
      CompileError: fieldsAuto({
        tag: () => "CompileError",
        compilationMode: CompilationMode,
        browserUiPosition: BrowserUiPosition,
        openErrorOverlay: boolean,
        errors: array(CompileError),
        foregroundColor: string,
        backgroundColor: string
      }),
      ElmJsonError: fieldsAuto({
        tag: () => "ElmJsonError",
        error: string
      }),
      ClientError: fieldsAuto({
        tag: () => "ClientError",
        message: string
      })
    })
  });
  var SuccessfullyCompiled = fieldsAuto({
    tag: () => "SuccessfullyCompiled",
    code: string,
    elmCompiledTimestamp: number,
    compilationMode: CompilationMode,
    browserUiPosition: BrowserUiPosition
  });
  var SuccessfullyCompiledButRecordFieldsChanged = fieldsAuto({
    tag: () => "SuccessfullyCompiledButRecordFieldsChanged"
  });
  var WebSocketToClientMessage = fieldsUnion("tag", {
    FocusedTabAcknowledged,
    OpenEditorFailed,
    StaticFilesChanged,
    StaticFilesMayHaveChangedWhileDisconnected,
    StatusChanged,
    SuccessfullyCompiled,
    SuccessfullyCompiledButRecordFieldsChanged
  });
  var WebSocketToServerMessage = fieldsUnion("tag", {
    ChangedCompilationMode: fieldsAuto({
      tag: () => "ChangedCompilationMode",
      compilationMode: CompilationMode
    }),
    ChangedBrowserUiPosition: fieldsAuto({
      tag: () => "ChangedBrowserUiPosition",
      browserUiPosition: BrowserUiPosition
    }),
    ChangedOpenErrorOverlay: fieldsAuto({
      tag: () => "ChangedOpenErrorOverlay",
      openErrorOverlay: boolean
    }),
    FocusedTab: fieldsAuto({
      tag: () => "FocusedTab"
    }),
    PressedOpenEditor: fieldsAuto({
      tag: () => "PressedOpenEditor",
      file: AbsolutePath,
      line: number,
      column: number
    })
  });
  function decodeWebSocketToClientMessage(message) {
    if (message.startsWith("//")) {
      const newlineIndexRaw = message.indexOf("\n");
      const newlineIndex = newlineIndexRaw === -1 ? message.length : newlineIndexRaw;
      const jsonString = message.slice(2, newlineIndex);
      const parsed = SuccessfullyCompiled(JSON.parse(jsonString));
      return { ...parsed, code: message };
    } else {
      return WebSocketToClientMessage(JSON.parse(message));
    }
  }

  // client/client.ts
  var window2 = globalThis;
  var IS_WEB_WORKER = window2.window === void 0;
  var RELOAD_MESSAGE_KEY = "__elmWatchReloadMessage";
  var RELOAD_TARGET_NAME_KEY_PREFIX = "__elmWatchReloadTarget__";
  var DEFAULT_ELM_WATCH = {
    MOCKED_TIMINGS: false,
    WEBSOCKET_TIMEOUT: 1e3,
    ON_INIT: () => {
    },
    ON_RENDER: () => {
    },
    ON_REACHED_IDLE_STATE: () => {
    },
    CHANGED_CSS: new Date(0),
    CHANGED_FILE_URL_PATHS: { timestamp: new Date(0), changed: /* @__PURE__ */ new Set() },
    ORIGINAL_STYLES: /* @__PURE__ */ new WeakMap(),
    RELOAD_STATUSES: {},
    RELOAD_PAGE: (message) => {
      if (message !== void 0) {
        try {
          window2.sessionStorage.setItem(RELOAD_MESSAGE_KEY, message);
        } catch {
        }
      }
      if (IS_WEB_WORKER) {
        if (message !== void 0) {
          console.info(message);
        }
        console.error(
          message === void 0 ? "elm-watch: You need to reload the page! I seem to be running in a Web Worker, so I can\u2019t do it for you." : `elm-watch: You need to reload the page! I seem to be running in a Web Worker, so I couldn\u2019t actually reload the page (see above).`
        );
      } else {
        window2.location.reload();
      }
    },
    KILL_MATCHING: () => Promise.resolve(),
    DISCONNECT: () => {
    },
    LOG_DEBUG: console.debug
  };
  var { __ELM_WATCH } = window2;
  if (typeof __ELM_WATCH !== "object" || __ELM_WATCH === null) {
    __ELM_WATCH = {};
    Object.defineProperty(window2, "__ELM_WATCH", { value: __ELM_WATCH });
  }
  for (const [key, value] of Object.entries(DEFAULT_ELM_WATCH)) {
    if (__ELM_WATCH[key] === void 0) {
      __ELM_WATCH[key] = value;
    }
  }
  var VERSION = "2.0.0-beta.3";
  var TARGET_NAME = "with-debugger";
  var INITIAL_ELM_COMPILED_TIMESTAMP = Number(
    "1736039052788"
  );
  var ORIGINAL_COMPILATION_MODE = "standard";
  var ORIGINAL_BROWSER_UI_POSITION = "BottomLeft";
  var WEBSOCKET_CONNECTION = "8003";
  var CONTAINER_ID = "elm-watch";
  var DEBUG = String("false") === "true";
  var ELM_WATCH_CHANGED_FILE_URL_PATHS_EVENT = "elm-watch:changed-file-url-paths";
  var BROWSER_UI_MOVED_EVENT = "BROWSER_UI_MOVED_EVENT";
  var CLOSE_ALL_ERROR_OVERLAYS_EVENT = "CLOSE_ALL_ERROR_OVERLAYS_EVENT";
  var ELM_WATCH_CHANGED_FILE_URL_BATCH_TIME = 10;
  var JUST_CHANGED_BROWSER_UI_POSITION_TIMEOUT = 2e3;
  var SEND_KEY_DO_NOT_USE_ALL_THE_TIME = Symbol(
    "This value is supposed to only be obtained via `Status`."
  );
  function logDebug(...args) {
    if (DEBUG) {
      __ELM_WATCH.LOG_DEBUG(...args);
    }
  }
  function parseBrowseUiPositionWithFallback(value) {
    try {
      return BrowserUiPosition(value);
    } catch {
      return ORIGINAL_BROWSER_UI_POSITION;
    }
  }
  function removeElmWatchIndexHtmlComment() {
    const node = document.firstChild;
    if (node instanceof Comment && node.data.trimStart().startsWith("elm-watch debug information:")) {
      node.remove();
    }
  }
  function run() {
    let elmCompiledTimestampBeforeReload = void 0;
    try {
      const message = window2.sessionStorage.getItem(RELOAD_MESSAGE_KEY);
      if (message !== null) {
        console.info(message);
        window2.sessionStorage.removeItem(RELOAD_MESSAGE_KEY);
      }
      const key = RELOAD_TARGET_NAME_KEY_PREFIX + TARGET_NAME;
      const previous = window2.sessionStorage.getItem(key);
      if (previous !== null) {
        const number2 = Number(previous);
        if (Number.isFinite(number2)) {
          elmCompiledTimestampBeforeReload = number2;
        }
        window2.sessionStorage.removeItem(key);
      }
    } catch {
    }
    const elements = IS_WEB_WORKER ? void 0 : getOrCreateTargetRoot();
    const browserUiPosition = elements === void 0 ? ORIGINAL_BROWSER_UI_POSITION : parseBrowseUiPositionWithFallback(elements.container.dataset.position);
    const getNow = () => new Date();
    if (!IS_WEB_WORKER) {
      removeElmWatchIndexHtmlComment();
    }
    runTeaProgram({
      initMutable: initMutable(getNow, elements),
      init: init(getNow(), browserUiPosition, elmCompiledTimestampBeforeReload),
      update: (msg, model) => {
        const [updatedModel, cmds] = update(msg, model);
        const modelChanged = updatedModel !== model;
        const reloadTrouble = model.status.tag !== updatedModel.status.tag && updatedModel.status.tag === "WaitingForReload" && updatedModel.elmCompiledTimestamp === updatedModel.elmCompiledTimestampBeforeReload;
        const newModel = modelChanged ? {
          ...updatedModel,
          uiExpanded: reloadTrouble ? true : updatedModel.uiExpanded
        } : model;
        const oldErrorOverlay = getErrorOverlay(model.status);
        const newErrorOverlay = getErrorOverlay(newModel.status);
        const statusType = statusToStatusType(newModel.status.tag);
        const statusTypeChanged = statusType !== statusToStatusType(model.status.tag);
        const statusFlashType = getStatusFlashType({
          statusType,
          statusTypeChanged,
          hasReceivedHotReload: newModel.elmCompiledTimestamp !== INITIAL_ELM_COMPILED_TIMESTAMP,
          uiRelatedUpdate: msg.tag === "UiMsg",
          errorOverlayVisible: elements !== void 0 && !elements.overlay.hidden
        });
        const flashCmd = statusFlashType === void 0 || cmds.some((cmd) => cmd.tag === "Flash") ? [] : [{ tag: "Flash", flashType: statusFlashType }];
        const allCmds = modelChanged ? [
          ...cmds,
          {
            tag: "UpdateGlobalStatus",
            reloadStatus: statusToReloadStatus(newModel),
            elmCompiledTimestamp: newModel.elmCompiledTimestamp
          },
          newModel.status.tag === model.status.tag && oldErrorOverlay?.openErrorOverlay === newErrorOverlay?.openErrorOverlay ? { tag: "NoCmd" } : {
            tag: "UpdateErrorOverlay",
            errors: newErrorOverlay === void 0 || !newErrorOverlay.openErrorOverlay ? /* @__PURE__ */ new Map() : newErrorOverlay.errors,
            sendKey: statusToSpecialCaseSendKey(newModel.status)
          },
          ...elements !== void 0 || newModel.status.tag !== model.status.tag ? [
            {
              tag: "Render",
              model: newModel,
              manageFocus: msg.tag === "UiMsg"
            }
          ] : [],
          ...flashCmd,
          model.browserUiPosition === newModel.browserUiPosition ? { tag: "NoCmd" } : {
            tag: "SetBrowserUiPosition",
            browserUiPosition: newModel.browserUiPosition
          },
          reloadTrouble ? { tag: "TriggerReachedIdleState", reason: "ReloadTrouble" } : { tag: "NoCmd" }
        ] : [...cmds, ...flashCmd];
        logDebug(`${msg.tag} (${TARGET_NAME})`, msg, newModel, allCmds);
        return [newModel, allCmds];
      },
      runCmd: runCmd(getNow, elements)
    }).catch((error) => {
      console.error("elm-watch: Unexpectedly exited with error:", error);
    });
  }
  function getErrorOverlay(status) {
    return "errorOverlay" in status ? status.errorOverlay : void 0;
  }
  function statusToReloadStatus(model) {
    switch (model.status.tag) {
      case "Busy":
      case "Connecting":
        return { tag: "MightWantToReload" };
      case "CompileError":
      case "ElmJsonError":
      case "EvalError":
      case "Idle":
      case "SleepingBeforeReconnect":
      case "UnexpectedError":
        return { tag: "NoReloadWanted" };
      case "WaitingForReload":
        return model.elmCompiledTimestamp === model.elmCompiledTimestampBeforeReload ? { tag: "NoReloadWanted" } : { tag: "ReloadRequested", reasons: model.status.reasons };
    }
  }
  function statusToStatusType(statusTag) {
    switch (statusTag) {
      case "Idle":
        return "Success";
      case "Busy":
      case "Connecting":
      case "SleepingBeforeReconnect":
      case "WaitingForReload":
        return "Waiting";
      case "CompileError":
      case "ElmJsonError":
      case "EvalError":
      case "UnexpectedError":
        return "Error";
    }
  }
  function statusToSpecialCaseSendKey(status) {
    switch (status.tag) {
      case "CompileError":
      case "Idle":
        return status.sendKey;
      case "Busy":
        return SEND_KEY_DO_NOT_USE_ALL_THE_TIME;
      case "Connecting":
      case "SleepingBeforeReconnect":
      case "WaitingForReload":
      case "ElmJsonError":
      case "EvalError":
      case "UnexpectedError":
        return void 0;
    }
  }
  function getOrCreateContainer() {
    const existing = document.getElementById(CONTAINER_ID);
    if (existing !== null) {
      return existing;
    }
    const container = h(HTMLDivElement, { id: CONTAINER_ID });
    container.style.all = "unset";
    container.style.position = "fixed";
    container.style.zIndex = "2147483647";
    const shadowRoot = container.attachShadow({ mode: "open" });
    shadowRoot.append(h(HTMLStyleElement, {}, CSS));
    document.documentElement.append(container);
    return container;
  }
  function getOrCreateTargetRoot() {
    const container = getOrCreateContainer();
    const { shadowRoot } = container;
    if (shadowRoot === null) {
      throw new Error(
        `elm-watch: Cannot set up hot reload, because an element with ID ${CONTAINER_ID} exists, but \`.shadowRoot\` is null!`
      );
    }
    let overlay = shadowRoot.querySelector(`.${CLASS.overlay}`);
    if (overlay === null) {
      overlay = h(HTMLDivElement, {
        className: CLASS.overlay,
        attrs: { "data-test-id": "Overlay" }
      });
      shadowRoot.append(overlay);
    }
    let overlayCloseButton = shadowRoot.querySelector(
      `.${CLASS.overlayCloseButton}`
    );
    if (overlayCloseButton === null) {
      const closeAllErrorOverlays = () => {
        shadowRoot.dispatchEvent(new CustomEvent(CLOSE_ALL_ERROR_OVERLAYS_EVENT));
      };
      overlayCloseButton = h(HTMLButtonElement, {
        className: CLASS.overlayCloseButton,
        attrs: {
          "aria-label": "Close error overlay",
          "data-test-id": "OverlayCloseButton"
        },
        onclick: closeAllErrorOverlays
      });
      shadowRoot.append(overlayCloseButton);
      const overlayNonNull = overlay;
      window2.addEventListener(
        "keydown",
        (event) => {
          if (overlayNonNull.hasChildNodes() && event.key === "Escape") {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeAllErrorOverlays();
          }
        },
        true
      );
    }
    let root = shadowRoot.querySelector(`.${CLASS.root}`);
    if (root === null) {
      root = h(HTMLDivElement, { className: CLASS.root });
      shadowRoot.append(root);
    }
    const targetRoot = createTargetRoot(TARGET_NAME);
    root.append(targetRoot);
    const elements = {
      container,
      shadowRoot,
      overlay,
      overlayCloseButton,
      root,
      targetRoot
    };
    setBrowserUiPosition(ORIGINAL_BROWSER_UI_POSITION, elements);
    return elements;
  }
  function createTargetRoot(targetName) {
    return h(HTMLDivElement, {
      className: CLASS.targetRoot,
      attrs: { "data-target": targetName }
    });
  }
  function browserUiPositionToCss(browserUiPosition) {
    switch (browserUiPosition) {
      case "TopLeft":
        return { top: "-1px", bottom: "auto", left: "-1px", right: "auto" };
      case "TopRight":
        return { top: "-1px", bottom: "auto", left: "auto", right: "-1px" };
      case "BottomLeft":
        return { top: "auto", bottom: "-1px", left: "-1px", right: "auto" };
      case "BottomRight":
        return { top: "auto", bottom: "-1px", left: "auto", right: "-1px" };
    }
  }
  function browserUiPositionToCssForChooser(browserUiPosition) {
    switch (browserUiPosition) {
      case "TopLeft":
        return { top: "auto", bottom: "0", left: "auto", right: "0" };
      case "TopRight":
        return { top: "auto", bottom: "0", left: "0", right: "auto" };
      case "BottomLeft":
        return { top: "0", bottom: "auto", left: "auto", right: "0" };
      case "BottomRight":
        return { top: "0", bottom: "auto", left: "0", right: "auto" };
    }
  }
  function setBrowserUiPosition(browserUiPosition, elements) {
    const isFirstTargetRoot = elements.targetRoot.previousElementSibling === null;
    if (!isFirstTargetRoot) {
      return;
    }
    elements.container.dataset.position = browserUiPosition;
    for (const [key, value] of Object.entries(
      browserUiPositionToCss(browserUiPosition)
    )) {
      elements.container.style.setProperty(key, value);
    }
    const isInBottomHalf = browserUiPosition === "BottomLeft" || browserUiPosition === "BottomRight";
    elements.root.classList.toggle(CLASS.rootBottomHalf, isInBottomHalf);
    elements.shadowRoot.dispatchEvent(
      new CustomEvent(BROWSER_UI_MOVED_EVENT, { detail: browserUiPosition })
    );
  }
  var initMutable = (getNow, elements) => (dispatch, resolvePromise) => {
    let removeListeners = [];
    const mutable = {
      removeListeners: () => {
        for (const removeListener of removeListeners) {
          removeListener();
        }
      },
      webSocket: initWebSocket(
        getNow,
        INITIAL_ELM_COMPILED_TIMESTAMP,
        dispatch
      ),
      webSocketTimeoutId: void 0
    };
    mutable.webSocket.addEventListener(
      "open",
      () => {
        removeListeners = [
          addEventListener(window2, "focus", (event) => {
            if (event instanceof CustomEvent && event.detail !== TARGET_NAME) {
              return;
            }
            dispatch({ tag: "FocusedTab" });
          }),
          addEventListener(window2, "visibilitychange", () => {
            if (document.visibilityState === "visible") {
              dispatch({
                tag: "PageVisibilityChangedToVisible",
                date: getNow()
              });
            }
          }),
          ...elements === void 0 ? [] : [
            addEventListener(
              elements.shadowRoot,
              BROWSER_UI_MOVED_EVENT,
              (event) => {
                dispatch({
                  tag: "BrowserUiMoved",
                  browserUiPosition: fields(
                    (field) => field("detail", parseBrowseUiPositionWithFallback)
                  )(event)
                });
              }
            ),
            addEventListener(
              elements.shadowRoot,
              CLOSE_ALL_ERROR_OVERLAYS_EVENT,
              () => {
                dispatch({
                  tag: "UiMsg",
                  date: getNow(),
                  msg: {
                    tag: "ChangedOpenErrorOverlay",
                    openErrorOverlay: false
                  }
                });
              }
            )
          ]
        ];
      },
      { once: true }
    );
    __ELM_WATCH.RELOAD_STATUSES[TARGET_NAME] = {
      tag: "MightWantToReload"
    };
    const originalOnInit = __ELM_WATCH.ON_INIT;
    __ELM_WATCH.ON_INIT = () => {
      dispatch({ tag: "AppInit" });
      originalOnInit();
    };
    const originalKillMatching = __ELM_WATCH.KILL_MATCHING;
    __ELM_WATCH.KILL_MATCHING = (targetName) => new Promise((resolve, reject) => {
      if (targetName.test(TARGET_NAME) && mutable.webSocket.readyState !== WebSocket.CLOSED) {
        mutable.webSocket.addEventListener("close", () => {
          originalKillMatching(targetName).then(resolve).catch(reject);
        });
        mutable.removeListeners();
        mutable.webSocket.close();
        if (mutable.webSocketTimeoutId !== void 0) {
          clearTimeout(mutable.webSocketTimeoutId);
          mutable.webSocketTimeoutId = void 0;
        }
        elements?.targetRoot.remove();
        resolvePromise(void 0);
      } else {
        originalKillMatching(targetName).then(resolve).catch(reject);
      }
    });
    const originalDisconnect = __ELM_WATCH.DISCONNECT;
    __ELM_WATCH.DISCONNECT = (targetName) => {
      if (targetName.test(TARGET_NAME) && mutable.webSocket.readyState !== WebSocket.CLOSED) {
        mutable.webSocket.close();
      } else {
        originalDisconnect(targetName);
      }
    };
    return mutable;
  };
  function addEventListener(target, eventName, listener) {
    target.addEventListener(eventName, listener);
    return () => {
      target.removeEventListener(eventName, listener);
    };
  }
  function initWebSocket(getNow, elmCompiledTimestamp, dispatch) {
    const hostname = window2.location.hostname === "" ? "localhost" : window2.location.hostname;
    const protocol = window2.location.protocol === "https:" ? "wss" : "ws";
    const url = new URL(
      /^\d+$/.test(WEBSOCKET_CONNECTION) ? `${protocol}://${hostname}:${WEBSOCKET_CONNECTION}/elm-watch` : WEBSOCKET_CONNECTION
    );
    url.searchParams.set("elmWatchVersion", VERSION);
    url.searchParams.set("targetName", TARGET_NAME);
    url.searchParams.set("elmCompiledTimestamp", elmCompiledTimestamp.toString());
    const webSocket = new WebSocket(url);
    webSocket.addEventListener("open", () => {
      dispatch({ tag: "WebSocketConnected", date: getNow() });
    });
    webSocket.addEventListener("close", () => {
      dispatch({
        tag: "WebSocketClosed",
        date: getNow()
      });
    });
    webSocket.addEventListener("message", (event) => {
      dispatch({
        tag: "WebSocketMessageReceived",
        date: getNow(),
        data: event.data
      });
    });
    return webSocket;
  }
  var init = (date, browserUiPosition, elmCompiledTimestampBeforeReload) => {
    const model = {
      status: { tag: "Connecting", date, attemptNumber: 1 },
      compilationMode: ORIGINAL_COMPILATION_MODE,
      browserUiPosition,
      lastBrowserUiPositionChangeDate: void 0,
      elmCompiledTimestamp: INITIAL_ELM_COMPILED_TIMESTAMP,
      elmCompiledTimestampBeforeReload,
      uiExpanded: false
    };
    return [model, [{ tag: "Render", model, manageFocus: false }]];
  };
  function update(msg, model) {
    switch (msg.tag) {
      case "AppInit":
        return [{ ...model }, []];
      case "BrowserUiMoved":
        return [{ ...model, browserUiPosition: msg.browserUiPosition }, []];
      case "EvalErrored":
        return [
          {
            ...model,
            status: { tag: "EvalError", date: msg.date },
            uiExpanded: true
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "EvalErrored"
            }
          ]
        ];
      case "EvalNeedsReload":
        return [
          {
            ...model,
            status: {
              tag: "WaitingForReload",
              date: msg.date,
              reasons: msg.reasons
            }
          },
          []
        ];
      case "EvalSucceeded":
        return [
          {
            ...model,
            status: {
              tag: "Idle",
              date: msg.date,
              sendKey: SEND_KEY_DO_NOT_USE_ALL_THE_TIME
            }
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "EvalSucceeded"
            }
          ]
        ];
      case "FocusedTab":
        return [
          model,
          [
            ...statusToStatusType(model.status.tag) === "Error" ? [{ tag: "Flash", flashType: "error" }] : [],
            {
              tag: "SendMessage",
              message: { tag: "FocusedTab" },
              sendKey: SEND_KEY_DO_NOT_USE_ALL_THE_TIME
            },
            {
              tag: "WebSocketTimeoutBegin"
            }
          ]
        ];
      case "PageVisibilityChangedToVisible":
        return reconnect(model, msg.date, { force: true });
      case "ReloadAllCssDone":
        return [
          model,
          msg.didChange ? [{ tag: "Flash", flashType: "success" }] : []
        ];
      case "SleepBeforeReconnectDone":
        return reconnect(model, msg.date, { force: false });
      case "UiMsg":
        return onUiMsg(msg.date, msg.msg, model);
      case "WebSocketClosed": {
        const attemptNumber = "attemptNumber" in model.status ? model.status.attemptNumber + 1 : 1;
        return [
          {
            ...model,
            status: {
              tag: "SleepingBeforeReconnect",
              date: msg.date,
              attemptNumber
            }
          },
          [{ tag: "SleepBeforeReconnect", attemptNumber }]
        ];
      }
      case "WebSocketConnected":
        return [
          {
            ...model,
            status: { tag: "Busy", date: msg.date, errorOverlay: void 0 }
          },
          []
        ];
      case "WebSocketMessageReceived": {
        const result = parseWebSocketMessageData(msg.data);
        switch (result.tag) {
          case "Success":
            return onWebSocketToClientMessage(msg.date, result.message, model);
          case "Error":
            return [
              {
                ...model,
                status: {
                  tag: "UnexpectedError",
                  date: msg.date,
                  message: result.message
                },
                uiExpanded: true
              },
              []
            ];
        }
      }
    }
  }
  function onUiMsg(date, msg, model) {
    switch (msg.tag) {
      case "ChangedBrowserUiPosition":
        return [
          {
            ...model,
            browserUiPosition: msg.browserUiPosition,
            lastBrowserUiPositionChangeDate: date
          },
          [
            {
              tag: "SendMessage",
              message: {
                tag: "ChangedBrowserUiPosition",
                browserUiPosition: msg.browserUiPosition
              },
              sendKey: msg.sendKey
            }
          ]
        ];
      case "ChangedCompilationMode":
        return [
          {
            ...model,
            status: {
              tag: "Busy",
              date,
              errorOverlay: getErrorOverlay(model.status)
            },
            compilationMode: msg.compilationMode
          },
          [
            {
              tag: "SendMessage",
              message: {
                tag: "ChangedCompilationMode",
                compilationMode: msg.compilationMode
              },
              sendKey: msg.sendKey
            }
          ]
        ];
      case "ChangedOpenErrorOverlay":
        return "errorOverlay" in model.status && model.status.errorOverlay !== void 0 ? [
          {
            ...model,
            status: {
              ...model.status,
              errorOverlay: {
                ...model.status.errorOverlay,
                openErrorOverlay: msg.openErrorOverlay
              }
            },
            uiExpanded: false
          },
          [
            {
              tag: "SendMessage",
              message: {
                tag: "ChangedOpenErrorOverlay",
                openErrorOverlay: msg.openErrorOverlay
              },
              sendKey: model.status.tag === "Busy" ? SEND_KEY_DO_NOT_USE_ALL_THE_TIME : model.status.sendKey
            }
          ]
        ] : [model, []];
      case "PressedChevron":
        return [{ ...model, uiExpanded: !model.uiExpanded }, []];
      case "PressedOpenEditor":
        return [
          model,
          [
            {
              tag: "SendMessage",
              message: {
                tag: "PressedOpenEditor",
                file: msg.file,
                line: msg.line,
                column: msg.column
              },
              sendKey: msg.sendKey
            }
          ]
        ];
      case "PressedReconnectNow":
        return reconnect(model, date, { force: true });
    }
  }
  function onWebSocketToClientMessage(date, msg, model) {
    switch (msg.tag) {
      case "FocusedTabAcknowledged":
        return [model, [{ tag: "WebSocketTimeoutClear" }]];
      case "OpenEditorFailed":
        return [
          model.status.tag === "CompileError" ? {
            ...model,
            status: { ...model.status, openEditorError: msg.error },
            uiExpanded: true
          } : model,
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "OpenEditorFailed"
            }
          ]
        ];
      case "StaticFilesChanged":
        return [
          { ...model, status: { ...model.status, date } },
          [
            {
              tag: "HandleStaticFilesChanged",
              changedFileUrlPaths: msg.changedFileUrlPaths
            }
          ]
        ];
      case "StaticFilesMayHaveChangedWhileDisconnected":
        return [
          { ...model, status: { ...model.status, date } },
          [
            {
              tag: "HandleStaticFilesChanged",
              changedFileUrlPaths: "AnyFileMayHaveChanged"
            }
          ]
        ];
      case "StatusChanged":
        return statusChanged(date, msg, model);
      case "SuccessfullyCompiled": {
        const justChangedBrowserUiPosition = model.lastBrowserUiPositionChangeDate !== void 0 && date.getTime() - model.lastBrowserUiPositionChangeDate.getTime() < JUST_CHANGED_BROWSER_UI_POSITION_TIMEOUT;
        return msg.compilationMode !== ORIGINAL_COMPILATION_MODE ? [
          {
            ...model,
            status: {
              tag: "WaitingForReload",
              date,
              reasons: ORIGINAL_COMPILATION_MODE === "proxy" ? [] : [
                `compilation mode changed from ${ORIGINAL_COMPILATION_MODE} to ${msg.compilationMode}.`
              ]
            },
            compilationMode: msg.compilationMode
          },
          []
        ] : [
          {
            ...model,
            compilationMode: msg.compilationMode,
            elmCompiledTimestamp: msg.elmCompiledTimestamp,
            browserUiPosition: msg.browserUiPosition,
            lastBrowserUiPositionChangeDate: void 0
          },
          [
            { tag: "Eval", code: msg.code },
            justChangedBrowserUiPosition ? {
              tag: "SetBrowserUiPosition",
              browserUiPosition: msg.browserUiPosition
            } : { tag: "NoCmd" }
          ]
        ];
      }
      case "SuccessfullyCompiledButRecordFieldsChanged":
        return [
          {
            ...model,
            status: {
              tag: "WaitingForReload",
              date,
              reasons: [
                `record field mangling in optimize mode was different than last time.`
              ]
            }
          },
          []
        ];
    }
  }
  function statusChanged(date, { status }, model) {
    switch (status.tag) {
      case "AlreadyUpToDate":
        return [
          {
            ...model,
            status: {
              tag: "Idle",
              date,
              sendKey: SEND_KEY_DO_NOT_USE_ALL_THE_TIME
            },
            compilationMode: status.compilationMode,
            browserUiPosition: status.browserUiPosition
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "AlreadyUpToDate"
            }
          ]
        ];
      case "Busy":
        return [
          {
            ...model,
            status: {
              tag: "Busy",
              date,
              errorOverlay: getErrorOverlay(model.status)
            },
            compilationMode: status.compilationMode,
            browserUiPosition: status.browserUiPosition
          },
          []
        ];
      case "ClientError":
        return [
          {
            ...model,
            status: { tag: "UnexpectedError", date, message: status.message },
            uiExpanded: true
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "ClientError"
            }
          ]
        ];
      case "CompileError":
        return [
          {
            ...model,
            status: {
              tag: "CompileError",
              date,
              sendKey: SEND_KEY_DO_NOT_USE_ALL_THE_TIME,
              errorOverlay: {
                errors: new Map(
                  status.errors.map((error) => {
                    const overlayError = {
                      title: error.title,
                      location: error.location,
                      htmlContent: error.htmlContent,
                      foregroundColor: status.foregroundColor,
                      backgroundColor: status.backgroundColor
                    };
                    const id = JSON.stringify(overlayError);
                    return [id, overlayError];
                  })
                ),
                openErrorOverlay: status.openErrorOverlay
              },
              openEditorError: void 0
            },
            compilationMode: status.compilationMode,
            browserUiPosition: status.browserUiPosition
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "CompileError"
            }
          ]
        ];
      case "ElmJsonError":
        return [
          {
            ...model,
            status: { tag: "ElmJsonError", date, error: status.error }
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "ElmJsonError"
            }
          ]
        ];
    }
  }
  function reconnect(model, date, { force }) {
    return model.status.tag === "SleepingBeforeReconnect" && (date.getTime() - model.status.date.getTime() >= retryWaitMs(model.status.attemptNumber) || force) ? [
      {
        ...model,
        status: {
          tag: "Connecting",
          date,
          attemptNumber: model.status.attemptNumber
        }
      },
      [
        {
          tag: "Reconnect",
          elmCompiledTimestamp: model.elmCompiledTimestamp
        }
      ]
    ] : [model, []];
  }
  function retryWaitMs(attemptNumber) {
    return Math.min(1e3 + 10 * attemptNumber ** 2, 1e3 * 60);
  }
  function printRetryWaitMs(attemptNumber) {
    return `${retryWaitMs(attemptNumber) / 1e3} seconds`;
  }
  var runCmd = (getNow, elements) => (cmd, mutable, dispatch, _resolvePromise, rejectPromise) => {
    switch (cmd.tag) {
      case "Eval": {
        try {
          const f = new Function(cmd.code);
          f();
          dispatch({ tag: "EvalSucceeded", date: getNow() });
        } catch (unknownError) {
          if (unknownError instanceof Error && unknownError.message.startsWith("ELM_WATCH_RELOAD_NEEDED")) {
            dispatch({
              tag: "EvalNeedsReload",
              date: getNow(),
              reasons: unknownError.message.split("\n\n---\n\n").slice(1)
            });
          } else {
            void Promise.reject(unknownError);
            dispatch({ tag: "EvalErrored", date: getNow() });
          }
        }
        return;
      }
      case "Flash":
        if (elements !== void 0) {
          flash(elements, cmd.flashType);
        }
        return;
      case "HandleStaticFilesChanged": {
        const now = getNow();
        let shouldReloadCss = false;
        if (cmd.changedFileUrlPaths === "AnyFileMayHaveChanged") {
          shouldReloadCss = true;
        } else {
          if (now.getTime() - __ELM_WATCH.CHANGED_FILE_URL_PATHS.timestamp.getTime() > ELM_WATCH_CHANGED_FILE_URL_BATCH_TIME) {
            __ELM_WATCH.CHANGED_FILE_URL_PATHS = {
              timestamp: now,
              changed: /* @__PURE__ */ new Set()
            };
          }
          const justChangedFileUrlPaths = /* @__PURE__ */ new Set();
          for (const path of cmd.changedFileUrlPaths) {
            if (path.toLowerCase().endsWith(".css")) {
              shouldReloadCss = true;
            } else if (!__ELM_WATCH.CHANGED_FILE_URL_PATHS.changed.has(path)) {
              justChangedFileUrlPaths.add(path);
            }
          }
          if (justChangedFileUrlPaths.size > 0) {
            for (const path of justChangedFileUrlPaths) {
              __ELM_WATCH.CHANGED_FILE_URL_PATHS.changed.add(path);
            }
            window2.dispatchEvent(
              new CustomEvent(ELM_WATCH_CHANGED_FILE_URL_PATHS_EVENT, {
                detail: justChangedFileUrlPaths
              })
            );
          }
        }
        if (shouldReloadCss && now.getTime() - __ELM_WATCH.CHANGED_CSS.getTime() > ELM_WATCH_CHANGED_FILE_URL_BATCH_TIME) {
          __ELM_WATCH.CHANGED_CSS = now;
          reloadAllCssIfNeeded(__ELM_WATCH.ORIGINAL_STYLES).then((didChange) => {
            dispatch({ tag: "ReloadAllCssDone", didChange });
          }).catch(rejectPromise);
        }
        return;
      }
      case "NoCmd":
        return;
      case "Reconnect":
        mutable.webSocket = initWebSocket(
          getNow,
          cmd.elmCompiledTimestamp,
          dispatch
        );
        return;
      case "Render": {
        const { model } = cmd;
        const info = {
          version: VERSION,
          webSocketUrl: new URL(mutable.webSocket.url),
          targetName: TARGET_NAME,
          originalCompilationMode: ORIGINAL_COMPILATION_MODE,
          initializedElmAppsStatus: checkInitializedElmAppsStatus()
        };
        if (elements === void 0) {
          const isError = statusToStatusType(model.status.tag) === "Error";
          const consoleMethod = isError ? console.error : console.info;
          consoleMethod(renderWebWorker(model, info));
        } else {
          const { targetRoot } = elements;
          render(getNow, targetRoot, dispatch, model, info, cmd.manageFocus);
        }
        return;
      }
      case "SendMessage": {
        const json = JSON.stringify(cmd.message);
        try {
          mutable.webSocket.send(json);
        } catch (error) {
          console.error("elm-watch: Failed to send WebSocket message:", error);
        }
        return;
      }
      case "SetBrowserUiPosition":
        if (elements !== void 0) {
          setBrowserUiPosition(cmd.browserUiPosition, elements);
        }
        return;
      case "SleepBeforeReconnect":
        setTimeout(() => {
          if (typeof document === "undefined" || document.visibilityState === "visible") {
            dispatch({ tag: "SleepBeforeReconnectDone", date: getNow() });
          }
        }, retryWaitMs(cmd.attemptNumber));
        return;
      case "TriggerReachedIdleState":
        Promise.resolve().then(() => {
          __ELM_WATCH.ON_REACHED_IDLE_STATE(cmd.reason);
        }).catch(rejectPromise);
        return;
      case "UpdateErrorOverlay":
        if (elements !== void 0) {
          updateErrorOverlay(
            TARGET_NAME,
            (msg) => {
              dispatch({ tag: "UiMsg", date: getNow(), msg });
            },
            cmd.sendKey,
            cmd.errors,
            elements.overlay,
            elements.overlayCloseButton
          );
        }
        return;
      case "UpdateGlobalStatus":
        __ELM_WATCH.RELOAD_STATUSES[TARGET_NAME] = cmd.reloadStatus;
        switch (cmd.reloadStatus.tag) {
          case "NoReloadWanted":
          case "MightWantToReload":
            break;
          case "ReloadRequested":
            try {
              window2.sessionStorage.setItem(
                RELOAD_TARGET_NAME_KEY_PREFIX + TARGET_NAME,
                cmd.elmCompiledTimestamp.toString()
              );
            } catch {
            }
        }
        reloadPageIfNeeded();
        return;
      case "WebSocketTimeoutBegin":
        if (mutable.webSocketTimeoutId === void 0) {
          mutable.webSocketTimeoutId = setTimeout(() => {
            mutable.webSocketTimeoutId = void 0;
            mutable.webSocket.close();
            dispatch({
              tag: "WebSocketClosed",
              date: getNow()
            });
          }, __ELM_WATCH.WEBSOCKET_TIMEOUT);
        }
        return;
      case "WebSocketTimeoutClear":
        if (mutable.webSocketTimeoutId !== void 0) {
          clearTimeout(mutable.webSocketTimeoutId);
          mutable.webSocketTimeoutId = void 0;
        }
        return;
    }
  };
  function parseWebSocketMessageData(data) {
    try {
      return {
        tag: "Success",
        message: decodeWebSocketToClientMessage(string(data))
      };
    } catch (unknownError) {
      return {
        tag: "Error",
        message: `Failed to decode web socket message sent from the server:
${possiblyDecodeErrorToString(
          unknownError
        )}`
      };
    }
  }
  function possiblyDecodeErrorToString(unknownError) {
    return unknownError instanceof DecoderError ? unknownError.format() : unknownError instanceof Error ? unknownError.message : repr(unknownError);
  }
  function functionToNull(value) {
    return typeof value === "function" ? null : value;
  }
  var ProgramType = stringUnion({
    "Platform.worker": null,
    "Browser.sandbox": null,
    "Browser.element": null,
    "Browser.document": null,
    "Browser.application": null,
    Html: null
  });
  var ElmModule = chain(
    record(
      chain(
        functionToNull,
        multi({
          null: () => [],
          array: array(
            fields((field) => field("__elmWatchProgramType", ProgramType))
          ),
          object: (value) => ElmModule(value)
        })
      )
    ),
    (record2) => Object.values(record2).flat()
  );
  var ProgramTypes = fields((field) => field("Elm", ElmModule));
  function checkInitializedElmAppsStatus() {
    if (window2.Elm !== void 0 && "__elmWatchProxy" in window2.Elm) {
      return {
        tag: "DebuggerModeStatus",
        status: {
          tag: "Disabled",
          reason: noDebuggerYetReason
        }
      };
    }
    if (window2.Elm === void 0) {
      return { tag: "MissingWindowElm" };
    }
    let programTypes;
    try {
      programTypes = ProgramTypes(window2);
    } catch (unknownError) {
      return {
        tag: "DecodeError",
        message: possiblyDecodeErrorToString(unknownError)
      };
    }
    if (programTypes.length === 0) {
      return { tag: "NoProgramsAtAll" };
    }
    const noDebugger = programTypes.filter((programType) => {
      switch (programType) {
        case "Platform.worker":
        case "Html":
          return true;
        case "Browser.sandbox":
        case "Browser.element":
        case "Browser.document":
        case "Browser.application":
          return false;
      }
    });
    return {
      tag: "DebuggerModeStatus",
      status: noDebugger.length === programTypes.length ? {
        tag: "Disabled",
        reason: noDebuggerReason(new Set(noDebugger))
      } : { tag: "Enabled" }
    };
  }
  function reloadPageIfNeeded() {
    let shouldReload = false;
    const reasons = [];
    for (const [targetName, reloadStatus] of Object.entries(
      __ELM_WATCH.RELOAD_STATUSES
    )) {
      switch (reloadStatus.tag) {
        case "MightWantToReload":
          return;
        case "NoReloadWanted":
          break;
        case "ReloadRequested":
          shouldReload = true;
          if (reloadStatus.reasons.length > 0) {
            reasons.push([targetName, reloadStatus.reasons]);
          }
          break;
      }
    }
    if (!shouldReload) {
      return;
    }
    const first = reasons[0];
    const [separator, reasonString] = reasons.length === 1 && first !== void 0 && first[1].length === 1 ? [" ", `${first[1].join("")}
(target: ${first[0]})`] : [
      ":\n\n",
      reasons.map(
        ([targetName, subReasons]) => [
          targetName,
          ...subReasons.map((subReason) => `- ${subReason}`)
        ].join("\n")
      ).join("\n\n")
    ];
    const message = reasons.length === 0 ? void 0 : `elm-watch: I did a full page reload because${separator}${reasonString}`;
    __ELM_WATCH.RELOAD_STATUSES = {};
    __ELM_WATCH.RELOAD_PAGE(message);
  }
  function h(t, {
    attrs,
    style,
    localName,
    ...props
  }, ...children) {
    const element = document.createElement(
      localName ?? t.name.replace(/^HTML(\w+)Element$/, "$1").replace("Anchor", "a").replace("Paragraph", "p").replace(/^([DOU])List$/, "$1l").toLowerCase()
    );
    Object.assign(element, props);
    if (attrs !== void 0) {
      for (const [key, value] of Object.entries(attrs)) {
        element.setAttribute(key, value);
      }
    }
    if (style !== void 0) {
      for (const [key, value] of Object.entries(style)) {
        element.style[key] = value;
      }
    }
    for (const child of children) {
      if (child !== void 0) {
        element.append(
          typeof child === "string" ? document.createTextNode(child) : child
        );
      }
    }
    return element;
  }
  function renderWebWorker(model, info) {
    const statusData = statusIconAndText(model, info);
    return `${statusData.icon} elm-watch: ${statusData.status} ${formatTime(
      model.status.date
    )} (${info.targetName})`;
  }
  function render(getNow, targetRoot, dispatch, model, info, manageFocus) {
    targetRoot.replaceChildren(
      view(
        (msg) => {
          dispatch({ tag: "UiMsg", date: getNow(), msg });
        },
        model,
        info
      )
    );
    const firstFocusableElement = targetRoot.querySelector(`button, [tabindex]`);
    if (manageFocus && firstFocusableElement instanceof HTMLElement) {
      firstFocusableElement.focus();
    }
    __ELM_WATCH.ON_RENDER(TARGET_NAME);
  }
  var CLASS = {
    browserUiPositionButton: "browserUiPositionButton",
    browserUiPositionChooser: "browserUiPositionChooser",
    chevronButton: "chevronButton",
    compilationModeWithIcon: "compilationModeWithIcon",
    container: "container",
    debugModeIcon: "debugModeIcon",
    envNotSet: "envNotSet",
    errorLocationButton: "errorLocationButton",
    errorTitle: "errorTitle",
    expandedUiContainer: "expandedUiContainer",
    flash: "flash",
    overlay: "overlay",
    overlayCloseButton: "overlayCloseButton",
    root: "root",
    rootBottomHalf: "rootBottomHalf",
    shortStatusContainer: "shortStatusContainer",
    targetName: "targetName",
    targetRoot: "targetRoot"
  };
  function getStatusFlashType({
    statusType,
    statusTypeChanged,
    hasReceivedHotReload,
    uiRelatedUpdate,
    errorOverlayVisible
  }) {
    switch (statusType) {
      case "Success":
        return statusTypeChanged && hasReceivedHotReload ? "success" : void 0;
      case "Error":
        return errorOverlayVisible ? statusTypeChanged && hasReceivedHotReload ? "error" : void 0 : uiRelatedUpdate ? void 0 : "error";
      case "Waiting":
        return void 0;
    }
  }
  function flash(elements, flashType) {
    for (const element of elements.targetRoot.querySelectorAll(
      `.${CLASS.flash}`
    )) {
      element.setAttribute("data-flash", flashType);
    }
  }
  var CHEVRON_UP = "\u25B2";
  var CHEVRON_DOWN = "\u25BC";
  var CSS = `
input,
button,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  color: inherit;
  margin: 0;
}

fieldset {
  display: grid;
  gap: 0.25em;
  margin: 0;
  border: 1px solid var(--grey);
  padding: 0.25em 0.75em 0.5em;
}

fieldset:disabled {
  color: var(--grey);
}

p,
dd {
  margin: 0;
}

dl {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.25em 1em;
  margin: 0;
  white-space: nowrap;
}

dt {
  text-align: right;
  color: var(--grey);
}

time {
  display: inline-grid;
  overflow: hidden;
}

time::after {
  content: attr(data-format);
  visibility: hidden;
  height: 0;
}

.${CLASS.overlay} {
  position: fixed;
  z-index: -2;
  inset: 0;
  overflow-y: auto;
  padding: 2ch 0;
}

.${CLASS.overlayCloseButton} {
  position: fixed;
  z-index: -1;
  top: 0;
  right: 0;
  appearance: none;
  padding: 1em;
  border: none;
  border-radius: 0;
  background: none;
  cursor: pointer;
  font-size: 1.25em;
  filter: drop-shadow(0 0 0.125em var(--backgroundColor));
}

.${CLASS.overlayCloseButton}::before,
.${CLASS.overlayCloseButton}::after {
  content: "";
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.125em;
  height: 1em;
  background-color: var(--foregroundColor);
  transform: translate(-50%, -50%) rotate(45deg);
}

.${CLASS.overlayCloseButton}::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.${CLASS.overlay},
.${CLASS.overlay} pre {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
}

.${CLASS.overlay} details {
  --border-thickness: 0.125em;
  border-top: var(--border-thickness) solid;
  margin: 2ch 0;
}

.${CLASS.overlay} summary {
  cursor: pointer;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 2ch;
  word-break: break-word;
}

.${CLASS.overlay} summary::-webkit-details-marker {
  display: none;
}

.${CLASS.overlay} summary::marker {
  content: none;
}

.${CLASS.overlay} summary > * {
  pointer-events: auto;
}

.${CLASS.errorTitle} {
  display: inline-block;
  font-weight: bold;
  --padding: 1ch;
  padding: 0 var(--padding);
  transform: translate(calc(var(--padding) * -1), calc(-50% - var(--border-thickness) / 2));
}

.${CLASS.errorTitle}::before {
  content: "${CHEVRON_DOWN}";
  display: inline-block;
  margin-right: 1ch;
  transform: translateY(-0.0625em);
}

details[open] > summary > .${CLASS.errorTitle}::before {
  content: "${CHEVRON_UP}";
}

.${CLASS.errorLocationButton} {
  appearance: none;
  padding: 0;
  border: none;
  border-radius: 0;
  background: none;
  text-align: left;
  text-decoration: underline;
  cursor: pointer;
}

.${CLASS.overlay} pre {
  margin: 0;
  padding: 2ch;
  overflow-x: auto;
}

.${CLASS.root} {
  all: initial;
  --grey: #767676;
  display: flex;
  align-items: start;
  overflow: auto;
  max-height: 100vh;
  max-width: 100vw;
  color: black;
  font-family: system-ui;
}

.${CLASS.rootBottomHalf} {
  align-items: end;
}

.${CLASS.targetRoot} + .${CLASS.targetRoot} {
  margin-left: -1px;
}

.${CLASS.targetRoot}:only-of-type .${CLASS.debugModeIcon},
.${CLASS.targetRoot}:only-of-type .${CLASS.targetName} {
  display: none;
}

.${CLASS.container} {
  display: flex;
  flex-direction: column-reverse;
  background-color: white;
  border: 1px solid var(--grey);
}

.${CLASS.rootBottomHalf} .${CLASS.container} {
  flex-direction: column;
}

.${CLASS.envNotSet} {
  display: grid;
  gap: 0.75em;
  margin: 2em 0;
}

.${CLASS.envNotSet},
.${CLASS.root} pre {
  border-left: 0.25em solid var(--grey);
  padding-left: 0.5em;
}

.${CLASS.root} pre {
  margin: 0;
  white-space: pre-wrap;
}

.${CLASS.expandedUiContainer} {
  padding: 1em;
  padding-top: 0.75em;
  display: grid;
  gap: 0.75em;
  outline: none;
  contain: paint;
}

.${CLASS.rootBottomHalf} .${CLASS.expandedUiContainer} {
  padding-bottom: 0.75em;
}

.${CLASS.expandedUiContainer}:is(.length0, .length1) {
  grid-template-columns: min-content;
}

.${CLASS.expandedUiContainer} > dl {
  justify-self: start;
}

.${CLASS.expandedUiContainer} label {
  display: grid;
  grid-template-columns: min-content auto;
  align-items: center;
  gap: 0.25em;
}

.${CLASS.expandedUiContainer} label.Disabled {
  color: var(--grey);
}

.${CLASS.expandedUiContainer} label > small {
  grid-column: 2;
}

.${CLASS.compilationModeWithIcon} {
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.${CLASS.browserUiPositionChooser} {
  position: absolute;
  display: grid;
  grid-template-columns: min-content min-content;
  pointer-events: none;
}

.${CLASS.browserUiPositionButton} {
  appearance: none;
  padding: 0;
  border: none;
  background: none;
  border-radius: none;
  pointer-events: auto;
  width: 1em;
  height: 1em;
  text-align: center;
  line-height: 1em;
}

.${CLASS.browserUiPositionButton}:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

.${CLASS.targetRoot}:not(:first-child) .${CLASS.browserUiPositionChooser} {
  display: none;
}

.${CLASS.shortStatusContainer} {
  line-height: 1;
  padding: 0.25em;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.25em;
}

[data-flash]::before {
  content: "";
  position: absolute;
  margin-top: 0.5em;
  margin-left: 0.5em;
  --size: min(500px, 100vmin);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  animation: flash 0.7s 0.05s ease-out both;
  pointer-events: none;
}

[data-flash="error"]::before {
  background-color: #eb0000;
}

[data-flash="success"]::before {
  background-color: #00b600;
}

@keyframes flash {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.9;
  }

  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes nudge {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-flash]::before {
    transform: translate(-50%, -50%);
    width: 2em;
    height: 2em;
    animation: nudge 0.25s ease-in-out 4 alternate forwards;
  }
}

.${CLASS.chevronButton} {
  appearance: none;
  border: none;
  border-radius: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}
`;
  function view(dispatch, passedModel, info) {
    const model = __ELM_WATCH.MOCKED_TIMINGS ? {
      ...passedModel,
      status: {
        ...passedModel.status,
        date: new Date("2022-02-05T13:10:05Z")
      }
    } : passedModel;
    const statusData = {
      ...statusIconAndText(model, info),
      ...viewStatus(dispatch, model, info)
    };
    return h(
      HTMLDivElement,
      { className: CLASS.container },
      model.uiExpanded ? viewExpandedUi(
        model.status,
        statusData,
        info,
        model.browserUiPosition,
        dispatch
      ) : void 0,
      h(
        HTMLDivElement,
        {
          className: CLASS.shortStatusContainer,
          onclick: () => {
            dispatch({ tag: "PressedChevron" });
          }
        },
        h(
          HTMLButtonElement,
          {
            className: CLASS.chevronButton,
            attrs: { "aria-expanded": model.uiExpanded.toString() }
          },
          icon(
            model.uiExpanded ? CHEVRON_UP : CHEVRON_DOWN,
            model.uiExpanded ? "Collapse elm-watch" : "Expand elm-watch"
          )
        ),
        compilationModeIcon(model.compilationMode),
        icon(statusData.icon, statusData.status, {
          className: CLASS.flash,
          onanimationend: (event) => {
            if (event.currentTarget instanceof HTMLElement) {
              event.currentTarget.removeAttribute("data-flash");
            }
          }
        }),
        h(
          HTMLTimeElement,
          { dateTime: model.status.date.toISOString() },
          formatTime(model.status.date)
        ),
        h(HTMLSpanElement, { className: CLASS.targetName }, TARGET_NAME)
      )
    );
  }
  function icon(emoji, alt, props) {
    return h(
      HTMLSpanElement,
      { attrs: { "aria-label": alt }, ...props },
      h(HTMLSpanElement, { attrs: { "aria-hidden": "true" } }, emoji)
    );
  }
  function viewExpandedUi(status, statusData, info, browserUiPosition, dispatch) {
    const items = [
      ["target", info.targetName],
      ["elm-watch", info.version],
      ["web socket", printWebSocketUrl(info.webSocketUrl)],
      [
        "updated",
        h(
          HTMLTimeElement,
          {
            dateTime: status.date.toISOString(),
            attrs: { "data-format": "2044-04-30 04:44:44" }
          },
          `${formatDate(status.date)} ${formatTime(status.date)}`
        )
      ],
      ["status", statusData.status],
      ...statusData.dl
    ];
    const browserUiPositionSendKey = statusToSpecialCaseSendKey(status);
    return h(
      HTMLDivElement,
      {
        className: `${CLASS.expandedUiContainer} length${statusData.content.length}`,
        attrs: {
          tabindex: "-1"
        }
      },
      h(
        HTMLDListElement,
        {},
        ...items.flatMap(([key, value]) => [
          h(HTMLElement, { localName: "dt" }, key),
          h(HTMLElement, { localName: "dd" }, value)
        ])
      ),
      ...statusData.content,
      browserUiPositionSendKey === void 0 ? void 0 : viewBrowserUiPositionChooser(
        browserUiPosition,
        dispatch,
        browserUiPositionSendKey
      )
    );
  }
  var allBrowserUiPositionsInOrder = [
    "TopLeft",
    "TopRight",
    "BottomLeft",
    "BottomRight"
  ];
  function viewBrowserUiPositionChooser(currentPosition, dispatch, sendKey) {
    const arrows = getBrowserUiPositionArrows(currentPosition);
    return h(
      HTMLDivElement,
      {
        className: CLASS.browserUiPositionChooser,
        style: browserUiPositionToCssForChooser(currentPosition)
      },
      ...allBrowserUiPositionsInOrder.map((position) => {
        const arrow = arrows[position];
        return arrow === void 0 ? h(HTMLDivElement, { style: { visibility: "hidden" } }, "\xB7") : h(
          HTMLButtonElement,
          {
            className: CLASS.browserUiPositionButton,
            attrs: { "data-position": position },
            onclick: () => {
              dispatch({
                tag: "ChangedBrowserUiPosition",
                browserUiPosition: position,
                sendKey
              });
            }
          },
          arrow
        );
      })
    );
  }
  var ARROW_UP = "\u2191";
  var ARROW_DOWN = "\u2193";
  var ARROW_LEFT = "\u2190";
  var ARROW_RIGHT = "\u2192";
  var ARROW_UP_LEFT = "\u2196";
  var ARROW_UP_RIGHT = "\u2197";
  var ARROW_DOWN_LEFT = "\u2199";
  var ARROW_DOWN_RIGHT = "\u2198";
  function getBrowserUiPositionArrows(browserUiPosition) {
    switch (browserUiPosition) {
      case "TopLeft":
        return {
          TopLeft: void 0,
          TopRight: ARROW_RIGHT,
          BottomLeft: ARROW_DOWN,
          BottomRight: ARROW_DOWN_RIGHT
        };
      case "TopRight":
        return {
          TopLeft: ARROW_LEFT,
          TopRight: void 0,
          BottomLeft: ARROW_DOWN_LEFT,
          BottomRight: ARROW_DOWN
        };
      case "BottomLeft":
        return {
          TopLeft: ARROW_UP,
          TopRight: ARROW_UP_RIGHT,
          BottomLeft: void 0,
          BottomRight: ARROW_RIGHT
        };
      case "BottomRight":
        return {
          TopLeft: ARROW_UP_LEFT,
          TopRight: ARROW_UP,
          BottomLeft: ARROW_LEFT,
          BottomRight: void 0
        };
    }
  }
  function statusIconAndText(model, info) {
    switch (model.status.tag) {
      case "Busy":
        return {
          icon: "\u23F3",
          status: "Waiting for compilation"
        };
      case "CompileError":
        return {
          icon: "\u{1F6A8}",
          status: "Compilation error"
        };
      case "Connecting":
        return {
          icon: "\u{1F50C}",
          status: "Connecting"
        };
      case "ElmJsonError":
        return {
          icon: "\u{1F6A8}",
          status: "elm.json or inputs error"
        };
      case "EvalError":
        return {
          icon: "\u26D4\uFE0F",
          status: "Eval error"
        };
      case "Idle":
        return {
          icon: idleIcon(info.initializedElmAppsStatus),
          status: "Successfully compiled"
        };
      case "SleepingBeforeReconnect":
        return {
          icon: "\u{1F50C}",
          status: "Sleeping"
        };
      case "UnexpectedError":
        return {
          icon: "\u274C",
          status: "Unexpected error"
        };
      case "WaitingForReload":
        return model.elmCompiledTimestamp === model.elmCompiledTimestampBeforeReload ? {
          icon: "\u274C",
          status: "Reload trouble"
        } : {
          icon: "\u23F3",
          status: "Waiting for reload"
        };
    }
  }
  function viewStatus(dispatch, model, info) {
    const { status, compilationMode } = model;
    switch (status.tag) {
      case "Busy":
        return {
          dl: [],
          content: [
            ...viewCompilationModeChooser({
              dispatch,
              sendKey: void 0,
              compilationMode,
              warnAboutCompilationModeMismatch: false,
              info
            }),
            ...status.errorOverlay === void 0 ? [] : [viewErrorOverlayToggleButton(dispatch, status.errorOverlay)]
          ]
        };
      case "CompileError":
        return {
          dl: [],
          content: [
            ...viewCompilationModeChooser({
              dispatch,
              sendKey: status.sendKey,
              compilationMode,
              warnAboutCompilationModeMismatch: true,
              info
            }),
            viewErrorOverlayToggleButton(dispatch, status.errorOverlay),
            ...status.openEditorError === void 0 ? [] : viewOpenEditorError(status.openEditorError)
          ]
        };
      case "Connecting":
        return {
          dl: [
            ["attempt", status.attemptNumber.toString()],
            ["sleep", printRetryWaitMs(status.attemptNumber)]
          ],
          content: [
            ...viewHttpsInfo(info.webSocketUrl),
            h(HTMLButtonElement, { disabled: true }, "Connecting web socket\u2026")
          ]
        };
      case "ElmJsonError":
        return {
          dl: [],
          content: [
            h(HTMLPreElement, { style: { minWidth: "80ch" } }, status.error)
          ]
        };
      case "EvalError":
        return {
          dl: [],
          content: [
            h(
              HTMLParagraphElement,
              {},
              "Check the console in the browser developer tools to see errors!"
            )
          ]
        };
      case "Idle":
        return {
          dl: [],
          content: viewCompilationModeChooser({
            dispatch,
            sendKey: status.sendKey,
            compilationMode,
            warnAboutCompilationModeMismatch: true,
            info
          })
        };
      case "SleepingBeforeReconnect":
        return {
          dl: [
            ["attempt", status.attemptNumber.toString()],
            ["sleep", printRetryWaitMs(status.attemptNumber)]
          ],
          content: [
            ...viewHttpsInfo(info.webSocketUrl),
            h(
              HTMLButtonElement,
              {
                onclick: () => {
                  dispatch({ tag: "PressedReconnectNow" });
                }
              },
              "Reconnect web socket now"
            )
          ]
        };
      case "UnexpectedError":
        return {
          dl: [],
          content: [
            h(
              HTMLParagraphElement,
              {},
              "I ran into an unexpected error! This is the error message:"
            ),
            h(HTMLPreElement, {}, status.message)
          ]
        };
      case "WaitingForReload":
        return {
          dl: [],
          content: model.elmCompiledTimestamp === model.elmCompiledTimestampBeforeReload ? [
            "A while ago I reloaded the page to get new compiled JavaScript.",
            "But it looks like after the last page reload I got the same JavaScript as before, instead of new stuff!",
            `The old JavaScript was compiled ${new Date(
              model.elmCompiledTimestamp
            ).toLocaleString()}, and so was the JavaScript currently running.`,
            "I currently need to reload the page again, but fear a reload loop if I try.",
            "Do you have accidental HTTP caching enabled maybe?",
            "Try hard refreshing the page and see if that helps, and consider disabling HTTP caching during development."
          ].map((text) => h(HTMLParagraphElement, {}, text)) : [h(HTMLParagraphElement, {}, "Waiting for other targets\u2026")]
        };
    }
  }
  function viewErrorOverlayToggleButton(dispatch, errorOverlay) {
    return h(
      HTMLButtonElement,
      {
        attrs: {
          "data-test-id": errorOverlay.openErrorOverlay ? "HideErrorOverlayButton" : "ShowErrorOverlayButton"
        },
        onclick: () => {
          dispatch({
            tag: "ChangedOpenErrorOverlay",
            openErrorOverlay: !errorOverlay.openErrorOverlay
          });
        }
      },
      errorOverlay.openErrorOverlay ? "Hide errors" : "Show errors"
    );
  }
  function viewOpenEditorError(error) {
    switch (error.tag) {
      case "EnvNotSet":
        return [
          h(
            HTMLDivElement,
            { className: CLASS.envNotSet },
            h(
              HTMLParagraphElement,
              {},
              "\u2139\uFE0F Clicking error locations only works if you set it up."
            ),
            h(
              HTMLParagraphElement,
              {},
              "Check this out: ",
              h(
                HTMLAnchorElement,
                {
                  href: "https://lydell.github.io/elm-watch/browser-ui/#clickable-error-locations",
                  target: "_blank",
                  rel: "noreferrer"
                },
                h(
                  HTMLElement,
                  { localName: "strong" },
                  "Clickable error locations"
                )
              )
            )
          )
        ];
      case "CommandFailed":
        return [
          h(
            HTMLParagraphElement,
            {},
            h(
              HTMLElement,
              { localName: "strong" },
              "Opening the location in your editor failed!"
            )
          ),
          h(HTMLPreElement, {}, error.message)
        ];
    }
  }
  function idleIcon(status) {
    switch (status.tag) {
      case "DecodeError":
      case "MissingWindowElm":
        return "\u274C";
      case "NoProgramsAtAll":
        return "\u2753";
      case "DebuggerModeStatus":
        return "\u2705";
    }
  }
  function compilationModeIcon(compilationMode) {
    switch (compilationMode) {
      case "proxy":
        return void 0;
      case "debug":
        return icon("\u{1F41B}", "Debug mode", { className: CLASS.debugModeIcon });
      case "standard":
        return void 0;
      case "optimize":
        return icon("\u{1F680}", "Optimize mode");
    }
  }
  function printWebSocketUrl(url) {
    const hostname = url.hostname.endsWith(".localhost") ? "localhost" : url.hostname;
    return `${url.protocol}//${hostname}:${url.port}${url.pathname}`;
  }
  function viewHttpsInfo(webSocketUrl) {
    return webSocketUrl.protocol === "wss:" ? [
      h(
        HTMLParagraphElement,
        {},
        h(HTMLElement, { localName: "strong" }, "Having trouble connecting?")
      ),
      h(HTMLParagraphElement, {}, "Setting up HTTPS can be a bit tricky."),
      h(
        HTMLParagraphElement,
        {},
        "Read all about ",
        h(
          HTMLAnchorElement,
          {
            href: "https://lydell.github.io/elm-watch/https/",
            target: "_blank",
            rel: "noreferrer"
          },
          "HTTPS with elm-watch"
        ),
        "."
      )
    ] : [];
  }
  var noDebuggerYetReason = "The Elm debugger isn't available at this point.";
  function noDebuggerReason(noDebuggerProgramTypes) {
    return `The Elm debugger isn't supported by ${humanList(
      Array.from(noDebuggerProgramTypes, (programType) => `\`${programType}\``),
      "and"
    )} programs.`;
  }
  function humanList(list, joinWord) {
    const { length } = list;
    return length <= 1 ? list.join("") : length === 2 ? list.join(` ${joinWord} `) : `${list.slice(0, length - 2).join(", ")}, ${list.slice(-2).join(` ${joinWord} `)}`;
  }
  function viewCompilationModeChooser({
    dispatch,
    sendKey,
    compilationMode: selectedMode,
    warnAboutCompilationModeMismatch,
    info
  }) {
    switch (info.initializedElmAppsStatus.tag) {
      case "DecodeError":
        return [
          h(
            HTMLParagraphElement,
            {},
            "window.Elm does not look like expected! This is the error message:"
          ),
          h(HTMLPreElement, {}, info.initializedElmAppsStatus.message)
        ];
      case "MissingWindowElm":
        return [
          h(
            HTMLParagraphElement,
            {},
            "elm-watch requires ",
            h(
              HTMLAnchorElement,
              {
                href: "https://lydell.github.io/elm-watch/window.Elm/",
                target: "_blank",
                rel: "noreferrer"
              },
              "window.Elm"
            ),
            " to exist, but it is undefined!"
          )
        ];
      case "NoProgramsAtAll":
        return [
          h(
            HTMLParagraphElement,
            {},
            "It looks like no Elm apps were initialized by elm-watch. Check the console in the browser developer tools to see potential errors!"
          )
        ];
      case "DebuggerModeStatus": {
        const compilationModes = [
          {
            mode: "debug",
            name: "Debug",
            status: info.initializedElmAppsStatus.status
          },
          { mode: "standard", name: "Standard", status: { tag: "Enabled" } },
          { mode: "optimize", name: "Optimize", status: { tag: "Enabled" } }
        ];
        return [
          h(
            HTMLFieldSetElement,
            { disabled: sendKey === void 0 },
            h(HTMLLegendElement, {}, "Compilation mode"),
            ...compilationModes.map(({ mode, name, status }) => {
              const nameWithIcon = h(
                HTMLSpanElement,
                { className: CLASS.compilationModeWithIcon },
                name,
                mode === selectedMode ? compilationModeIcon(mode) : void 0
              );
              return h(
                HTMLLabelElement,
                { className: status.tag },
                h(HTMLInputElement, {
                  type: "radio",
                  name: `CompilationMode-${info.targetName}`,
                  value: mode,
                  checked: mode === selectedMode,
                  disabled: sendKey === void 0 || status.tag === "Disabled",
                  onchange: sendKey === void 0 ? void 0 : () => {
                    dispatch({
                      tag: "ChangedCompilationMode",
                      compilationMode: mode,
                      sendKey
                    });
                  }
                }),
                ...status.tag === "Enabled" ? [
                  nameWithIcon,
                  warnAboutCompilationModeMismatch && mode === selectedMode && selectedMode !== info.originalCompilationMode && info.originalCompilationMode !== "proxy" ? h(
                    HTMLElement,
                    { localName: "small" },
                    `Note: The code currently running is in ${ORIGINAL_COMPILATION_MODE} mode.`
                  ) : void 0
                ] : [
                  nameWithIcon,
                  h(HTMLElement, { localName: "small" }, status.reason)
                ]
              );
            })
          )
        ];
      }
    }
  }
  var DATA_TARGET_NAMES = "data-target-names";
  function updateErrorOverlay(targetName, dispatch, sendKey, errors, overlay, overlayCloseButton) {
    const existingErrorElements = new Map(
      Array.from(overlay.children, (element) => [
        element.id,
        {
          targetNames: new Set(
            (element.getAttribute(DATA_TARGET_NAMES) ?? "").split("\n")
          ),
          element
        }
      ])
    );
    for (const [id, { targetNames, element }] of existingErrorElements) {
      if (targetNames.has(targetName) && !errors.has(id)) {
        targetNames.delete(targetName);
        if (targetNames.size === 0) {
          element.remove();
        } else {
          element.setAttribute(DATA_TARGET_NAMES, [...targetNames].join("\n"));
        }
      }
    }
    let previousElement = void 0;
    for (const [id, error] of errors) {
      const maybeExisting = existingErrorElements.get(id);
      if (maybeExisting === void 0) {
        const element = viewOverlayError(
          targetName,
          dispatch,
          sendKey,
          id,
          error
        );
        if (previousElement === void 0) {
          overlay.prepend(element);
        } else {
          previousElement.after(element);
        }
        overlay.style.backgroundColor = error.backgroundColor;
        overlayCloseButton.style.setProperty(
          "--foregroundColor",
          error.foregroundColor
        );
        overlayCloseButton.style.setProperty(
          "--backgroundColor",
          error.backgroundColor
        );
        previousElement = element;
      } else {
        if (!maybeExisting.targetNames.has(targetName)) {
          maybeExisting.element.setAttribute(
            DATA_TARGET_NAMES,
            [...maybeExisting.targetNames, targetName].join("\n")
          );
        }
        previousElement = maybeExisting.element;
      }
    }
    const hidden = !overlay.hasChildNodes();
    overlay.hidden = hidden;
    overlayCloseButton.hidden = hidden;
    overlayCloseButton.style.right = `${overlay.offsetWidth - overlay.clientWidth}px`;
  }
  function viewOverlayError(targetName, dispatch, sendKey, id, error) {
    return h(
      HTMLDetailsElement,
      {
        open: true,
        id,
        style: {
          backgroundColor: error.backgroundColor,
          color: error.foregroundColor
        },
        attrs: {
          [DATA_TARGET_NAMES]: targetName
        }
      },
      h(
        HTMLElement,
        { localName: "summary" },
        h(
          HTMLSpanElement,
          {
            className: CLASS.errorTitle,
            style: {
              backgroundColor: error.backgroundColor
            }
          },
          error.title
        ),
        error.location === void 0 ? void 0 : h(
          HTMLParagraphElement,
          {},
          viewErrorLocation(dispatch, sendKey, error.location)
        )
      ),
      h(HTMLPreElement, { innerHTML: error.htmlContent })
    );
  }
  function viewErrorLocation(dispatch, sendKey, location) {
    switch (location.tag) {
      case "FileOnly":
        return viewErrorLocationButton(
          dispatch,
          sendKey,
          {
            file: location.file,
            line: 1,
            column: 1
          },
          location.file.absolutePath
        );
      case "FileWithLineAndColumn": {
        return viewErrorLocationButton(
          dispatch,
          sendKey,
          location,
          `${location.file.absolutePath}:${location.line}:${location.column}`
        );
      }
      case "Target":
        return `Target: ${location.targetName}`;
    }
  }
  function viewErrorLocationButton(dispatch, sendKey, location, text) {
    return sendKey === void 0 ? text : h(
      HTMLButtonElement,
      {
        className: CLASS.errorLocationButton,
        onclick: () => {
          dispatch({
            tag: "PressedOpenEditor",
            file: location.file,
            line: location.line,
            column: location.column,
            sendKey
          });
        }
      },
      text
    );
  }
  if (typeof WebSocket !== "undefined") {
    run();
  }
})();
(function(scope){
'use strict';

var _Platform_effectManagers = {}, _Scheduler_enqueue; // added by elm-watch

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.1/optimize for better performance and smaller assets.');


var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log_UNUSED = F2(function(tag, value)
{
	return value;
});

var _Debug_log = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString_UNUSED(value)
{
	return '<internals>';
}

function _Debug_toString(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash_UNUSED(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.start.line === region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'on lines ' + region.start.line + ' through ' + region.end.line;
}



// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**_UNUSED/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**_UNUSED/
	if (typeof x.$ === 'undefined')
	//*/
	/**/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0_UNUSED = 0;
var _Utils_Tuple0 = { $: '#0' };

function _Utils_Tuple2_UNUSED(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3_UNUSED(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr_UNUSED(c) { return c; }
function _Utils_chr(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil_UNUSED = { $: 0 };
var _List_Nil = { $: '[]' };

function _List_Cons_UNUSED(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap(value) { return { $: 0, a: value }; }
function _Json_unwrap(value) { return value.a; }

function _Json_wrap_UNUSED(value) { return value; }
function _Json_unwrap_UNUSED(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

// This function was slightly modified by elm-watch.
function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		// c: null // commented out by elm-watch
		c: Function.prototype // added by elm-watch
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			// }); // commented out by elm-watch
			}) || Function.prototype; // added by elm-watch
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


// This function was slightly modified by elm-watch.
var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		"Platform.worker", // added by elm-watch
		false, // isDebug, added by elm-watch
		debugMetadata, // added by elm-watch
		flagDecoder,
		args,
		impl.init,
		// impl.update, // commented out by elm-watch
		// impl.subscriptions, // commented out by elm-watch
		impl, // added by elm-watch
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


// This whole function was changed by elm-watch.
function _Platform_initialize(programType, isDebug, debugMetadata, flagDecoder, args, init, impl, stepperBuilder)
{
	if (args === "__elmWatchReturnData") {
		return { impl: impl, debugMetadata: debugMetadata, flagDecoder : flagDecoder, programType: programType };
	}

	var flags = _Json_wrap(args ? args['flags'] : undefined);
	var flagResult = A2(_Json_run, flagDecoder, flags);
	$elm$core$Result$isOk(flagResult) || _Debug_crash(2 /**/, _Json_errorToString(flagResult.a) /**/);
	var managers = {};
	var initUrl = programType === "Browser.application" ? _Browser_getUrl() : undefined;
	globalThis.__ELM_WATCH.INIT_URL = initUrl;
	var initPair = init(flagResult.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);
	var update;
	var subscriptions;

	function setUpdateAndSubscriptions() {
		update = impl.update || impl._impl.update;
		subscriptions = impl.subscriptions || impl._impl.subscriptions;
		if (isDebug) {
			update = $elm$browser$Debugger$Main$wrapUpdate(update);
			subscriptions = $elm$browser$Debugger$Main$wrapSubs(subscriptions);
		}
	}

	function sendToApp(msg, viewMetadata) {
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	setUpdateAndSubscriptions();
	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	function __elmWatchHotReload(newData, new_Platform_effectManagers, new_Scheduler_enqueue, moduleName) {
		_Platform_enqueueEffects(managers, _Platform_batch(_List_Nil), _Platform_batch(_List_Nil));
		_Scheduler_enqueue = new_Scheduler_enqueue;

		var reloadReasons = [];

		for (var key in new_Platform_effectManagers) {
			var manager = new_Platform_effectManagers[key];
			if (!(key in _Platform_effectManagers)) {
				_Platform_effectManagers[key] = manager;
				managers[key] = _Platform_instantiateManager(manager, sendToApp);
				if (manager.a) {
					reloadReasons.push("a new port '" + key + "' was added. The idea is to give JavaScript code a chance to set it up!");
					manager.a(key, sendToApp)
				}
			}
		}

		for (var key in newData.impl) {
			if (key === "_impl" && impl._impl) {
				for (var subKey in newData.impl[key]) {
					impl._impl[subKey] = newData.impl[key][subKey];
				}
			} else {
				impl[key] = newData.impl[key];
			}
		}

		var newFlagResult = A2(_Json_run, newData.flagDecoder, flags);
		if (!$elm$core$Result$isOk(newFlagResult)) {
			return reloadReasons.concat("the flags type in `" + moduleName + "` changed and now the passed flags aren't correct anymore. The idea is to try to run with new flags!\nThis is the error:\n" + _Json_errorToString(newFlagResult.a));
		}
		if (!_Utils_eq_elmWatchInternal(debugMetadata, newData.debugMetadata)) {
			return reloadReasons.concat("the message type in `" + moduleName + '` changed in debug mode ("debug metadata" changed).');
		}
		init = impl.init || impl._impl.init;
		if (isDebug) {
			init = A3($elm$browser$Debugger$Main$wrapInit, _Json_wrap(newData.debugMetadata), initPair.a.popout, init);
		}
		globalThis.__ELM_WATCH.INIT_URL = initUrl;
		var newInitPair = init(newFlagResult.a);
		if (!_Utils_eq_elmWatchInternal(initPair, newInitPair)) {
			return reloadReasons.concat("`" + moduleName + ".init` returned something different than last time. Let's start fresh!");
		}

		setUpdateAndSubscriptions();
		stepper(model, true /* isSync */);
		_Platform_enqueueEffects(managers, _Platform_batch(_List_Nil), subscriptions(model));
		return reloadReasons;
	}

	return Object.defineProperties(
		ports ? { ports: ports } : {},
		{
			__elmWatchHotReload: { value: __elmWatchHotReload },
			__elmWatchProgramType: { value: programType },
		}
	);
}

// This whole function was added by elm-watch.
// Copy-paste of _Utils_eq but does not assume that x and y have the same type,
// and considers functions to always be equal.
function _Utils_eq_elmWatchInternal(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp_elmWatchInternal(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp_elmWatchInternal(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

// This whole function was added by elm-watch.
function _Utils_eqHelp_elmWatchInternal(x, y, depth, stack)
{
	if (x === y) {
		return true;
	}

	var xType = _Utils_typeof_elmWatchInternal(x);
	var yType = _Utils_typeof_elmWatchInternal(y);

	if (xType !== yType) {
		return false;
	}

	switch (xType) {
		case "primitive":
			return false;
		case "function":
			return true;
	}

	if (x.$ !== y.$) {
		return false;
	}

	if (x.$ === 'Set_elm_builtin') {
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	} else if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin' || x.$ < 0) {
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}

	if (Object.keys(x).length !== Object.keys(y).length) {
		return false;
	}

	if (depth > 100) {
		stack.push(_Utils_Tuple2(x, y));
		return true;
	}

	for (var key in x) {
		if (!_Utils_eqHelp_elmWatchInternal(x[key], y[key], depth + 1, stack)) {
			return false;
		}
	}
	return true;
}

// This whole function was added by elm-watch.
function _Utils_typeof_elmWatchInternal(x)
{
	var type = typeof x;
	return type === "function"
		? "function"
		: type !== "object" || type === null
		? "primitive"
		: "objectOrArray";
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


// This whole function was changed by elm-watch.
function _Platform_export(exports)
{
	var reloadReasons = _Platform_mergeExportsElmWatch('Elm', scope['Elm'] || (scope['Elm'] = {}), exports);
	if (reloadReasons.length > 0) {
		throw new Error(["ELM_WATCH_RELOAD_NEEDED"].concat(Array.from(new Set(reloadReasons))).join("\n\n---\n\n"));
	}
}

// This whole function was added by elm-watch.
function _Platform_mergeExportsElmWatch(moduleName, obj, exports)
{
	var reloadReasons = [];
	for (var name in exports) {
		if (name === "init") {
			if ("init" in obj) {
				if ("__elmWatchApps" in obj) {
					var data = exports.init("__elmWatchReturnData");
					for (var index = 0; index < obj.__elmWatchApps.length; index++) {
						var app = obj.__elmWatchApps[index];
						if (app.__elmWatchProgramType !== data.programType) {
							reloadReasons.push("`" + moduleName + ".main` changed from `" + app.__elmWatchProgramType + "` to `" + data.programType + "`.");
						} else {
							try {
								var innerReasons = app.__elmWatchHotReload(data, _Platform_effectManagers, _Scheduler_enqueue, moduleName);
								reloadReasons = reloadReasons.concat(innerReasons);
							} catch (error) {
								reloadReasons.push("hot reload for `" + moduleName + "` failed, probably because of incompatible model changes.\nThis is the error:\n" + error + "\n" + (error ? error.stack : ""));
							}
						}
					}
				} else {
					throw new Error("elm-watch: I'm trying to create `" + moduleName + ".init`, but it already exists and wasn't created by elm-watch. Maybe a duplicate script is getting loaded accidentally?");
				}
			} else {
				obj.__elmWatchApps = [];
				obj.init = function() {
					var app = exports.init.apply(exports, arguments);
					obj.__elmWatchApps.push(app);
					globalThis.__ELM_WATCH.ON_INIT();
					return app;
				};
			}
		} else {
			var innerReasons = _Platform_mergeExportsElmWatch(moduleName + "." + name, obj[name] || (obj[name] = {}), exports[name]);
			reloadReasons = reloadReasons.concat(innerReasons);
		}
	}
	return reloadReasons;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

// This whole function was changed by elm-watch.
var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	var programType = "Html";

	if (args === "__elmWatchReturnData") {
		return { virtualNode: virtualNode, programType: programType };
	}

	/**_UNUSED/ // always UNUSED with elm-watch
	var node = args['node'];
	//*/
	/**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	var nextNode = _VirtualDom_render(virtualNode, function() {});
	node.parentNode.replaceChild(nextNode, node);
	node = nextNode;
	var sendToApp = function() {};

	function __elmWatchHotReload(newData) {
		var patches = _VirtualDom_diff(virtualNode, newData.virtualNode);
		node = _VirtualDom_applyPatches(node, virtualNode, patches, sendToApp);
		virtualNode = newData.virtualNode;
		return [];
	}

	return Object.defineProperties(
		{},
		{
			__elmWatchHotReload: { value: __elmWatchHotReload },
			__elmWatchProgramType: { value: programType },
		}
	);
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		message: func(record.message),
		stopPropagation: record.stopPropagation,
		preventDefault: record.preventDefault
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.message;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.stopPropagation;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.preventDefault) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

// This function was slightly modified by elm-watch.
var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		impl._impl ? "Browser.sandbox" : "Browser.element", // added by elm-watch
		false, // isDebug, added by elm-watch
		debugMetadata, // added by elm-watch
		flagDecoder,
		args,
		impl.init,
		// impl.update, // commented out by elm-watch
		// impl.subscriptions, // commented out by elm-watch
		impl, // added by elm-watch
		function(sendToApp, initialModel) {
			// var view = impl.view; // commented out by elm-watch
			/**_UNUSED/ // always UNUSED with elm-watch
			var domNode = args['node'];
			//*/
			/**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				// var nextNode = view(model); // commented out by elm-watch
				var nextNode = impl.view(model); // added by elm-watch
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

// This function was slightly modified by elm-watch.
var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		impl._impl ? "Browser.application" : "Browser.document", // added by elm-watch
		false, // isDebug, added by elm-watch
		debugMetadata, // added by elm-watch
		flagDecoder,
		args,
		impl.init,
		// impl.update, // commented out by elm-watch
		// impl.subscriptions, // commented out by elm-watch
		impl, // added by elm-watch
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.setup && impl.setup(sendToApp)
			// var view = impl.view; // commented out by elm-watch
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				// var doc = view(model); // commented out by elm-watch
				var doc = impl.view(model); // added by elm-watch
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.body);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.title) && (_VirtualDom_doc.title = title = doc.title);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


// This function was slightly modified by elm-watch.
function _Browser_application(impl)
{
	// var onUrlChange = impl.onUrlChange; // commented out by elm-watch
	// var onUrlRequest = impl.onUrlRequest; // commented out by elm-watch
	// var key = function() { key.a(onUrlChange(_Browser_getUrl())); }; // commented out by elm-watch
	var key = function() { key.a(impl.onUrlChange(_Browser_getUrl())); }; // added by elm-watch

	return _Browser_document({
		setup: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(impl.onUrlRequest(
						(next
							&& curr.protocol === next.protocol
							&& curr.host === next.host
							&& curr.port_.a === next.port_.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		init: function(flags)
		{
			// return A3(impl.init, flags, _Browser_getUrl(), key); // commented out by elm-watch
			return A3(impl.init, flags, globalThis.__ELM_WATCH.INIT_URL, key); // added by elm-watch
		},
		// view: impl.view, // commented out by elm-watch
		// update: impl.update, // commented out by elm-watch
		// subscriptions: impl.subscriptions // commented out by elm-watch
		view: function(model) { return impl.view(model); }, // added by elm-watch
		_impl: impl // added by elm-watch
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { hidden: 'hidden', change: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { hidden: 'mozHidden', change: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { hidden: 'msHidden', change: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { hidden: 'webkitHidden', change: 'webkitvisibilitychange' }
		: { hidden: 'hidden', change: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		scene: _Browser_getScene(),
		viewport: {
			x: _Browser_window.pageXOffset,
			y: _Browser_window.pageYOffset,
			width: _Browser_doc.documentElement.clientWidth,
			height: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		width: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		height: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			scene: {
				width: node.scrollWidth,
				height: node.scrollHeight
			},
			viewport: {
				x: node.scrollLeft,
				y: node.scrollTop,
				width: node.clientWidth,
				height: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			scene: _Browser_getScene(),
			viewport: {
				x: x,
				y: y,
				width: _Browser_doc.documentElement.clientWidth,
				height: _Browser_doc.documentElement.clientHeight
			},
			element: {
				x: x + rect.left,
				y: y + rect.top,
				width: rect.width,
				height: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});
var $author$project$Main$OnUrlChange = function (a) {
	return {$: 'OnUrlChange', a: a};
};
var $author$project$Main$OnUrlRequest = function (a) {
	return {$: 'OnUrlRequest', a: a};
};
var $elm$core$List$cons = _List_cons;
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (node.$ === 'SubTree') {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0.a;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Basics$EQ = {$: 'EQ'};
var $elm$core$Basics$GT = {$: 'GT'};
var $elm$core$Basics$LT = {$: 'LT'};
var $elm$core$Result$Err = function (a) {
	return {$: 'Err', a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 'Failure', a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 'Index', a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 'Ok', a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 'OneOf', a: a};
};
var $elm$core$Basics$False = {$: 'False'};
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 'Just', a: a};
};
var $elm$core$Maybe$Nothing = {$: 'Nothing'};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 'Field':
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 'Nothing') {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'Index':
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'OneOf':
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 'Leaf', a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 'SubTree', a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.nodeListSize) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.tail);
		} else {
			var treeLen = builder.nodeListSize * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.nodeList) : builder.nodeList;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.nodeListSize);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.tail);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{nodeList: nodeList, nodeListSize: (len / $elm$core$Array$branchFactor) | 0, tail: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = {$: 'True'};
var $elm$core$Result$isOk = function (result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 'External', a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 'Internal', a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = function (a) {
	return {$: 'NotFound', a: a};
};
var $elm$url$Url$Http = {$: 'Http'};
var $elm$url$Url$Https = {$: 'Https'};
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {fragment: fragment, host: host, path: path, port_: port_, protocol: protocol, query: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 'Nothing') {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Http,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Https,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0.a;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = function (a) {
	return {$: 'Perform', a: a};
};
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(_Utils_Tuple0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0.a;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return _Utils_Tuple0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(_Utils_Tuple0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0.a;
		return $elm$core$Task$Perform(
			A2($elm$core$Task$map, tagger, task));
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			$elm$core$Task$Perform(
				A2($elm$core$Task$map, toMessage, task)));
	});
var $elm$browser$Browser$application = _Browser_application;
var $elm$json$Json$Decode$field = _Json_decodeField;
var $author$project$Main$En = {$: 'En'};
var $author$project$Main$Ja = {$: 'Ja'};
var $author$project$Counter$Counter = function (a) {
	return {$: 'Counter', a: a};
};
var $author$project$Counter$Elastic = {$: 'Elastic'};
var $author$project$Counter$Fixed = function (a) {
	return {$: 'Fixed', a: a};
};
var $author$project$Counter$elasticDefaultSpeed = 30;
var $author$project$Counter$calculateCachedStepSize = F2(
	function (speed, lengthNextValues) {
		if (speed.$ === 'Elastic') {
			return (lengthNextValues + 1) / $author$project$Counter$elasticDefaultSpeed;
		} else {
			var speed_ = speed.a;
			return speed_ / 60;
		}
	});
var $author$project$Counter$init = function () {
	var defaultSpeed = $author$project$Counter$Elastic;
	var defaultNextValues = _List_Nil;
	return $author$project$Counter$Counter(
		{
			animationPosition: 0,
			cachedStepSize: A2(
				$author$project$Counter$calculateCachedStepSize,
				defaultSpeed,
				$elm$core$List$length(defaultNextValues)),
			nextValues: defaultNextValues,
			pause: true,
			size: $author$project$Counter$Fixed(8),
			speed: defaultSpeed,
			value: 0
		});
}();
var $author$project$Playground$Game = F3(
	function (a, b, c) {
		return {$: 'Game', a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$Visible = {$: 'Visible'};
var $author$project$Playground$Mouse = F4(
	function (x, y, down, click) {
		return {click: click, down: down, x: x, y: y};
	});
var $author$project$Playground$Time = function (a) {
	return {$: 'Time', a: a};
};
var $elm$core$Set$Set_elm_builtin = function (a) {
	return {$: 'Set_elm_builtin', a: a};
};
var $elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Set$empty = $elm$core$Set$Set_elm_builtin($elm$core$Dict$empty);
var $author$project$Playground$emptyKeyboard = {backspace: false, down: false, enter: false, keys: $elm$core$Set$empty, left: false, right: false, shift: false, space: false, up: false};
var $elm$time$Time$Posix = function (a) {
	return {$: 'Posix', a: a};
};
var $elm$time$Time$millisToPosix = $elm$time$Time$Posix;
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $author$project$Playground$toScreen = F2(
	function (width, height) {
		return {bottom: (-height) / 2, height: height, left: (-width) / 2, right: width / 2, top: height / 2, width: width};
	});
var $author$project$Playground$initialComputer = function (_v0) {
	var x = _v0.a;
	var y = _v0.b;
	return {
		keyboard: $author$project$Playground$emptyKeyboard,
		mouse: A4($author$project$Playground$Mouse, 0, 0, false, false),
		screen: A2($author$project$Playground$toScreen, x, y),
		time: $author$project$Playground$Time(
			$elm$time$Time$millisToPosix(0))
	};
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Playground$initGame = F2(
	function (initialMemory, flags) {
		return _Utils_Tuple2(
			A3(
				$author$project$Playground$Game,
				$elm$browser$Browser$Events$Visible,
				initialMemory,
				$author$project$Playground$initialComputer(flags)),
			$elm$core$Platform$Cmd$none);
	});
var $author$project$FloatingTokyoCity$Day = {$: 'Day'};
var $author$project$FloatingTokyoCity$Playing = function (a) {
	return {$: 'Playing', a: a};
};
var $author$project$FloatingTokyoCity$initialMemory = {
	devMode: false,
	gameState: $author$project$FloatingTokyoCity$Playing(0),
	qrCode: false,
	timeOfDay: $author$project$FloatingTokyoCity$Day
};
var $author$project$FloatingTokyoCity$init = $author$project$Playground$initGame($author$project$FloatingTokyoCity$initialMemory);
var $mdgriffith$elm_ui$Internal$Model$Empty = {$: 'Empty'};
var $mdgriffith$elm_ui$Element$none = $mdgriffith$elm_ui$Internal$Model$Empty;
var $author$project$Main$Icon_QRCodeWithHole = {$: 'Icon_QRCodeWithHole'};
var $elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var $mdgriffith$elm_ui$Internal$Model$Unstyled = function (a) {
	return {$: 'Unstyled', a: a};
};
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $mdgriffith$elm_ui$Internal$Model$unstyled = A2($elm$core$Basics$composeL, $mdgriffith$elm_ui$Internal$Model$Unstyled, $elm$core$Basics$always);
var $mdgriffith$elm_ui$Element$html = $mdgriffith$elm_ui$Internal$Model$unstyled;
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$circle = $elm$svg$Svg$trustedNode('circle');
var $elm$svg$Svg$Attributes$clipRule = _VirtualDom_attribute('clip-rule');
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$svg$Svg$Attributes$cx = _VirtualDom_attribute('cx');
var $elm$svg$Svg$Attributes$cy = _VirtualDom_attribute('cy');
var $elm$svg$Svg$Attributes$d = _VirtualDom_attribute('d');
var $elm$svg$Svg$defs = $elm$svg$Svg$trustedNode('defs');
var $elm$svg$Svg$Attributes$fill = _VirtualDom_attribute('fill');
var $elm$svg$Svg$Attributes$fillRule = _VirtualDom_attribute('fill-rule');
var $elm$svg$Svg$Attributes$id = _VirtualDom_attribute('id');
var $elm$svg$Svg$path = $elm$svg$Svg$trustedNode('path');
var $author$project$Main$qrCodeDots = _List_fromArray(
	[
		_Utils_Tuple3(32, 32, 'a'),
		_Utils_Tuple3(32, 40, 'a'),
		_Utils_Tuple3(32, 48, 'a'),
		_Utils_Tuple3(32, 56, 'a'),
		_Utils_Tuple3(32, 64, 'a'),
		_Utils_Tuple3(32, 72, 'a'),
		_Utils_Tuple3(32, 80, 'a'),
		_Utils_Tuple3(32, 104, 'a'),
		_Utils_Tuple3(32, 120, 'a'),
		_Utils_Tuple3(32, 128, 'a'),
		_Utils_Tuple3(32, 176, 'a'),
		_Utils_Tuple3(32, 184, 'a'),
		_Utils_Tuple3(32, 208, 'a'),
		_Utils_Tuple3(32, 216, 'a'),
		_Utils_Tuple3(32, 224, 'a'),
		_Utils_Tuple3(32, 232, 'a'),
		_Utils_Tuple3(32, 240, 'a'),
		_Utils_Tuple3(32, 248, 'a'),
		_Utils_Tuple3(32, 256, 'a'),
		_Utils_Tuple3(40, 32, 'a'),
		_Utils_Tuple3(40, 80, 'a'),
		_Utils_Tuple3(40, 104, 'a'),
		_Utils_Tuple3(40, 120, 'a'),
		_Utils_Tuple3(40, 128, 'a'),
		_Utils_Tuple3(40, 136, 'a'),
		_Utils_Tuple3(40, 144, 'a'),
		_Utils_Tuple3(40, 160, 'a'),
		_Utils_Tuple3(40, 168, 'a'),
		_Utils_Tuple3(40, 176, 'a'),
		_Utils_Tuple3(40, 184, 'a'),
		_Utils_Tuple3(40, 208, 'a'),
		_Utils_Tuple3(40, 256, 'a'),
		_Utils_Tuple3(48, 32, 'a'),
		_Utils_Tuple3(48, 48, 'a'),
		_Utils_Tuple3(48, 56, 'a'),
		_Utils_Tuple3(48, 64, 'a'),
		_Utils_Tuple3(48, 80, 'a'),
		_Utils_Tuple3(48, 104, 'a'),
		_Utils_Tuple3(48, 112, 'a'),
		_Utils_Tuple3(48, 120, 'a'),
		_Utils_Tuple3(48, 136, 'a'),
		_Utils_Tuple3(48, 176, 'a'),
		_Utils_Tuple3(48, 184, 'a'),
		_Utils_Tuple3(48, 208, 'a'),
		_Utils_Tuple3(48, 224, 'a'),
		_Utils_Tuple3(48, 232, 'a'),
		_Utils_Tuple3(48, 240, 'a'),
		_Utils_Tuple3(48, 256, 'a'),
		_Utils_Tuple3(56, 32, 'a'),
		_Utils_Tuple3(56, 48, 'a'),
		_Utils_Tuple3(56, 56, 'a'),
		_Utils_Tuple3(56, 64, 'a'),
		_Utils_Tuple3(56, 80, 'a'),
		_Utils_Tuple3(56, 112, 'a'),
		_Utils_Tuple3(56, 120, 'a'),
		_Utils_Tuple3(56, 128, 'a'),
		_Utils_Tuple3(56, 136, 'a'),
		_Utils_Tuple3(56, 144, 'a'),
		_Utils_Tuple3(56, 152, 'a'),
		_Utils_Tuple3(56, 168, 'a'),
		_Utils_Tuple3(56, 176, 'a'),
		_Utils_Tuple3(56, 184, 'a'),
		_Utils_Tuple3(56, 208, 'a'),
		_Utils_Tuple3(56, 224, 'a'),
		_Utils_Tuple3(56, 232, 'a'),
		_Utils_Tuple3(56, 240, 'a'),
		_Utils_Tuple3(56, 256, 'a'),
		_Utils_Tuple3(64, 32, 'a'),
		_Utils_Tuple3(64, 48, 'a'),
		_Utils_Tuple3(64, 56, 'a'),
		_Utils_Tuple3(64, 64, 'a'),
		_Utils_Tuple3(64, 80, 'a'),
		_Utils_Tuple3(64, 96, 'a'),
		_Utils_Tuple3(64, 104, 'a'),
		_Utils_Tuple3(64, 120, 'a'),
		_Utils_Tuple3(64, 144, 'a'),
		_Utils_Tuple3(64, 168, 'a'),
		_Utils_Tuple3(64, 184, 'a'),
		_Utils_Tuple3(64, 192, 'a'),
		_Utils_Tuple3(64, 208, 'a'),
		_Utils_Tuple3(64, 224, 'a'),
		_Utils_Tuple3(64, 232, 'a'),
		_Utils_Tuple3(64, 240, 'a'),
		_Utils_Tuple3(64, 256, 'a'),
		_Utils_Tuple3(72, 32, 'a'),
		_Utils_Tuple3(72, 80, 'a'),
		_Utils_Tuple3(72, 96, 'a'),
		_Utils_Tuple3(72, 120, 'a'),
		_Utils_Tuple3(72, 128, 'a'),
		_Utils_Tuple3(72, 176, 'a'),
		_Utils_Tuple3(72, 184, 'a'),
		_Utils_Tuple3(72, 192, 'a'),
		_Utils_Tuple3(72, 208, 'a'),
		_Utils_Tuple3(72, 256, 'a'),
		_Utils_Tuple3(80, 32, 'a'),
		_Utils_Tuple3(80, 40, 'a'),
		_Utils_Tuple3(80, 48, 'a'),
		_Utils_Tuple3(80, 56, 'a'),
		_Utils_Tuple3(80, 64, 'a'),
		_Utils_Tuple3(80, 72, 'a'),
		_Utils_Tuple3(80, 80, 'a'),
		_Utils_Tuple3(80, 96, 'a'),
		_Utils_Tuple3(80, 112, 'a'),
		_Utils_Tuple3(80, 128, 'a'),
		_Utils_Tuple3(80, 144, 'a'),
		_Utils_Tuple3(80, 160, 'a'),
		_Utils_Tuple3(80, 176, 'a'),
		_Utils_Tuple3(80, 192, 'a'),
		_Utils_Tuple3(80, 208, 'a'),
		_Utils_Tuple3(80, 216, 'a'),
		_Utils_Tuple3(80, 224, 'a'),
		_Utils_Tuple3(80, 232, 'a'),
		_Utils_Tuple3(80, 240, 'a'),
		_Utils_Tuple3(80, 248, 'a'),
		_Utils_Tuple3(80, 256, 'a'),
		_Utils_Tuple3(88, 96, 'a'),
		_Utils_Tuple3(88, 120, 'a'),
		_Utils_Tuple3(88, 136, 'a'),
		_Utils_Tuple3(88, 144, 'a'),
		_Utils_Tuple3(88, 152, 'a'),
		_Utils_Tuple3(88, 160, 'a'),
		_Utils_Tuple3(88, 168, 'a'),
		_Utils_Tuple3(88, 192, 'a'),
		_Utils_Tuple3(96, 40, 'a'),
		_Utils_Tuple3(96, 72, 'a'),
		_Utils_Tuple3(96, 80, 'a'),
		_Utils_Tuple3(96, 88, 'a'),
		_Utils_Tuple3(96, 160, 'b'),
		_Utils_Tuple3(96, 200, 'a'),
		_Utils_Tuple3(96, 208, 'a'),
		_Utils_Tuple3(96, 216, 'a'),
		_Utils_Tuple3(96, 224, 'a'),
		_Utils_Tuple3(104, 32, 'a'),
		_Utils_Tuple3(104, 40, 'a'),
		_Utils_Tuple3(104, 48, 'a'),
		_Utils_Tuple3(104, 56, 'a'),
		_Utils_Tuple3(104, 64, 'a'),
		_Utils_Tuple3(104, 88, 'a'),
		_Utils_Tuple3(104, 96, 'a'),
		_Utils_Tuple3(104, 112, 'a'),
		_Utils_Tuple3(104, 120, 'a'),
		_Utils_Tuple3(104, 128, 'b'),
		_Utils_Tuple3(104, 136, 'b'),
		_Utils_Tuple3(104, 168, 'a'),
		_Utils_Tuple3(104, 176, 'a'),
		_Utils_Tuple3(104, 192, 'a'),
		_Utils_Tuple3(104, 200, 'a'),
		_Utils_Tuple3(104, 208, 'a'),
		_Utils_Tuple3(104, 240, 'a'),
		_Utils_Tuple3(104, 248, 'a'),
		_Utils_Tuple3(104, 256, 'a'),
		_Utils_Tuple3(112, 32, 'a'),
		_Utils_Tuple3(112, 48, 'a'),
		_Utils_Tuple3(112, 56, 'a'),
		_Utils_Tuple3(112, 80, 'a'),
		_Utils_Tuple3(112, 88, 'a'),
		_Utils_Tuple3(112, 96, 'a'),
		_Utils_Tuple3(112, 128, 'b'),
		_Utils_Tuple3(112, 160, 'b'),
		_Utils_Tuple3(112, 168, 'b'),
		_Utils_Tuple3(112, 184, 'a'),
		_Utils_Tuple3(112, 192, 'a'),
		_Utils_Tuple3(112, 200, 'a'),
		_Utils_Tuple3(112, 208, 'a'),
		_Utils_Tuple3(112, 224, 'a'),
		_Utils_Tuple3(112, 232, 'a'),
		_Utils_Tuple3(112, 248, 'a'),
		_Utils_Tuple3(120, 32, 'a'),
		_Utils_Tuple3(120, 48, 'a'),
		_Utils_Tuple3(120, 64, 'a'),
		_Utils_Tuple3(120, 104, 'a'),
		_Utils_Tuple3(120, 112, 'a'),
		_Utils_Tuple3(120, 120, 'b'),
		_Utils_Tuple3(120, 136, 'b'),
		_Utils_Tuple3(120, 144, 'b'),
		_Utils_Tuple3(120, 160, 'b'),
		_Utils_Tuple3(120, 168, 'b'),
		_Utils_Tuple3(120, 176, 'b'),
		_Utils_Tuple3(120, 184, 'a'),
		_Utils_Tuple3(120, 192, 'a'),
		_Utils_Tuple3(120, 200, 'a'),
		_Utils_Tuple3(120, 208, 'a'),
		_Utils_Tuple3(120, 232, 'a'),
		_Utils_Tuple3(120, 240, 'a'),
		_Utils_Tuple3(128, 32, 'a'),
		_Utils_Tuple3(128, 56, 'a'),
		_Utils_Tuple3(128, 64, 'a'),
		_Utils_Tuple3(128, 72, 'a'),
		_Utils_Tuple3(128, 80, 'a'),
		_Utils_Tuple3(128, 88, 'a'),
		_Utils_Tuple3(128, 96, 'a'),
		_Utils_Tuple3(128, 104, 'a'),
		_Utils_Tuple3(128, 120, 'b'),
		_Utils_Tuple3(128, 144, 'b'),
		_Utils_Tuple3(128, 152, 'b'),
		_Utils_Tuple3(128, 184, 'a'),
		_Utils_Tuple3(128, 208, 'a'),
		_Utils_Tuple3(128, 216, 'a'),
		_Utils_Tuple3(128, 224, 'a'),
		_Utils_Tuple3(128, 240, 'a'),
		_Utils_Tuple3(128, 248, 'a'),
		_Utils_Tuple3(136, 40, 'a'),
		_Utils_Tuple3(136, 56, 'a'),
		_Utils_Tuple3(136, 96, 'a'),
		_Utils_Tuple3(136, 128, 'b'),
		_Utils_Tuple3(136, 144, 'b'),
		_Utils_Tuple3(136, 168, 'b'),
		_Utils_Tuple3(136, 200, 'a'),
		_Utils_Tuple3(136, 216, 'a'),
		_Utils_Tuple3(136, 224, 'a'),
		_Utils_Tuple3(136, 232, 'a'),
		_Utils_Tuple3(136, 256, 'a'),
		_Utils_Tuple3(144, 32, 'a'),
		_Utils_Tuple3(144, 40, 'a'),
		_Utils_Tuple3(144, 56, 'a'),
		_Utils_Tuple3(144, 72, 'a'),
		_Utils_Tuple3(144, 80, 'a'),
		_Utils_Tuple3(144, 88, 'a'),
		_Utils_Tuple3(144, 96, 'a'),
		_Utils_Tuple3(144, 112, 'b'),
		_Utils_Tuple3(144, 128, 'b'),
		_Utils_Tuple3(144, 136, 'b'),
		_Utils_Tuple3(144, 144, 'b'),
		_Utils_Tuple3(144, 152, 'b'),
		_Utils_Tuple3(144, 168, 'b'),
		_Utils_Tuple3(144, 176, 'b'),
		_Utils_Tuple3(144, 200, 'a'),
		_Utils_Tuple3(144, 216, 'a'),
		_Utils_Tuple3(144, 232, 'a'),
		_Utils_Tuple3(144, 240, 'a'),
		_Utils_Tuple3(144, 248, 'a'),
		_Utils_Tuple3(144, 256, 'a'),
		_Utils_Tuple3(152, 32, 'a'),
		_Utils_Tuple3(152, 48, 'a'),
		_Utils_Tuple3(152, 56, 'a'),
		_Utils_Tuple3(152, 72, 'a'),
		_Utils_Tuple3(152, 104, 'a'),
		_Utils_Tuple3(152, 184, 'a'),
		_Utils_Tuple3(152, 192, 'a'),
		_Utils_Tuple3(152, 200, 'a'),
		_Utils_Tuple3(152, 208, 'a'),
		_Utils_Tuple3(152, 232, 'a'),
		_Utils_Tuple3(152, 240, 'a'),
		_Utils_Tuple3(152, 256, 'a'),
		_Utils_Tuple3(160, 32, 'a'),
		_Utils_Tuple3(160, 40, 'a'),
		_Utils_Tuple3(160, 48, 'a'),
		_Utils_Tuple3(160, 56, 'a'),
		_Utils_Tuple3(160, 64, 'a'),
		_Utils_Tuple3(160, 80, 'a'),
		_Utils_Tuple3(160, 88, 'a'),
		_Utils_Tuple3(160, 104, 'a'),
		_Utils_Tuple3(160, 120, 'b'),
		_Utils_Tuple3(160, 128, 'b'),
		_Utils_Tuple3(160, 136, 'b'),
		_Utils_Tuple3(160, 160, 'b'),
		_Utils_Tuple3(160, 192, 'a'),
		_Utils_Tuple3(160, 208, 'a'),
		_Utils_Tuple3(160, 216, 'a'),
		_Utils_Tuple3(160, 224, 'a'),
		_Utils_Tuple3(160, 256, 'a'),
		_Utils_Tuple3(168, 32, 'a'),
		_Utils_Tuple3(168, 48, 'a'),
		_Utils_Tuple3(168, 64, 'a'),
		_Utils_Tuple3(168, 72, 'a'),
		_Utils_Tuple3(168, 120, 'b'),
		_Utils_Tuple3(168, 144, 'b'),
		_Utils_Tuple3(168, 152, 'b'),
		_Utils_Tuple3(168, 160, 'b'),
		_Utils_Tuple3(168, 176, 'b'),
		_Utils_Tuple3(168, 184, 'a'),
		_Utils_Tuple3(168, 208, 'a'),
		_Utils_Tuple3(168, 216, 'a'),
		_Utils_Tuple3(176, 48, 'a'),
		_Utils_Tuple3(176, 56, 'a'),
		_Utils_Tuple3(176, 64, 'a'),
		_Utils_Tuple3(176, 80, 'a'),
		_Utils_Tuple3(176, 104, 'a'),
		_Utils_Tuple3(176, 112, 'a'),
		_Utils_Tuple3(176, 120, 'b'),
		_Utils_Tuple3(176, 128, 'b'),
		_Utils_Tuple3(176, 152, 'b'),
		_Utils_Tuple3(176, 160, 'b'),
		_Utils_Tuple3(176, 176, 'a'),
		_Utils_Tuple3(176, 184, 'a'),
		_Utils_Tuple3(176, 216, 'a'),
		_Utils_Tuple3(176, 256, 'a'),
		_Utils_Tuple3(184, 32, 'a'),
		_Utils_Tuple3(184, 40, 'a'),
		_Utils_Tuple3(184, 72, 'a'),
		_Utils_Tuple3(184, 104, 'a'),
		_Utils_Tuple3(184, 112, 'a'),
		_Utils_Tuple3(184, 120, 'a'),
		_Utils_Tuple3(184, 160, 'b'),
		_Utils_Tuple3(184, 168, 'a'),
		_Utils_Tuple3(184, 184, 'a'),
		_Utils_Tuple3(184, 200, 'a'),
		_Utils_Tuple3(184, 208, 'a'),
		_Utils_Tuple3(184, 216, 'a'),
		_Utils_Tuple3(184, 224, 'a'),
		_Utils_Tuple3(184, 240, 'a'),
		_Utils_Tuple3(184, 256, 'a'),
		_Utils_Tuple3(192, 32, 'a'),
		_Utils_Tuple3(192, 72, 'a'),
		_Utils_Tuple3(192, 80, 'a'),
		_Utils_Tuple3(192, 88, 'a'),
		_Utils_Tuple3(192, 96, 'a'),
		_Utils_Tuple3(192, 120, 'a'),
		_Utils_Tuple3(192, 128, 'a'),
		_Utils_Tuple3(192, 144, 'b'),
		_Utils_Tuple3(192, 152, 'b'),
		_Utils_Tuple3(192, 160, 'b'),
		_Utils_Tuple3(192, 168, 'a'),
		_Utils_Tuple3(192, 176, 'a'),
		_Utils_Tuple3(192, 184, 'a'),
		_Utils_Tuple3(192, 192, 'a'),
		_Utils_Tuple3(192, 200, 'a'),
		_Utils_Tuple3(192, 208, 'a'),
		_Utils_Tuple3(192, 216, 'a'),
		_Utils_Tuple3(192, 224, 'a'),
		_Utils_Tuple3(192, 240, 'a'),
		_Utils_Tuple3(192, 248, 'a'),
		_Utils_Tuple3(192, 256, 'a'),
		_Utils_Tuple3(200, 104, 'a'),
		_Utils_Tuple3(200, 112, 'a'),
		_Utils_Tuple3(200, 120, 'a'),
		_Utils_Tuple3(200, 144, 'a'),
		_Utils_Tuple3(200, 152, 'a'),
		_Utils_Tuple3(200, 160, 'a'),
		_Utils_Tuple3(200, 192, 'a'),
		_Utils_Tuple3(200, 224, 'a'),
		_Utils_Tuple3(200, 240, 'a'),
		_Utils_Tuple3(200, 256, 'a'),
		_Utils_Tuple3(208, 32, 'a'),
		_Utils_Tuple3(208, 40, 'a'),
		_Utils_Tuple3(208, 48, 'a'),
		_Utils_Tuple3(208, 56, 'a'),
		_Utils_Tuple3(208, 64, 'a'),
		_Utils_Tuple3(208, 72, 'a'),
		_Utils_Tuple3(208, 80, 'a'),
		_Utils_Tuple3(208, 96, 'a'),
		_Utils_Tuple3(208, 104, 'a'),
		_Utils_Tuple3(208, 136, 'a'),
		_Utils_Tuple3(208, 144, 'a'),
		_Utils_Tuple3(208, 168, 'a'),
		_Utils_Tuple3(208, 192, 'a'),
		_Utils_Tuple3(208, 208, 'a'),
		_Utils_Tuple3(208, 224, 'a'),
		_Utils_Tuple3(208, 248, 'a'),
		_Utils_Tuple3(208, 256, 'a'),
		_Utils_Tuple3(216, 32, 'a'),
		_Utils_Tuple3(216, 80, 'a'),
		_Utils_Tuple3(216, 96, 'a'),
		_Utils_Tuple3(216, 104, 'a'),
		_Utils_Tuple3(216, 128, 'a'),
		_Utils_Tuple3(216, 152, 'a'),
		_Utils_Tuple3(216, 168, 'a'),
		_Utils_Tuple3(216, 176, 'a'),
		_Utils_Tuple3(216, 192, 'a'),
		_Utils_Tuple3(216, 224, 'a'),
		_Utils_Tuple3(216, 232, 'a'),
		_Utils_Tuple3(216, 248, 'a'),
		_Utils_Tuple3(224, 32, 'a'),
		_Utils_Tuple3(224, 48, 'a'),
		_Utils_Tuple3(224, 56, 'a'),
		_Utils_Tuple3(224, 64, 'a'),
		_Utils_Tuple3(224, 80, 'a'),
		_Utils_Tuple3(224, 104, 'a'),
		_Utils_Tuple3(224, 112, 'a'),
		_Utils_Tuple3(224, 120, 'a'),
		_Utils_Tuple3(224, 136, 'a'),
		_Utils_Tuple3(224, 144, 'a'),
		_Utils_Tuple3(224, 168, 'a'),
		_Utils_Tuple3(224, 176, 'a'),
		_Utils_Tuple3(224, 184, 'a'),
		_Utils_Tuple3(224, 192, 'a'),
		_Utils_Tuple3(224, 200, 'a'),
		_Utils_Tuple3(224, 208, 'a'),
		_Utils_Tuple3(224, 216, 'a'),
		_Utils_Tuple3(224, 224, 'a'),
		_Utils_Tuple3(224, 256, 'a'),
		_Utils_Tuple3(232, 32, 'a'),
		_Utils_Tuple3(232, 48, 'a'),
		_Utils_Tuple3(232, 56, 'a'),
		_Utils_Tuple3(232, 64, 'a'),
		_Utils_Tuple3(232, 80, 'a'),
		_Utils_Tuple3(232, 104, 'a'),
		_Utils_Tuple3(232, 120, 'a'),
		_Utils_Tuple3(232, 128, 'a'),
		_Utils_Tuple3(232, 152, 'a'),
		_Utils_Tuple3(232, 168, 'a'),
		_Utils_Tuple3(232, 176, 'a'),
		_Utils_Tuple3(232, 184, 'a'),
		_Utils_Tuple3(232, 192, 'a'),
		_Utils_Tuple3(232, 216, 'a'),
		_Utils_Tuple3(232, 256, 'a'),
		_Utils_Tuple3(240, 32, 'a'),
		_Utils_Tuple3(240, 48, 'a'),
		_Utils_Tuple3(240, 56, 'a'),
		_Utils_Tuple3(240, 64, 'a'),
		_Utils_Tuple3(240, 80, 'a'),
		_Utils_Tuple3(240, 104, 'a'),
		_Utils_Tuple3(240, 136, 'a'),
		_Utils_Tuple3(240, 168, 'a'),
		_Utils_Tuple3(240, 200, 'a'),
		_Utils_Tuple3(240, 240, 'a'),
		_Utils_Tuple3(248, 32, 'a'),
		_Utils_Tuple3(248, 80, 'a'),
		_Utils_Tuple3(248, 96, 'a'),
		_Utils_Tuple3(248, 104, 'a'),
		_Utils_Tuple3(248, 120, 'a'),
		_Utils_Tuple3(248, 136, 'a'),
		_Utils_Tuple3(248, 192, 'a'),
		_Utils_Tuple3(248, 216, 'a'),
		_Utils_Tuple3(248, 232, 'a'),
		_Utils_Tuple3(248, 240, 'a'),
		_Utils_Tuple3(248, 248, 'a'),
		_Utils_Tuple3(248, 256, 'a'),
		_Utils_Tuple3(256, 32, 'a'),
		_Utils_Tuple3(256, 40, 'a'),
		_Utils_Tuple3(256, 48, 'a'),
		_Utils_Tuple3(256, 56, 'a'),
		_Utils_Tuple3(256, 64, 'a'),
		_Utils_Tuple3(256, 72, 'a'),
		_Utils_Tuple3(256, 80, 'a'),
		_Utils_Tuple3(256, 104, 'a'),
		_Utils_Tuple3(256, 112, 'a'),
		_Utils_Tuple3(256, 120, 'a'),
		_Utils_Tuple3(256, 128, 'a'),
		_Utils_Tuple3(256, 136, 'a'),
		_Utils_Tuple3(256, 144, 'a'),
		_Utils_Tuple3(256, 152, 'a'),
		_Utils_Tuple3(256, 168, 'a'),
		_Utils_Tuple3(256, 176, 'a'),
		_Utils_Tuple3(256, 184, 'a'),
		_Utils_Tuple3(256, 200, 'a'),
		_Utils_Tuple3(256, 208, 'a'),
		_Utils_Tuple3(256, 224, 'a'),
		_Utils_Tuple3(256, 240, 'a'),
		_Utils_Tuple3(256, 248, 'a')
	]);
var $elm$svg$Svg$Attributes$r = _VirtualDom_attribute('r');
var $author$project$Main$saFill = function (cl) {
	return $elm$svg$Svg$Attributes$fill(cl);
};
var $elm$svg$Svg$Attributes$style = _VirtualDom_attribute('style');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$svg$Svg$text = $elm$virtual_dom$VirtualDom$text;
var $elm$svg$Svg$textPath = $elm$svg$Svg$trustedNode('textPath');
var $elm$svg$Svg$text_ = $elm$svg$Svg$trustedNode('text');
var $elm$svg$Svg$use = $elm$svg$Svg$trustedNode('use');
var $elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var $elm$svg$Svg$Attributes$xlinkHref = function (value) {
	return A3(
		_VirtualDom_attributeNS,
		'http://www.w3.org/1999/xlink',
		'xlink:href',
		_VirtualDom_noJavaScriptUri(value));
};
var $elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var $author$project$Main$iconViewBoxAndPaths = F2(
	function (icon_, cl) {
		switch (icon_.$) {
			case 'Icon_Github':
				return _Utils_Tuple2(
					'0 0 1024 1024',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$fillRule('evenodd'),
									$elm$svg$Svg$Attributes$clipRule('evenodd'),
									$elm$svg$Svg$Attributes$d('M512 0a512 512 0 0 0-162 998c26 4 35-11 35-25v-95c-129 24-162-31-173-60-5-15-30-60-52-72-18-10-44-34-1-34 41-1 69 37 79 52 46 78 120 56 149 42 5-33 18-55 33-68-114-13-233-57-233-253 0-56 20-102 52-137-5-13-23-66 5-136 0 0 43-14 141 52a475 475 0 0 1 256 0c98-66 141-52 141-52 28 70 10 123 5 136 33 35 53 81 53 137 0 197-120 240-234 253 19 16 35 47 35 95l-1 140c0 14 10 30 35 25A513 513 0 0 0 512 0z')
								]),
							_List_Nil)
						]));
			case 'Icon_Twitter':
				return _Utils_Tuple2(
					'0 0 300 244',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M94.7 243.2c112.5 0 174-93.2 174-174 0-2.6 0-5.2-.2-7.9 12-8.6 22.3-19.4 30.5-31.6a122 122 0 0 1-35.1 9.6 61.4 61.4 0 0 0 26.9-33.8c-11.8 7-25 12-38.8 14.8a61 61 0 0 0-104.2 55.8 173.6 173.6 0 0 1-126-64 61 61 0 0 0 18.9 81.7c-10-.3-19.5-3-27.7-7.6v.8c0 29.6 21 54.3 49 59.9a61.2 61.2 0 0 1-27.6 1 61.2 61.2 0 0 0 57.1 42.5A122.7 122.7 0 0 1 1 215.7a173 173 0 0 0 93.7 27.5')
								]),
							_List_Nil)
						]));
			case 'Icon_LookInside':
				return _Utils_Tuple2(
					'0 0 425 300',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$elm$svg$Svg$Attributes$id('curve'),
									$elm$svg$Svg$Attributes$style('fill: transparent;'),
									$elm$svg$Svg$Attributes$d('M6,150C49.63,93,105.79,36.65,156.2,47.55,207.89,58.74,213,131.91,264,150c40.67,14.43,108.57-6.91,229-145')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$text_,
							_List_fromArray(
								[
									$elm$svg$Svg$Attributes$x('25')
								]),
							_List_fromArray(
								[
									A2(
									$elm$svg$Svg$textPath,
									_List_fromArray(
										[
											$elm$svg$Svg$Attributes$xlinkHref('#curve'),
											$elm$svg$Svg$Attributes$style('font-size: 20px; letter-spacing: 3px; -webkit-text-stroke: 2px white; fill: ' + cl)
										]),
									_List_fromArray(
										[
											$elm$svg$Svg$text('Click to look how I\'m working inside ➤')
										]))
								]))
						]));
			case 'Icon_Play':
				return _Utils_Tuple2(
					'0 0 60 60',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M45.6 29.2l-22-15a1 1 0 00-1.6.8v30a1 1 0 001.6.8l22-15a1 1 0 000-1.6zM24 43.2V16.8L43.2 30 24 43.1z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M30 0a30 30 0 100 60 30 30 0 000-60zm0 58a28 28 0 110-56 28 28 0 010 56z')
								]),
							_List_Nil)
						]));
			case 'Icon_Pause':
				return _Utils_Tuple2(
					'0 0 60 60',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M30 0a30 30 0 100 60 30 30 0 000-60zm0 58a28 28 0 110-56 28 28 0 010 56z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M33 46h8V14h-8v32zm2-30h4v28h-4V16zM19 46h8V14h-8v32zm2-30h4v28h-4V16z')
								]),
							_List_Nil)
						]));
			case 'Icon_Logo':
				return _Utils_Tuple2(
					'0 0 305 335',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill('red'),
									$elm$svg$Svg$Attributes$d('M72 205l-50-50 50-50 50 50z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill('#777'),
									$elm$svg$Svg$Attributes$d('M67 209l-50 50V159zM21 264l70-71v142zM98 334V193l141 141zM205 292L105 192h200zM71 72H0L71 1zM76 0v100l50 50V50z')
								]),
							_List_Nil)
						]));
			case 'Icon_Close':
				return _Utils_Tuple2(
					'0 0 357 357',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M357 36L321 0 179 143 36 0 0 36l143 143L0 321l36 36 143-143 142 143 36-36-143-142z')
								]),
							_List_Nil)
						]));
			case 'Icon_Microphone':
				return _Utils_Tuple2(
					'0 0 58 58',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M44 28a1 1 0 00-1 1v6a14 14 0 01-28 0v-6a1 1 0 10-2 0v6a16 16 0 0015 16v5h-5a1 1 0 100 2h12a1 1 0 100-2h-5v-5a16 16 0 0015-16v-6c0-.6-.4-1-1-1z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M29 46c6 0 11-5 11-11V11a11 11 0 00-22 0v24c0 6 5 11 11 11zm-9-35a9 9 0 0118 0v24a9 9 0 01-18 0V11z')
								]),
							_List_Nil)
						]));
			case 'Icon_TwitterOutlined':
				return _Utils_Tuple2(
					'0 0 511.3 511.3',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M508 94c-2-2-7-3-10-2l-17 6c10-12 17-25 21-38 2-4 1-7-1-10-3-3-7-3-11-2-24 11-45 19-62 25h-2c-14-8-48-26-72-26-62 1-111 53-111 117v3c-90-17-140-43-194-100l-8-8-6 10c-29 56-8 108 26 142-16-2-26-7-36-15-3-3-8-4-12-1-4 2-5 7-5 11 13 41 43 74 76 94-16 0-29-2-42-11-3-1-8-1-12 1s-5 7-3 12c15 44 46 67 94 73-25 15-58 27-109 28-5 0-10 4-11 8-2 5 0 10 3 13 31 25 101 40 187 40 152 0 277-136 277-304v-2c20-10 35-28 43-53 1-4 0-8-3-11zm-52 50l-5 1v15c0 158-117 287-260 287-79 0-132-13-161-27 60-5 95-24 122-45l21-15h-26c-49 0-79-14-97-47 16 5 32 5 50 4l21-1 3-17c-33-10-72-39-91-79 17 8 36 10 54 10h26l-21-16c-18-13-72-59-46-125 55 55 108 80 204 97l10 2v-24c0-54 42-98 94-99 20-1 53 17 62 22 6 3 11 4 16 2l46-17c-8 13-18 25-32 36-4 3-4 8-3 12 2 5 7 6 12 5l33-12c-6 12-15 25-32 31z')
								]),
							_List_Nil)
						]));
			case 'Icon_Tickets':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M512 224L453 42c-2-5-8-8-13-6L7 177c-5 1-8 7-7 12l28 86v192c0 5 5 10 10 10h456c5 0 10-5 10-10V276c0-6-5-10-10-10h-79l90-29c5-2 8-8 7-13zm-28 62v171H48V286h56v111a10 10 0 0020 0V286h360zm-133-20H46l-23-73 52-18 20 62a10 10 0 0019-7l-20-61L437 58l52 163-138 45z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M421 102c-1-5-7-8-12-7l-261 85a10 10 0 006 19l261-85c5-1 8-7 6-12zM377 167l50-16a10 10 0 00-6-19l-50 16a10 10 0 006 19zM419 213a10 10 0 0013 6l15-5a10 10 0 00-6-19l-15 5c-6 2-9 7-7 13zM391 211l-16 6a10 10 0 006 19l16-6a10 10 0 00-6-19zM251 187l-91 29a10 10 0 006 19l91-29a10 10 0 00-6-19zM114 420c-6 0-10 5-10 10v4a10 10 0 0020 0v-4c0-5-5-10-10-10zM162 323c0 5 4 10 10 10h274a10 10 0 000-20H172c-6 0-10 4-10 10zM446 351h-52a10 10 0 000 20h52a10 10 0 000-20zM446 417h-17a10 10 0 000 20h17a10 10 0 000-20zM393 417h-17a10 10 0 000 20h17a10 10 0 000-20zM268 351h-96a10 10 0 000 20h96a10 10 0 000-20z')
								]),
							_List_Nil)
						]));
			case 'Icon_Love':
				return _Utils_Tuple2(
					'0 0 52 52',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M52 16.2C51.1 8 45.1 1.8 37.7 1.8a14 14 0 00-12 7c-2.5-4.4-6.8-7-11.6-7C6.8 1.8.8 7.8 0 16.2c0 .4-.3 2.4.4 5.5 1.1 4.6 3.6 8.7 7.2 12l18.1 16.5 18.5-16.5c3.6-3.3 6-7.4 7.2-12 .7-3.1.5-5 .4-5.5zm-2.5 5c-1 4.2-3.2 8-6.6 11L26 47.5 9 32.2c-3.4-3-5.6-6.8-6.6-11-.7-3-.4-4.6-.4-4.6v-.1C2.7 9 7.8 3.8 14 3.8c4.7 0 8.9 3 10.8 7.5l1 2.2.9-2.2a12 12 0 0111-7.5c6.4 0 11.5 5.3 12.1 12.8 0 0 .3 1.7-.4 4.7z')
								]),
							_List_Nil)
						]));
			case 'Icon_Respect':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M467.8 88.1a10 10 0 00-14.2 0 10 10 0 000 14.1c1.9 1.9 4.4 3 7 3a10 10 0 007-17zM238 323.6a10 10 0 00-14 0 10 10 0 000 14.2c1.8 1.8 4.4 2.9 7 2.9 2.6 0 5.2-1 7-3a10 10 0 000-14z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M492 121.3a10 10 0 10-17.4 9.9 134.3 134.3 0 01-21.8 161l-7.6 7.6a37.4 37.4 0 00-8.5-13.2L333.9 183.8c6.7-3.3 13-7.7 18.4-13.1L372 151a10 10 0 00-14.1-14.2L338 156.5a48.7 48.7 0 01-34.6 14.4H264a10 10 0 00-7 3l-30.2 30a23 23 0 01-32.5-32.4l68.8-68.9C305.3 60.6 371 51.3 423 80.1a10 10 0 009.7-17.5 155.1 155.1 0 00-95.1-17.9C307 48.7 279 61.6 256 82c-28.2-25-64-38.6-102-38.6-41.2 0-79.9 16-109 45S0 156.3 0 197.4a153 153 0 0045.1 109L49 310a10 10 0 002.1 1.6 37.5 37.5 0 0039 34.7v1.5a37.4 37.4 0 0039.2 37.7v1.5a37.4 37.4 0 0039.2 37.6 37.6 37.6 0 0064.3 28.2l14-14 18.8 18.9a37.4 37.4 0 0053.3 0 37.6 37.6 0 0011-28.5h1.9a37.6 37.6 0 0037.6-39.2h1.6a37.4 37.4 0 0037.6-39.1h1.5a37.4 37.4 0 0034.8-23.3 10 10 0 002.7-1.9l19.4-19.4a154.4 154.4 0 0025-185zm-403.4 205a17.6 17.6 0 01-17.7-17.6c0-4.7 1.8-9.2 5.2-12.5L93.3 279a17.6 17.6 0 0125 0 17.7 17.7 0 010 25l-17.2 17.2a17.6 17.6 0 01-12.5 5.2zm26.6 34a17.6 17.6 0 010-25l17.3-17.2a17.6 17.6 0 0125 0 17.7 17.7 0 010 25l-17.3 17.2a17.7 17.7 0 01-25 0zm39.2 39.2a17.6 17.6 0 010-25l17.2-17.2a17.6 17.6 0 0125 0 17.7 17.7 0 010 25l-17.2 17.2a17.7 17.7 0 01-25 0zm81.4 22l-17.2 17.2a17.6 17.6 0 01-25 0 17.7 17.7 0 010-25l17.2-17.3a17.6 17.6 0 0125 0 17.6 17.6 0 010 25zm186.7-95.8a17.6 17.6 0 01-25 0L356 284.1 316.7 245a10 10 0 00-14.1 14.1l80.8 80.8a17.7 17.7 0 01-25 25L277.6 284a10 10 0 00-14.2 14.2l39.2 39.1 41.6 41.6a17.7 17.7 0 01-25 25l-41.6-41.6a10 10 0 00-2.6-1.8l-11.9-11.9a10 10 0 00-14 14.1l55.6 55.7a17.7 17.7 0 01-25 25l-21.2-21.1a37.7 37.7 0 00-36.7-51.1 37.6 37.6 0 00-39.2-39.2 37.6 37.6 0 00-39.1-39.1 37.6 37.6 0 00-64.3-28.2L61.9 282c-2.1 2.2-4 4.6-5.5 7.1A133.1 133.1 0 0120 197.3c0-35.8 14-69.5 39.3-94.8 25.3-25.3 59-39.2 94.7-39.2a133 133 0 0187.7 32.6l-61.5 61.4a42.7 42.7 0 000 60.8 42.8 42.8 0 0060.8 0l27.2-27.2h35.3c2.9 0 5.8-.2 8.6-.6l110.4 110.4a17.7 17.7 0 010 25z')
								]),
							_List_Nil)
						]));
			case 'Icon_Organize':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M354 64h-54v-3c0-16-13-29-29-29h-19c-8-19-27-32-49-32h-2c-22 0-41 13-49 32h-19c-16 0-29 13-29 29v3H50C19 64 0 79 0 104v358c0 28 22 50 50 50h304c28 0 50-22 50-50V236a10 10 0 10-20 0v226c0 17-13 30-30 30H50c-17 0-30-13-30-30V104c0-5 0-20 30-20h54v14c0 6 4 10 10 10h176c6 0 10-4 10-10V84h54c17 0 30 13 30 30v34a10 10 0 1020 0v-34c0-28-22-50-50-50zm-74 24H124V61c0-5 4-9 9-9h26c4 0 8-3 9-7 4-15 18-25 33-25h2c15 0 29 10 33 25 1 4 5 7 9 7h26c5 0 9 4 9 9zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M394 180a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10c0-3-1-6-3-8l-7-2zm0 0M502 322a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10 10 10 0 00-10-10zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M511 185l-32-71c-1-4-5-6-9-6s-8 2-9 6l-32 71-1 5v298c0 13 11 24 24 24h36c13 0 24-11 24-24V376a10 10 0 10-20 0v70h-44V200h44v92a10 10 0 1020 0V190l-1-5zm-41-43l17 38h-34zm22 324v22c0 2-2 4-4 4h-36c-2 0-4-2-4-4v-22zm0 0M118 144a42 42 0 100 84 42 42 0 000-84zm0 64a22 22 0 110-44 22 22 0 010 44zm0 0M118 264a42 42 0 100 84 42 42 0 000-84zm0 64a22 22 0 110-44 22 22 0 010 44zm0 0M118 384a42 42 0 100 84 42 42 0 000-84zm0 64a22 22 0 110-44 22 22 0 010 44zm0 0M318 208H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 160H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 328H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 280H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 448H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 400H204a10 10 0 100 20h114a10 10 0 100-20zm0 0')
								]),
							_List_Nil)
						]));
			case 'Icon_CustomerSupport':
				return _Utils_Tuple2(
					'0 0 770 770',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M1.5 52.2l38 66.5a9.5 9.5 0 006 4.5l35.4 8.9 121.5 121.5 13.5-13.4L92.4 116.8a9.5 9.5 0 00-4.4-2.5l-34-8.6-32.4-56.6 27.7-27.7L106 53.7l8.5 34a9.5 9.5 0 002.5 4.5l123.5 123.4 13.4-13.4L132.4 80.7l-8.9-35.5a9.5 9.5 0 00-4.5-5.9l-66.5-38a9.5 9.5 0 00-11.4 1.5l-38 38c-3 3-3.7 7.7-1.6 11.4zm0 0M396.3 187.1l-208.9 209-13.4-13.5 208.9-208.9zm0 0M150.8 403.4a9.5 9.5 0 00-8-4.6h-57a9.5 9.5 0 00-8.2 4.6L49.1 451a9.5 9.5 0 000 9.8l28.5 47.5a9.5 9.5 0 008.1 4.6h57c3.3 0 6.4-1.8 8.1-4.6l28.5-47.5c1.8-3 1.8-6.8 0-9.8zm-13.5 90.4H91.1l-22.8-38 22.8-38h46.2l22.8 38zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M456 228A113.6 113.6 0 00566.6 86.3a9.5 9.5 0 00-16-4.4l-59 59-47-15.6L429 78.6l59.2-59.2a9.5 9.5 0 00-4.5-15.9 113.6 113.6 0 00-139.2 132.7l-208 208a114 114 0 1089.4 89.4l49.8-49.8 21.8 21.7a9.5 9.5 0 0013.4 0l4.8-4.7a10.6 10.6 0 0115 15l-4.7 4.8a9.5 9.5 0 000 13.4l113.3 113.3A76.6 76.6 0 10548 439.4l-.5-.5-113.3-113.2a9.5 9.5 0 00-13.4 0l-4.8 4.7a10.6 10.6 0 11-15-15l4.7-4.8a9.5 9.5 0 000-13.4L384 275.4l49.8-49.8c7.3 1.5 14.8 2.3 22.3 2.3zm37.4 322.8c-7 0-13.8-1.3-20.2-3.7l74.1-74.2a57.6 57.6 0 01-54 77.9zM385.8 304a29.6 29.6 0 0041.8 41.7L534 452.4c1.2 1.1 2.3 2.3 3.3 3.6l-81.2 81.2-3.6-3.3L346 427.2a29.6 29.6 0 00-41.8-41.7L289 370.3l81.6-81.5zm38.3-95.5L208.7 423.8a9.5 9.5 0 00-2.5 9 95.6 95.6 0 11-69-69c3.2.8 6.6-.2 9-2.5l215.4-215.4a9.5 9.5 0 002.5-9 94.5 94.5 0 0197.4-117.7l-50.1 50A9.5 9.5 0 00409 79l19 57c1 2.8 3.1 5 6 6l57 19c3.4 1 7.1.2 9.7-2.3l50-50.1c.2 1.8.2 3.6.2 5.4a94.5 94.5 0 01-117.9 92c-3.2-.8-6.7.1-9 2.5zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M491.3 477.6L477.8 491l-95-95 13.5-13.4zm0 0')
								]),
							_List_Nil)
						]));
			case 'Icon_Card':
				return _Utils_Tuple2(
					'0 -84 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M467.7 0H44.3A44.3 44.3 0 000 44.3v255.1a44.3 44.3 0 0044.3 44.3h423.4a44.3 44.3 0 0044.3-44.3V44.3A44.3 44.3 0 00467.7 0zm29 299.4c0 16-13 29-29 29H44.3c-16 0-29-13-29-29V44.3c0-16 13-29 29-29h423.4c16 0 29 13 29 29zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M227.6 60.8H51.2a7.6 7.6 0 00-7.6 7.6v18.3a7.6 7.6 0 0015.2 0V76H220v185.6H58.8V117a7.6 7.6 0 00-15.2 0v152c0 4.3 3.4 7.7 7.6 7.7h176.4c4.2 0 7.6-3.4 7.6-7.6V68.4c0-4.2-3.4-7.6-7.6-7.6zm0 0M462.8 78.5H272.2a7.6 7.6 0 000 15.2h190.6a7.6 7.6 0 100-15.2zm0 0M462.8 133.6h-42.6a7.6 7.6 0 100 15.2h42.6a7.6 7.6 0 000-15.2zm0 0M272.2 148.8h117.6a7.6 7.6 0 000-15.2H272.2a7.6 7.6 0 100 15.2zm0 0M462.8 188.8H272.2a7.6 7.6 0 100 15.2h190.6a7.6 7.6 0 000-15.2zm0 0M375.6 244H272.2a7.6 7.6 0 100 15.2h103.4a7.6 7.6 0 000-15.3zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M86.2 244.8a7.6 7.6 0 0015.2 0 38 38 0 0176 0 7.6 7.6 0 1015.2 0 53.2 53.2 0 00-25.8-45.6 53.2 53.2 0 10-54.8 0 53.2 53.2 0 00-25.8 45.6zm15.2-91.2a38 38 0 1176.1 0 38 38 0 01-76.1 0zm0 0')
								]),
							_List_Nil)
						]));
			case 'Icon_HighFive':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M423.5 495a10 10 0 00-14.2 0 10 10 0 000 14 10 10 0 0014.2 0 10 10 0 000-14zM505 167.9a39.5 39.5 0 00-67.2 3.6V65.9a38.8 38.8 0 00-58-33.6 38.8 38.8 0 00-76.4 0 38.8 38.8 0 00-57.8 29.9A38.8 38.8 0 00188 96a10 10 0 0020 0 18.8 18.8 0 0137.4-2v26.6a10 10 0 0020 0V66a18.8 18.8 0 0137.4-1.9v77.8l.1 3.8a10 10 0 0020 0V65.9 38.8a18.8 18.8 0 0137.5 0v24.5l-.1 2.6v140.7a10 10 0 0020 0V64a18.8 18.8 0 0137.5 2v147.9a14 14 0 0012.5 14.1 14 14 0 0015.6-10.7l7.8-31.8a19.4 19.4 0 0137.9 8.4l-15.1 76.4c-5 25.6-17.5 49-36 67.4l-31.1 31a10 10 0 00-3 7.1V465a10 10 0 0020 0v-85l28.2-28.1a150.5 150.5 0 0041.5-77.7l15-76.4c2.1-10.5 0-21.1-6-30zM296.6 309a10 10 0 00-10 10v29.3a122 122 0 01-36.1 87l-19 19a10 10 0 00-3 7V502a10 10 0 0020 0v-36.5l16.1-16c27-27 42-63 42-101.2V319a10 10 0 00-10-10z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M303.7 276.4a10 10 0 00-14.2 0 10 10 0 000 14.2 10 10 0 0014.2 0 10 10 0 000-14.2zM269.5 160.5c-6.3 0-12.2 1.6-17.3 4.3a37.2 37.2 0 00-54.6-28.1 37.2 37.2 0 00-72.9 0A37.2 37.2 0 0070 169.3v97.3A37.8 37.8 0 006.7 265a37.4 37.4 0 00-6 28.6l14.3 72c5.5 28 19.1 53.4 39.3 73.6l26.4 26.3V502a10 10 0 0020 0v-40.7c0-2.6-1-5.2-3-7L68.4 425a122.5 122.5 0 01-33.8-63.2l-14.2-72a17.6 17.6 0 0114.3-21c9.2-1.5 18 4.3 20.3 13.3l7.3 30c1.8 7 8.2 11.4 15.3 10.5 7.1-.9 12.3-6.7 12.3-13.9V169.3a17.1 17.1 0 0134.2-1.8v73.3a10 10 0 0020.1 0v-71.5l-.1-2.5v-23.1a17.1 17.1 0 0134.2 0v97.1a10 10 0 0020.1 0v-73.3a17.1 17.1 0 0134 1.8v71.5a10 10 0 0020.1 0v-45a17.1 17.1 0 0134 1.8v46.7a10 10 0 0020 0v-46.7a37.2 37.2 0 00-37-37.1zM148.9 55.7L96 3a10 10 0 00-14 14.1l52.6 52.7a9.9 9.9 0 0014.1 0c4-3.9 4-10.2 0-14.1zM113.5 82.5H89.1a10 10 0 000 20h24.4a10 10 0 000-20zM171 0a10 10 0 00-10 10v25.2a10 10 0 1020 0V10a10 10 0 00-10-10z')
								]),
							_List_Nil)
						]));
			case 'Icon_Moon':
				return _Utils_Tuple2(
					'0 0 383.19 383.19',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M226.38 123.66a8.88 8.88 0 00-6.16-1.92h-33.6l31.6-35.28 2.96-3.28 1.52-1.92c.53-.74.96-1.55 1.28-2.4a8 8 0 00.56-2.88 6 6 0 00-2.96-5.76 17.84 17.84 0 00-8.4-1.6H173.9a8.64 8.64 0 00-5.84 1.76 5.92 5.92 0 00-2.08 4.72c0 2.72.91 4.37 2.72 4.96 2.6.74 5.3 1.06 8 .96h25.6a86.75 86.75 0 01-4.16 5.28l-6.56 7.36-8.88 9.6-10.32 11.44c-3.57 4-5.92 6.66-7.04 8a7.52 7.52 0 00.72 10.32 10.88 10.88 0 007.36 2.16h46.72a9.12 9.12 0 006.24-1.84 6.08 6.08 0 002.08-4.72 6.4 6.4 0 00-2.08-4.96zM297.18 164.54a7.04 7.04 0 00-4.96-1.52h-26.88l25.2-28.16 2.4-2.64 1.52-1.84a8.4 8.4 0 001.04-1.92c.3-.74.47-1.52.48-2.32a4.8 4.8 0 00-2.32-4.64c-2.1-.97-4.4-1.4-6.72-1.28h-31.68a6.96 6.96 0 00-4.64 1.44 4.72 4.72 0 00-1.68 3.76c0 2.13.72 3.47 2.16 4 2.09.58 4.25.82 6.4.72h20.48c-.8 1.2-1.92 2.56-3.36 4.24l-5.28 5.92-6.88 8-8 9.12c-2.88 3.2-4.77 5.39-5.68 6.56a6 6 0 00.56 8 8.64 8.64 0 005.84 1.68h37.12a7.28 7.28 0 004.96-1.44 4.88 4.88 0 001.6-3.76 5.12 5.12 0 00-1.68-3.92zM381.1 119.58a8.88 8.88 0 00-6.16-1.92H341.1l31.6-35.28 2.96-3.28 1.92-2.32c.53-.74.96-1.55 1.28-2.4a8 8 0 00.56-2.88 6 6 0 00-2.96-5.76 17.85 17.85 0 00-8.4-1.6h-39.68a8.64 8.64 0 00-5.84 1.76 5.92 5.92 0 00-2.08 4.72c0 2.72.91 4.37 2.72 4.96 2.6.74 5.3 1.06 8 .96h25.6a86.75 86.75 0 01-4.16 5.28l-6.64 7.52-8.64 9.6-10.32 11.44c-3.57 4-5.92 6.66-7.04 8a7.52 7.52 0 00.72 10.32 10.88 10.88 0 007.36 2.16h46.64a9.12 9.12 0 006.4-1.6 6.08 6.08 0 002.08-4.72 6.4 6.4 0 00-2.08-4.96z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M353.5 254.3a8 8 0 00-8.8-1.84c-86.7 35.9-186.1-5.3-221.99-92a169.92 169.92 0 013.03-136.88 8 8 0 00-10.32-10.8C20.36 51.83-25.04 160.54 14 255.6s147.77 140.46 242.83 101.41a186.08 186.08 0 0098.12-93.84 8 8 0 00-1.45-8.88zM186.22 355.1c-93.97-.02-170.14-76.21-170.13-170.2a170.16 170.16 0 0187.33-148.6 183.42 183.42 0 00-9.6 58.8c0 102.81 83.36 186.15 186.17 186.15 17.23 0 34.38-2.4 50.95-7.11a170.8 170.8 0 01-144.72 80.96z')
								]),
							_List_Nil)
						]));
			case 'Icon_PaperPlane':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M507 1.3a10 10 0 00-10 0L313.6 109.9a10 10 0 1010.1 17.2l131.5-77.8-244.9 254.1-121.8-37.2 159-94a10 10 0 00-10.2-17.2L58.9 260.4a10 10 0 002.2 18.2L206.5 323l64.2 116.8.2.3a10 10 0 0015.6 2l73.8-72.1L499 412.6A10 10 0 00512 403V10c0-3.6-2-7-5-8.7zm-235.7 328a10 10 0 00-1.8 5.6v61.2l-43.8-79.8 193.9-201.2-148.3 214.1zm18.2 82v-62.9l49 15-49 48zM492 389.5l-196.5-60.1L492 45.7v343.8z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M164.4 347.6a10 10 0 00-14.1 0l-93.4 93.3a10 10 0 0014.2 14.2l93.3-93.4a10 10 0 000-14.1zM40 472a10 10 0 00-14 0L3 495a10 10 0 0014 14l23-23c4-3.8 4-10.2 0-14zM142.6 494.3a10 10 0 00-14 0 10 10 0 000 14.2 10 10 0 0014 0 10 10 0 000-14.2zM217 420a10 10 0 00-14 0l-49.5 49.4a10 10 0 0014.1 14.1l49.5-49.4a10 10 0 000-14.2zM387.7 416.1a10 10 0 00-14.1 0L324 465.7A10 10 0 00338 480l49.6-49.6a10 10 0 000-14.2zM283.5 136.3a10 10 0 00-14.1 0 10 10 0 007 17 10 10 0 007.1-17z')
								]),
							_List_Nil)
						]));
			case 'Icon_Seo':
				return _Utils_Tuple2(
					'0 0 770 770',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M413.9 85.3a12.8 12.8 0 100 25.6 12.8 12.8 0 000-25.6zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M449.8 2.5a8.5 8.5 0 00-12.1 0l-68.3 68.3a8.5 8.5 0 00-2.5 6v59.7c0 4.7 3.9 8.6 8.6 8.6h59.7c2.3 0 4.4-1 6-2.5l68.3-68.3a8.5 8.5 0 000-12zM431.7 128H384V80.3l59.7-59.7 47.7 47.7zm0 0M8.5 290.1h25.6v1.1a33 33 0 0025.6 32.1v77.8c0 4.7 3.9 8.5 8.6 8.5h51.2c4.7 0 8.5-3.8 8.5-8.5v-34.2h8.6c14 0 25.5-11.4 25.5-25.5v-18a33 33 0 0023.6-21l143.6 63.8a8.5 8.5 0 0012-7.8V153.6a8.5 8.5 0 00-12-7.8l-143.6 63.9a33 33 0 00-31-22H67.2a33 33 0 00-33 33v1.2H8.4a8.5 8.5 0 00-8.5 8.5v51.2c0 4.7 3.8 8.5 8.5 8.5zM290.1 182l34.2-15.2v178.6L290 330zm-102.4 45.5l85.4-38v133.2l-85.4-38zm-76.8 131v34.1H76.8v-68.2h34.1zm34.2-17c0 4.7-3.8 8.5-8.5 8.5H128v-25.6h17zm-93.9-59.8v-60.8a16 16 0 0116-16h87.5a16 16 0 0116 16v70.4a16 16 0 01-16 16H67.2a16 16 0 01-16-16zm-34.1-42.7h17v34.2h-17zm0 0M425 335.5a8.5 8.5 0 00-12 0L352.6 396a8.5 8.5 0 000 12l84.5 84.5a8.5 8.5 0 0012 0l60.4-60.3a8.5 8.5 0 000-12zm56.1 80.3L433 412l-3.7-48.2zm-38 58.5L370.7 402l41.2-41.2 4.6 60a8.5 8.5 0 007.9 7.8l60 4.6zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M230.4 162.1a59.6 59.6 0 0047.8-95.4l52.1-52.1-12-12.1L266 54.6a59.7 59.7 0 10-35.7 107.5zm0-102.4a42.7 42.7 0 110 85.4 42.7 42.7 0 010-85.4zm0 0M367 298.7h42.6v8.5c0 4.7 3.8 8.5 8.5 8.5h68.3c4.7 0 8.5-3.8 8.5-8.5v-42.5c0-14.5-9.2-27.4-22.8-32.2a34.1 34.1 0 10-39.6 0c-5.5 2-10.5 5.3-14.3 9.7-3-3.4-6.6-6.2-10.7-8.2a25.6 25.6 0 10-30 0 34 34 0 00-19.1 30.5v25.6c0 4.7 3.8 8.6 8.5 8.6zm85.3-111a17 17 0 110 34.2 17 17 0 010-34.2zm-25.6 102.4v-25.4c0-9.5 7.7-17.2 17.2-17.2h16.7c9.5 0 17.3 7.7 17.3 17.2v34h-51.2zm-34.2-85.3a8.5 8.5 0 110 17 8.5 8.5 0 010-17zm-17 59.7a17 17 0 1134.1 0v17.1h-34.1zm0 0M239 349.9h-34.2c-2.3 0-4.4.9-6 2.5l-51.2 51.2a8.5 8.5 0 000 12l93.8 93.9a8.5 8.5 0 0012.1 0l68.3-68.3a8.5 8.5 0 000-12L245 352.4a8.5 8.5 0 00-6-2.5zm8.5 141.5l-81.8-81.8 42.6-42.7h27.1l68.3 68.3zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M198.8 420.6l34.1-34.1 12 12-34 34.2zm0 0M224.4 446.2l34.1-34.1 12 12-34 34.2zm0 0')
								]),
							_List_Nil)
						]));
			case 'Icon_Internet':
				return _Utils_Tuple2(
					'0 0 58 58',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M50.7 48.2a28.9 28.9 0 00-.6-39 29 29 0 00-20-9.2H28A28.9 28.9 0 007.3 48.2v.1A29 29 0 0028 58h2a29 29 0 0020.6-9.7zM2 30h12a37 37 0 002.4 12.2c-2.8 1-5.5 2.4-8 4.1C4.5 42 2.2 36.3 2 30zM9 11c2.5 1.6 5.1 3 7.9 3.9A37 37 0 0014 28H2c.3-6.5 2.8-12.4 6.9-17zm47 17H44c0-4.6-1-9-2.7-13.1 2.8-1 5.4-2.3 8-3.9 4 4.6 6.5 10.5 6.8 17zM28 15a35 35 0 01-8.5-1.3c2-4.2 5-8 8.5-11V15zm0 2v11H16a35 35 0 012.7-12.5A37 37 0 0028 17zm2 0a37 37 0 009.3-1.5A35 35 0 0142 28H30V17zm0-2V2.6a35 35 0 018.5 11A35 35 0 0130 15zm10.4-2a37 37 0 00-7.9-10.8 27 27 0 0115.2 7.4 34.8 34.8 0 01-7.3 3.5zm-22.8 0c-2.6-.8-5-2-7.3-3.4a27 27 0 0115.2-7.4 37 37 0 00-8 10.9zM16 30h12v10c-3.3.1-6.5.6-9.7 1.6A35 35 0 0116 30zm12 12v13.4a35 35 0 01-8.9-12C22 42.6 25 42.1 28 42zm2 13.4V42c3 .1 6 .6 8.9 1.4a35 35 0 01-8.9 12zM30 40V30h12c-.1 4-1 8-2.3 11.6-3.2-1-6.4-1.5-9.7-1.6zm14-10h12a26.9 26.9 0 01-6.3 16.3 36.9 36.9 0 00-8.1-4A37 37 0 0044 30zM9.7 47.8c2.4-1.5 4.9-2.8 7.5-3.7 2 4.3 4.7 8.3 8.3 11.7a27 27 0 01-15.8-8zm22.8 8c3.6-3.4 6.3-7.4 8.3-11.7 2.6 1 5.1 2.2 7.5 3.7a27 27 0 01-15.8 8z')
								]),
							_List_Nil)
						]));
			case 'Icon_Email':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M486.4 59.7H25.6A25.6 25.6 0 000 85.3v341.4a25.6 25.6 0 0025.6 25.6h460.8a25.6 25.6 0 0025.6-25.6V85.3a25.6 25.6 0 00-25.6-25.6zm8.5 367c0 4.7-3.8 8.5-8.5 8.5H25.6a8.5 8.5 0 01-8.5-8.5V85.3c0-4.7 3.8-8.5 8.5-8.5h460.8c4.7 0 8.5 3.8 8.5 8.5v341.4z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M470 93.9c-2.2-.2-4.4.5-6.2 2L267 261.2a17 17 0 01-22 0L48.2 96a8.5 8.5 0 00-11 13L234 274.3a34 34 0 0044 0l196.8-165.4a8.5 8.5 0 00-4.7-15zM164.1 273.1c-3-.6-6.1.4-8.2 2.7l-119.5 128A8.5 8.5 0 1049 415.4l119.5-128a8.5 8.5 0 00-4.3-14.3zM356.1 275.8a8.5 8.5 0 10-12.5 11.6l119.5 128a8.5 8.5 0 0012.5-11.6L356 275.8z')
								]),
							_List_Nil)
						]));
			case 'Icon_WaveHand':
				return _Utils_Tuple2(
					'0 0 297.7 297.7',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M40.2 77a37.1 37.1 0 0137-37 6 6 0 000-12c-27 0-49 22-49 49a6 6 0 0012 0z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M77.3 12a6 6 0 000-12C34.8 0 .2 34.6.2 77a6 6 0 0012 0c0-35.8 29.2-65 65-65zM220.4 28a6 6 0 000 12 37.1 37.1 0 0137.1 37 6 6 0 0012 0c0-27-22-49-49-49z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M220.4 0a6 6 0 000 12c36 0 65.1 29.2 65.1 65a6 6 0 0012 0c0-42.4-34.6-77-77-77zM227.5 80.6c-1 0-1.8 0-2.8.2a23 23 0 00-11.2 4.3v-5.2A25.6 25.6 0 00188.1 54c-5.2 0-10.2 1.6-14.4 4.5A25.5 25.5 0 00148.4 35a25.2 25.2 0 00-25.3 23.8 25 25 0 00-14.4-4.6 26 26 0 00-26.2 25.4v86L77 160a24.9 24.9 0 00-35.3.1 25.3 25.3 0 00-.6 35l53.9 71 1.1 15.3c.7 9.1 8.5 16.3 17.6 16.3h98.5c8.8 0 16.3-6.7 17.4-15.4l2.4-18.2a138 138 0 0016.3-48.2c3-17.3 4.2-37.8 4.2-61v-49a25 25 0 00-25-25.3zm-9.8 200.1c-.3 2.8-2.7 5-5.5 5l-98.5.2c-3 0-5.4-2.4-5.6-5.3l-1.4-18.8-56.4-74.5a13.3 13.3 0 019.4-22.6c3.4 0 6.8 1.3 9.3 3.9l15.9 15c1.2 1.1 2.3 1.7 3.8 1.7 3.2 0 5.8-2.5 5.8-6.2V79.5a13.8 13.8 0 0115.3-13.3c6.8.8 11.7 6.8 11.7 13.7v68.6c0 3.6 3 6.5 6.5 6.5 3.6 0 6.5-3 6.5-6.6V60.2A13.6 13.6 0 01149.7 47c6.8.8 11.8 6.9 11.8 13.7v87.8c0 3.6 3 6.6 6.6 6.6 3.5 0 6.4-3 6.4-6.5v-69a13.5 13.5 0 0115.2-13.3c6.8.8 11.8 6.8 11.8 13.7v68.4c0 3.7 3 6.6 6.7 6.6h.1c3.4 0 6.2-2.7 6.2-6.1v-42.4c0-6.9 5-13 11.8-13.7l1.2-.1c7.4 0 13 6 13 13.4v49c0 41.8-4.7 80.4-19.7 103.8-.5.7-.6 1.5-.7 2.4l-2.4 19.5z')
								]),
							_List_Nil)
						]));
			case 'Icon_Sunrise':
				return _Utils_Tuple2(
					'0 0 64 64',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M54 56c-2.2 0-4.27.86-5.83 2.41l-.76.76a6.2 6.2 0 01-8.82 0l-.76-.76C36.27 56.86 34.2 56 32 56s-4.27.86-5.83 2.41l-.76.76a6.2 6.2 0 01-8.82 0l-.76-.76C14.27 56.86 12.2 56 10 56s-4.27.86-5.83 2.41L1.3 61.3l1.42 1.42 2.88-2.88a6.2 6.2 0 018.82 0l.76.76C16.73 62.14 18.8 63 21 63s4.27-.86 5.83-2.41l.76-.76a6.2 6.2 0 018.82 0l.76.76C38.73 62.14 40.8 63 43 63s4.27-.86 5.83-2.41l.76-.76a6.2 6.2 0 018.82 0l2.88 2.88 1.42-1.42-2.88-2.88A8.19 8.19 0 0054 56zM31 1h2v14h-2zM63 41v-2H52.95c-.53-11.11-9.7-20-20.95-20s-20.42 8.89-20.95 20H1v2h10.04a20.8 20.8 0 001.76 7.5 8.24 8.24 0 00-8.63 1.91L1.3 53.3l1.42 1.42 2.88-2.88a6.2 6.2 0 018.82 0l.76.76C16.73 54.14 18.8 55 21 55s4.27-.86 5.83-2.41l.76-.76a6.2 6.2 0 018.82 0l.76.76C38.73 54.14 40.8 55 43 55s4.27-.86 5.83-2.41l.76-.76a6.2 6.2 0 018.82 0l2.88 2.88 1.42-1.42-2.88-2.88a8.19 8.19 0 00-8.63-1.91 20.8 20.8 0 001.76-7.5zM38.59 51.17l-.76-.76C36.27 48.86 34.2 48 32 48s-4.27.86-5.83 2.41l-.76.76a6.2 6.2 0 01-8.68.13A19.02 19.02 0 0132 21a19.02 19.02 0 0115.27 30.3 6.2 6.2 0 01-8.68-.13zM1.3 10.7l1.4-1.4 13 13-1.41 1.4zM48.29 22.3l13-13 1.4 1.41-12.99 13zM18.13 10.5l1.73-1 4 7-1.74 1zM40.12 16.51l4-7 1.74 1-4 7z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M1.64 28.93l.7-1.88 8 3-.7 1.87zM53.63 30.06l8-3 .7 1.87-8 3z')
								]),
							_List_Nil)
						]));
			case 'Icon_Sunset':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M0 290.13h512v17.07H0zM324.27 341.33h102.4v17.07h-102.4zM162.13 341.33H307.2v17.07H162.13zM85.33 341.33h59.73v17.07H85.33zM230.4 392.53h162.13v17.07H230.4zM119.47 392.53h93.87v17.07h-93.87zM196.27 443.73h170.67v17.07H196.27zM145.07 443.73h34.13v17.07h-34.13zM187.73 494.93h136.53V512H187.73z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M420.32 159.1c-39.4-90.6-145.18-132.25-235.8-92.84-90.61 39.42-132.26 145.2-92.85 235.8l15.65-6.8a161.07 161.07 0 01-2.18-124.07c15.86-40.3 46.47-72 86.19-89.28 81.97-35.66 177.68 2.02 213.35 84a162.6 162.6 0 010 129.34l15.65 6.82a179.74 179.74 0 00-.01-142.97zM34.13 13.56A49.4 49.4 0 000 0v17.07c8.71 0 16.9 3.38 23.07 9.53l5.03 5.03a8.51 8.51 0 0012.07 0l5.02-5.02a32.46 32.46 0 0123.08-9.54V0C55.47 0 43.4 4.8 34.13 13.56zM59.73 73.3A49.4 49.4 0 0025.6 59.72V76.8c8.71 0 16.9 3.39 23.07 9.53l5.03 5.04a8.51 8.51 0 0012.07 0l5.02-5.03a32.46 32.46 0 0123.08-9.54V59.73c-12.8 0-24.86 4.8-34.14 13.56zM119.47 30.63a49.4 49.4 0 00-34.14-13.56v17.06c8.72 0 16.9 3.4 23.07 9.54l5.04 5.03a8.51 8.51 0 0012.06 0l5.03-5.03a32.46 32.46 0 0123.07-9.54V17.07c-12.8 0-24.86 4.8-34.13 13.56z')
								]),
							_List_Nil)
						]));
			case 'Icon_Training':
				return _Utils_Tuple2(
					'0 0 770 770',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M120 32h80v16h-80zm0 0M144 96h-16v88h-16v-64H96v64H80v-40H64v40H48v16h112v-16h-16zm0 0M48 216h16v16H48zm0 0M80 216h80v16H80zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M472 328c13 0 24-11 24-24V181c0-16-12-30-27-32l-29-4v-13c10-9 16-22 16-36V80a48 48 0 00-96 0v16c0 14 6 27 16 36v13l-45 6-27-31V80h16V32h-85L203 0h-86L85 32H0v48h16v192H0v48h80v22L27 480H0v16h496v-16h-32V327l8 1zm-56-99l-8 8-8-8 7-53h2zM376 80a32 32 0 0164 0v16a32 32 0 01-64 0zm32 64c6 0 11-1 16-3v9c-2 3-7 10-16 10s-14-7-16-10v-9c5 2 10 3 16 3zm-28 17c2 3 6 7 12 10l-8 64 24 24 24-24-8-64c6-3 10-7 12-10l30 4c8 1 14 8 14 16v123a8 8 0 01-16 0V192h-16v80h-80v-80h-48c-3 0-5-1-7-3l-55-69-2-6v-1a9 9 0 0115-6l54 62zM136 352v128H76l49-128zm16 0h16v128h-16zm32 0h11l49 128h-60zm28 0h15l49 128h-15zm28-10v-22h80v-48h-16v-70c4 4 10 6 16 6h32v272h-59zm128-54h32v192h-32zM16 48h75l32-32h74l32 32h75v16H16zm16 32h256v22l-5-6a25 25 0 00-43 17v1c0 6 2 11 5 16l43 53v89H32zM16 288h288v16H16zm208 32v16H96v-16zM93 352h15L59 480H44zm323 128V288h32v192zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M224 160a48 48 0 100 96 48 48 0 000-96zm-8 17v23h-23c3-11 12-20 23-23zm-23 39h23v23c-11-3-20-12-23-23zm39 23v-62a32 32 0 010 62zm0 0')
								]),
							_List_Nil)
						]));
			case 'Icon_Startup':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$circle,
							_List_fromArray(
								[
									$elm$svg$Svg$Attributes$cx('10.1'),
									$elm$svg$Svg$Attributes$cy('500.4'),
									$elm$svg$Svg$Attributes$r('10.1')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$circle,
							_List_fromArray(
								[
									$elm$svg$Svg$Attributes$cx('267'),
									$elm$svg$Svg$Attributes$cy('245.3'),
									$elm$svg$Svg$Attributes$r('10')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M398.5 118a42.4 42.4 0 00-60.5 0 42.8 42.8 0 1060.5 0zm-14.2 46.3a22.7 22.7 0 11-32-32.1 22.7 22.7 0 0132 32zM125.4 411.4A10 10 0 00112 416l-12 24a33.1 33.1 0 01-27.2 18.2l-14 1c-2.3.1-3.8-1-4.5-1.8s-2-2.2-1.8-4.6l1-13.9a33.1 33.1 0 0118.2-27.3l24-12a10 10 0 10-9-18l-24 12a53.3 53.3 0 00-29.2 44l-1 13.8a26 26 0 0027.8 27.8l13.9-1A53.3 53.3 0 00118 449l12-24c2.4-5 .4-11-4.6-13.4z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M505 8.2c-4.6-4.7-11.1-7-17.7-6.7l-9.4.6a303 303 0 00-215.2 111l-22 27.1-57.6-1.7h-.3c-45.6 0-88.6 17.8-120.9 50.1l-59 59a10 10 0 006.6 17.1l124.9 6.4-5.1 6.3a10 10 0 00-1 11.1c2 3.6 4 7.2 6.1 10.6l-29.6 35.2a10 10 0 00-1.4 10.8 131.5 131.5 0 0062.8 62.7 10 10 0 0010.6-1.3c6.4-5.1 13.7-11.3 20.8-17.2l15.1-12.6c3 1.8 5.9 3.5 8.8 5a10 10 0 0011-.8l6.8-5.3 6.5 125.4a10 10 0 0017.1 6.5l59-59c32.3-32.2 50-75.2 50-120.8v-55l23.3-18a301.7 301.7 0 00116.5-224l.3-4.8c.3-6.6-2.2-13-7-17.7zM33.2 245.8l43-43a150 150 0 01106.6-44.2l42 1.3-74.6 92-117-6zm151.7 128c-5.3 4.4-10.6 9-15.6 13a110.8 110.8 0 01-44.8-44.7l21.7-25.7a232.8 232.8 0 0049.2 48.7l-10.5 8.8zm167-46.1c0 40.3-15.6 78.2-44.1 106.7l-43 43-6-116.8 93.2-72.3v39.4zm139.9-298a281.7 281.7 0 01-108.8 209L225.5 361c-13.1-7.6-25.3-16.6-36.4-26.8l53-53a10 10 0 00-14.1-14.3l-53 53a212.6 212.6 0 01-25.8-35l129.1-159a282.8 282.8 0 01201-103.6l9.3-.6a3.2 3.2 0 013.3 3.3l-.2 4.9z')
								]),
							_List_Nil)
						]));
			case 'Icon_Fireworks':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M288.7 244.3L268 231.5l5.8-23.6a7.5 7.5 0 00-10.8-8.4l-21.4 11.6-17.5-16.9a7.5 7.5 0 00-12.7 5.2l-.7 24.3-23.3 6.8a7.5 7.5 0 00-1.9 13.6l20.7 12.7-5.8 23.6a7.5 7.5 0 0010.8 8.4l21.4-11.6 17.5 16.9a7.5 7.5 0 0012.7-5.2l.7-24.3 23.3-6.7a7.5 7.5 0 001.9-13.6zm-34.7 7.4a7.5 7.5 0 00-5.4 7l-.3 12.8-9.2-9a7.5 7.5 0 00-8.8-1.1l-11.3 6 3.1-12.3c.8-3.2-.6-6.5-3.3-8.2l-11-6.7 12.3-3.6a7.5 7.5 0 005.5-7l.3-12.8 9.2 9c2.4 2.2 6 2.7 8.8 1.1l11.3-6-3.1 12.3c-.8 3.2.5 6.5 3.3 8.2l11 6.7-12.4 3.6zM168.4 211L95 186a7.5 7.5 0 10-4.9 14.2l73.5 25a7.5 7.5 0 104.8-14.2zM223.5 164.2L195.8 69a7.5 7.5 0 00-14.4 4.2l27.7 95.2a7.5 7.5 0 0014.4-4.2zM354.6 92.5c-3.3-2.6-8-2-10.5 1.3l-63.9 82.4a7.5 7.5 0 1011.9 9.2l63.8-82.4c2.5-3.3 2-8-1.3-10.5zM271.5 89.8c-4-.9-8 1.7-9 5.7L243.3 182a7.5 7.5 0 1014.6 3.3L277 98.8c1-4-1.6-8-5.6-9zM194 184.3l-38-42.7a7.5 7.5 0 00-11.2 10l38 42.7a7.5 7.5 0 0010.5.6 7.5 7.5 0 00.6-10.6zM169 249.5c-.4-4-4-7.2-8.1-6.8l-43.2 3.4a7.5 7.5 0 001.2 15l43.2-3.5c4.1-.3 7.2-4 6.9-8zM198.1 20.6a23.6 23.6 0 10-4.7 17.4c3.8-5 5.5-11.2 4.7-17.4zm-16.6 8.1a8.5 8.5 0 01-12 1.6 8.5 8.5 0 01-1.5-12 8.5 8.5 0 0113.5 10.4zM69 174a23.4 23.4 0 00-26.3-20.3A23.4 23.4 0 0022.4 180a23.4 23.4 0 0026.3 20.4A23.4 23.4 0 0069 174.1zm-16.5 8.3a8.5 8.5 0 01-12 1.5 8.5 8.5 0 01-1.5-12 8.5 8.5 0 0112-1.5 8.5 8.5 0 011.5 12zM393.8 41.8a23.4 23.4 0 00-33 4.2 23.4 23.4 0 004.2 33 23.4 23.4 0 0033-4.2c8-10.3 6.1-25.1-4.2-33zm-7.6 23.8A8.5 8.5 0 11372.7 55a8.5 8.5 0 0113.5 10.5zM329 367.2l-42.7-64.8a7.5 7.5 0 00-12.5 8.2l42.7 64.8a7.5 7.5 0 1012.5-8.2zM417 240.3l-99-3a7.5 7.5 0 00-.5 15l99 3h.3a7.5 7.5 0 00.2-15zM378 172.3a7.5 7.5 0 00-10.2-3.3L289 209.3a7.5 7.5 0 006.8 13.3l79-40.2a7.5 7.5 0 003.2-10.1zM356.6 297l-50.8-26a7.5 7.5 0 00-6.8 13.3l50.8 26a7.5 7.5 0 0010-3.2c2-3.7.5-8.2-3.2-10.1zM265.1 360.2l-7.5-42.6a7.5 7.5 0 00-14.8 2.5l7.5 42.7a7.5 7.5 0 1014.8-2.6zM480.7 230.7a23.4 23.4 0 00-33 4.2 23.4 23.4 0 004.2 33 23.4 23.4 0 0033-4.2c8-10.2 6-25-4.2-33zm-7.7 23.8a8.5 8.5 0 01-12 1.6 8.5 8.5 0 01-1.4-12 8.5 8.5 0 0112-1.5 8.5 8.5 0 011.4 12zM364.3 394a23.6 23.6 0 10-28.8 37.3 23.6 23.6 0 0028.8-37.2zm-7.6 23.9a8.5 8.5 0 01-12 1.5 8.5 8.5 0 1112-1.5zM186 298.7a7.5 7.5 0 00-10.6.2c-3.7 3.8-91.8 95.5-133 203a7.5 7.5 0 0014 5.3c40.1-104.5 128.9-197 129.8-197.9 2.9-3 2.8-7.7-.2-10.6z')
								]),
							_List_Nil)
						]));
			case 'Icon_AlarmClock':
				return _Utils_Tuple2(
					'0 0 58.15 58.15',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M40.08 29.15h-7.15a4 4 0 00-2.85-2.85V16.14a1 1 0 10-2 0V26.3a4 4 0 104.85 4.86h7.15a1 1 0 100-2zm-11 3a2 2 0 110-4 2 2 0 010 4z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M50.19 9.76l4.1 4.1a1 1 0 001.4 0A8.13 8.13 0 0044.22 2.38a1 1 0 000 1.4l4.56 4.57-1.7 1.7a26.89 26.89 0 00-36 0l-1.7-1.7 4.57-4.56a1 1 0 000-1.42A8.13 8.13 0 002.46 13.87a1 1 0 001.4 0l4.1-4.1 1.68 1.68a26.9 26.9 0 00-7.56 18.71c0 9.9 5.35 18.57 13.32 23.27l-3.03 3.03a1 1 0 101.41 1.41l3.45-3.45a26.83 26.83 0 0023.69 0l3.45 3.45a1 1 0 001.41 0 1 1 0 000-1.41l-3.02-3.03a27.01 27.01 0 0013.32-23.27 26.9 26.9 0 00-7.57-18.71l1.68-1.68zm4.1-5.97a6.13 6.13 0 01.64 7.9L46.4 3.13a6.13 6.13 0 017.9.65zm-51.07 7.9a6.13 6.13 0 018.54-8.55l-8.54 8.54zm25.86 43.46c-13.79 0-25-11.21-25-25s11.21-25 25-25 25 11.22 25 25-11.22 25-25 25z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M29.08 10.03a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM29.08 50.03a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM50.08 31.03h1a1 1 0 100-2h-1a1 1 0 100 2zM8.08 29.03h-1a1 1 0 100 2h1a1 1 0 100-2zM43.93 13.77l-.71.7a1 1 0 101.41 1.42l.71-.7a1 1 0 10-1.41-1.42zM13.52 44.17l-.7.71a1 1 0 101.4 1.41l.71-.7a1 1 0 10-1.41-1.42zM44.63 44.17a1 1 0 10-1.41 1.42l.7.7a1 1 0 001.42 0 1 1 0 000-1.4l-.7-.72zM14.23 13.77a1 1 0 10-1.42 1.41l.71.7a1 1 0 001.41 0 1 1 0 000-1.4l-.7-.71z')
								]),
							_List_Nil)
						]));
			case 'Icon_Conversation':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M346 319a10 10 0 00-10 10v69c0 27.57-22.43 50-50 50H178.03a10 10 0 00-10 10l-.01 19.87-23.87-23.86a10 10 0 00-9.17-6.01H70c-27.57 0-50-22.43-50-50V244c0-27.57 22.43-50 50-50h101a10 10 0 000-20H70c-38.6 0-70 31.4-70 70v154c0 38.6 31.4 70 70 70h59.86l41.07 41.07a10 10 0 0017.07-7.06l.02-34.01H286c38.6 0 70-31.4 70-70v-69a10 10 0 00-10-10z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M366.65 0h-25.3C261.2 0 196 65.2 196 145.35s65.2 145.34 145.34 145.34h25.31c12.51 0 24.9-1.59 36.9-4.73l37.38 37.37a10 10 0 0017.07-7.07V258.4a146.74 146.74 0 0038.2-47.1 143.78 143.78 0 0015.8-65.95C512 65.2 446.8 0 366.65 0zm75.33 245.53a10 10 0 00-3.98 8v38.6l-24.47-24.47a10 10 0 00-10-2.48 125.38 125.38 0 01-36.87 5.51h-25.31C272.23 270.7 216 214.46 216 145.35S272.23 20 341.35 20h25.3C435.78 20 492 76.23 492 145.35c0 39.73-18.23 76.25-50.02 100.19z')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M399.03 109.42a42.43 42.43 0 00-39.25-39.25 42.01 42.01 0 00-31.86 11.28 42.49 42.49 0 00-13.46 30.95 10 10 0 0020 0c0-6.26 2.52-12.06 7.1-16.33a22.35 22.35 0 0137.52 14.73 22.24 22.24 0 01-17.37 23.4 18.92 18.92 0 00-14.91 18.55v24.02a10 10 0 0020 0v-23.22a42.12 42.12 0 0032.23-44.13zM363.87 209.26c-1.86-1.86-4.44-2.93-7.07-2.93s-5.21 1.07-7.07 2.93a10.08 10.08 0 00-2.93 7.07c0 2.64 1.07 5.22 2.93 7.08 1.86 1.86 4.44 2.92 7.07 2.92s5.21-1.06 7.07-2.92a10.1 10.1 0 002.93-7.08c0-2.63-1.07-5.21-2.93-7.07zM275 310H64a10 10 0 000 20h211a10 10 0 100-20zM282.07 368.93c-1.86-1.86-4.44-2.93-7.07-2.93s-5.21 1.07-7.07 2.93c-1.86 1.86-2.93 4.44-2.93 7.07s1.07 5.21 2.93 7.07c1.86 1.86 4.44 2.93 7.07 2.93s5.21-1.07 7.07-2.93A10.05 10.05 0 00285 376c0-2.63-1.07-5.21-2.93-7.07zM235.67 366H64a10 10 0 000 20h171.67a10 10 0 100-20zM210 254H64a10 10 0 000 20h146a10 10 0 100-20z')
								]),
							_List_Nil)
						]));
			case 'Icon_Sun':
				return _Utils_Tuple2(
					'0 0 397.4 397.4',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M173.6 97.8l-22-22.2a7.3 7.3 0 10-10.2 10.2l21.9 22.2a7.3 7.3 0 0010.3-10.2zM359 76.8a7.3 7.3 0 00-11 0l-22.1 21.8A7.3 7.3 0 10336 109L358 87c3.2-2.5 3.6-7.1 1-10.2zM227.3 72.2l-.2-.6-8-30a7.2 7.2 0 10-14 3.6l8 30a7.2 7.2 0 0014.2-3zM326.7 227.1l-4.2-4 1.2-2.1a83 83 0 00-42.2-116.3l-.2-.2a83 83 0 00-103 36 94.3 94.3 0 00-119.6 91.1v3.8a63.2 63.2 0 004 126.2H271a78.8 78.8 0 0055.8-134.5zm-101.4-109a68.4 68.4 0 0185.4 96.1v.6a78.8 78.8 0 00-66.1-6 94.2 94.2 0 00-23.9-42.8c8.1-15 26.1-21.6 42-15.4a7.2 7.2 0 005.4-13.5 48 48 0 00-58.6 19.1 94.5 94.5 0 00-17.6-10.4 68.4 68.4 0 0133.4-27.8zM286 345.2c-5 1.2-10 1.8-15 1.7H63a48.7 48.7 0 01-34.5-83 48.5 48.5 0 0134.3-14.2H66.3a7.2 7.2 0 007.6-8.6l-.4-4.6v-5a79.8 79.8 0 01158.4-11.8 7.2 7.2 0 0010.4 5.5 64.3 64.3 0 1143.8 120zM397 145.4a7.2 7.2 0 00-8.3-5l-30.1 8a7.2 7.2 0 103.6 14l30-8c4-1.1 6-5.2 4.9-9zM392 216.2l-30-8.2a7.3 7.3 0 10-4 14l30 8.1a7.3 7.3 0 104-14zM289.8 36.7a7.3 7.3 0 00-9 5l-8.2 30a7.2 7.2 0 005 9 7.2 7.2 0 009.1-5l8-30a7.3 7.3 0 00-5-9z')
								]),
							_List_Nil)
						]));
			case 'Icon_Videos':
				return _Utils_Tuple2(
					'0 0 310 310',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M298 65c-11-14-32-19-71-19H83c-40 0-61 6-72 20S0 100 0 128v54c0 54 13 82 83 82h144c34 0 53-5 65-16 13-12 18-32 18-66v-54c0-30-1-50-12-63zm-99 97l-65 34a10 10 0 01-15-8v-68a10 10 0 0115-9l65 34a10 10 0 010 17z')
								]),
							_List_Nil)
						]));
			case 'Icon_VideosOutline':
				return _Utils_Tuple2(
					'0 -62 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M335 171l-113-62c-7-3-14-3-21 0-6 4-10 11-10 18v123a21 21 0 0021 21l10-3 113-60a21 21 0 000-37zm-114 64v-92l84 46zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M508 92v-1c0-4-5-40-22-59a83 83 0 00-58-26h-1c-68-5-170-6-171-6S153 1 84 6h-1-2c-11 1-34 4-55 27C9 51 4 87 4 91v1c0 1-4 42-4 83v38c0 41 4 82 4 84 0 4 5 40 22 59 20 21 44 24 57 25l5 1h2c39 4 161 6 166 6h1c1 0 103-1 171-6h3c11-1 34-4 55-26 17-19 22-55 22-59 0-2 4-43 4-84v-38c0-41-4-82-4-83zm-26 121c0 38-3 77-4 81-1 10-6 33-14 42a49 49 0 01-36 16h-3a3222 3222 0 01-332 0h-6c-11-2-27-4-39-16v-1c-8-8-13-29-14-41-1-3-4-42-4-81v-38c0-38 3-77 4-81 1-11 6-32 14-41 13-15 27-16 37-17l2-1a3233 3233 0 01337 0l3 1c9 1 24 3 37 16v1c8 8 13 30 14 41 1 3 4 43 4 81zm0 0')
								]),
							_List_Nil)
						]));
			case 'Icon_QRCodeSmall':
				return _Utils_Tuple2(
					'0 0 512 512',
					_List_fromArray(
						[
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M296 286a10 10 0 100-20 10 10 0 000 20zm0 0M76 286a10 10 0 100-20 10 10 0 000 20zm0 0M10 126c6 0 10-4 10-10V20h96a10 10 0 100-20H10C4 0 0 4 0 10v106c0 6 4 10 10 10zm0 0M126 502c0-6-4-10-10-10H20v-96a10 10 0 10-20 0v106c0 6 4 10 10 10h106c6 0 10-4 10-10zm0 0M502 386c-6 0-10 4-10 10v96h-96a10 10 0 100 20h106c6 0 10-4 10-10V396c0-6-4-10-10-10zm0 0M502 0H396a10 10 0 100 20h96v96a10 10 0 1020 0V10c0-6-4-10-10-10zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M66 436c0 6 4 10 10 10h100c6 0 10-4 10-10V336c0-6-4-10-10-10H76c-6 0-10 4-10 10zm20-90h80v80H86zm0 0M176 66H76c-6 0-10 4-10 10v100c0 6 4 10 10 10h100c6 0 10-4 10-10V76c0-6-4-10-10-10zm-10 100H86V86h80zm0 0M446 76c0-6-4-10-10-10H336c-6 0-10 4-10 10v100c0 6 4 10 10 10h100c6 0 10-4 10-10zm-20 90h-80V86h80zm0 0M446 436V336c0-6-4-10-10-10H336c-6 0-10 4-10 10v100c0 6 4 10 10 10h100c6 0 10-4 10-10zm-20-10h-80v-80h80zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M136 366h-20c-6 0-10 4-10 10v20c0 6 4 10 10 10h20c6 0 10-4 10-10v-20c0-6-4-10-10-10zm0 0M116 146h20c6 0 10-4 10-10v-20c0-6-4-10-10-10h-20c-6 0-10 4-10 10v20c0 6 4 10 10 10zm0 0M376 146h20c6 0 10-4 10-10v-20c0-6-4-10-10-10h-20c-6 0-10 4-10 10v20c0 6 4 10 10 10zm0 0M376 406h20c6 0 10-4 10-10v-20c0-6-4-10-10-10h-20c-6 0-10 4-10 10v20c0 6 4 10 10 10zm0 0M106 276c0 6 4 10 10 10h130v50a10 10 0 1020 0v-60c0-6-4-10-10-10H116c-6 0-10 4-10 10zm0 0M176 246a10 10 0 100-20H76a10 10 0 100 20zm0 0M216 246h40a10 10 0 100-20h-40a10 10 0 100 20zm0 0M216 66c-6 0-10 4-10 10v100c0 6 4 10 10 10h70v50c0 6 4 10 10 10h40a10 10 0 100-20h-30v-50c0-6-4-10-10-10h-70V76c0-6-4-10-10-10zm0 0M436 226h-60a10 10 0 100 20h60a10 10 0 100-20zm0 0M436 266H336a10 10 0 100 20h100a10 10 0 100-20zm0 0M256 366h-40c-6 0-10 4-10 10v60a10 10 0 1020 0v-50h30a10 10 0 100-20zm0 0')
								]),
							_List_Nil),
							A2(
							$elm$svg$Svg$path,
							_List_fromArray(
								[
									$author$project$Main$saFill(cl),
									$elm$svg$Svg$Attributes$d('M286 426h-30a10 10 0 100 20h40c6 0 10-4 10-10V316a10 10 0 10-20 0zm0 0M296 146c6 0 10-4 10-10V76a10 10 0 10-20 0v50h-30a10 10 0 100 20zm0 0')
								]),
							_List_Nil)
						]));
			case 'Icon_QRCode':
				return _Utils_Tuple2(
					'25 25 246 246',
					_Utils_ap(
						_List_fromArray(
							[
								A2(
								$elm$svg$Svg$path,
								_List_fromArray(
									[
										$elm$svg$Svg$Attributes$fill('rgba(0,0,0,0)'),
										$elm$svg$Svg$Attributes$d('M0 0h296v296H0z')
									]),
								_List_Nil),
								A2(
								$elm$svg$Svg$defs,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										$elm$svg$Svg$path,
										_List_fromArray(
											[
												$author$project$Main$saFill(cl),
												$elm$svg$Svg$Attributes$id('a'),
												$elm$svg$Svg$Attributes$d('M0 0h8v8H0z')
											]),
										_List_Nil)
									]))
							]),
						A2(
							$elm$core$List$map,
							function (_v1) {
								var x = _v1.a;
								var y = _v1.b;
								return A2(
									$elm$svg$Svg$use,
									_List_fromArray(
										[
											$elm$svg$Svg$Attributes$x(
											$elm$core$String$fromInt(x)),
											$elm$svg$Svg$Attributes$y(
											$elm$core$String$fromInt(y)),
											$elm$svg$Svg$Attributes$xlinkHref('#a')
										]),
									_List_Nil);
							},
							$author$project$Main$qrCodeDots)));
			default:
				return _Utils_Tuple2(
					'25 25 246 246',
					_Utils_ap(
						_List_fromArray(
							[
								A2(
								$elm$svg$Svg$path,
								_List_fromArray(
									[
										$elm$svg$Svg$Attributes$fill('rgba(0,0,0,0)'),
										$elm$svg$Svg$Attributes$d('M0 0h296v296H0z')
									]),
								_List_Nil),
								A2(
								$elm$svg$Svg$defs,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										$elm$svg$Svg$path,
										_List_fromArray(
											[
												$author$project$Main$saFill(cl),
												$elm$svg$Svg$Attributes$id('a'),
												$elm$svg$Svg$Attributes$d('M0 0h8v8H0z')
											]),
										_List_Nil)
									]))
							]),
						$elm$core$List$concat(
							A2(
								$elm$core$List$map,
								function (_v2) {
									var x = _v2.a;
									var y = _v2.b;
									var link = _v2.c;
									return (link === 'a') ? _List_fromArray(
										[
											A2(
											$elm$svg$Svg$use,
											_List_fromArray(
												[
													$elm$svg$Svg$Attributes$x(
													$elm$core$String$fromInt(x)),
													$elm$svg$Svg$Attributes$y(
													$elm$core$String$fromInt(y)),
													$elm$svg$Svg$Attributes$xlinkHref('#' + link)
												]),
											_List_Nil)
										]) : _List_Nil;
								},
								$author$project$Main$qrCodeDots))));
		}
	});
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var $elm$svg$Svg$Attributes$xmlSpace = A2(_VirtualDom_attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var $author$project$Main$icon = F3(
	function (icon_, cl, size) {
		var _v0 = A2($author$project$Main$iconViewBoxAndPaths, icon_, cl);
		var viewBox = _v0.a;
		var paths = _v0.b;
		return $mdgriffith$elm_ui$Element$html(
			A2(
				$elm$svg$Svg$svg,
				_List_fromArray(
					[
						$elm$svg$Svg$Attributes$xmlSpace('http://www.w3.org/2000/svg'),
						$elm$svg$Svg$Attributes$viewBox(viewBox),
						$elm$svg$Svg$Attributes$height(
						$elm$core$String$fromInt(size))
					]),
				paths));
	});
var $elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var $author$project$Main$regenerateTheQrCode = function (model) {
	return _Utils_update(
		model,
		{
			cachedQrCodeBlack: A3(
				$author$project$Main$icon,
				$author$project$Main$Icon_QRCodeWithHole,
				'black',
				A2($elm$core$Basics$min, model.width - 40, model.height - 160))
		});
};
var $author$project$Counter$start = function (_v0) {
	var data = _v0.a;
	return $author$project$Counter$Counter(
		_Utils_update(
			data,
			{pause: false}));
};
var $author$project$Main$init = F3(
	function (flags, url, key) {
		var _v0 = $author$project$FloatingTokyoCity$init(
			_Utils_Tuple2(600, 400));
		var floatingTokyoCity = _v0.a;
		return _Utils_Tuple2(
			$author$project$Main$regenerateTheQrCode(
				{
					cachedQrCodeBlack: $mdgriffith$elm_ui$Element$none,
					cachedQrCodeWhite: $mdgriffith$elm_ui$Element$none,
					countdown: $author$project$Counter$start($author$project$Counter$init),
					floatingTokyoCity: floatingTokyoCity,
					focused: true,
					height: flags.height,
					href: flags.href,
					key: key,
					language: (flags.language === 'ja') ? $author$project$Main$Ja : $author$project$Main$En,
					menuOpen: false,
					pause: false,
					startedOnSmallDevice: flags.width < 800,
					url: url,
					width: flags.width
				}),
			$elm$core$Platform$Cmd$none);
	});
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Main$FloatingTokyoCityMsg = function (a) {
	return {$: 'FloatingTokyoCityMsg', a: a};
};
var $author$project$Main$OnBlur = function (a) {
	return {$: 'OnBlur', a: a};
};
var $author$project$Main$OnFocus = function (a) {
	return {$: 'OnFocus', a: a};
};
var $author$project$Main$OnResize = F2(
	function (a, b) {
		return {$: 'OnResize', a: a, b: b};
	});
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$core$Platform$Sub$map = _Platform_map;
var $elm$core$Basics$not = _Basics_not;
var $elm$browser$Browser$Events$Window = {$: 'Window'};
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 'MySub', a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {pids: pids, subs: subs};
	});
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (node.$ === 'Document') {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$core$Dict$Black = {$: 'Black'};
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: 'RBNode_elm_builtin', a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = {$: 'Red'};
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Red')) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) && (left.d.$ === 'RBNode_elm_builtin')) && (left.d.a.$ === 'Red')) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1.$) {
				case 'LT':
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 'EQ':
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {event: event, key: key};
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (node.$ === 'Document') {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.pids,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (_v0.$ === 'Just') {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var key = _v0.key;
		var event = _v0.event;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.subs);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onResize = function (func) {
	return A3(
		$elm$browser$Browser$Events$on,
		$elm$browser$Browser$Events$Window,
		'resize',
		A2(
			$elm$json$Json$Decode$field,
			'target',
			A3(
				$elm$json$Json$Decode$map2,
				func,
				A2($elm$json$Json$Decode$field, 'innerWidth', $elm$json$Json$Decode$int),
				A2($elm$json$Json$Decode$field, 'innerHeight', $elm$json$Json$Decode$int))));
};
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $author$project$Main$onblur = _Platform_incomingPort(
	'onblur',
	$elm$json$Json$Decode$null(_Utils_Tuple0));
var $author$project$Main$onfocus = _Platform_incomingPort(
	'onfocus',
	$elm$json$Json$Decode$null(_Utils_Tuple0));
var $author$project$Playground$VisibilityChanged = function (a) {
	return {$: 'VisibilityChanged', a: a};
};
var $author$project$Playground$KeyChanged = F2(
	function (a, b) {
		return {$: 'KeyChanged', a: a, b: b};
	});
var $author$project$Playground$MouseButton = function (a) {
	return {$: 'MouseButton', a: a};
};
var $author$project$Playground$MouseClick = {$: 'MouseClick'};
var $author$project$Playground$MouseMove = F2(
	function (a, b) {
		return {$: 'MouseMove', a: a, b: b};
	});
var $author$project$Playground$Tick = function (a) {
	return {$: 'Tick', a: a};
};
var $elm$json$Json$Decode$float = _Json_decodeFloat;
var $elm$browser$Browser$AnimationManager$Time = function (a) {
	return {$: 'Time', a: a};
};
var $elm$browser$Browser$AnimationManager$State = F3(
	function (subs, request, oldTime) {
		return {oldTime: oldTime, request: request, subs: subs};
	});
var $elm$browser$Browser$AnimationManager$init = $elm$core$Task$succeed(
	A3($elm$browser$Browser$AnimationManager$State, _List_Nil, $elm$core$Maybe$Nothing, 0));
var $elm$browser$Browser$AnimationManager$now = _Browser_now(_Utils_Tuple0);
var $elm$browser$Browser$AnimationManager$rAF = _Browser_rAF(_Utils_Tuple0);
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$browser$Browser$AnimationManager$onEffects = F3(
	function (router, subs, _v0) {
		var request = _v0.request;
		var oldTime = _v0.oldTime;
		var _v1 = _Utils_Tuple2(request, subs);
		if (_v1.a.$ === 'Nothing') {
			if (!_v1.b.b) {
				var _v2 = _v1.a;
				return $elm$browser$Browser$AnimationManager$init;
			} else {
				var _v4 = _v1.a;
				return A2(
					$elm$core$Task$andThen,
					function (pid) {
						return A2(
							$elm$core$Task$andThen,
							function (time) {
								return $elm$core$Task$succeed(
									A3(
										$elm$browser$Browser$AnimationManager$State,
										subs,
										$elm$core$Maybe$Just(pid),
										time));
							},
							$elm$browser$Browser$AnimationManager$now);
					},
					$elm$core$Process$spawn(
						A2(
							$elm$core$Task$andThen,
							$elm$core$Platform$sendToSelf(router),
							$elm$browser$Browser$AnimationManager$rAF)));
			}
		} else {
			if (!_v1.b.b) {
				var pid = _v1.a.a;
				return A2(
					$elm$core$Task$andThen,
					function (_v3) {
						return $elm$browser$Browser$AnimationManager$init;
					},
					$elm$core$Process$kill(pid));
			} else {
				return $elm$core$Task$succeed(
					A3($elm$browser$Browser$AnimationManager$State, subs, request, oldTime));
			}
		}
	});
var $elm$browser$Browser$AnimationManager$onSelfMsg = F3(
	function (router, newTime, _v0) {
		var subs = _v0.subs;
		var oldTime = _v0.oldTime;
		var send = function (sub) {
			if (sub.$ === 'Time') {
				var tagger = sub.a;
				return A2(
					$elm$core$Platform$sendToApp,
					router,
					tagger(
						$elm$time$Time$millisToPosix(newTime)));
			} else {
				var tagger = sub.a;
				return A2(
					$elm$core$Platform$sendToApp,
					router,
					tagger(newTime - oldTime));
			}
		};
		return A2(
			$elm$core$Task$andThen,
			function (pid) {
				return A2(
					$elm$core$Task$andThen,
					function (_v1) {
						return $elm$core$Task$succeed(
							A3(
								$elm$browser$Browser$AnimationManager$State,
								subs,
								$elm$core$Maybe$Just(pid),
								newTime));
					},
					$elm$core$Task$sequence(
						A2($elm$core$List$map, send, subs)));
			},
			$elm$core$Process$spawn(
				A2(
					$elm$core$Task$andThen,
					$elm$core$Platform$sendToSelf(router),
					$elm$browser$Browser$AnimationManager$rAF)));
	});
var $elm$browser$Browser$AnimationManager$Delta = function (a) {
	return {$: 'Delta', a: a};
};
var $elm$browser$Browser$AnimationManager$subMap = F2(
	function (func, sub) {
		if (sub.$ === 'Time') {
			var tagger = sub.a;
			return $elm$browser$Browser$AnimationManager$Time(
				A2($elm$core$Basics$composeL, func, tagger));
		} else {
			var tagger = sub.a;
			return $elm$browser$Browser$AnimationManager$Delta(
				A2($elm$core$Basics$composeL, func, tagger));
		}
	});
_Platform_effectManagers['Browser.AnimationManager'] = _Platform_createManager($elm$browser$Browser$AnimationManager$init, $elm$browser$Browser$AnimationManager$onEffects, $elm$browser$Browser$AnimationManager$onSelfMsg, 0, $elm$browser$Browser$AnimationManager$subMap);
var $elm$browser$Browser$AnimationManager$subscription = _Platform_leaf('Browser.AnimationManager');
var $elm$browser$Browser$AnimationManager$onAnimationFrame = function (tagger) {
	return $elm$browser$Browser$AnimationManager$subscription(
		$elm$browser$Browser$AnimationManager$Time(tagger));
};
var $elm$browser$Browser$Events$onAnimationFrame = $elm$browser$Browser$AnimationManager$onAnimationFrame;
var $elm$browser$Browser$Events$Document = {$: 'Document'};
var $elm$browser$Browser$Events$onClick = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'click');
var $elm$browser$Browser$Events$onKeyDown = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'keydown');
var $elm$browser$Browser$Events$onKeyUp = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'keyup');
var $elm$browser$Browser$Events$onMouseDown = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'mousedown');
var $elm$browser$Browser$Events$onMouseMove = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'mousemove');
var $elm$browser$Browser$Events$onMouseUp = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'mouseup');
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $elm$browser$Browser$Events$Hidden = {$: 'Hidden'};
var $elm$browser$Browser$Events$withHidden = F2(
	function (func, isHidden) {
		return func(
			isHidden ? $elm$browser$Browser$Events$Hidden : $elm$browser$Browser$Events$Visible);
	});
var $elm$browser$Browser$Events$onVisibilityChange = function (func) {
	var info = _Browser_visibilityInfo(_Utils_Tuple0);
	return A3(
		$elm$browser$Browser$Events$on,
		$elm$browser$Browser$Events$Document,
		info.change,
		A2(
			$elm$json$Json$Decode$map,
			$elm$browser$Browser$Events$withHidden(func),
			A2(
				$elm$json$Json$Decode$field,
				'target',
				A2($elm$json$Json$Decode$field, info.hidden, $elm$json$Json$Decode$bool))));
};
var $author$project$Playground$gameSubscriptions = $elm$core$Platform$Sub$batch(
	_List_fromArray(
		[
			$elm$browser$Browser$Events$onKeyUp(
			A2(
				$elm$json$Json$Decode$map,
				$author$project$Playground$KeyChanged(false),
				A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string))),
			$elm$browser$Browser$Events$onKeyDown(
			A2(
				$elm$json$Json$Decode$map,
				$author$project$Playground$KeyChanged(true),
				A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string))),
			$elm$browser$Browser$Events$onAnimationFrame($author$project$Playground$Tick),
			$elm$browser$Browser$Events$onVisibilityChange($author$project$Playground$VisibilityChanged),
			$elm$browser$Browser$Events$onClick(
			$elm$json$Json$Decode$succeed($author$project$Playground$MouseClick)),
			$elm$browser$Browser$Events$onMouseDown(
			$elm$json$Json$Decode$succeed(
				$author$project$Playground$MouseButton(true))),
			$elm$browser$Browser$Events$onMouseUp(
			$elm$json$Json$Decode$succeed(
				$author$project$Playground$MouseButton(false))),
			$elm$browser$Browser$Events$onMouseMove(
			A3(
				$elm$json$Json$Decode$map2,
				$author$project$Playground$MouseMove,
				A2($elm$json$Json$Decode$field, 'pageX', $elm$json$Json$Decode$float),
				A2($elm$json$Json$Decode$field, 'pageY', $elm$json$Json$Decode$float)))
		]));
var $author$project$Playground$subscriptionsGame = function (_v0) {
	var visibility = _v0.a;
	if (visibility.$ === 'Hidden') {
		return $elm$browser$Browser$Events$onVisibilityChange($author$project$Playground$VisibilityChanged);
	} else {
		return $author$project$Playground$gameSubscriptions;
	}
};
var $author$project$FloatingTokyoCity$subscriptions = $author$project$Playground$subscriptionsGame;
var $author$project$Main$subscriptions = function (model) {
	return (model.url.path === '/elm-conferences') ? $elm$browser$Browser$Events$onResize($author$project$Main$OnResize) : $elm$core$Platform$Sub$batch(
		_Utils_ap(
			_List_fromArray(
				[
					$elm$browser$Browser$Events$onResize($author$project$Main$OnResize),
					$author$project$Main$onblur($author$project$Main$OnBlur),
					$author$project$Main$onfocus($author$project$Main$OnFocus)
				]),
			(model.focused && (!model.pause)) ? _Utils_ap(
				_List_fromArray(
					[
						A2(
						$elm$core$Platform$Sub$map,
						$author$project$Main$FloatingTokyoCityMsg,
						$author$project$FloatingTokyoCity$subscriptions(model.floatingTokyoCity))
					]),
				model.startedOnSmallDevice ? _List_Nil : _List_Nil) : _List_Nil));
};
var $elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var $author$project$Playground$changeMemory = F2(
	function (_v0, memoryChanger) {
		var visibility = _v0.a;
		var memory = _v0.b;
		var computer = _v0.c;
		return A3(
			$author$project$Playground$Game,
			visibility,
			memoryChanger(memory),
			computer);
	});
var $elm$core$Array$fromListHelp = F3(
	function (list, nodeList, nodeListSize) {
		fromListHelp:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, list);
			var jsArray = _v0.a;
			var remainingItems = _v0.b;
			if (_Utils_cmp(
				$elm$core$Elm$JsArray$length(jsArray),
				$elm$core$Array$branchFactor) < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					true,
					{nodeList: nodeList, nodeListSize: nodeListSize, tail: jsArray});
			} else {
				var $temp$list = remainingItems,
					$temp$nodeList = A2(
					$elm$core$List$cons,
					$elm$core$Array$Leaf(jsArray),
					nodeList),
					$temp$nodeListSize = nodeListSize + 1;
				list = $temp$list;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue fromListHelp;
			}
		}
	});
var $elm$core$Array$fromList = function (list) {
	if (!list.b) {
		return $elm$core$Array$empty;
	} else {
		return A3($elm$core$Array$fromListHelp, list, _List_Nil, 0);
	}
};
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm$core$Array$bitMask = 4294967295 >>> (32 - $elm$core$Array$shiftStep);
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Elm$JsArray$unsafeGet = _JsArray_unsafeGet;
var $elm$core$Array$getHelp = F3(
	function (shift, index, tree) {
		getHelp:
		while (true) {
			var pos = $elm$core$Array$bitMask & (index >>> shift);
			var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (_v0.$ === 'SubTree') {
				var subTree = _v0.a;
				var $temp$shift = shift - $elm$core$Array$shiftStep,
					$temp$index = index,
					$temp$tree = subTree;
				shift = $temp$shift;
				index = $temp$index;
				tree = $temp$tree;
				continue getHelp;
			} else {
				var values = _v0.a;
				return A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, values);
			}
		}
	});
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Array$tailIndex = function (len) {
	return (len >>> 5) << 5;
};
var $elm$core$Array$get = F2(
	function (index, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? $elm$core$Maybe$Nothing : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? $elm$core$Maybe$Just(
			A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, tail)) : $elm$core$Maybe$Just(
			A3($elm$core$Array$getHelp, startShift, index, tree)));
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Counter$lastValueInTheQueue = function (_v0) {
	var data = _v0.a;
	return A2(
		$elm$core$Maybe$withDefault,
		data.value,
		A2(
			$elm$core$Array$get,
			$elm$core$List$length(data.nextValues) - 1,
			$elm$core$Array$fromList(data.nextValues)));
};
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $elm$core$String$padLeft = F3(
	function (n, _char, string) {
		return _Utils_ap(
			A2(
				$elm$core$String$repeat,
				n - $elm$core$String$length(string),
				$elm$core$String$fromChar(_char)),
			string);
	});
var $author$project$Counter$convertToPaddedString = F2(
	function (value, digitsQuantity) {
		return A3(
			$elm$core$String$padLeft,
			digitsQuantity,
			_Utils_chr('0'),
			$elm$core$String$fromInt(value));
	});
var $author$project$Counter$addLimited = F2(
	function (a, b) {
		var sum = a + b;
		return (sum > 9) ? (sum - 10) : ((sum < 0) ? (sum + 10) : sum);
	});
var $author$project$Counter$directionClosestToTarget = F2(
	function (present, target) {
		if (_Utils_eq(present, target)) {
			return 0;
		} else {
			var normalizedTarget = target - present;
			return ((normalizedTarget > 5) || ((normalizedTarget < 0) && (_Utils_cmp(normalizedTarget, -5) > -1))) ? (-1) : 1;
		}
	});
var $author$project$Counter$getCharFromEnd = F2(
	function (index, string) {
		return A3($elm$core$String$slice, (-2) - index, (-1) - index, string + 'X');
	});
var $author$project$Counter$toInt = function (string) {
	return A2(
		$elm$core$Maybe$withDefault,
		0,
		$elm$core$String$toInt(string));
};
var $author$project$Counter$helper = F4(
	function (present, target, index, _v0) {
		var sliceTarget = A2($author$project$Counter$getCharFromEnd, index, target);
		var slicePresent = A2($author$project$Counter$getCharFromEnd, index, present);
		var sliceIntTarget = $author$project$Counter$toInt(sliceTarget);
		var sliceIntPresent = $author$project$Counter$toInt(slicePresent);
		var direction = A2($author$project$Counter$directionClosestToTarget, sliceIntPresent, sliceIntTarget);
		var gettingCloser = A2($author$project$Counter$addLimited, sliceIntPresent, direction);
		return $elm$core$String$fromInt(gettingCloser);
	});
var $elm$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (n <= 0) {
				return result;
			} else {
				var $temp$result = A2($elm$core$List$cons, value, result),
					$temp$n = n - 1,
					$temp$value = value;
				result = $temp$result;
				n = $temp$n;
				value = $temp$value;
				continue repeatHelp;
			}
		}
	});
var $elm$core$List$repeat = F2(
	function (n, value) {
		return A3($elm$core$List$repeatHelp, _List_Nil, n, value);
	});
var $author$project$Counter$calculateNextValue = F3(
	function (valueTarget, valuePresent, digitsQuantity) {
		return _Utils_eq(valueTarget, valuePresent) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
			function () {
				var target = A2($author$project$Counter$convertToPaddedString, valueTarget, digitsQuantity);
				var present = A2($author$project$Counter$convertToPaddedString, valuePresent, digitsQuantity);
				return A2(
					$elm$core$Maybe$withDefault,
					0,
					$elm$core$String$toInt(
						A2(
							$elm$core$String$join,
							'',
							$elm$core$List$reverse(
								A2(
									$elm$core$List$indexedMap,
									A2($author$project$Counter$helper, present, target),
									A2($elm$core$List$repeat, digitsQuantity, _Utils_Tuple0))))));
			}());
	});
var $author$project$Counter$listSteps = function (args) {
	listSteps:
	while (true) {
		var maybeGettingCloser = A3($author$project$Counter$calculateNextValue, args.target, args.present, args.wheelsQuantity);
		if (maybeGettingCloser.$ === 'Nothing') {
			return args.nextValues;
		} else {
			var gettingCloser = maybeGettingCloser.a;
			if (_Utils_eq(gettingCloser, args.target)) {
				return A2($elm$core$List$cons, gettingCloser, args.nextValues);
			} else {
				var $temp$args = {
					nextValues: A2($elm$core$List$cons, gettingCloser, args.nextValues),
					present: gettingCloser,
					target: args.target,
					wheelsQuantity: args.wheelsQuantity
				};
				args = $temp$args;
				continue listSteps;
			}
		}
	}
};
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Counter$nextValue = function (_v0) {
	var data = _v0.a;
	return $elm$core$List$head(data.nextValues);
};
var $elm$core$Basics$round = _Basics_round;
var $author$project$Counter$numberOfDigits = function (number) {
	return $elm$core$Basics$round(
		A2($elm$core$Basics$logBase, 10, number + 1) + 1);
};
var $author$project$Counter$wheelsQuantity = function (_v0) {
	var data = _v0.a;
	var _v1 = data.size;
	if (_v1.$ === 'Flexible') {
		return $author$project$Counter$numberOfDigits(
			A2(
				$elm$core$Basics$max,
				data.value,
				A2(
					$elm$core$Maybe$withDefault,
					0,
					$author$project$Counter$nextValue(
						$author$project$Counter$Counter(data)))));
	} else {
		var wheels = _v1.a;
		return wheels;
	}
};
var $author$project$Counter$jumpTo = F2(
	function (target, _v0) {
		var data = _v0.a;
		var targetNotNegative = (target < 0) ? 0 : target;
		if (_Utils_eq(
			target,
			$author$project$Counter$lastValueInTheQueue(
				$author$project$Counter$Counter(data)))) {
			return $author$project$Counter$Counter(data);
		} else {
			var newNextValues = _Utils_ap(
				data.nextValues,
				$elm$core$List$reverse(
					$author$project$Counter$listSteps(
						{
							nextValues: _List_Nil,
							present: $author$project$Counter$lastValueInTheQueue(
								$author$project$Counter$Counter(data)),
							target: targetNotNegative,
							wheelsQuantity: $author$project$Counter$wheelsQuantity(
								$author$project$Counter$Counter(data))
						})));
			var newCachecedStepSize = A2(
				$author$project$Counter$calculateCachedStepSize,
				data.speed,
				$elm$core$List$length(newNextValues));
			var newAnimationPosition = (!data.animationPosition) ? 1 : data.animationPosition;
			return $author$project$Counter$Counter(
				_Utils_update(
					data,
					{animationPosition: newAnimationPosition, cachedStepSize: newCachecedStepSize, nextValues: newNextValues}));
		}
	});
var $elm$browser$Browser$Navigation$load = _Browser_load;
var $elm$core$Platform$Cmd$map = _Platform_map;
var $author$project$Main$menuSideBySide = function (x) {
	return x > 740;
};
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0.a;
	return millis;
};
var $elm$browser$Browser$Navigation$pushUrl = _Browser_pushUrl;
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$scrollTo = _Platform_outgoingPort('scrollTo', $elm$json$Json$Encode$string);
var $elm$url$Url$addPort = F2(
	function (maybePort, starter) {
		if (maybePort.$ === 'Nothing') {
			return starter;
		} else {
			var port_ = maybePort.a;
			return starter + (':' + $elm$core$String$fromInt(port_));
		}
	});
var $elm$url$Url$addPrefixed = F3(
	function (prefix, maybeSegment, starter) {
		if (maybeSegment.$ === 'Nothing') {
			return starter;
		} else {
			var segment = maybeSegment.a;
			return _Utils_ap(
				starter,
				_Utils_ap(prefix, segment));
		}
	});
var $elm$url$Url$toString = function (url) {
	var http = function () {
		var _v0 = url.protocol;
		if (_v0.$ === 'Http') {
			return 'http://';
		} else {
			return 'https://';
		}
	}();
	return A3(
		$elm$url$Url$addPrefixed,
		'#',
		url.fragment,
		A3(
			$elm$url$Url$addPrefixed,
			'?',
			url.query,
			_Utils_ap(
				A2(
					$elm$url$Url$addPort,
					url.port_,
					_Utils_ap(http, url.host)),
				url.path)));
};
var $author$project$Counter$startNextTransition = function (_v0) {
	var data = _v0.a;
	var _v1 = data.nextValues;
	if (!_v1.b) {
		return $author$project$Counter$Counter(data);
	} else {
		if (!_v1.b.b) {
			var newValue = _v1.a;
			return $author$project$Counter$Counter(
				_Utils_update(
					data,
					{animationPosition: 0, nextValues: _List_Nil, value: newValue}));
		} else {
			var newValue = _v1.a;
			var newNextValues = _v1.b;
			return $author$project$Counter$Counter(
				_Utils_update(
					data,
					{
						animationPosition: 1,
						cachedStepSize: A2(
							$author$project$Counter$calculateCachedStepSize,
							data.speed,
							$elm$core$List$length(data.nextValues)),
						nextValues: newNextValues,
						value: newValue
					}));
		}
	}
};
var $author$project$Counter$update = function (_v0) {
	var data = _v0.a;
	if (data.pause) {
		return $author$project$Counter$Counter(data);
	} else {
		var newPosition = data.animationPosition - data.cachedStepSize;
		var newCounter = (newPosition < 0) ? $author$project$Counter$startNextTransition(
			$author$project$Counter$Counter(
				_Utils_update(
					data,
					{animationPosition: 0}))) : $author$project$Counter$Counter(
			_Utils_update(
				data,
				{animationPosition: newPosition}));
		return newCounter;
	}
};
var $author$project$Playground$mouseClick = F2(
	function (bool, mouse) {
		return _Utils_update(
			mouse,
			{click: bool});
	});
var $author$project$Playground$mouseDown = F2(
	function (bool, mouse) {
		return _Utils_update(
			mouse,
			{down: bool});
	});
var $author$project$Playground$mouseMove = F3(
	function (x, y, mouse) {
		return _Utils_update(
			mouse,
			{x: x, y: y});
	});
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0.a;
		return $elm$core$Set$Set_elm_builtin(
			A3($elm$core$Dict$insert, key, _Utils_Tuple0, dict));
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.e.d.$ === 'RBNode_elm_builtin') && (dict.e.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				$elm$core$Dict$Red,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr.$ === 'Black') {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.d.d.$ === 'RBNode_elm_builtin') && (dict.d.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				$elm$core$Dict$Red,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr.$ === 'Black') {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Black')) {
					if (right.d.$ === 'RBNode_elm_builtin') {
						if (right.d.a.$ === 'Black') {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor.$ === 'Black') {
			if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === 'RBNode_elm_builtin') {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Black')) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === 'RBNode_elm_builtin') {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBNode_elm_builtin') {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === 'RBNode_elm_builtin') {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Set$remove = F2(
	function (key, _v0) {
		var dict = _v0.a;
		return $elm$core$Set$Set_elm_builtin(
			A2($elm$core$Dict$remove, key, dict));
	});
var $author$project$Playground$updateKeyboard = F3(
	function (isDown, key, keyboard) {
		var keys = isDown ? A2($elm$core$Set$insert, key, keyboard.keys) : A2($elm$core$Set$remove, key, keyboard.keys);
		switch (key) {
			case ' ':
				return _Utils_update(
					keyboard,
					{keys: keys, space: isDown});
			case 'Enter':
				return _Utils_update(
					keyboard,
					{enter: isDown, keys: keys});
			case 'Shift':
				return _Utils_update(
					keyboard,
					{keys: keys, shift: isDown});
			case 'Backspace':
				return _Utils_update(
					keyboard,
					{backspace: isDown, keys: keys});
			case 'ArrowUp':
				return _Utils_update(
					keyboard,
					{keys: keys, up: isDown});
			case 'ArrowDown':
				return _Utils_update(
					keyboard,
					{down: isDown, keys: keys});
			case 'ArrowLeft':
				return _Utils_update(
					keyboard,
					{keys: keys, left: isDown});
			case 'ArrowRight':
				return _Utils_update(
					keyboard,
					{keys: keys, right: isDown});
			default:
				return _Utils_update(
					keyboard,
					{keys: keys});
		}
	});
var $author$project$Playground$gameUpdate = F3(
	function (updateMemory, msg, _v0) {
		var vis = _v0.a;
		var memory = _v0.b;
		var computer = _v0.c;
		switch (msg.$) {
			case 'Tick':
				var time = msg.a;
				return A3(
					$author$project$Playground$Game,
					vis,
					A2(updateMemory, computer, memory),
					computer.mouse.click ? _Utils_update(
						computer,
						{
							mouse: A2($author$project$Playground$mouseClick, false, computer.mouse),
							time: $author$project$Playground$Time(time)
						}) : _Utils_update(
						computer,
						{
							time: $author$project$Playground$Time(time)
						}));
			case 'GotViewport':
				var viewport = msg.a.viewport;
				return A3(
					$author$project$Playground$Game,
					vis,
					memory,
					_Utils_update(
						computer,
						{
							screen: A2($author$project$Playground$toScreen, viewport.width, viewport.height)
						}));
			case 'Resized':
				var w = msg.a;
				var h = msg.b;
				return A3(
					$author$project$Playground$Game,
					vis,
					memory,
					_Utils_update(
						computer,
						{
							screen: A2($author$project$Playground$toScreen, w, h)
						}));
			case 'KeyChanged':
				var isDown = msg.a;
				var key = msg.b;
				return A3(
					$author$project$Playground$Game,
					vis,
					memory,
					_Utils_update(
						computer,
						{
							keyboard: A3($author$project$Playground$updateKeyboard, isDown, key, computer.keyboard)
						}));
			case 'MouseMove':
				var pageX = msg.a;
				var pageY = msg.b;
				var y = computer.screen.top - pageY;
				var x = computer.screen.left + pageX;
				return A3(
					$author$project$Playground$Game,
					vis,
					memory,
					_Utils_update(
						computer,
						{
							mouse: A3($author$project$Playground$mouseMove, x, y, computer.mouse)
						}));
			case 'MouseClick':
				return A3(
					$author$project$Playground$Game,
					vis,
					memory,
					_Utils_update(
						computer,
						{
							mouse: A2($author$project$Playground$mouseClick, true, computer.mouse)
						}));
			case 'MouseButton':
				var isDown = msg.a;
				return A3(
					$author$project$Playground$Game,
					vis,
					memory,
					_Utils_update(
						computer,
						{
							mouse: A2($author$project$Playground$mouseDown, isDown, computer.mouse)
						}));
			default:
				var visibility = msg.a;
				return A3(
					$author$project$Playground$Game,
					visibility,
					memory,
					_Utils_update(
						computer,
						{
							keyboard: $author$project$Playground$emptyKeyboard,
							mouse: A4($author$project$Playground$Mouse, computer.mouse.x, computer.mouse.y, false, false)
						}));
		}
	});
var $author$project$Playground$updateGame = F3(
	function (updateMemory, msg, model) {
		return _Utils_Tuple2(
			A3($author$project$Playground$gameUpdate, updateMemory, msg, model),
			$elm$core$Platform$Cmd$none);
	});
var $author$project$FloatingTokyoCity$GameOver = function (a) {
	return {$: 'GameOver', a: a};
};
var $author$project$FloatingTokyoCity$Night = {$: 'Night'};
var $author$project$FloatingTokyoCity$Sunrise = {$: 'Sunrise'};
var $author$project$FloatingTokyoCity$Sunset = {$: 'Sunset'};
var $author$project$FloatingTokyoCity$Won = function (a) {
	return {$: 'Won', a: a};
};
var $elm$core$Set$fromList = function (list) {
	return A3($elm$core$List$foldl, $elm$core$Set$insert, $elm$core$Set$empty, list);
};
var $elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var $elm$core$Basics$modBy = _Basics_modBy;
var $author$project$Playground$toFrac = F2(
	function (period, _v0) {
		var posix = _v0.a;
		var p = period * 1000;
		var ms = $elm$time$Time$posixToMillis(posix);
		return A2(
			$elm$core$Basics$modBy,
			$elm$core$Basics$round(p),
			ms) / p;
	});
var $author$project$Playground$zigzag = F4(
	function (lo, hi, period, time) {
		return lo + ((hi - lo) * $elm$core$Basics$abs(
			(2 * A2($author$project$Playground$toFrac, period, time)) - 1));
	});
var $author$project$FloatingTokyoCity$interactiveData = function (computer) {
	return {
		angle: A4($author$project$Playground$zigzag, 90, 0, 15, computer.time),
		letterEHorizontal: A3($elm$core$Basics$clamp, -180, 0, (200 - computer.mouse.x) * 0.3),
		letterEVertical: A3($elm$core$Basics$clamp, -100, 80, (100 + computer.mouse.y) * 0.6)
	};
};
var $author$project$FloatingTokyoCity$goal = function (computer) {
	var limit = 5;
	var data = $author$project$FloatingTokyoCity$interactiveData(computer);
	return (_Utils_cmp(
		$elm$core$Basics$abs((-70) - data.letterEHorizontal),
		limit) < 0) && ((_Utils_cmp(
		$elm$core$Basics$abs(14 - data.letterEVertical),
		limit) < 0) && (_Utils_cmp(
		$elm$core$Basics$abs(data.angle),
		limit) < 0));
};
var $author$project$FloatingTokyoCity$update3d = F2(
	function (computer, model) {
		var model1 = _Utils_eq(
			computer.keyboard.keys,
			$elm$core$Set$fromList(
				_List_fromArray(
					['d', 'e', 'v']))) ? _Utils_update(
			model,
			{devMode: true}) : model;
		var model2 = function () {
			var _v1 = $elm$core$Set$toList(computer.keyboard.keys);
			_v1$6:
			while (true) {
				if (_v1.b && (!_v1.b.b)) {
					switch (_v1.a) {
						case '1':
							return _Utils_update(
								model1,
								{timeOfDay: $author$project$FloatingTokyoCity$Sunrise});
						case '2':
							return _Utils_update(
								model1,
								{timeOfDay: $author$project$FloatingTokyoCity$Day});
						case '3':
							return _Utils_update(
								model1,
								{timeOfDay: $author$project$FloatingTokyoCity$Sunset});
						case '4':
							return _Utils_update(
								model1,
								{timeOfDay: $author$project$FloatingTokyoCity$Night});
						case 'q':
							return _Utils_update(
								model1,
								{qrCode: true});
						case 'Escape':
							return _Utils_update(
								model1,
								{qrCode: false});
						default:
							break _v1$6;
					}
				} else {
					break _v1$6;
				}
			}
			return model1;
		}();
		var _v0 = model2.gameState;
		switch (_v0.$) {
			case 'Playing':
				var fadeValue = _v0.a;
				return $author$project$FloatingTokyoCity$goal(computer) ? _Utils_update(
					model2,
					{
						gameState: $author$project$FloatingTokyoCity$Won(0)
					}) : ((fadeValue < 1) ? _Utils_update(
					model2,
					{
						gameState: $author$project$FloatingTokyoCity$Playing(fadeValue + 0.01)
					}) : model2);
			case 'Won':
				var fadeValue = _v0.a;
				return (fadeValue < 1) ? _Utils_update(
					model2,
					{
						gameState: $author$project$FloatingTokyoCity$Won(fadeValue + 0.03)
					}) : _Utils_update(
					model2,
					{
						gameState: $author$project$FloatingTokyoCity$GameOver(0)
					});
			default:
				var fadeValue = _v0.a;
				return (fadeValue < 1) ? _Utils_update(
					model2,
					{
						gameState: $author$project$FloatingTokyoCity$GameOver(fadeValue + 0.03)
					}) : model2;
		}
	});
var $author$project$FloatingTokyoCity$updateMemory = $author$project$FloatingTokyoCity$update3d;
var $author$project$FloatingTokyoCity$update = $author$project$Playground$updateGame($author$project$FloatingTokyoCity$updateMemory);
var $author$project$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 'OnUrlRequest':
				var urlRequest = msg.a;
				if (urlRequest.$ === 'Internal') {
					var url = urlRequest.a;
					return _Utils_Tuple2(
						model,
						A2(
							$elm$browser$Browser$Navigation$pushUrl,
							model.key,
							$elm$url$Url$toString(url)));
				} else {
					var href = urlRequest.a;
					return _Utils_Tuple2(
						model,
						$elm$browser$Browser$Navigation$load(href));
				}
			case 'OnUrlChange':
				var url = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{url: url}),
					$elm$core$Platform$Cmd$none);
			case 'OnFocus':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{focused: true}),
					$elm$core$Platform$Cmd$none);
			case 'OnBlur':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{focused: false}),
					$elm$core$Platform$Cmd$none);
			case 'OnAnimationFrame':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							countdown: $author$project$Counter$update(model.countdown)
						}),
					$elm$core$Platform$Cmd$none);
			case 'TimeNow':
				var posix = msg.a;
				var newCountdown = function () {
					var remainingSeconds = $elm$core$Basics$round(
						$elm$core$Basics$abs(
							($elm$time$Time$posixToMillis(posix) / 1000) - 1585960200));
					return A2($author$project$Counter$jumpTo, remainingSeconds, model.countdown);
				}();
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{countdown: newCountdown}),
					$elm$core$Platform$Cmd$none);
			case 'ChangeTimeOfDay':
				var timeOfDay = msg.a;
				var floatingTokyoCity = model.floatingTokyoCity;
				var newTokyoModel = A2(
					$author$project$Playground$changeMemory,
					floatingTokyoCity,
					function (memory) {
						return _Utils_update(
							memory,
							{timeOfDay: timeOfDay});
					});
				return _Utils_Tuple2(
					$author$project$Main$regenerateTheQrCode(
						_Utils_update(
							model,
							{
								floatingTokyoCity: newTokyoModel,
								menuOpen: $author$project$Main$menuSideBySide(model.width) ? model.menuOpen : false
							})),
					$elm$core$Platform$Cmd$none);
			case 'FloatingTokyoCityMsg':
				var tokyoMsg = msg.a;
				var _v2 = A2($author$project$FloatingTokyoCity$update, tokyoMsg, model.floatingTokyoCity);
				var floatingTokyoCity = _v2.a;
				var tokyoCmd = _v2.b;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{floatingTokyoCity: floatingTokyoCity}),
					A2($elm$core$Platform$Cmd$map, $author$project$Main$FloatingTokyoCityMsg, tokyoCmd));
			case 'ScrollTo':
				var destination = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							menuOpen: $author$project$Main$menuSideBySide(model.width) ? model.menuOpen : false
						}),
					$author$project$Main$scrollTo(destination));
			case 'OnResize':
				var x = msg.a;
				var y = msg.b;
				return _Utils_Tuple2(
					$author$project$Main$regenerateTheQrCode(
						_Utils_update(
							model,
							{height: y, width: x})),
					$elm$core$Platform$Cmd$none);
			case 'ToggleQrCode':
				var bool = msg.a;
				var floatingTokyoCity = model.floatingTokyoCity;
				var newTokyoModel = A2(
					$author$project$Playground$changeMemory,
					floatingTokyoCity,
					function (memory) {
						return _Utils_update(
							memory,
							{qrCode: bool});
					});
				return _Utils_Tuple2(
					$author$project$Main$regenerateTheQrCode(
						_Utils_update(
							model,
							{floatingTokyoCity: newTokyoModel, menuOpen: false})),
					$elm$core$Platform$Cmd$none);
			case 'ToggleMenu':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{menuOpen: !model.menuOpen}),
					$elm$core$Platform$Cmd$none);
			case 'TogglePause':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{pause: !model.pause}),
					$elm$core$Platform$Cmd$none);
			default:
				var language = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							language: language,
							menuOpen: $author$project$Main$menuSideBySide(model.width) ? model.menuOpen : false
						}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$Icon_LookInside = {$: 'Icon_LookInside'};
var $author$project$Main$Icon_Pause = {$: 'Icon_Pause'};
var $author$project$Main$Icon_Play = {$: 'Icon_Play'};
var $author$project$Main$TogglePause = {$: 'TogglePause'};
var $mdgriffith$elm_ui$Internal$Model$AlignY = function (a) {
	return {$: 'AlignY', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$Bottom = {$: 'Bottom'};
var $mdgriffith$elm_ui$Element$alignBottom = $mdgriffith$elm_ui$Internal$Model$AlignY($mdgriffith$elm_ui$Internal$Model$Bottom);
var $mdgriffith$elm_ui$Internal$Model$AlignX = function (a) {
	return {$: 'AlignX', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$Right = {$: 'Right'};
var $mdgriffith$elm_ui$Element$alignRight = $mdgriffith$elm_ui$Internal$Model$AlignX($mdgriffith$elm_ui$Internal$Model$Right);
var $mdgriffith$elm_ui$Internal$Model$StyleClass = F2(
	function (a, b) {
		return {$: 'StyleClass', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$Transparency = F2(
	function (a, b) {
		return {$: 'Transparency', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$floatClass = function (x) {
	return $elm$core$String$fromInt(
		$elm$core$Basics$round(x * 255));
};
var $mdgriffith$elm_ui$Internal$Flag$Flag = function (a) {
	return {$: 'Flag', a: a};
};
var $mdgriffith$elm_ui$Internal$Flag$Second = function (a) {
	return {$: 'Second', a: a};
};
var $mdgriffith$elm_ui$Internal$Flag$flag = function (i) {
	return (i > 31) ? $mdgriffith$elm_ui$Internal$Flag$Second(1 << (i - 32)) : $mdgriffith$elm_ui$Internal$Flag$Flag(1 << i);
};
var $mdgriffith$elm_ui$Internal$Flag$transparency = $mdgriffith$elm_ui$Internal$Flag$flag(0);
var $mdgriffith$elm_ui$Element$alpha = function (o) {
	var transparency = function (x) {
		return 1 - x;
	}(
		A2(
			$elm$core$Basics$min,
			1.0,
			A2($elm$core$Basics$max, 0.0, o)));
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$transparency,
		A2(
			$mdgriffith$elm_ui$Internal$Model$Transparency,
			'transparency-' + $mdgriffith$elm_ui$Internal$Model$floatClass(transparency),
			transparency));
};
var $mdgriffith$elm_ui$Internal$Model$Attr = function (a) {
	return {$: 'Attr', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$Button = {$: 'Button'};
var $mdgriffith$elm_ui$Internal$Model$Describe = function (a) {
	return {$: 'Describe', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$Unkeyed = function (a) {
	return {$: 'Unkeyed', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$AsEl = {$: 'AsEl'};
var $mdgriffith$elm_ui$Internal$Model$asEl = $mdgriffith$elm_ui$Internal$Model$AsEl;
var $mdgriffith$elm_ui$Internal$Style$classes = {above: 'a', active: 'atv', alignBottom: 'ab', alignCenterX: 'cx', alignCenterY: 'cy', alignContainerBottom: 'acb', alignContainerCenterX: 'accx', alignContainerCenterY: 'accy', alignContainerRight: 'acr', alignLeft: 'al', alignRight: 'ar', alignTop: 'at', alignedHorizontally: 'ah', alignedVertically: 'av', any: 's', behind: 'bh', below: 'b', bold: 'w7', borderDashed: 'bd', borderDotted: 'bdt', borderNone: 'bn', borderSolid: 'bs', capturePointerEvents: 'cpe', clip: 'cp', clipX: 'cpx', clipY: 'cpy', column: 'c', container: 'ctr', contentBottom: 'cb', contentCenterX: 'ccx', contentCenterY: 'ccy', contentLeft: 'cl', contentRight: 'cr', contentTop: 'ct', cursorPointer: 'cptr', cursorText: 'ctxt', focus: 'fcs', focusedWithin: 'focus-within', fullSize: 'fs', grid: 'g', hasBehind: 'hbh', heightContent: 'hc', heightExact: 'he', heightFill: 'hf', heightFillPortion: 'hfp', hover: 'hv', imageContainer: 'ic', inFront: 'fr', inputLabel: 'lbl', inputMultiline: 'iml', inputMultilineFiller: 'imlf', inputMultilineParent: 'imlp', inputMultilineWrapper: 'implw', inputText: 'it', italic: 'i', link: 'lnk', nearby: 'nb', noTextSelection: 'notxt', onLeft: 'ol', onRight: 'or', opaque: 'oq', overflowHidden: 'oh', page: 'pg', paragraph: 'p', passPointerEvents: 'ppe', root: 'ui', row: 'r', scrollbars: 'sb', scrollbarsX: 'sbx', scrollbarsY: 'sby', seButton: 'sbt', single: 'e', sizeByCapital: 'cap', spaceEvenly: 'sev', strike: 'sk', text: 't', textCenter: 'tc', textExtraBold: 'w8', textExtraLight: 'w2', textHeavy: 'w9', textJustify: 'tj', textJustifyAll: 'tja', textLeft: 'tl', textLight: 'w3', textMedium: 'w5', textNormalWeight: 'w4', textRight: 'tr', textSemiBold: 'w6', textThin: 'w1', textUnitalicized: 'tun', transition: 'ts', transparent: 'clr', underline: 'u', widthContent: 'wc', widthExact: 'we', widthFill: 'wf', widthFillPortion: 'wfp', wrapped: 'wrp'};
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $mdgriffith$elm_ui$Internal$Model$Generic = {$: 'Generic'};
var $mdgriffith$elm_ui$Internal$Model$div = $mdgriffith$elm_ui$Internal$Model$Generic;
var $mdgriffith$elm_ui$Internal$Model$NoNearbyChildren = {$: 'NoNearbyChildren'};
var $mdgriffith$elm_ui$Internal$Model$columnClass = $mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.column);
var $mdgriffith$elm_ui$Internal$Model$gridClass = $mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.grid);
var $mdgriffith$elm_ui$Internal$Model$pageClass = $mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.page);
var $mdgriffith$elm_ui$Internal$Model$paragraphClass = $mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.paragraph);
var $mdgriffith$elm_ui$Internal$Model$rowClass = $mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.row);
var $mdgriffith$elm_ui$Internal$Model$singleClass = $mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.single);
var $mdgriffith$elm_ui$Internal$Model$contextClasses = function (context) {
	switch (context.$) {
		case 'AsRow':
			return $mdgriffith$elm_ui$Internal$Model$rowClass;
		case 'AsColumn':
			return $mdgriffith$elm_ui$Internal$Model$columnClass;
		case 'AsEl':
			return $mdgriffith$elm_ui$Internal$Model$singleClass;
		case 'AsGrid':
			return $mdgriffith$elm_ui$Internal$Model$gridClass;
		case 'AsParagraph':
			return $mdgriffith$elm_ui$Internal$Model$paragraphClass;
		default:
			return $mdgriffith$elm_ui$Internal$Model$pageClass;
	}
};
var $mdgriffith$elm_ui$Internal$Model$Keyed = function (a) {
	return {$: 'Keyed', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$NoStyleSheet = {$: 'NoStyleSheet'};
var $mdgriffith$elm_ui$Internal$Model$Styled = function (a) {
	return {$: 'Styled', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$addChildren = F2(
	function (existing, nearbyChildren) {
		switch (nearbyChildren.$) {
			case 'NoNearbyChildren':
				return existing;
			case 'ChildrenBehind':
				var behind = nearbyChildren.a;
				return _Utils_ap(behind, existing);
			case 'ChildrenInFront':
				var inFront = nearbyChildren.a;
				return _Utils_ap(existing, inFront);
			default:
				var behind = nearbyChildren.a;
				var inFront = nearbyChildren.b;
				return _Utils_ap(
					behind,
					_Utils_ap(existing, inFront));
		}
	});
var $mdgriffith$elm_ui$Internal$Model$addKeyedChildren = F3(
	function (key, existing, nearbyChildren) {
		switch (nearbyChildren.$) {
			case 'NoNearbyChildren':
				return existing;
			case 'ChildrenBehind':
				var behind = nearbyChildren.a;
				return _Utils_ap(
					A2(
						$elm$core$List$map,
						function (x) {
							return _Utils_Tuple2(key, x);
						},
						behind),
					existing);
			case 'ChildrenInFront':
				var inFront = nearbyChildren.a;
				return _Utils_ap(
					existing,
					A2(
						$elm$core$List$map,
						function (x) {
							return _Utils_Tuple2(key, x);
						},
						inFront));
			default:
				var behind = nearbyChildren.a;
				var inFront = nearbyChildren.b;
				return _Utils_ap(
					A2(
						$elm$core$List$map,
						function (x) {
							return _Utils_Tuple2(key, x);
						},
						behind),
					_Utils_ap(
						existing,
						A2(
							$elm$core$List$map,
							function (x) {
								return _Utils_Tuple2(key, x);
							},
							inFront)));
		}
	});
var $mdgriffith$elm_ui$Internal$Model$AsParagraph = {$: 'AsParagraph'};
var $mdgriffith$elm_ui$Internal$Model$asParagraph = $mdgriffith$elm_ui$Internal$Model$AsParagraph;
var $mdgriffith$elm_ui$Internal$Flag$alignBottom = $mdgriffith$elm_ui$Internal$Flag$flag(41);
var $mdgriffith$elm_ui$Internal$Flag$alignRight = $mdgriffith$elm_ui$Internal$Flag$flag(40);
var $mdgriffith$elm_ui$Internal$Flag$centerX = $mdgriffith$elm_ui$Internal$Flag$flag(42);
var $mdgriffith$elm_ui$Internal$Flag$centerY = $mdgriffith$elm_ui$Internal$Flag$flag(43);
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$div = _VirtualDom_node('div');
var $mdgriffith$elm_ui$Internal$Model$lengthClassName = function (x) {
	switch (x.$) {
		case 'Px':
			var px = x.a;
			return $elm$core$String$fromInt(px) + 'px';
		case 'Content':
			return 'auto';
		case 'Fill':
			var i = x.a;
			return $elm$core$String$fromInt(i) + 'fr';
		case 'Min':
			var min = x.a;
			var len = x.b;
			return 'min' + ($elm$core$String$fromInt(min) + $mdgriffith$elm_ui$Internal$Model$lengthClassName(len));
		default:
			var max = x.a;
			var len = x.b;
			return 'max' + ($elm$core$String$fromInt(max) + $mdgriffith$elm_ui$Internal$Model$lengthClassName(len));
	}
};
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $mdgriffith$elm_ui$Internal$Model$transformClass = function (transform) {
	switch (transform.$) {
		case 'Untransformed':
			return $elm$core$Maybe$Nothing;
		case 'Moved':
			var _v1 = transform.a;
			var x = _v1.a;
			var y = _v1.b;
			var z = _v1.c;
			return $elm$core$Maybe$Just(
				'mv-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(x) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(y) + ('-' + $mdgriffith$elm_ui$Internal$Model$floatClass(z))))));
		default:
			var _v2 = transform.a;
			var tx = _v2.a;
			var ty = _v2.b;
			var tz = _v2.c;
			var _v3 = transform.b;
			var sx = _v3.a;
			var sy = _v3.b;
			var sz = _v3.c;
			var _v4 = transform.c;
			var ox = _v4.a;
			var oy = _v4.b;
			var oz = _v4.c;
			var angle = transform.d;
			return $elm$core$Maybe$Just(
				'tfrm-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(tx) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(ty) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(tz) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(sx) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(sy) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(sz) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(ox) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(oy) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(oz) + ('-' + $mdgriffith$elm_ui$Internal$Model$floatClass(angle))))))))))))))))))));
	}
};
var $mdgriffith$elm_ui$Internal$Model$getStyleName = function (style) {
	switch (style.$) {
		case 'Shadows':
			var name = style.a;
			return name;
		case 'Transparency':
			var name = style.a;
			var o = style.b;
			return name;
		case 'Style':
			var _class = style.a;
			return _class;
		case 'FontFamily':
			var name = style.a;
			return name;
		case 'FontSize':
			var i = style.a;
			return 'font-size-' + $elm$core$String$fromInt(i);
		case 'Single':
			var _class = style.a;
			return _class;
		case 'Colored':
			var _class = style.a;
			return _class;
		case 'SpacingStyle':
			var cls = style.a;
			var x = style.b;
			var y = style.c;
			return cls;
		case 'PaddingStyle':
			var cls = style.a;
			var top = style.b;
			var right = style.c;
			var bottom = style.d;
			var left = style.e;
			return cls;
		case 'BorderWidth':
			var cls = style.a;
			var top = style.b;
			var right = style.c;
			var bottom = style.d;
			var left = style.e;
			return cls;
		case 'GridTemplateStyle':
			var template = style.a;
			return 'grid-rows-' + (A2(
				$elm$core$String$join,
				'-',
				A2($elm$core$List$map, $mdgriffith$elm_ui$Internal$Model$lengthClassName, template.rows)) + ('-cols-' + (A2(
				$elm$core$String$join,
				'-',
				A2($elm$core$List$map, $mdgriffith$elm_ui$Internal$Model$lengthClassName, template.columns)) + ('-space-x-' + ($mdgriffith$elm_ui$Internal$Model$lengthClassName(template.spacing.a) + ('-space-y-' + $mdgriffith$elm_ui$Internal$Model$lengthClassName(template.spacing.b)))))));
		case 'GridPosition':
			var pos = style.a;
			return 'gp grid-pos-' + ($elm$core$String$fromInt(pos.row) + ('-' + ($elm$core$String$fromInt(pos.col) + ('-' + ($elm$core$String$fromInt(pos.width) + ('-' + $elm$core$String$fromInt(pos.height)))))));
		case 'PseudoSelector':
			var selector = style.a;
			var subStyle = style.b;
			var name = function () {
				switch (selector.$) {
					case 'Focus':
						return 'fs';
					case 'Hover':
						return 'hv';
					default:
						return 'act';
				}
			}();
			return A2(
				$elm$core$String$join,
				' ',
				A2(
					$elm$core$List$map,
					function (sty) {
						var _v1 = $mdgriffith$elm_ui$Internal$Model$getStyleName(sty);
						if (_v1 === '') {
							return '';
						} else {
							var styleName = _v1;
							return styleName + ('-' + name);
						}
					},
					subStyle));
		default:
			var x = style.a;
			return A2(
				$elm$core$Maybe$withDefault,
				'',
				$mdgriffith$elm_ui$Internal$Model$transformClass(x));
	}
};
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1.$) {
					case 'LT':
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 'EQ':
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (_v0.$ === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0.a;
		return A2($elm$core$Dict$member, key, dict);
	});
var $mdgriffith$elm_ui$Internal$Model$reduceStyles = F2(
	function (style, nevermind) {
		var cache = nevermind.a;
		var existing = nevermind.b;
		var styleName = $mdgriffith$elm_ui$Internal$Model$getStyleName(style);
		return A2($elm$core$Set$member, styleName, cache) ? nevermind : _Utils_Tuple2(
			A2($elm$core$Set$insert, styleName, cache),
			A2($elm$core$List$cons, style, existing));
	});
var $mdgriffith$elm_ui$Internal$Model$Property = F2(
	function (a, b) {
		return {$: 'Property', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$Style = F2(
	function (a, b) {
		return {$: 'Style', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Style$dot = function (c) {
	return '.' + c;
};
var $elm$core$String$fromFloat = _String_fromNumber;
var $mdgriffith$elm_ui$Internal$Model$formatColor = function (_v0) {
	var red = _v0.a;
	var green = _v0.b;
	var blue = _v0.c;
	var alpha = _v0.d;
	return 'rgba(' + ($elm$core$String$fromInt(
		$elm$core$Basics$round(red * 255)) + ((',' + $elm$core$String$fromInt(
		$elm$core$Basics$round(green * 255))) + ((',' + $elm$core$String$fromInt(
		$elm$core$Basics$round(blue * 255))) + (',' + ($elm$core$String$fromFloat(alpha) + ')')))));
};
var $mdgriffith$elm_ui$Internal$Model$formatBoxShadow = function (shadow) {
	return A2(
		$elm$core$String$join,
		' ',
		A2(
			$elm$core$List$filterMap,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					shadow.inset ? $elm$core$Maybe$Just('inset') : $elm$core$Maybe$Nothing,
					$elm$core$Maybe$Just(
					$elm$core$String$fromFloat(shadow.offset.a) + 'px'),
					$elm$core$Maybe$Just(
					$elm$core$String$fromFloat(shadow.offset.b) + 'px'),
					$elm$core$Maybe$Just(
					$elm$core$String$fromFloat(shadow.blur) + 'px'),
					$elm$core$Maybe$Just(
					$elm$core$String$fromFloat(shadow.size) + 'px'),
					$elm$core$Maybe$Just(
					$mdgriffith$elm_ui$Internal$Model$formatColor(shadow.color))
				])));
};
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Tuple$mapFirst = F2(
	function (func, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		return _Utils_Tuple2(
			func(x),
			y);
	});
var $elm$core$Tuple$mapSecond = F2(
	function (func, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		return _Utils_Tuple2(
			x,
			func(y));
	});
var $mdgriffith$elm_ui$Internal$Model$renderFocusStyle = function (focus) {
	return _List_fromArray(
		[
			A2(
			$mdgriffith$elm_ui$Internal$Model$Style,
			$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.focusedWithin) + ':focus-within',
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				_List_fromArray(
					[
						A2(
						$elm$core$Maybe$map,
						function (color) {
							return A2(
								$mdgriffith$elm_ui$Internal$Model$Property,
								'border-color',
								$mdgriffith$elm_ui$Internal$Model$formatColor(color));
						},
						focus.borderColor),
						A2(
						$elm$core$Maybe$map,
						function (color) {
							return A2(
								$mdgriffith$elm_ui$Internal$Model$Property,
								'background-color',
								$mdgriffith$elm_ui$Internal$Model$formatColor(color));
						},
						focus.backgroundColor),
						A2(
						$elm$core$Maybe$map,
						function (shadow) {
							return A2(
								$mdgriffith$elm_ui$Internal$Model$Property,
								'box-shadow',
								$mdgriffith$elm_ui$Internal$Model$formatBoxShadow(
									{
										blur: shadow.blur,
										color: shadow.color,
										inset: false,
										offset: A2(
											$elm$core$Tuple$mapSecond,
											$elm$core$Basics$toFloat,
											A2($elm$core$Tuple$mapFirst, $elm$core$Basics$toFloat, shadow.offset)),
										size: shadow.size
									}));
						},
						focus.shadow),
						$elm$core$Maybe$Just(
						A2($mdgriffith$elm_ui$Internal$Model$Property, 'outline', 'none'))
					]))),
			A2(
			$mdgriffith$elm_ui$Internal$Model$Style,
			($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + ':focus .focusable, ') + (($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + '.focusable:focus, ') + ('.ui-slide-bar:focus + ' + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + ' .focusable-thumb'))),
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				_List_fromArray(
					[
						A2(
						$elm$core$Maybe$map,
						function (color) {
							return A2(
								$mdgriffith$elm_ui$Internal$Model$Property,
								'border-color',
								$mdgriffith$elm_ui$Internal$Model$formatColor(color));
						},
						focus.borderColor),
						A2(
						$elm$core$Maybe$map,
						function (color) {
							return A2(
								$mdgriffith$elm_ui$Internal$Model$Property,
								'background-color',
								$mdgriffith$elm_ui$Internal$Model$formatColor(color));
						},
						focus.backgroundColor),
						A2(
						$elm$core$Maybe$map,
						function (shadow) {
							return A2(
								$mdgriffith$elm_ui$Internal$Model$Property,
								'box-shadow',
								$mdgriffith$elm_ui$Internal$Model$formatBoxShadow(
									{
										blur: shadow.blur,
										color: shadow.color,
										inset: false,
										offset: A2(
											$elm$core$Tuple$mapSecond,
											$elm$core$Basics$toFloat,
											A2($elm$core$Tuple$mapFirst, $elm$core$Basics$toFloat, shadow.offset)),
										size: shadow.size
									}));
						},
						focus.shadow),
						$elm$core$Maybe$Just(
						A2($mdgriffith$elm_ui$Internal$Model$Property, 'outline', 'none'))
					])))
		]);
};
var $elm$virtual_dom$VirtualDom$node = function (tag) {
	return _VirtualDom_node(
		_VirtualDom_noScript(tag));
};
var $elm$virtual_dom$VirtualDom$property = F2(
	function (key, value) {
		return A2(
			_VirtualDom_property,
			_VirtualDom_noInnerHtmlOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlJson(value));
	});
var $mdgriffith$elm_ui$Internal$Style$AllChildren = F2(
	function (a, b) {
		return {$: 'AllChildren', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Style$Batch = function (a) {
	return {$: 'Batch', a: a};
};
var $mdgriffith$elm_ui$Internal$Style$Child = F2(
	function (a, b) {
		return {$: 'Child', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Style$Class = F2(
	function (a, b) {
		return {$: 'Class', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Style$Descriptor = F2(
	function (a, b) {
		return {$: 'Descriptor', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Style$Left = {$: 'Left'};
var $mdgriffith$elm_ui$Internal$Style$Prop = F2(
	function (a, b) {
		return {$: 'Prop', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Style$Right = {$: 'Right'};
var $mdgriffith$elm_ui$Internal$Style$Self = function (a) {
	return {$: 'Self', a: a};
};
var $mdgriffith$elm_ui$Internal$Style$Supports = F2(
	function (a, b) {
		return {$: 'Supports', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Style$Content = function (a) {
	return {$: 'Content', a: a};
};
var $mdgriffith$elm_ui$Internal$Style$Bottom = {$: 'Bottom'};
var $mdgriffith$elm_ui$Internal$Style$CenterX = {$: 'CenterX'};
var $mdgriffith$elm_ui$Internal$Style$CenterY = {$: 'CenterY'};
var $mdgriffith$elm_ui$Internal$Style$Top = {$: 'Top'};
var $mdgriffith$elm_ui$Internal$Style$alignments = _List_fromArray(
	[$mdgriffith$elm_ui$Internal$Style$Top, $mdgriffith$elm_ui$Internal$Style$Bottom, $mdgriffith$elm_ui$Internal$Style$Right, $mdgriffith$elm_ui$Internal$Style$Left, $mdgriffith$elm_ui$Internal$Style$CenterX, $mdgriffith$elm_ui$Internal$Style$CenterY]);
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $mdgriffith$elm_ui$Internal$Style$contentName = function (desc) {
	switch (desc.a.$) {
		case 'Top':
			var _v1 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.contentTop);
		case 'Bottom':
			var _v2 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.contentBottom);
		case 'Right':
			var _v3 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.contentRight);
		case 'Left':
			var _v4 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.contentLeft);
		case 'CenterX':
			var _v5 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.contentCenterX);
		default:
			var _v6 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.contentCenterY);
	}
};
var $mdgriffith$elm_ui$Internal$Style$selfName = function (desc) {
	switch (desc.a.$) {
		case 'Top':
			var _v1 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignTop);
		case 'Bottom':
			var _v2 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignBottom);
		case 'Right':
			var _v3 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignRight);
		case 'Left':
			var _v4 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignLeft);
		case 'CenterX':
			var _v5 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignCenterX);
		default:
			var _v6 = desc.a;
			return $mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignCenterY);
	}
};
var $mdgriffith$elm_ui$Internal$Style$describeAlignment = function (values) {
	var createDescription = function (alignment) {
		var _v0 = values(alignment);
		var content = _v0.a;
		var indiv = _v0.b;
		return _List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$contentName(
					$mdgriffith$elm_ui$Internal$Style$Content(alignment)),
				content),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Child,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$selfName(
							$mdgriffith$elm_ui$Internal$Style$Self(alignment)),
						indiv)
					]))
			]);
	};
	return $mdgriffith$elm_ui$Internal$Style$Batch(
		A2($elm$core$List$concatMap, createDescription, $mdgriffith$elm_ui$Internal$Style$alignments));
};
var $mdgriffith$elm_ui$Internal$Style$elDescription = _List_fromArray(
	[
		A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex'),
		A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-direction', 'column'),
		A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'pre'),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Descriptor,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.hasBehind),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '0'),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Child,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.behind),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '-1')
					]))
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Descriptor,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.seButton),
		_List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Internal$Style$Child,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.text),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '0')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthFill),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'auto !important')
							]))
					]))
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Child,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightContent),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', 'auto')
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Child,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '100000')
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Child,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthFill),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%')
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Child,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthFillPortion),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%')
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Child,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthContent),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'flex-start')
			])),
		$mdgriffith$elm_ui$Internal$Style$describeAlignment(
		function (alignment) {
			switch (alignment.$) {
				case 'Top':
					return _Utils_Tuple2(
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'flex-start')
							]),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', 'auto !important'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', '0 !important')
							]));
				case 'Bottom':
					return _Utils_Tuple2(
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'flex-end')
							]),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', 'auto !important'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', '0 !important')
							]));
				case 'Right':
					return _Utils_Tuple2(
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'flex-end')
							]),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'flex-end')
							]));
				case 'Left':
					return _Utils_Tuple2(
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'flex-start')
							]),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'flex-start')
							]));
				case 'CenterX':
					return _Utils_Tuple2(
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'center')
							]),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'center')
							]));
				default:
					return _Utils_Tuple2(
						_List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', 'auto'),
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', 'auto')
									]))
							]),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', 'auto !important'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', 'auto !important')
							]));
			}
		})
	]);
var $mdgriffith$elm_ui$Internal$Style$gridAlignments = function (values) {
	var createDescription = function (alignment) {
		return _List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Internal$Style$Child,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$selfName(
							$mdgriffith$elm_ui$Internal$Style$Self(alignment)),
						values(alignment))
					]))
			]);
	};
	return $mdgriffith$elm_ui$Internal$Style$Batch(
		A2($elm$core$List$concatMap, createDescription, $mdgriffith$elm_ui$Internal$Style$alignments));
};
var $mdgriffith$elm_ui$Internal$Style$Above = {$: 'Above'};
var $mdgriffith$elm_ui$Internal$Style$Behind = {$: 'Behind'};
var $mdgriffith$elm_ui$Internal$Style$Below = {$: 'Below'};
var $mdgriffith$elm_ui$Internal$Style$OnLeft = {$: 'OnLeft'};
var $mdgriffith$elm_ui$Internal$Style$OnRight = {$: 'OnRight'};
var $mdgriffith$elm_ui$Internal$Style$Within = {$: 'Within'};
var $mdgriffith$elm_ui$Internal$Style$locations = function () {
	var loc = $mdgriffith$elm_ui$Internal$Style$Above;
	var _v0 = function () {
		switch (loc.$) {
			case 'Above':
				return _Utils_Tuple0;
			case 'Below':
				return _Utils_Tuple0;
			case 'OnRight':
				return _Utils_Tuple0;
			case 'OnLeft':
				return _Utils_Tuple0;
			case 'Within':
				return _Utils_Tuple0;
			default:
				return _Utils_Tuple0;
		}
	}();
	return _List_fromArray(
		[$mdgriffith$elm_ui$Internal$Style$Above, $mdgriffith$elm_ui$Internal$Style$Below, $mdgriffith$elm_ui$Internal$Style$OnRight, $mdgriffith$elm_ui$Internal$Style$OnLeft, $mdgriffith$elm_ui$Internal$Style$Within, $mdgriffith$elm_ui$Internal$Style$Behind]);
}();
var $mdgriffith$elm_ui$Internal$Style$baseSheet = _List_fromArray(
	[
		A2(
		$mdgriffith$elm_ui$Internal$Style$Class,
		'html,body',
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'padding', '0'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0')
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Class,
		_Utils_ap(
			$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
			_Utils_ap(
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.single),
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.imageContainer))),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'block'),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						'img',
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'max-height', '100%'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'object-fit', 'cover')
							]))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthFill),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						'img',
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'max-width', '100%'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'object-fit', 'cover')
							]))
					]))
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Class,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + ':focus',
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'outline', 'none')
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Class,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.root),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', 'auto'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'min-height', '100%'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '0'),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				_Utils_ap(
					$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
					$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill)),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%')
							]))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Child,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inFront),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.nearby),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'fixed'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '20')
							]))
					]))
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Class,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.nearby),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'relative'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'border', 'none'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-direction', 'row'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', 'auto'),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.single),
				$mdgriffith$elm_ui$Internal$Style$elDescription),
				$mdgriffith$elm_ui$Internal$Style$Batch(
				function (fn) {
					return A2($elm$core$List$map, fn, $mdgriffith$elm_ui$Internal$Style$locations);
				}(
					function (loc) {
						switch (loc.$) {
							case 'Above':
								return A2(
									$mdgriffith$elm_ui$Internal$Style$Descriptor,
									$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.above),
									_List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'absolute'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'bottom', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'left', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '20'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important'),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill),
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', 'auto')
												])),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthFill),
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%')
												])),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'none'),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											'*',
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'auto')
												]))
										]));
							case 'Below':
								return A2(
									$mdgriffith$elm_ui$Internal$Style$Descriptor,
									$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.below),
									_List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'absolute'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'bottom', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'left', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '20'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'none'),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											'*',
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'auto')
												])),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill),
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', 'auto')
												]))
										]));
							case 'OnRight':
								return A2(
									$mdgriffith$elm_ui$Internal$Style$Descriptor,
									$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.onRight),
									_List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'absolute'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'left', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'top', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '20'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'none'),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											'*',
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'auto')
												]))
										]));
							case 'OnLeft':
								return A2(
									$mdgriffith$elm_ui$Internal$Style$Descriptor,
									$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.onLeft),
									_List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'absolute'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'right', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'top', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '20'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'none'),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											'*',
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'auto')
												]))
										]));
							case 'Within':
								return A2(
									$mdgriffith$elm_ui$Internal$Style$Descriptor,
									$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inFront),
									_List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'absolute'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'left', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'top', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'none'),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											'*',
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'auto')
												]))
										]));
							default:
								return A2(
									$mdgriffith$elm_ui$Internal$Style$Descriptor,
									$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.behind),
									_List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'absolute'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'left', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'top', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '0'),
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'none'),
											A2(
											$mdgriffith$elm_ui$Internal$Style$Child,
											'*',
											_List_fromArray(
												[
													A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'auto')
												]))
										]));
						}
					}))
			])),
		A2(
		$mdgriffith$elm_ui$Internal$Style$Class,
		$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
		_List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'relative'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'border', 'none'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-shrink', '0'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-direction', 'row'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', 'auto'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'resize', 'none'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-feature-settings', 'inherit'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'box-sizing', 'border-box'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'padding', '0'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'border-width', '0'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'border-style', 'solid'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-size', 'inherit'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'color', 'inherit'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-family', 'inherit'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'line-height', '1'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', 'inherit'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-decoration', 'none'),
				A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-style', 'inherit'),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.wrapped),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-wrap', 'wrap')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.noTextSelection),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, '-moz-user-select', 'none'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, '-webkit-user-select', 'none'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, '-ms-user-select', 'none'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'user-select', 'none')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.cursorPointer),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'cursor', 'pointer')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.cursorText),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'cursor', 'text')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.passPointerEvents),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'none !important')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.capturePointerEvents),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'auto !important')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.transparent),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'opacity', '0')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.opaque),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'opacity', '1')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot(
					_Utils_ap($mdgriffith$elm_ui$Internal$Style$classes.hover, $mdgriffith$elm_ui$Internal$Style$classes.transparent)) + ':hover',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'opacity', '0')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot(
					_Utils_ap($mdgriffith$elm_ui$Internal$Style$classes.hover, $mdgriffith$elm_ui$Internal$Style$classes.opaque)) + ':hover',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'opacity', '1')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot(
					_Utils_ap($mdgriffith$elm_ui$Internal$Style$classes.focus, $mdgriffith$elm_ui$Internal$Style$classes.transparent)) + ':focus',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'opacity', '0')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot(
					_Utils_ap($mdgriffith$elm_ui$Internal$Style$classes.focus, $mdgriffith$elm_ui$Internal$Style$classes.opaque)) + ':focus',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'opacity', '1')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot(
					_Utils_ap($mdgriffith$elm_ui$Internal$Style$classes.active, $mdgriffith$elm_ui$Internal$Style$classes.transparent)) + ':active',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'opacity', '0')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot(
					_Utils_ap($mdgriffith$elm_ui$Internal$Style$classes.active, $mdgriffith$elm_ui$Internal$Style$classes.opaque)) + ':active',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'opacity', '1')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.transition),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Style$Prop,
						'transition',
						A2(
							$elm$core$String$join,
							', ',
							A2(
								$elm$core$List$map,
								function (x) {
									return x + ' 160ms';
								},
								_List_fromArray(
									['transform', 'opacity', 'filter', 'background-color', 'color', 'font-size']))))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.scrollbars),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'overflow', 'auto'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-shrink', '1')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.scrollbarsX),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'overflow-x', 'auto'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.row),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-shrink', '1')
							]))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.scrollbarsY),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'overflow-y', 'auto'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.column),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-shrink', '1')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.single),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-shrink', '1')
							]))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.clip),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'overflow', 'hidden')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.clipX),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'overflow-x', 'hidden')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.clipY),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'overflow-y', 'hidden')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthContent),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', 'auto')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.borderNone),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'border-width', '0')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.borderDashed),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'border-style', 'dashed')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.borderDotted),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'border-style', 'dotted')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.borderSolid),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'border-style', 'solid')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.text),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'pre'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline-block')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inputText),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'line-height', '1.05'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'background', 'transparent'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-align', 'inherit')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.single),
				$mdgriffith$elm_ui$Internal$Style$elDescription),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.row),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-direction', 'row'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', '0%'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthExact),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', 'auto')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.link),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', 'auto')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'stretch !important')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFillPortion),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'stretch !important')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthFill),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '100000')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.container),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '0'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', 'auto'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'stretch')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						'u:first-of-type.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerRight,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '1')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						's:first-of-type.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterX,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '1'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignCenterX),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-left', 'auto !important')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						's:last-of-type.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterX,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '1'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignCenterX),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-right', 'auto !important')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						's:only-of-type.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterX,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '1'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignCenterY),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', 'auto !important'),
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', 'auto !important')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						's:last-of-type.' + ($mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterX + ' ~ u'),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '0')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						'u:first-of-type.' + ($mdgriffith$elm_ui$Internal$Style$classes.alignContainerRight + (' ~ s.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterX)),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '0')
							])),
						$mdgriffith$elm_ui$Internal$Style$describeAlignment(
						function (alignment) {
							switch (alignment.$) {
								case 'Top':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'flex-start')
											]),
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'flex-start')
											]));
								case 'Bottom':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'flex-end')
											]),
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'flex-end')
											]));
								case 'Right':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'flex-end')
											]),
										_List_Nil);
								case 'Left':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'flex-start')
											]),
										_List_Nil);
								case 'CenterX':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'center')
											]),
										_List_Nil);
								default:
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'center')
											]),
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'center')
											]));
							}
						}),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.spaceEvenly),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'space-between')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inputLabel),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'baseline')
							]))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.column),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-direction', 'column'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', '0px'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'min-height', 'min-content'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightExact),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', 'auto')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.heightFill),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '100000')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthFill),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthFillPortion),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthContent),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'flex-start')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						'u:first-of-type.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerBottom,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '1')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						's:first-of-type.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterY,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '1'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignCenterY),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', 'auto !important'),
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', '0 !important')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						's:last-of-type.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterY,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '1'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignCenterY),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', 'auto !important'),
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', '0 !important')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						's:only-of-type.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterY,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '1'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.alignCenterY),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', 'auto !important'),
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', 'auto !important')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						's:last-of-type.' + ($mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterY + ' ~ u'),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '0')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						'u:first-of-type.' + ($mdgriffith$elm_ui$Internal$Style$classes.alignContainerBottom + (' ~ s.' + $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterY)),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '0')
							])),
						$mdgriffith$elm_ui$Internal$Style$describeAlignment(
						function (alignment) {
							switch (alignment.$) {
								case 'Top':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'flex-start')
											]),
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-bottom', 'auto')
											]));
								case 'Bottom':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'flex-end')
											]),
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin-top', 'auto')
											]));
								case 'Right':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'flex-end')
											]),
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'flex-end')
											]));
								case 'Left':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'flex-start')
											]),
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'flex-start')
											]));
								case 'CenterX':
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'center')
											]),
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'center')
											]));
								default:
									return _Utils_Tuple2(
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'center')
											]),
										_List_Nil);
							}
						}),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.container),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-grow', '0'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', 'auto'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-self', 'stretch !important')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.spaceEvenly),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'space-between')
							]))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.grid),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', '-ms-grid'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						'.gp',
						_List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Supports,
						_Utils_Tuple2('display', 'grid'),
						_List_fromArray(
							[
								_Utils_Tuple2('display', 'grid')
							])),
						$mdgriffith$elm_ui$Internal$Style$gridAlignments(
						function (alignment) {
							switch (alignment.$) {
								case 'Top':
									return _List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'flex-start')
										]);
								case 'Bottom':
									return _List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'flex-end')
										]);
								case 'Right':
									return _List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'flex-end')
										]);
								case 'Left':
									return _List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'flex-start')
										]);
								case 'CenterX':
									return _List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'align-items', 'center')
										]);
								default:
									return _List_fromArray(
										[
											A2($mdgriffith$elm_ui$Internal$Style$Prop, 'justify-content', 'center')
										]);
							}
						})
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.page),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'block'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any + ':first-child'),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot(
							$mdgriffith$elm_ui$Internal$Style$classes.any + ($mdgriffith$elm_ui$Internal$Style$selfName(
								$mdgriffith$elm_ui$Internal$Style$Self($mdgriffith$elm_ui$Internal$Style$Left)) + (':first-child + .' + $mdgriffith$elm_ui$Internal$Style$classes.any))),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot(
							$mdgriffith$elm_ui$Internal$Style$classes.any + ($mdgriffith$elm_ui$Internal$Style$selfName(
								$mdgriffith$elm_ui$Internal$Style$Self($mdgriffith$elm_ui$Internal$Style$Right)) + (':first-child + .' + $mdgriffith$elm_ui$Internal$Style$classes.any))),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'margin', '0 !important')
							])),
						$mdgriffith$elm_ui$Internal$Style$describeAlignment(
						function (alignment) {
							switch (alignment.$) {
								case 'Top':
									return _Utils_Tuple2(_List_Nil, _List_Nil);
								case 'Bottom':
									return _Utils_Tuple2(_List_Nil, _List_Nil);
								case 'Right':
									return _Utils_Tuple2(
										_List_Nil,
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'float', 'right'),
												A2(
												$mdgriffith$elm_ui$Internal$Style$Descriptor,
												'::after',
												_List_fromArray(
													[
														A2($mdgriffith$elm_ui$Internal$Style$Prop, 'content', '\"\"'),
														A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'table'),
														A2($mdgriffith$elm_ui$Internal$Style$Prop, 'clear', 'both')
													]))
											]));
								case 'Left':
									return _Utils_Tuple2(
										_List_Nil,
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'float', 'left'),
												A2(
												$mdgriffith$elm_ui$Internal$Style$Descriptor,
												'::after',
												_List_fromArray(
													[
														A2($mdgriffith$elm_ui$Internal$Style$Prop, 'content', '\"\"'),
														A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'table'),
														A2($mdgriffith$elm_ui$Internal$Style$Prop, 'clear', 'both')
													]))
											]));
								case 'CenterX':
									return _Utils_Tuple2(_List_Nil, _List_Nil);
								default:
									return _Utils_Tuple2(_List_Nil, _List_Nil);
							}
						})
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inputMultiline),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'pre-wrap !important'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'background-color', 'transparent')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inputMultilineWrapper),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.single),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'flex-basis', 'auto')
							]))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inputMultilineParent),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'pre-wrap !important'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'cursor', 'text'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inputMultilineFiller),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'pre-wrap !important'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'color', 'transparent')
							]))
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.paragraph),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'block'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'normal'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'overflow-wrap', 'break-word'),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Descriptor,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.hasBehind),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '0'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.behind),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'z-index', '-1')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$AllChildren,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.text),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'normal')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$AllChildren,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.paragraph),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								'::after',
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'content', 'none')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								'::before',
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'content', 'none')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$AllChildren,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.single),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline'),
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'normal'),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.widthExact),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline-block')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.inFront),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.behind),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.above),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.below),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.onRight),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Descriptor,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.onLeft),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'flex')
									])),
								A2(
								$mdgriffith$elm_ui$Internal$Style$Child,
								$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.text),
								_List_fromArray(
									[
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline'),
										A2($mdgriffith$elm_ui$Internal$Style$Prop, 'white-space', 'normal')
									]))
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.row),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.column),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline-flex')
							])),
						A2(
						$mdgriffith$elm_ui$Internal$Style$Child,
						$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.grid),
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'inline-grid')
							])),
						$mdgriffith$elm_ui$Internal$Style$describeAlignment(
						function (alignment) {
							switch (alignment.$) {
								case 'Top':
									return _Utils_Tuple2(_List_Nil, _List_Nil);
								case 'Bottom':
									return _Utils_Tuple2(_List_Nil, _List_Nil);
								case 'Right':
									return _Utils_Tuple2(
										_List_Nil,
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'float', 'right')
											]));
								case 'Left':
									return _Utils_Tuple2(
										_List_Nil,
										_List_fromArray(
											[
												A2($mdgriffith$elm_ui$Internal$Style$Prop, 'float', 'left')
											]));
								case 'CenterX':
									return _Utils_Tuple2(_List_Nil, _List_Nil);
								default:
									return _Utils_Tuple2(_List_Nil, _List_Nil);
							}
						})
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				'.hidden',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'display', 'none')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textThin),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '100')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textExtraLight),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '200')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textLight),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '300')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textNormalWeight),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '400')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textMedium),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '500')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textSemiBold),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '600')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.bold),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '700')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textExtraBold),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '800')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textHeavy),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-weight', '900')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.italic),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-style', 'italic')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.strike),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-decoration', 'line-through')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.underline),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-decoration', 'underline'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-decoration-skip-ink', 'auto'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-decoration-skip', 'ink')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				_Utils_ap(
					$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.underline),
					$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.strike)),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-decoration', 'line-through underline'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-decoration-skip-ink', 'auto'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-decoration-skip', 'ink')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textUnitalicized),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-style', 'normal')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textJustify),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-align', 'justify')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textJustifyAll),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-align', 'justify-all')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textCenter),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-align', 'center')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textRight),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-align', 'right')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				$mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.textLeft),
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'text-align', 'left')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Descriptor,
				'.modal',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'position', 'fixed'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'left', '0'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'top', '0'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'width', '100%'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'height', '100%'),
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'pointer-events', 'none')
					]))
			]))
	]);
var $mdgriffith$elm_ui$Internal$Style$fontVariant = function (_var) {
	return _List_fromArray(
		[
			A2(
			$mdgriffith$elm_ui$Internal$Style$Class,
			'.v-' + _var,
			_List_fromArray(
				[
					A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-feature-settings', '\"' + (_var + '\"'))
				])),
			A2(
			$mdgriffith$elm_ui$Internal$Style$Class,
			'.v-' + (_var + '-off'),
			_List_fromArray(
				[
					A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-feature-settings', '\"' + (_var + '\" 0'))
				]))
		]);
};
var $mdgriffith$elm_ui$Internal$Style$commonValues = $elm$core$List$concat(
	_List_fromArray(
		[
			A2(
			$elm$core$List$map,
			function (x) {
				return A2(
					$mdgriffith$elm_ui$Internal$Style$Class,
					'.border-' + $elm$core$String$fromInt(x),
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Internal$Style$Prop,
							'border-width',
							$elm$core$String$fromInt(x) + 'px')
						]));
			},
			A2($elm$core$List$range, 0, 6)),
			A2(
			$elm$core$List$map,
			function (i) {
				return A2(
					$mdgriffith$elm_ui$Internal$Style$Class,
					'.font-size-' + $elm$core$String$fromInt(i),
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Internal$Style$Prop,
							'font-size',
							$elm$core$String$fromInt(i) + 'px')
						]));
			},
			A2($elm$core$List$range, 8, 32)),
			A2(
			$elm$core$List$map,
			function (i) {
				return A2(
					$mdgriffith$elm_ui$Internal$Style$Class,
					'.p-' + $elm$core$String$fromInt(i),
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Internal$Style$Prop,
							'padding',
							$elm$core$String$fromInt(i) + 'px')
						]));
			},
			A2($elm$core$List$range, 0, 24)),
			_List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Internal$Style$Class,
				'.v-smcp',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-variant', 'small-caps')
					])),
				A2(
				$mdgriffith$elm_ui$Internal$Style$Class,
				'.v-smcp-off',
				_List_fromArray(
					[
						A2($mdgriffith$elm_ui$Internal$Style$Prop, 'font-variant', 'normal')
					]))
			]),
			$mdgriffith$elm_ui$Internal$Style$fontVariant('zero'),
			$mdgriffith$elm_ui$Internal$Style$fontVariant('onum'),
			$mdgriffith$elm_ui$Internal$Style$fontVariant('liga'),
			$mdgriffith$elm_ui$Internal$Style$fontVariant('dlig'),
			$mdgriffith$elm_ui$Internal$Style$fontVariant('ordn'),
			$mdgriffith$elm_ui$Internal$Style$fontVariant('tnum'),
			$mdgriffith$elm_ui$Internal$Style$fontVariant('afrc'),
			$mdgriffith$elm_ui$Internal$Style$fontVariant('frac')
		]));
var $mdgriffith$elm_ui$Internal$Style$explainer = '\n.explain {\n    border: 6px solid rgb(174, 121, 15) !important;\n}\n.explain > .' + ($mdgriffith$elm_ui$Internal$Style$classes.any + (' {\n    border: 4px dashed rgb(0, 151, 167) !important;\n}\n\n.ctr {\n    border: none !important;\n}\n.explain > .ctr > .' + ($mdgriffith$elm_ui$Internal$Style$classes.any + ' {\n    border: 4px dashed rgb(0, 151, 167) !important;\n}\n\n')));
var $mdgriffith$elm_ui$Internal$Style$inputTextReset = '\ninput[type="search"],\ninput[type="search"]::-webkit-search-decoration,\ninput[type="search"]::-webkit-search-cancel-button,\ninput[type="search"]::-webkit-search-results-button,\ninput[type="search"]::-webkit-search-results-decoration {\n  -webkit-appearance:none;\n}\n';
var $mdgriffith$elm_ui$Internal$Style$sliderReset = '\ninput[type=range] {\n  -webkit-appearance: none; \n  background: transparent;\n  position:absolute;\n  left:0;\n  top:0;\n  z-index:10;\n  width: 100%;\n  outline: dashed 1px;\n  height: 100%;\n  opacity: 0;\n}\n';
var $mdgriffith$elm_ui$Internal$Style$thumbReset = '\ninput[type=range]::-webkit-slider-thumb {\n    -webkit-appearance: none;\n    opacity: 0.5;\n    width: 80px;\n    height: 80px;\n    background-color: black;\n    border:none;\n    border-radius: 5px;\n}\ninput[type=range]::-moz-range-thumb {\n    opacity: 0.5;\n    width: 80px;\n    height: 80px;\n    background-color: black;\n    border:none;\n    border-radius: 5px;\n}\ninput[type=range]::-ms-thumb {\n    opacity: 0.5;\n    width: 80px;\n    height: 80px;\n    background-color: black;\n    border:none;\n    border-radius: 5px;\n}\ninput[type=range][orient=vertical]{\n    writing-mode: bt-lr; /* IE */\n    -webkit-appearance: slider-vertical;  /* WebKit */\n}\n';
var $mdgriffith$elm_ui$Internal$Style$trackReset = '\ninput[type=range]::-moz-range-track {\n    background: transparent;\n    cursor: pointer;\n}\ninput[type=range]::-ms-track {\n    background: transparent;\n    cursor: pointer;\n}\ninput[type=range]::-webkit-slider-runnable-track {\n    background: transparent;\n    cursor: pointer;\n}\n';
var $mdgriffith$elm_ui$Internal$Style$overrides = '@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {' + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.row) + (' > ' + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + (' { flex-basis: auto !important; } ' + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.row) + (' > ' + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.container) + (' { flex-basis: auto !important; }}' + ($mdgriffith$elm_ui$Internal$Style$inputTextReset + ($mdgriffith$elm_ui$Internal$Style$sliderReset + ($mdgriffith$elm_ui$Internal$Style$trackReset + ($mdgriffith$elm_ui$Internal$Style$thumbReset + $mdgriffith$elm_ui$Internal$Style$explainer)))))))))))))));
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $mdgriffith$elm_ui$Internal$Style$Intermediate = function (a) {
	return {$: 'Intermediate', a: a};
};
var $mdgriffith$elm_ui$Internal$Style$emptyIntermediate = F2(
	function (selector, closing) {
		return $mdgriffith$elm_ui$Internal$Style$Intermediate(
			{closing: closing, others: _List_Nil, props: _List_Nil, selector: selector});
	});
var $mdgriffith$elm_ui$Internal$Style$renderRules = F2(
	function (_v0, rulesToRender) {
		var parent = _v0.a;
		var generateIntermediates = F2(
			function (rule, rendered) {
				switch (rule.$) {
					case 'Prop':
						var name = rule.a;
						var val = rule.b;
						return _Utils_update(
							rendered,
							{
								props: A2(
									$elm$core$List$cons,
									_Utils_Tuple2(name, val),
									rendered.props)
							});
					case 'Supports':
						var _v2 = rule.a;
						var prop = _v2.a;
						var value = _v2.b;
						var props = rule.b;
						return _Utils_update(
							rendered,
							{
								others: A2(
									$elm$core$List$cons,
									$mdgriffith$elm_ui$Internal$Style$Intermediate(
										{closing: '\n}', others: _List_Nil, props: props, selector: '@supports (' + (prop + (':' + (value + (') {' + parent.selector))))}),
									rendered.others)
							});
					case 'Adjacent':
						var selector = rule.a;
						var adjRules = rule.b;
						return _Utils_update(
							rendered,
							{
								others: A2(
									$elm$core$List$cons,
									A2(
										$mdgriffith$elm_ui$Internal$Style$renderRules,
										A2($mdgriffith$elm_ui$Internal$Style$emptyIntermediate, parent.selector + (' + ' + selector), ''),
										adjRules),
									rendered.others)
							});
					case 'Child':
						var child = rule.a;
						var childRules = rule.b;
						return _Utils_update(
							rendered,
							{
								others: A2(
									$elm$core$List$cons,
									A2(
										$mdgriffith$elm_ui$Internal$Style$renderRules,
										A2($mdgriffith$elm_ui$Internal$Style$emptyIntermediate, parent.selector + (' > ' + child), ''),
										childRules),
									rendered.others)
							});
					case 'AllChildren':
						var child = rule.a;
						var childRules = rule.b;
						return _Utils_update(
							rendered,
							{
								others: A2(
									$elm$core$List$cons,
									A2(
										$mdgriffith$elm_ui$Internal$Style$renderRules,
										A2($mdgriffith$elm_ui$Internal$Style$emptyIntermediate, parent.selector + (' ' + child), ''),
										childRules),
									rendered.others)
							});
					case 'Descriptor':
						var descriptor = rule.a;
						var descriptorRules = rule.b;
						return _Utils_update(
							rendered,
							{
								others: A2(
									$elm$core$List$cons,
									A2(
										$mdgriffith$elm_ui$Internal$Style$renderRules,
										A2(
											$mdgriffith$elm_ui$Internal$Style$emptyIntermediate,
											_Utils_ap(parent.selector, descriptor),
											''),
										descriptorRules),
									rendered.others)
							});
					default:
						var batched = rule.a;
						return _Utils_update(
							rendered,
							{
								others: A2(
									$elm$core$List$cons,
									A2(
										$mdgriffith$elm_ui$Internal$Style$renderRules,
										A2($mdgriffith$elm_ui$Internal$Style$emptyIntermediate, parent.selector, ''),
										batched),
									rendered.others)
							});
				}
			});
		return $mdgriffith$elm_ui$Internal$Style$Intermediate(
			A3($elm$core$List$foldr, generateIntermediates, parent, rulesToRender));
	});
var $mdgriffith$elm_ui$Internal$Style$renderCompact = function (styleClasses) {
	var renderValues = function (values) {
		return $elm$core$String$concat(
			A2(
				$elm$core$List$map,
				function (_v3) {
					var x = _v3.a;
					var y = _v3.b;
					return x + (':' + (y + ';'));
				},
				values));
	};
	var renderClass = function (rule) {
		var _v2 = rule.props;
		if (!_v2.b) {
			return '';
		} else {
			return rule.selector + ('{' + (renderValues(rule.props) + (rule.closing + '}')));
		}
	};
	var renderIntermediate = function (_v0) {
		var rule = _v0.a;
		return _Utils_ap(
			renderClass(rule),
			$elm$core$String$concat(
				A2($elm$core$List$map, renderIntermediate, rule.others)));
	};
	return $elm$core$String$concat(
		A2(
			$elm$core$List$map,
			renderIntermediate,
			A3(
				$elm$core$List$foldr,
				F2(
					function (_v1, existing) {
						var name = _v1.a;
						var styleRules = _v1.b;
						return A2(
							$elm$core$List$cons,
							A2(
								$mdgriffith$elm_ui$Internal$Style$renderRules,
								A2($mdgriffith$elm_ui$Internal$Style$emptyIntermediate, name, ''),
								styleRules),
							existing);
					}),
				_List_Nil,
				styleClasses)));
};
var $mdgriffith$elm_ui$Internal$Style$rules = _Utils_ap(
	$mdgriffith$elm_ui$Internal$Style$overrides,
	$mdgriffith$elm_ui$Internal$Style$renderCompact(
		_Utils_ap($mdgriffith$elm_ui$Internal$Style$baseSheet, $mdgriffith$elm_ui$Internal$Style$commonValues)));
var $mdgriffith$elm_ui$Internal$Model$staticRoot = function (opts) {
	var _v0 = opts.mode;
	switch (_v0.$) {
		case 'Layout':
			return A3(
				$elm$virtual_dom$VirtualDom$node,
				'div',
				_List_Nil,
				_List_fromArray(
					[
						A3(
						$elm$virtual_dom$VirtualDom$node,
						'style',
						_List_Nil,
						_List_fromArray(
							[
								$elm$virtual_dom$VirtualDom$text($mdgriffith$elm_ui$Internal$Style$rules)
							]))
					]));
		case 'NoStaticStyleSheet':
			return $elm$virtual_dom$VirtualDom$text('');
		default:
			return A3(
				$elm$virtual_dom$VirtualDom$node,
				'elm-ui-static-rules',
				_List_fromArray(
					[
						A2(
						$elm$virtual_dom$VirtualDom$property,
						'rules',
						$elm$json$Json$Encode$string($mdgriffith$elm_ui$Internal$Style$rules))
					]),
				_List_Nil);
	}
};
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(_Utils_Tuple0),
				entries));
	});
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(_Utils_Tuple0),
			pairs));
};
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $mdgriffith$elm_ui$Internal$Model$fontName = function (font) {
	switch (font.$) {
		case 'Serif':
			return 'serif';
		case 'SansSerif':
			return 'sans-serif';
		case 'Monospace':
			return 'monospace';
		case 'Typeface':
			var name = font.a;
			return '\"' + (name + '\"');
		case 'ImportFont':
			var name = font.a;
			var url = font.b;
			return '\"' + (name + '\"');
		default:
			var name = font.a.name;
			return '\"' + (name + '\"');
	}
};
var $mdgriffith$elm_ui$Internal$Model$isSmallCaps = function (_var) {
	switch (_var.$) {
		case 'VariantActive':
			var name = _var.a;
			return name === 'smcp';
		case 'VariantOff':
			var name = _var.a;
			return false;
		default:
			var name = _var.a;
			var index = _var.b;
			return (name === 'smcp') && (index === 1);
	}
};
var $mdgriffith$elm_ui$Internal$Model$hasSmallCaps = function (typeface) {
	if (typeface.$ === 'FontWith') {
		var font = typeface.a;
		return A2($elm$core$List$any, $mdgriffith$elm_ui$Internal$Model$isSmallCaps, font.variants);
	} else {
		return false;
	}
};
var $mdgriffith$elm_ui$Internal$Model$renderProps = F3(
	function (force, _v0, existing) {
		var key = _v0.a;
		var val = _v0.b;
		return force ? (existing + ('\n  ' + (key + (': ' + (val + ' !important;'))))) : (existing + ('\n  ' + (key + (': ' + (val + ';')))));
	});
var $mdgriffith$elm_ui$Internal$Model$renderStyle = F4(
	function (options, maybePseudo, selector, props) {
		if (maybePseudo.$ === 'Nothing') {
			return _List_fromArray(
				[
					selector + ('{' + (A3(
					$elm$core$List$foldl,
					$mdgriffith$elm_ui$Internal$Model$renderProps(false),
					'',
					props) + '\n}'))
				]);
		} else {
			var pseudo = maybePseudo.a;
			switch (pseudo.$) {
				case 'Hover':
					var _v2 = options.hover;
					switch (_v2.$) {
						case 'NoHover':
							return _List_Nil;
						case 'ForceHover':
							return _List_fromArray(
								[
									selector + ('-hv {' + (A3(
									$elm$core$List$foldl,
									$mdgriffith$elm_ui$Internal$Model$renderProps(true),
									'',
									props) + '\n}'))
								]);
						default:
							return _List_fromArray(
								[
									selector + ('-hv:hover {' + (A3(
									$elm$core$List$foldl,
									$mdgriffith$elm_ui$Internal$Model$renderProps(false),
									'',
									props) + '\n}'))
								]);
					}
				case 'Focus':
					var renderedProps = A3(
						$elm$core$List$foldl,
						$mdgriffith$elm_ui$Internal$Model$renderProps(false),
						'',
						props);
					return _List_fromArray(
						[
							selector + ('-fs:focus {' + (renderedProps + '\n}')),
							('.' + ($mdgriffith$elm_ui$Internal$Style$classes.any + (':focus ' + (selector + '-fs  {')))) + (renderedProps + '\n}'),
							(selector + '-fs:focus-within {') + (renderedProps + '\n}'),
							('.ui-slide-bar:focus + ' + ($mdgriffith$elm_ui$Internal$Style$dot($mdgriffith$elm_ui$Internal$Style$classes.any) + (' .focusable-thumb' + (selector + '-fs {')))) + (renderedProps + '\n}')
						]);
				default:
					return _List_fromArray(
						[
							selector + ('-act:active {' + (A3(
							$elm$core$List$foldl,
							$mdgriffith$elm_ui$Internal$Model$renderProps(false),
							'',
							props) + '\n}'))
						]);
			}
		}
	});
var $mdgriffith$elm_ui$Internal$Model$renderVariant = function (_var) {
	switch (_var.$) {
		case 'VariantActive':
			var name = _var.a;
			return '\"' + (name + '\"');
		case 'VariantOff':
			var name = _var.a;
			return '\"' + (name + '\" 0');
		default:
			var name = _var.a;
			var index = _var.b;
			return '\"' + (name + ('\" ' + $elm$core$String$fromInt(index)));
	}
};
var $mdgriffith$elm_ui$Internal$Model$renderVariants = function (typeface) {
	if (typeface.$ === 'FontWith') {
		var font = typeface.a;
		return $elm$core$Maybe$Just(
			A2(
				$elm$core$String$join,
				', ',
				A2($elm$core$List$map, $mdgriffith$elm_ui$Internal$Model$renderVariant, font.variants)));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $mdgriffith$elm_ui$Internal$Model$transformValue = function (transform) {
	switch (transform.$) {
		case 'Untransformed':
			return $elm$core$Maybe$Nothing;
		case 'Moved':
			var _v1 = transform.a;
			var x = _v1.a;
			var y = _v1.b;
			var z = _v1.c;
			return $elm$core$Maybe$Just(
				'translate3d(' + ($elm$core$String$fromFloat(x) + ('px, ' + ($elm$core$String$fromFloat(y) + ('px, ' + ($elm$core$String$fromFloat(z) + 'px)'))))));
		default:
			var _v2 = transform.a;
			var tx = _v2.a;
			var ty = _v2.b;
			var tz = _v2.c;
			var _v3 = transform.b;
			var sx = _v3.a;
			var sy = _v3.b;
			var sz = _v3.c;
			var _v4 = transform.c;
			var ox = _v4.a;
			var oy = _v4.b;
			var oz = _v4.c;
			var angle = transform.d;
			var translate = 'translate3d(' + ($elm$core$String$fromFloat(tx) + ('px, ' + ($elm$core$String$fromFloat(ty) + ('px, ' + ($elm$core$String$fromFloat(tz) + 'px)')))));
			var scale = 'scale3d(' + ($elm$core$String$fromFloat(sx) + (', ' + ($elm$core$String$fromFloat(sy) + (', ' + ($elm$core$String$fromFloat(sz) + ')')))));
			var rotate = 'rotate3d(' + ($elm$core$String$fromFloat(ox) + (', ' + ($elm$core$String$fromFloat(oy) + (', ' + ($elm$core$String$fromFloat(oz) + (', ' + ($elm$core$String$fromFloat(angle) + 'rad)')))))));
			return $elm$core$Maybe$Just(translate + (' ' + (scale + (' ' + rotate))));
	}
};
var $mdgriffith$elm_ui$Internal$Model$renderStyleRule = F3(
	function (options, rule, maybePseudo) {
		switch (rule.$) {
			case 'Style':
				var selector = rule.a;
				var props = rule.b;
				return A4($mdgriffith$elm_ui$Internal$Model$renderStyle, options, maybePseudo, selector, props);
			case 'Shadows':
				var name = rule.a;
				var prop = rule.b;
				return A4(
					$mdgriffith$elm_ui$Internal$Model$renderStyle,
					options,
					maybePseudo,
					'.' + name,
					_List_fromArray(
						[
							A2($mdgriffith$elm_ui$Internal$Model$Property, 'box-shadow', prop)
						]));
			case 'Transparency':
				var name = rule.a;
				var transparency = rule.b;
				var opacity = A2(
					$elm$core$Basics$max,
					0,
					A2($elm$core$Basics$min, 1, 1 - transparency));
				return A4(
					$mdgriffith$elm_ui$Internal$Model$renderStyle,
					options,
					maybePseudo,
					'.' + name,
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Internal$Model$Property,
							'opacity',
							$elm$core$String$fromFloat(opacity))
						]));
			case 'FontSize':
				var i = rule.a;
				return A4(
					$mdgriffith$elm_ui$Internal$Model$renderStyle,
					options,
					maybePseudo,
					'.font-size-' + $elm$core$String$fromInt(i),
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Internal$Model$Property,
							'font-size',
							$elm$core$String$fromInt(i) + 'px')
						]));
			case 'FontFamily':
				var name = rule.a;
				var typefaces = rule.b;
				var features = A2(
					$elm$core$String$join,
					', ',
					A2($elm$core$List$filterMap, $mdgriffith$elm_ui$Internal$Model$renderVariants, typefaces));
				var families = _List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Internal$Model$Property,
						'font-family',
						A2(
							$elm$core$String$join,
							', ',
							A2($elm$core$List$map, $mdgriffith$elm_ui$Internal$Model$fontName, typefaces))),
						A2($mdgriffith$elm_ui$Internal$Model$Property, 'font-feature-settings', features),
						A2(
						$mdgriffith$elm_ui$Internal$Model$Property,
						'font-variant',
						A2($elm$core$List$any, $mdgriffith$elm_ui$Internal$Model$hasSmallCaps, typefaces) ? 'small-caps' : 'normal')
					]);
				return A4($mdgriffith$elm_ui$Internal$Model$renderStyle, options, maybePseudo, '.' + name, families);
			case 'Single':
				var _class = rule.a;
				var prop = rule.b;
				var val = rule.c;
				return A4(
					$mdgriffith$elm_ui$Internal$Model$renderStyle,
					options,
					maybePseudo,
					'.' + _class,
					_List_fromArray(
						[
							A2($mdgriffith$elm_ui$Internal$Model$Property, prop, val)
						]));
			case 'Colored':
				var _class = rule.a;
				var prop = rule.b;
				var color = rule.c;
				return A4(
					$mdgriffith$elm_ui$Internal$Model$renderStyle,
					options,
					maybePseudo,
					'.' + _class,
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Internal$Model$Property,
							prop,
							$mdgriffith$elm_ui$Internal$Model$formatColor(color))
						]));
			case 'SpacingStyle':
				var cls = rule.a;
				var x = rule.b;
				var y = rule.c;
				var yPx = $elm$core$String$fromInt(y) + 'px';
				var xPx = $elm$core$String$fromInt(x) + 'px';
				var single = '.' + $mdgriffith$elm_ui$Internal$Style$classes.single;
				var row = '.' + $mdgriffith$elm_ui$Internal$Style$classes.row;
				var wrappedRow = '.' + ($mdgriffith$elm_ui$Internal$Style$classes.wrapped + row);
				var right = '.' + $mdgriffith$elm_ui$Internal$Style$classes.alignRight;
				var paragraph = '.' + $mdgriffith$elm_ui$Internal$Style$classes.paragraph;
				var page = '.' + $mdgriffith$elm_ui$Internal$Style$classes.page;
				var left = '.' + $mdgriffith$elm_ui$Internal$Style$classes.alignLeft;
				var halfY = $elm$core$String$fromFloat(y / 2) + 'px';
				var halfX = $elm$core$String$fromFloat(x / 2) + 'px';
				var column = '.' + $mdgriffith$elm_ui$Internal$Style$classes.column;
				var _class = '.' + cls;
				var any = '.' + $mdgriffith$elm_ui$Internal$Style$classes.any;
				return $elm$core$List$concat(
					_List_fromArray(
						[
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (row + (' > ' + (any + (' + ' + any)))),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'margin-left', xPx)
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (wrappedRow + (' > ' + any)),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'margin', halfY + (' ' + halfX))
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (column + (' > ' + (any + (' + ' + any)))),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'margin-top', yPx)
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (page + (' > ' + (any + (' + ' + any)))),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'margin-top', yPx)
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (page + (' > ' + left)),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'margin-right', xPx)
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (page + (' > ' + right)),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'margin-left', xPx)
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_Utils_ap(_class, paragraph),
							_List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Internal$Model$Property,
									'line-height',
									'calc(1em + ' + ($elm$core$String$fromInt(y) + 'px)'))
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							'textarea' + (any + _class),
							_List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Internal$Model$Property,
									'line-height',
									'calc(1em + ' + ($elm$core$String$fromInt(y) + 'px)')),
									A2(
									$mdgriffith$elm_ui$Internal$Model$Property,
									'height',
									'calc(100% + ' + ($elm$core$String$fromInt(y) + 'px)'))
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (paragraph + (' > ' + left)),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'margin-right', xPx)
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (paragraph + (' > ' + right)),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'margin-left', xPx)
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (paragraph + '::after'),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'content', '\'\''),
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'display', 'block'),
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'height', '0'),
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'width', '0'),
									A2(
									$mdgriffith$elm_ui$Internal$Model$Property,
									'margin-top',
									$elm$core$String$fromInt((-1) * ((y / 2) | 0)) + 'px')
								])),
							A4(
							$mdgriffith$elm_ui$Internal$Model$renderStyle,
							options,
							maybePseudo,
							_class + (paragraph + '::before'),
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'content', '\'\''),
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'display', 'block'),
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'height', '0'),
									A2($mdgriffith$elm_ui$Internal$Model$Property, 'width', '0'),
									A2(
									$mdgriffith$elm_ui$Internal$Model$Property,
									'margin-bottom',
									$elm$core$String$fromInt((-1) * ((y / 2) | 0)) + 'px')
								]))
						]));
			case 'PaddingStyle':
				var cls = rule.a;
				var top = rule.b;
				var right = rule.c;
				var bottom = rule.d;
				var left = rule.e;
				var _class = '.' + cls;
				return A4(
					$mdgriffith$elm_ui$Internal$Model$renderStyle,
					options,
					maybePseudo,
					_class,
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Internal$Model$Property,
							'padding',
							$elm$core$String$fromFloat(top) + ('px ' + ($elm$core$String$fromFloat(right) + ('px ' + ($elm$core$String$fromFloat(bottom) + ('px ' + ($elm$core$String$fromFloat(left) + 'px')))))))
						]));
			case 'BorderWidth':
				var cls = rule.a;
				var top = rule.b;
				var right = rule.c;
				var bottom = rule.d;
				var left = rule.e;
				var _class = '.' + cls;
				return A4(
					$mdgriffith$elm_ui$Internal$Model$renderStyle,
					options,
					maybePseudo,
					_class,
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Internal$Model$Property,
							'border-width',
							$elm$core$String$fromInt(top) + ('px ' + ($elm$core$String$fromInt(right) + ('px ' + ($elm$core$String$fromInt(bottom) + ('px ' + ($elm$core$String$fromInt(left) + 'px')))))))
						]));
			case 'GridTemplateStyle':
				var template = rule.a;
				var toGridLengthHelper = F3(
					function (minimum, maximum, x) {
						toGridLengthHelper:
						while (true) {
							switch (x.$) {
								case 'Px':
									var px = x.a;
									return $elm$core$String$fromInt(px) + 'px';
								case 'Content':
									var _v2 = _Utils_Tuple2(minimum, maximum);
									if (_v2.a.$ === 'Nothing') {
										if (_v2.b.$ === 'Nothing') {
											var _v3 = _v2.a;
											var _v4 = _v2.b;
											return 'max-content';
										} else {
											var _v6 = _v2.a;
											var maxSize = _v2.b.a;
											return 'minmax(max-content, ' + ($elm$core$String$fromInt(maxSize) + 'px)');
										}
									} else {
										if (_v2.b.$ === 'Nothing') {
											var minSize = _v2.a.a;
											var _v5 = _v2.b;
											return 'minmax(' + ($elm$core$String$fromInt(minSize) + ('px, ' + 'max-content)'));
										} else {
											var minSize = _v2.a.a;
											var maxSize = _v2.b.a;
											return 'minmax(' + ($elm$core$String$fromInt(minSize) + ('px, ' + ($elm$core$String$fromInt(maxSize) + 'px)')));
										}
									}
								case 'Fill':
									var i = x.a;
									var _v7 = _Utils_Tuple2(minimum, maximum);
									if (_v7.a.$ === 'Nothing') {
										if (_v7.b.$ === 'Nothing') {
											var _v8 = _v7.a;
											var _v9 = _v7.b;
											return $elm$core$String$fromInt(i) + 'fr';
										} else {
											var _v11 = _v7.a;
											var maxSize = _v7.b.a;
											return 'minmax(max-content, ' + ($elm$core$String$fromInt(maxSize) + 'px)');
										}
									} else {
										if (_v7.b.$ === 'Nothing') {
											var minSize = _v7.a.a;
											var _v10 = _v7.b;
											return 'minmax(' + ($elm$core$String$fromInt(minSize) + ('px, ' + ($elm$core$String$fromInt(i) + ('fr' + 'fr)'))));
										} else {
											var minSize = _v7.a.a;
											var maxSize = _v7.b.a;
											return 'minmax(' + ($elm$core$String$fromInt(minSize) + ('px, ' + ($elm$core$String$fromInt(maxSize) + 'px)')));
										}
									}
								case 'Min':
									var m = x.a;
									var len = x.b;
									var $temp$minimum = $elm$core$Maybe$Just(m),
										$temp$maximum = maximum,
										$temp$x = len;
									minimum = $temp$minimum;
									maximum = $temp$maximum;
									x = $temp$x;
									continue toGridLengthHelper;
								default:
									var m = x.a;
									var len = x.b;
									var $temp$minimum = minimum,
										$temp$maximum = $elm$core$Maybe$Just(m),
										$temp$x = len;
									minimum = $temp$minimum;
									maximum = $temp$maximum;
									x = $temp$x;
									continue toGridLengthHelper;
							}
						}
					});
				var toGridLength = function (x) {
					return A3(toGridLengthHelper, $elm$core$Maybe$Nothing, $elm$core$Maybe$Nothing, x);
				};
				var xSpacing = toGridLength(template.spacing.a);
				var ySpacing = toGridLength(template.spacing.b);
				var rows = function (x) {
					return 'grid-template-rows: ' + (x + ';');
				}(
					A2(
						$elm$core$String$join,
						' ',
						A2($elm$core$List$map, toGridLength, template.rows)));
				var msRows = function (x) {
					return '-ms-grid-rows: ' + (x + ';');
				}(
					A2(
						$elm$core$String$join,
						ySpacing,
						A2($elm$core$List$map, toGridLength, template.columns)));
				var msColumns = function (x) {
					return '-ms-grid-columns: ' + (x + ';');
				}(
					A2(
						$elm$core$String$join,
						ySpacing,
						A2($elm$core$List$map, toGridLength, template.columns)));
				var gapY = 'grid-row-gap:' + (toGridLength(template.spacing.b) + ';');
				var gapX = 'grid-column-gap:' + (toGridLength(template.spacing.a) + ';');
				var columns = function (x) {
					return 'grid-template-columns: ' + (x + ';');
				}(
					A2(
						$elm$core$String$join,
						' ',
						A2($elm$core$List$map, toGridLength, template.columns)));
				var _class = '.grid-rows-' + (A2(
					$elm$core$String$join,
					'-',
					A2($elm$core$List$map, $mdgriffith$elm_ui$Internal$Model$lengthClassName, template.rows)) + ('-cols-' + (A2(
					$elm$core$String$join,
					'-',
					A2($elm$core$List$map, $mdgriffith$elm_ui$Internal$Model$lengthClassName, template.columns)) + ('-space-x-' + ($mdgriffith$elm_ui$Internal$Model$lengthClassName(template.spacing.a) + ('-space-y-' + $mdgriffith$elm_ui$Internal$Model$lengthClassName(template.spacing.b)))))));
				var modernGrid = _class + ('{' + (columns + (rows + (gapX + (gapY + '}')))));
				var supports = '@supports (display:grid) {' + (modernGrid + '}');
				var base = _class + ('{' + (msColumns + (msRows + '}')));
				return _List_fromArray(
					[base, supports]);
			case 'GridPosition':
				var position = rule.a;
				var msPosition = A2(
					$elm$core$String$join,
					' ',
					_List_fromArray(
						[
							'-ms-grid-row: ' + ($elm$core$String$fromInt(position.row) + ';'),
							'-ms-grid-row-span: ' + ($elm$core$String$fromInt(position.height) + ';'),
							'-ms-grid-column: ' + ($elm$core$String$fromInt(position.col) + ';'),
							'-ms-grid-column-span: ' + ($elm$core$String$fromInt(position.width) + ';')
						]));
				var modernPosition = A2(
					$elm$core$String$join,
					' ',
					_List_fromArray(
						[
							'grid-row: ' + ($elm$core$String$fromInt(position.row) + (' / ' + ($elm$core$String$fromInt(position.row + position.height) + ';'))),
							'grid-column: ' + ($elm$core$String$fromInt(position.col) + (' / ' + ($elm$core$String$fromInt(position.col + position.width) + ';')))
						]));
				var _class = '.grid-pos-' + ($elm$core$String$fromInt(position.row) + ('-' + ($elm$core$String$fromInt(position.col) + ('-' + ($elm$core$String$fromInt(position.width) + ('-' + $elm$core$String$fromInt(position.height)))))));
				var modernGrid = _class + ('{' + (modernPosition + '}'));
				var supports = '@supports (display:grid) {' + (modernGrid + '}');
				var base = _class + ('{' + (msPosition + '}'));
				return _List_fromArray(
					[base, supports]);
			case 'PseudoSelector':
				var _class = rule.a;
				var styles = rule.b;
				var renderPseudoRule = function (style) {
					return A3(
						$mdgriffith$elm_ui$Internal$Model$renderStyleRule,
						options,
						style,
						$elm$core$Maybe$Just(_class));
				};
				return A2($elm$core$List$concatMap, renderPseudoRule, styles);
			default:
				var transform = rule.a;
				var val = $mdgriffith$elm_ui$Internal$Model$transformValue(transform);
				var _class = $mdgriffith$elm_ui$Internal$Model$transformClass(transform);
				var _v12 = _Utils_Tuple2(_class, val);
				if ((_v12.a.$ === 'Just') && (_v12.b.$ === 'Just')) {
					var cls = _v12.a.a;
					var v = _v12.b.a;
					return A4(
						$mdgriffith$elm_ui$Internal$Model$renderStyle,
						options,
						maybePseudo,
						'.' + cls,
						_List_fromArray(
							[
								A2($mdgriffith$elm_ui$Internal$Model$Property, 'transform', v)
							]));
				} else {
					return _List_Nil;
				}
		}
	});
var $mdgriffith$elm_ui$Internal$Model$encodeStyles = F2(
	function (options, stylesheet) {
		return $elm$json$Json$Encode$object(
			A2(
				$elm$core$List$map,
				function (style) {
					var styled = A3($mdgriffith$elm_ui$Internal$Model$renderStyleRule, options, style, $elm$core$Maybe$Nothing);
					return _Utils_Tuple2(
						$mdgriffith$elm_ui$Internal$Model$getStyleName(style),
						A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, styled));
				},
				stylesheet));
	});
var $mdgriffith$elm_ui$Internal$Model$bracket = F2(
	function (selector, rules) {
		var renderPair = function (_v0) {
			var name = _v0.a;
			var val = _v0.b;
			return name + (': ' + (val + ';'));
		};
		return selector + (' {' + (A2(
			$elm$core$String$join,
			'',
			A2($elm$core$List$map, renderPair, rules)) + '}'));
	});
var $mdgriffith$elm_ui$Internal$Model$fontRule = F3(
	function (name, modifier, _v0) {
		var parentAdj = _v0.a;
		var textAdjustment = _v0.b;
		return _List_fromArray(
			[
				A2($mdgriffith$elm_ui$Internal$Model$bracket, '.' + (name + ('.' + (modifier + (', ' + ('.' + (name + (' .' + modifier))))))), parentAdj),
				A2($mdgriffith$elm_ui$Internal$Model$bracket, '.' + (name + ('.' + (modifier + ('> .' + ($mdgriffith$elm_ui$Internal$Style$classes.text + (', .' + (name + (' .' + (modifier + (' > .' + $mdgriffith$elm_ui$Internal$Style$classes.text)))))))))), textAdjustment)
			]);
	});
var $mdgriffith$elm_ui$Internal$Model$renderFontAdjustmentRule = F3(
	function (fontToAdjust, _v0, otherFontName) {
		var full = _v0.a;
		var capital = _v0.b;
		var name = _Utils_eq(fontToAdjust, otherFontName) ? fontToAdjust : (otherFontName + (' .' + fontToAdjust));
		return A2(
			$elm$core$String$join,
			' ',
			_Utils_ap(
				A3($mdgriffith$elm_ui$Internal$Model$fontRule, name, $mdgriffith$elm_ui$Internal$Style$classes.sizeByCapital, capital),
				A3($mdgriffith$elm_ui$Internal$Model$fontRule, name, $mdgriffith$elm_ui$Internal$Style$classes.fullSize, full)));
	});
var $mdgriffith$elm_ui$Internal$Model$renderNullAdjustmentRule = F2(
	function (fontToAdjust, otherFontName) {
		var name = _Utils_eq(fontToAdjust, otherFontName) ? fontToAdjust : (otherFontName + (' .' + fontToAdjust));
		return A2(
			$elm$core$String$join,
			' ',
			_List_fromArray(
				[
					A2(
					$mdgriffith$elm_ui$Internal$Model$bracket,
					'.' + (name + ('.' + ($mdgriffith$elm_ui$Internal$Style$classes.sizeByCapital + (', ' + ('.' + (name + (' .' + $mdgriffith$elm_ui$Internal$Style$classes.sizeByCapital))))))),
					_List_fromArray(
						[
							_Utils_Tuple2('line-height', '1')
						])),
					A2(
					$mdgriffith$elm_ui$Internal$Model$bracket,
					'.' + (name + ('.' + ($mdgriffith$elm_ui$Internal$Style$classes.sizeByCapital + ('> .' + ($mdgriffith$elm_ui$Internal$Style$classes.text + (', .' + (name + (' .' + ($mdgriffith$elm_ui$Internal$Style$classes.sizeByCapital + (' > .' + $mdgriffith$elm_ui$Internal$Style$classes.text)))))))))),
					_List_fromArray(
						[
							_Utils_Tuple2('vertical-align', '0'),
							_Utils_Tuple2('line-height', '1')
						]))
				]));
	});
var $mdgriffith$elm_ui$Internal$Model$adjust = F3(
	function (size, height, vertical) {
		return {height: height / size, size: size, vertical: vertical};
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$core$List$maximum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(
			A3($elm$core$List$foldl, $elm$core$Basics$max, x, xs));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$List$minimum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(
			A3($elm$core$List$foldl, $elm$core$Basics$min, x, xs));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$Basics$neq = _Utils_notEqual;
var $mdgriffith$elm_ui$Internal$Model$convertAdjustment = function (adjustment) {
	var lines = _List_fromArray(
		[adjustment.capital, adjustment.baseline, adjustment.descender, adjustment.lowercase]);
	var lineHeight = 1.5;
	var normalDescender = (lineHeight - 1) / 2;
	var oldMiddle = lineHeight / 2;
	var descender = A2(
		$elm$core$Maybe$withDefault,
		adjustment.descender,
		$elm$core$List$minimum(lines));
	var newBaseline = A2(
		$elm$core$Maybe$withDefault,
		adjustment.baseline,
		$elm$core$List$minimum(
			A2(
				$elm$core$List$filter,
				function (x) {
					return !_Utils_eq(x, descender);
				},
				lines)));
	var base = lineHeight;
	var ascender = A2(
		$elm$core$Maybe$withDefault,
		adjustment.capital,
		$elm$core$List$maximum(lines));
	var capitalSize = 1 / (ascender - newBaseline);
	var capitalVertical = 1 - ascender;
	var fullSize = 1 / (ascender - descender);
	var fullVertical = 1 - ascender;
	var newCapitalMiddle = ((ascender - newBaseline) / 2) + newBaseline;
	var newFullMiddle = ((ascender - descender) / 2) + descender;
	return {
		capital: A3($mdgriffith$elm_ui$Internal$Model$adjust, capitalSize, ascender - newBaseline, capitalVertical),
		full: A3($mdgriffith$elm_ui$Internal$Model$adjust, fullSize, ascender - descender, fullVertical)
	};
};
var $mdgriffith$elm_ui$Internal$Model$fontAdjustmentRules = function (converted) {
	return _Utils_Tuple2(
		_List_fromArray(
			[
				_Utils_Tuple2('display', 'block')
			]),
		_List_fromArray(
			[
				_Utils_Tuple2('display', 'inline-block'),
				_Utils_Tuple2(
				'line-height',
				$elm$core$String$fromFloat(converted.height)),
				_Utils_Tuple2(
				'vertical-align',
				$elm$core$String$fromFloat(converted.vertical) + 'em'),
				_Utils_Tuple2(
				'font-size',
				$elm$core$String$fromFloat(converted.size) + 'em')
			]));
};
var $mdgriffith$elm_ui$Internal$Model$typefaceAdjustment = function (typefaces) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (face, found) {
				if (found.$ === 'Nothing') {
					if (face.$ === 'FontWith') {
						var _with = face.a;
						var _v2 = _with.adjustment;
						if (_v2.$ === 'Nothing') {
							return found;
						} else {
							var adjustment = _v2.a;
							return $elm$core$Maybe$Just(
								_Utils_Tuple2(
									$mdgriffith$elm_ui$Internal$Model$fontAdjustmentRules(
										function ($) {
											return $.full;
										}(
											$mdgriffith$elm_ui$Internal$Model$convertAdjustment(adjustment))),
									$mdgriffith$elm_ui$Internal$Model$fontAdjustmentRules(
										function ($) {
											return $.capital;
										}(
											$mdgriffith$elm_ui$Internal$Model$convertAdjustment(adjustment)))));
						}
					} else {
						return found;
					}
				} else {
					return found;
				}
			}),
		$elm$core$Maybe$Nothing,
		typefaces);
};
var $mdgriffith$elm_ui$Internal$Model$renderTopLevelValues = function (rules) {
	var withImport = function (font) {
		if (font.$ === 'ImportFont') {
			var url = font.b;
			return $elm$core$Maybe$Just('@import url(\'' + (url + '\');'));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	};
	var fontImports = function (_v2) {
		var name = _v2.a;
		var typefaces = _v2.b;
		var imports = A2(
			$elm$core$String$join,
			'\n',
			A2($elm$core$List$filterMap, withImport, typefaces));
		return imports;
	};
	var allNames = A2($elm$core$List$map, $elm$core$Tuple$first, rules);
	var fontAdjustments = function (_v1) {
		var name = _v1.a;
		var typefaces = _v1.b;
		var _v0 = $mdgriffith$elm_ui$Internal$Model$typefaceAdjustment(typefaces);
		if (_v0.$ === 'Nothing') {
			return A2(
				$elm$core$String$join,
				'',
				A2(
					$elm$core$List$map,
					$mdgriffith$elm_ui$Internal$Model$renderNullAdjustmentRule(name),
					allNames));
		} else {
			var adjustment = _v0.a;
			return A2(
				$elm$core$String$join,
				'',
				A2(
					$elm$core$List$map,
					A2($mdgriffith$elm_ui$Internal$Model$renderFontAdjustmentRule, name, adjustment),
					allNames));
		}
	};
	return _Utils_ap(
		A2(
			$elm$core$String$join,
			'\n',
			A2($elm$core$List$map, fontImports, rules)),
		A2(
			$elm$core$String$join,
			'\n',
			A2($elm$core$List$map, fontAdjustments, rules)));
};
var $mdgriffith$elm_ui$Internal$Model$topLevelValue = function (rule) {
	if (rule.$ === 'FontFamily') {
		var name = rule.a;
		var typefaces = rule.b;
		return $elm$core$Maybe$Just(
			_Utils_Tuple2(name, typefaces));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $mdgriffith$elm_ui$Internal$Model$toStyleSheetString = F2(
	function (options, stylesheet) {
		var combine = F2(
			function (style, rendered) {
				return {
					rules: _Utils_ap(
						rendered.rules,
						A3($mdgriffith$elm_ui$Internal$Model$renderStyleRule, options, style, $elm$core$Maybe$Nothing)),
					topLevel: function () {
						var _v1 = $mdgriffith$elm_ui$Internal$Model$topLevelValue(style);
						if (_v1.$ === 'Nothing') {
							return rendered.topLevel;
						} else {
							var topLevel = _v1.a;
							return A2($elm$core$List$cons, topLevel, rendered.topLevel);
						}
					}()
				};
			});
		var _v0 = A3(
			$elm$core$List$foldl,
			combine,
			{rules: _List_Nil, topLevel: _List_Nil},
			stylesheet);
		var topLevel = _v0.topLevel;
		var rules = _v0.rules;
		return _Utils_ap(
			$mdgriffith$elm_ui$Internal$Model$renderTopLevelValues(topLevel),
			$elm$core$String$concat(rules));
	});
var $mdgriffith$elm_ui$Internal$Model$toStyleSheet = F2(
	function (options, styleSheet) {
		var _v0 = options.mode;
		switch (_v0.$) {
			case 'Layout':
				return A3(
					$elm$virtual_dom$VirtualDom$node,
					'div',
					_List_Nil,
					_List_fromArray(
						[
							A3(
							$elm$virtual_dom$VirtualDom$node,
							'style',
							_List_Nil,
							_List_fromArray(
								[
									$elm$virtual_dom$VirtualDom$text(
									A2($mdgriffith$elm_ui$Internal$Model$toStyleSheetString, options, styleSheet))
								]))
						]));
			case 'NoStaticStyleSheet':
				return A3(
					$elm$virtual_dom$VirtualDom$node,
					'div',
					_List_Nil,
					_List_fromArray(
						[
							A3(
							$elm$virtual_dom$VirtualDom$node,
							'style',
							_List_Nil,
							_List_fromArray(
								[
									$elm$virtual_dom$VirtualDom$text(
									A2($mdgriffith$elm_ui$Internal$Model$toStyleSheetString, options, styleSheet))
								]))
						]));
			default:
				return A3(
					$elm$virtual_dom$VirtualDom$node,
					'elm-ui-rules',
					_List_fromArray(
						[
							A2(
							$elm$virtual_dom$VirtualDom$property,
							'rules',
							A2($mdgriffith$elm_ui$Internal$Model$encodeStyles, options, styleSheet))
						]),
					_List_Nil);
		}
	});
var $mdgriffith$elm_ui$Internal$Model$embedKeyed = F4(
	function (_static, opts, styles, children) {
		var dynamicStyleSheet = A2(
			$mdgriffith$elm_ui$Internal$Model$toStyleSheet,
			opts,
			A3(
				$elm$core$List$foldl,
				$mdgriffith$elm_ui$Internal$Model$reduceStyles,
				_Utils_Tuple2(
					$elm$core$Set$empty,
					$mdgriffith$elm_ui$Internal$Model$renderFocusStyle(opts.focus)),
				styles).b);
		return _static ? A2(
			$elm$core$List$cons,
			_Utils_Tuple2(
				'static-stylesheet',
				$mdgriffith$elm_ui$Internal$Model$staticRoot(opts)),
			A2(
				$elm$core$List$cons,
				_Utils_Tuple2('dynamic-stylesheet', dynamicStyleSheet),
				children)) : A2(
			$elm$core$List$cons,
			_Utils_Tuple2('dynamic-stylesheet', dynamicStyleSheet),
			children);
	});
var $mdgriffith$elm_ui$Internal$Model$embedWith = F4(
	function (_static, opts, styles, children) {
		var dynamicStyleSheet = A2(
			$mdgriffith$elm_ui$Internal$Model$toStyleSheet,
			opts,
			A3(
				$elm$core$List$foldl,
				$mdgriffith$elm_ui$Internal$Model$reduceStyles,
				_Utils_Tuple2(
					$elm$core$Set$empty,
					$mdgriffith$elm_ui$Internal$Model$renderFocusStyle(opts.focus)),
				styles).b);
		return _static ? A2(
			$elm$core$List$cons,
			$mdgriffith$elm_ui$Internal$Model$staticRoot(opts),
			A2($elm$core$List$cons, dynamicStyleSheet, children)) : A2($elm$core$List$cons, dynamicStyleSheet, children);
	});
var $mdgriffith$elm_ui$Internal$Flag$heightBetween = $mdgriffith$elm_ui$Internal$Flag$flag(45);
var $mdgriffith$elm_ui$Internal$Flag$heightFill = $mdgriffith$elm_ui$Internal$Flag$flag(37);
var $elm$virtual_dom$VirtualDom$keyedNode = function (tag) {
	return _VirtualDom_keyedNode(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$p = _VirtualDom_node('p');
var $mdgriffith$elm_ui$Internal$Flag$present = F2(
	function (myFlag, _v0) {
		var fieldOne = _v0.a;
		var fieldTwo = _v0.b;
		if (myFlag.$ === 'Flag') {
			var first = myFlag.a;
			return _Utils_eq(first & fieldOne, first);
		} else {
			var second = myFlag.a;
			return _Utils_eq(second & fieldTwo, second);
		}
	});
var $elm$html$Html$s = _VirtualDom_node('s');
var $elm$html$Html$u = _VirtualDom_node('u');
var $mdgriffith$elm_ui$Internal$Flag$widthBetween = $mdgriffith$elm_ui$Internal$Flag$flag(44);
var $mdgriffith$elm_ui$Internal$Flag$widthFill = $mdgriffith$elm_ui$Internal$Flag$flag(39);
var $mdgriffith$elm_ui$Internal$Model$finalizeNode = F6(
	function (has, node, attributes, children, embedMode, parentContext) {
		var createNode = F2(
			function (nodeName, attrs) {
				if (children.$ === 'Keyed') {
					var keyed = children.a;
					return A3(
						$elm$virtual_dom$VirtualDom$keyedNode,
						nodeName,
						attrs,
						function () {
							switch (embedMode.$) {
								case 'NoStyleSheet':
									return keyed;
								case 'OnlyDynamic':
									var opts = embedMode.a;
									var styles = embedMode.b;
									return A4($mdgriffith$elm_ui$Internal$Model$embedKeyed, false, opts, styles, keyed);
								default:
									var opts = embedMode.a;
									var styles = embedMode.b;
									return A4($mdgriffith$elm_ui$Internal$Model$embedKeyed, true, opts, styles, keyed);
							}
						}());
				} else {
					var unkeyed = children.a;
					return A2(
						function () {
							switch (nodeName) {
								case 'div':
									return $elm$html$Html$div;
								case 'p':
									return $elm$html$Html$p;
								default:
									return $elm$virtual_dom$VirtualDom$node(nodeName);
							}
						}(),
						attrs,
						function () {
							switch (embedMode.$) {
								case 'NoStyleSheet':
									return unkeyed;
								case 'OnlyDynamic':
									var opts = embedMode.a;
									var styles = embedMode.b;
									return A4($mdgriffith$elm_ui$Internal$Model$embedWith, false, opts, styles, unkeyed);
								default:
									var opts = embedMode.a;
									var styles = embedMode.b;
									return A4($mdgriffith$elm_ui$Internal$Model$embedWith, true, opts, styles, unkeyed);
							}
						}());
				}
			});
		var html = function () {
			switch (node.$) {
				case 'Generic':
					return A2(createNode, 'div', attributes);
				case 'NodeName':
					var nodeName = node.a;
					return A2(createNode, nodeName, attributes);
				default:
					var nodeName = node.a;
					var internal = node.b;
					return A3(
						$elm$virtual_dom$VirtualDom$node,
						nodeName,
						attributes,
						_List_fromArray(
							[
								A2(
								createNode,
								internal,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class($mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.single))
									]))
							]));
			}
		}();
		switch (parentContext.$) {
			case 'AsRow':
				return (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$widthFill, has) && (!A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$widthBetween, has))) ? html : (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$alignRight, has) ? A2(
					$elm$html$Html$u,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							A2(
								$elm$core$String$join,
								' ',
								_List_fromArray(
									[$mdgriffith$elm_ui$Internal$Style$classes.any, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.container, $mdgriffith$elm_ui$Internal$Style$classes.contentCenterY, $mdgriffith$elm_ui$Internal$Style$classes.alignContainerRight])))
						]),
					_List_fromArray(
						[html])) : (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$centerX, has) ? A2(
					$elm$html$Html$s,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							A2(
								$elm$core$String$join,
								' ',
								_List_fromArray(
									[$mdgriffith$elm_ui$Internal$Style$classes.any, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.container, $mdgriffith$elm_ui$Internal$Style$classes.contentCenterY, $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterX])))
						]),
					_List_fromArray(
						[html])) : html));
			case 'AsColumn':
				return (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$heightFill, has) && (!A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$heightBetween, has))) ? html : (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$centerY, has) ? A2(
					$elm$html$Html$s,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							A2(
								$elm$core$String$join,
								' ',
								_List_fromArray(
									[$mdgriffith$elm_ui$Internal$Style$classes.any, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.container, $mdgriffith$elm_ui$Internal$Style$classes.alignContainerCenterY])))
						]),
					_List_fromArray(
						[html])) : (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$alignBottom, has) ? A2(
					$elm$html$Html$u,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							A2(
								$elm$core$String$join,
								' ',
								_List_fromArray(
									[$mdgriffith$elm_ui$Internal$Style$classes.any, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.container, $mdgriffith$elm_ui$Internal$Style$classes.alignContainerBottom])))
						]),
					_List_fromArray(
						[html])) : html));
			default:
				return html;
		}
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $mdgriffith$elm_ui$Internal$Model$textElementClasses = $mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.text + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.widthContent + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.heightContent)))));
var $mdgriffith$elm_ui$Internal$Model$textElement = function (str) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class($mdgriffith$elm_ui$Internal$Model$textElementClasses)
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(str)
			]));
};
var $mdgriffith$elm_ui$Internal$Model$textElementFillClasses = $mdgriffith$elm_ui$Internal$Style$classes.any + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.text + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.widthFill + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.heightFill)))));
var $mdgriffith$elm_ui$Internal$Model$textElementFill = function (str) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class($mdgriffith$elm_ui$Internal$Model$textElementFillClasses)
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(str)
			]));
};
var $mdgriffith$elm_ui$Internal$Model$createElement = F3(
	function (context, children, rendered) {
		var gatherKeyed = F2(
			function (_v8, _v9) {
				var key = _v8.a;
				var child = _v8.b;
				var htmls = _v9.a;
				var existingStyles = _v9.b;
				switch (child.$) {
					case 'Unstyled':
						var html = child.a;
						return _Utils_eq(context, $mdgriffith$elm_ui$Internal$Model$asParagraph) ? _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								_Utils_Tuple2(
									key,
									html(context)),
								htmls),
							existingStyles) : _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								_Utils_Tuple2(
									key,
									html(context)),
								htmls),
							existingStyles);
					case 'Styled':
						var styled = child.a;
						return _Utils_eq(context, $mdgriffith$elm_ui$Internal$Model$asParagraph) ? _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								_Utils_Tuple2(
									key,
									A2(styled.html, $mdgriffith$elm_ui$Internal$Model$NoStyleSheet, context)),
								htmls),
							$elm$core$List$isEmpty(existingStyles) ? styled.styles : _Utils_ap(styled.styles, existingStyles)) : _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								_Utils_Tuple2(
									key,
									A2(styled.html, $mdgriffith$elm_ui$Internal$Model$NoStyleSheet, context)),
								htmls),
							$elm$core$List$isEmpty(existingStyles) ? styled.styles : _Utils_ap(styled.styles, existingStyles));
					case 'Text':
						var str = child.a;
						return _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								_Utils_Tuple2(
									key,
									_Utils_eq(context, $mdgriffith$elm_ui$Internal$Model$asEl) ? $mdgriffith$elm_ui$Internal$Model$textElementFill(str) : $mdgriffith$elm_ui$Internal$Model$textElement(str)),
								htmls),
							existingStyles);
					default:
						return _Utils_Tuple2(htmls, existingStyles);
				}
			});
		var gather = F2(
			function (child, _v6) {
				var htmls = _v6.a;
				var existingStyles = _v6.b;
				switch (child.$) {
					case 'Unstyled':
						var html = child.a;
						return _Utils_eq(context, $mdgriffith$elm_ui$Internal$Model$asParagraph) ? _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								html(context),
								htmls),
							existingStyles) : _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								html(context),
								htmls),
							existingStyles);
					case 'Styled':
						var styled = child.a;
						return _Utils_eq(context, $mdgriffith$elm_ui$Internal$Model$asParagraph) ? _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								A2(styled.html, $mdgriffith$elm_ui$Internal$Model$NoStyleSheet, context),
								htmls),
							$elm$core$List$isEmpty(existingStyles) ? styled.styles : _Utils_ap(styled.styles, existingStyles)) : _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								A2(styled.html, $mdgriffith$elm_ui$Internal$Model$NoStyleSheet, context),
								htmls),
							$elm$core$List$isEmpty(existingStyles) ? styled.styles : _Utils_ap(styled.styles, existingStyles));
					case 'Text':
						var str = child.a;
						return _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								_Utils_eq(context, $mdgriffith$elm_ui$Internal$Model$asEl) ? $mdgriffith$elm_ui$Internal$Model$textElementFill(str) : $mdgriffith$elm_ui$Internal$Model$textElement(str),
								htmls),
							existingStyles);
					default:
						return _Utils_Tuple2(htmls, existingStyles);
				}
			});
		if (children.$ === 'Keyed') {
			var keyedChildren = children.a;
			var _v1 = A3(
				$elm$core$List$foldr,
				gatherKeyed,
				_Utils_Tuple2(_List_Nil, _List_Nil),
				keyedChildren);
			var keyed = _v1.a;
			var styles = _v1.b;
			var newStyles = $elm$core$List$isEmpty(styles) ? rendered.styles : _Utils_ap(rendered.styles, styles);
			if (!newStyles.b) {
				return $mdgriffith$elm_ui$Internal$Model$Unstyled(
					A5(
						$mdgriffith$elm_ui$Internal$Model$finalizeNode,
						rendered.has,
						rendered.node,
						rendered.attributes,
						$mdgriffith$elm_ui$Internal$Model$Keyed(
							A3($mdgriffith$elm_ui$Internal$Model$addKeyedChildren, 'nearby-element-pls', keyed, rendered.children)),
						$mdgriffith$elm_ui$Internal$Model$NoStyleSheet));
			} else {
				var allStyles = newStyles;
				return $mdgriffith$elm_ui$Internal$Model$Styled(
					{
						html: A4(
							$mdgriffith$elm_ui$Internal$Model$finalizeNode,
							rendered.has,
							rendered.node,
							rendered.attributes,
							$mdgriffith$elm_ui$Internal$Model$Keyed(
								A3($mdgriffith$elm_ui$Internal$Model$addKeyedChildren, 'nearby-element-pls', keyed, rendered.children))),
						styles: allStyles
					});
			}
		} else {
			var unkeyedChildren = children.a;
			var _v3 = A3(
				$elm$core$List$foldr,
				gather,
				_Utils_Tuple2(_List_Nil, _List_Nil),
				unkeyedChildren);
			var unkeyed = _v3.a;
			var styles = _v3.b;
			var newStyles = $elm$core$List$isEmpty(styles) ? rendered.styles : _Utils_ap(rendered.styles, styles);
			if (!newStyles.b) {
				return $mdgriffith$elm_ui$Internal$Model$Unstyled(
					A5(
						$mdgriffith$elm_ui$Internal$Model$finalizeNode,
						rendered.has,
						rendered.node,
						rendered.attributes,
						$mdgriffith$elm_ui$Internal$Model$Unkeyed(
							A2($mdgriffith$elm_ui$Internal$Model$addChildren, unkeyed, rendered.children)),
						$mdgriffith$elm_ui$Internal$Model$NoStyleSheet));
			} else {
				var allStyles = newStyles;
				return $mdgriffith$elm_ui$Internal$Model$Styled(
					{
						html: A4(
							$mdgriffith$elm_ui$Internal$Model$finalizeNode,
							rendered.has,
							rendered.node,
							rendered.attributes,
							$mdgriffith$elm_ui$Internal$Model$Unkeyed(
								A2($mdgriffith$elm_ui$Internal$Model$addChildren, unkeyed, rendered.children))),
						styles: allStyles
					});
			}
		}
	});
var $mdgriffith$elm_ui$Internal$Model$Single = F3(
	function (a, b, c) {
		return {$: 'Single', a: a, b: b, c: c};
	});
var $mdgriffith$elm_ui$Internal$Model$Transform = function (a) {
	return {$: 'Transform', a: a};
};
var $mdgriffith$elm_ui$Internal$Flag$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var $elm$core$Bitwise$or = _Bitwise_or;
var $mdgriffith$elm_ui$Internal$Flag$add = F2(
	function (myFlag, _v0) {
		var one = _v0.a;
		var two = _v0.b;
		if (myFlag.$ === 'Flag') {
			var first = myFlag.a;
			return A2($mdgriffith$elm_ui$Internal$Flag$Field, first | one, two);
		} else {
			var second = myFlag.a;
			return A2($mdgriffith$elm_ui$Internal$Flag$Field, one, second | two);
		}
	});
var $mdgriffith$elm_ui$Internal$Model$ChildrenBehind = function (a) {
	return {$: 'ChildrenBehind', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$ChildrenBehindAndInFront = F2(
	function (a, b) {
		return {$: 'ChildrenBehindAndInFront', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$ChildrenInFront = function (a) {
	return {$: 'ChildrenInFront', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$nearbyElement = F2(
	function (location, elem) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					function () {
						switch (location.$) {
							case 'Above':
								return A2(
									$elm$core$String$join,
									' ',
									_List_fromArray(
										[$mdgriffith$elm_ui$Internal$Style$classes.nearby, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.above]));
							case 'Below':
								return A2(
									$elm$core$String$join,
									' ',
									_List_fromArray(
										[$mdgriffith$elm_ui$Internal$Style$classes.nearby, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.below]));
							case 'OnRight':
								return A2(
									$elm$core$String$join,
									' ',
									_List_fromArray(
										[$mdgriffith$elm_ui$Internal$Style$classes.nearby, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.onRight]));
							case 'OnLeft':
								return A2(
									$elm$core$String$join,
									' ',
									_List_fromArray(
										[$mdgriffith$elm_ui$Internal$Style$classes.nearby, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.onLeft]));
							case 'InFront':
								return A2(
									$elm$core$String$join,
									' ',
									_List_fromArray(
										[$mdgriffith$elm_ui$Internal$Style$classes.nearby, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.inFront]));
							default:
								return A2(
									$elm$core$String$join,
									' ',
									_List_fromArray(
										[$mdgriffith$elm_ui$Internal$Style$classes.nearby, $mdgriffith$elm_ui$Internal$Style$classes.single, $mdgriffith$elm_ui$Internal$Style$classes.behind]));
						}
					}())
				]),
			_List_fromArray(
				[
					function () {
					switch (elem.$) {
						case 'Empty':
							return $elm$virtual_dom$VirtualDom$text('');
						case 'Text':
							var str = elem.a;
							return $mdgriffith$elm_ui$Internal$Model$textElement(str);
						case 'Unstyled':
							var html = elem.a;
							return html($mdgriffith$elm_ui$Internal$Model$asEl);
						default:
							var styled = elem.a;
							return A2(styled.html, $mdgriffith$elm_ui$Internal$Model$NoStyleSheet, $mdgriffith$elm_ui$Internal$Model$asEl);
					}
				}()
				]));
	});
var $mdgriffith$elm_ui$Internal$Model$addNearbyElement = F3(
	function (location, elem, existing) {
		var nearby = A2($mdgriffith$elm_ui$Internal$Model$nearbyElement, location, elem);
		switch (existing.$) {
			case 'NoNearbyChildren':
				if (location.$ === 'Behind') {
					return $mdgriffith$elm_ui$Internal$Model$ChildrenBehind(
						_List_fromArray(
							[nearby]));
				} else {
					return $mdgriffith$elm_ui$Internal$Model$ChildrenInFront(
						_List_fromArray(
							[nearby]));
				}
			case 'ChildrenBehind':
				var existingBehind = existing.a;
				if (location.$ === 'Behind') {
					return $mdgriffith$elm_ui$Internal$Model$ChildrenBehind(
						A2($elm$core$List$cons, nearby, existingBehind));
				} else {
					return A2(
						$mdgriffith$elm_ui$Internal$Model$ChildrenBehindAndInFront,
						existingBehind,
						_List_fromArray(
							[nearby]));
				}
			case 'ChildrenInFront':
				var existingInFront = existing.a;
				if (location.$ === 'Behind') {
					return A2(
						$mdgriffith$elm_ui$Internal$Model$ChildrenBehindAndInFront,
						_List_fromArray(
							[nearby]),
						existingInFront);
				} else {
					return $mdgriffith$elm_ui$Internal$Model$ChildrenInFront(
						A2($elm$core$List$cons, nearby, existingInFront));
				}
			default:
				var existingBehind = existing.a;
				var existingInFront = existing.b;
				if (location.$ === 'Behind') {
					return A2(
						$mdgriffith$elm_ui$Internal$Model$ChildrenBehindAndInFront,
						A2($elm$core$List$cons, nearby, existingBehind),
						existingInFront);
				} else {
					return A2(
						$mdgriffith$elm_ui$Internal$Model$ChildrenBehindAndInFront,
						existingBehind,
						A2($elm$core$List$cons, nearby, existingInFront));
				}
		}
	});
var $mdgriffith$elm_ui$Internal$Model$Embedded = F2(
	function (a, b) {
		return {$: 'Embedded', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$NodeName = function (a) {
	return {$: 'NodeName', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$addNodeName = F2(
	function (newNode, old) {
		switch (old.$) {
			case 'Generic':
				return $mdgriffith$elm_ui$Internal$Model$NodeName(newNode);
			case 'NodeName':
				var name = old.a;
				return A2($mdgriffith$elm_ui$Internal$Model$Embedded, name, newNode);
			default:
				var x = old.a;
				var y = old.b;
				return A2($mdgriffith$elm_ui$Internal$Model$Embedded, x, y);
		}
	});
var $mdgriffith$elm_ui$Internal$Model$alignXName = function (align) {
	switch (align.$) {
		case 'Left':
			return $mdgriffith$elm_ui$Internal$Style$classes.alignedHorizontally + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.alignLeft);
		case 'Right':
			return $mdgriffith$elm_ui$Internal$Style$classes.alignedHorizontally + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.alignRight);
		default:
			return $mdgriffith$elm_ui$Internal$Style$classes.alignedHorizontally + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.alignCenterX);
	}
};
var $mdgriffith$elm_ui$Internal$Model$alignYName = function (align) {
	switch (align.$) {
		case 'Top':
			return $mdgriffith$elm_ui$Internal$Style$classes.alignedVertically + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.alignTop);
		case 'Bottom':
			return $mdgriffith$elm_ui$Internal$Style$classes.alignedVertically + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.alignBottom);
		default:
			return $mdgriffith$elm_ui$Internal$Style$classes.alignedVertically + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.alignCenterY);
	}
};
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $mdgriffith$elm_ui$Internal$Model$FullTransform = F4(
	function (a, b, c, d) {
		return {$: 'FullTransform', a: a, b: b, c: c, d: d};
	});
var $mdgriffith$elm_ui$Internal$Model$Moved = function (a) {
	return {$: 'Moved', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$composeTransformation = F2(
	function (transform, component) {
		switch (transform.$) {
			case 'Untransformed':
				switch (component.$) {
					case 'MoveX':
						var x = component.a;
						return $mdgriffith$elm_ui$Internal$Model$Moved(
							_Utils_Tuple3(x, 0, 0));
					case 'MoveY':
						var y = component.a;
						return $mdgriffith$elm_ui$Internal$Model$Moved(
							_Utils_Tuple3(0, y, 0));
					case 'MoveZ':
						var z = component.a;
						return $mdgriffith$elm_ui$Internal$Model$Moved(
							_Utils_Tuple3(0, 0, z));
					case 'MoveXYZ':
						var xyz = component.a;
						return $mdgriffith$elm_ui$Internal$Model$Moved(xyz);
					case 'Rotate':
						var xyz = component.a;
						var angle = component.b;
						return A4(
							$mdgriffith$elm_ui$Internal$Model$FullTransform,
							_Utils_Tuple3(0, 0, 0),
							_Utils_Tuple3(1, 1, 1),
							xyz,
							angle);
					default:
						var xyz = component.a;
						return A4(
							$mdgriffith$elm_ui$Internal$Model$FullTransform,
							_Utils_Tuple3(0, 0, 0),
							xyz,
							_Utils_Tuple3(0, 0, 1),
							0);
				}
			case 'Moved':
				var moved = transform.a;
				var x = moved.a;
				var y = moved.b;
				var z = moved.c;
				switch (component.$) {
					case 'MoveX':
						var newX = component.a;
						return $mdgriffith$elm_ui$Internal$Model$Moved(
							_Utils_Tuple3(newX, y, z));
					case 'MoveY':
						var newY = component.a;
						return $mdgriffith$elm_ui$Internal$Model$Moved(
							_Utils_Tuple3(x, newY, z));
					case 'MoveZ':
						var newZ = component.a;
						return $mdgriffith$elm_ui$Internal$Model$Moved(
							_Utils_Tuple3(x, y, newZ));
					case 'MoveXYZ':
						var xyz = component.a;
						return $mdgriffith$elm_ui$Internal$Model$Moved(xyz);
					case 'Rotate':
						var xyz = component.a;
						var angle = component.b;
						return A4(
							$mdgriffith$elm_ui$Internal$Model$FullTransform,
							moved,
							_Utils_Tuple3(1, 1, 1),
							xyz,
							angle);
					default:
						var scale = component.a;
						return A4(
							$mdgriffith$elm_ui$Internal$Model$FullTransform,
							moved,
							scale,
							_Utils_Tuple3(0, 0, 1),
							0);
				}
			default:
				var moved = transform.a;
				var x = moved.a;
				var y = moved.b;
				var z = moved.c;
				var scaled = transform.b;
				var origin = transform.c;
				var angle = transform.d;
				switch (component.$) {
					case 'MoveX':
						var newX = component.a;
						return A4(
							$mdgriffith$elm_ui$Internal$Model$FullTransform,
							_Utils_Tuple3(newX, y, z),
							scaled,
							origin,
							angle);
					case 'MoveY':
						var newY = component.a;
						return A4(
							$mdgriffith$elm_ui$Internal$Model$FullTransform,
							_Utils_Tuple3(x, newY, z),
							scaled,
							origin,
							angle);
					case 'MoveZ':
						var newZ = component.a;
						return A4(
							$mdgriffith$elm_ui$Internal$Model$FullTransform,
							_Utils_Tuple3(x, y, newZ),
							scaled,
							origin,
							angle);
					case 'MoveXYZ':
						var newMove = component.a;
						return A4($mdgriffith$elm_ui$Internal$Model$FullTransform, newMove, scaled, origin, angle);
					case 'Rotate':
						var newOrigin = component.a;
						var newAngle = component.b;
						return A4($mdgriffith$elm_ui$Internal$Model$FullTransform, moved, scaled, newOrigin, newAngle);
					default:
						var newScale = component.a;
						return A4($mdgriffith$elm_ui$Internal$Model$FullTransform, moved, newScale, origin, angle);
				}
		}
	});
var $mdgriffith$elm_ui$Internal$Flag$height = $mdgriffith$elm_ui$Internal$Flag$flag(7);
var $mdgriffith$elm_ui$Internal$Flag$heightContent = $mdgriffith$elm_ui$Internal$Flag$flag(36);
var $mdgriffith$elm_ui$Internal$Flag$merge = F2(
	function (_v0, _v1) {
		var one = _v0.a;
		var two = _v0.b;
		var three = _v1.a;
		var four = _v1.b;
		return A2($mdgriffith$elm_ui$Internal$Flag$Field, one | three, two | four);
	});
var $mdgriffith$elm_ui$Internal$Flag$none = A2($mdgriffith$elm_ui$Internal$Flag$Field, 0, 0);
var $mdgriffith$elm_ui$Internal$Model$renderHeight = function (h) {
	switch (h.$) {
		case 'Px':
			var px = h.a;
			var val = $elm$core$String$fromInt(px);
			var name = 'height-px-' + val;
			return _Utils_Tuple3(
				$mdgriffith$elm_ui$Internal$Flag$none,
				$mdgriffith$elm_ui$Internal$Style$classes.heightExact + (' ' + name),
				_List_fromArray(
					[
						A3($mdgriffith$elm_ui$Internal$Model$Single, name, 'height', val + 'px')
					]));
		case 'Content':
			return _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$heightContent, $mdgriffith$elm_ui$Internal$Flag$none),
				$mdgriffith$elm_ui$Internal$Style$classes.heightContent,
				_List_Nil);
		case 'Fill':
			var portion = h.a;
			return (portion === 1) ? _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$heightFill, $mdgriffith$elm_ui$Internal$Flag$none),
				$mdgriffith$elm_ui$Internal$Style$classes.heightFill,
				_List_Nil) : _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$heightFill, $mdgriffith$elm_ui$Internal$Flag$none),
				$mdgriffith$elm_ui$Internal$Style$classes.heightFillPortion + (' height-fill-' + $elm$core$String$fromInt(portion)),
				_List_fromArray(
					[
						A3(
						$mdgriffith$elm_ui$Internal$Model$Single,
						$mdgriffith$elm_ui$Internal$Style$classes.any + ('.' + ($mdgriffith$elm_ui$Internal$Style$classes.column + (' > ' + $mdgriffith$elm_ui$Internal$Style$dot(
							'height-fill-' + $elm$core$String$fromInt(portion))))),
						'flex-grow',
						$elm$core$String$fromInt(portion * 100000))
					]));
		case 'Min':
			var minSize = h.a;
			var len = h.b;
			var cls = 'min-height-' + $elm$core$String$fromInt(minSize);
			var style = A3(
				$mdgriffith$elm_ui$Internal$Model$Single,
				cls,
				'min-height',
				$elm$core$String$fromInt(minSize) + 'px !important');
			var _v1 = $mdgriffith$elm_ui$Internal$Model$renderHeight(len);
			var newFlag = _v1.a;
			var newAttrs = _v1.b;
			var newStyle = _v1.c;
			return _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$heightBetween, newFlag),
				cls + (' ' + newAttrs),
				A2($elm$core$List$cons, style, newStyle));
		default:
			var maxSize = h.a;
			var len = h.b;
			var cls = 'max-height-' + $elm$core$String$fromInt(maxSize);
			var style = A3(
				$mdgriffith$elm_ui$Internal$Model$Single,
				cls,
				'max-height',
				$elm$core$String$fromInt(maxSize) + 'px');
			var _v2 = $mdgriffith$elm_ui$Internal$Model$renderHeight(len);
			var newFlag = _v2.a;
			var newAttrs = _v2.b;
			var newStyle = _v2.c;
			return _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$heightBetween, newFlag),
				cls + (' ' + newAttrs),
				A2($elm$core$List$cons, style, newStyle));
	}
};
var $mdgriffith$elm_ui$Internal$Flag$widthContent = $mdgriffith$elm_ui$Internal$Flag$flag(38);
var $mdgriffith$elm_ui$Internal$Model$renderWidth = function (w) {
	switch (w.$) {
		case 'Px':
			var px = w.a;
			return _Utils_Tuple3(
				$mdgriffith$elm_ui$Internal$Flag$none,
				$mdgriffith$elm_ui$Internal$Style$classes.widthExact + (' width-px-' + $elm$core$String$fromInt(px)),
				_List_fromArray(
					[
						A3(
						$mdgriffith$elm_ui$Internal$Model$Single,
						'width-px-' + $elm$core$String$fromInt(px),
						'width',
						$elm$core$String$fromInt(px) + 'px')
					]));
		case 'Content':
			return _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$widthContent, $mdgriffith$elm_ui$Internal$Flag$none),
				$mdgriffith$elm_ui$Internal$Style$classes.widthContent,
				_List_Nil);
		case 'Fill':
			var portion = w.a;
			return (portion === 1) ? _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$widthFill, $mdgriffith$elm_ui$Internal$Flag$none),
				$mdgriffith$elm_ui$Internal$Style$classes.widthFill,
				_List_Nil) : _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$widthFill, $mdgriffith$elm_ui$Internal$Flag$none),
				$mdgriffith$elm_ui$Internal$Style$classes.widthFillPortion + (' width-fill-' + $elm$core$String$fromInt(portion)),
				_List_fromArray(
					[
						A3(
						$mdgriffith$elm_ui$Internal$Model$Single,
						$mdgriffith$elm_ui$Internal$Style$classes.any + ('.' + ($mdgriffith$elm_ui$Internal$Style$classes.row + (' > ' + $mdgriffith$elm_ui$Internal$Style$dot(
							'width-fill-' + $elm$core$String$fromInt(portion))))),
						'flex-grow',
						$elm$core$String$fromInt(portion * 100000))
					]));
		case 'Min':
			var minSize = w.a;
			var len = w.b;
			var cls = 'min-width-' + $elm$core$String$fromInt(minSize);
			var style = A3(
				$mdgriffith$elm_ui$Internal$Model$Single,
				cls,
				'min-width',
				$elm$core$String$fromInt(minSize) + 'px');
			var _v1 = $mdgriffith$elm_ui$Internal$Model$renderWidth(len);
			var newFlag = _v1.a;
			var newAttrs = _v1.b;
			var newStyle = _v1.c;
			return _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$widthBetween, newFlag),
				cls + (' ' + newAttrs),
				A2($elm$core$List$cons, style, newStyle));
		default:
			var maxSize = w.a;
			var len = w.b;
			var cls = 'max-width-' + $elm$core$String$fromInt(maxSize);
			var style = A3(
				$mdgriffith$elm_ui$Internal$Model$Single,
				cls,
				'max-width',
				$elm$core$String$fromInt(maxSize) + 'px');
			var _v2 = $mdgriffith$elm_ui$Internal$Model$renderWidth(len);
			var newFlag = _v2.a;
			var newAttrs = _v2.b;
			var newStyle = _v2.c;
			return _Utils_Tuple3(
				A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$widthBetween, newFlag),
				cls + (' ' + newAttrs),
				A2($elm$core$List$cons, style, newStyle));
	}
};
var $mdgriffith$elm_ui$Internal$Flag$borderWidth = $mdgriffith$elm_ui$Internal$Flag$flag(27);
var $mdgriffith$elm_ui$Internal$Model$skippable = F2(
	function (flag, style) {
		if (_Utils_eq(flag, $mdgriffith$elm_ui$Internal$Flag$borderWidth)) {
			if (style.$ === 'Single') {
				var val = style.c;
				switch (val) {
					case '0px':
						return true;
					case '1px':
						return true;
					case '2px':
						return true;
					case '3px':
						return true;
					case '4px':
						return true;
					case '5px':
						return true;
					case '6px':
						return true;
					default:
						return false;
				}
			} else {
				return false;
			}
		} else {
			switch (style.$) {
				case 'FontSize':
					var i = style.a;
					return (i >= 8) && (i <= 32);
				case 'PaddingStyle':
					var name = style.a;
					var t = style.b;
					var r = style.c;
					var b = style.d;
					var l = style.e;
					return _Utils_eq(t, b) && (_Utils_eq(t, r) && (_Utils_eq(t, l) && ((t >= 0) && (t <= 24))));
				default:
					return false;
			}
		}
	});
var $mdgriffith$elm_ui$Internal$Flag$width = $mdgriffith$elm_ui$Internal$Flag$flag(6);
var $mdgriffith$elm_ui$Internal$Flag$xAlign = $mdgriffith$elm_ui$Internal$Flag$flag(30);
var $mdgriffith$elm_ui$Internal$Flag$yAlign = $mdgriffith$elm_ui$Internal$Flag$flag(29);
var $mdgriffith$elm_ui$Internal$Model$gatherAttrRecursive = F8(
	function (classes, node, has, transform, styles, attrs, children, elementAttrs) {
		gatherAttrRecursive:
		while (true) {
			if (!elementAttrs.b) {
				var _v1 = $mdgriffith$elm_ui$Internal$Model$transformClass(transform);
				if (_v1.$ === 'Nothing') {
					return {
						attributes: A2(
							$elm$core$List$cons,
							$elm$html$Html$Attributes$class(classes),
							attrs),
						children: children,
						has: has,
						node: node,
						styles: styles
					};
				} else {
					var _class = _v1.a;
					return {
						attributes: A2(
							$elm$core$List$cons,
							$elm$html$Html$Attributes$class(classes + (' ' + _class)),
							attrs),
						children: children,
						has: has,
						node: node,
						styles: A2(
							$elm$core$List$cons,
							$mdgriffith$elm_ui$Internal$Model$Transform(transform),
							styles)
					};
				}
			} else {
				var attribute = elementAttrs.a;
				var remaining = elementAttrs.b;
				switch (attribute.$) {
					case 'NoAttribute':
						var $temp$classes = classes,
							$temp$node = node,
							$temp$has = has,
							$temp$transform = transform,
							$temp$styles = styles,
							$temp$attrs = attrs,
							$temp$children = children,
							$temp$elementAttrs = remaining;
						classes = $temp$classes;
						node = $temp$node;
						has = $temp$has;
						transform = $temp$transform;
						styles = $temp$styles;
						attrs = $temp$attrs;
						children = $temp$children;
						elementAttrs = $temp$elementAttrs;
						continue gatherAttrRecursive;
					case 'Class':
						var flag = attribute.a;
						var exactClassName = attribute.b;
						if (A2($mdgriffith$elm_ui$Internal$Flag$present, flag, has)) {
							var $temp$classes = classes,
								$temp$node = node,
								$temp$has = has,
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						} else {
							var $temp$classes = exactClassName + (' ' + classes),
								$temp$node = node,
								$temp$has = A2($mdgriffith$elm_ui$Internal$Flag$add, flag, has),
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						}
					case 'Attr':
						var actualAttribute = attribute.a;
						var $temp$classes = classes,
							$temp$node = node,
							$temp$has = has,
							$temp$transform = transform,
							$temp$styles = styles,
							$temp$attrs = A2($elm$core$List$cons, actualAttribute, attrs),
							$temp$children = children,
							$temp$elementAttrs = remaining;
						classes = $temp$classes;
						node = $temp$node;
						has = $temp$has;
						transform = $temp$transform;
						styles = $temp$styles;
						attrs = $temp$attrs;
						children = $temp$children;
						elementAttrs = $temp$elementAttrs;
						continue gatherAttrRecursive;
					case 'StyleClass':
						var flag = attribute.a;
						var style = attribute.b;
						if (A2($mdgriffith$elm_ui$Internal$Flag$present, flag, has)) {
							var $temp$classes = classes,
								$temp$node = node,
								$temp$has = has,
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						} else {
							if (A2($mdgriffith$elm_ui$Internal$Model$skippable, flag, style)) {
								var $temp$classes = $mdgriffith$elm_ui$Internal$Model$getStyleName(style) + (' ' + classes),
									$temp$node = node,
									$temp$has = A2($mdgriffith$elm_ui$Internal$Flag$add, flag, has),
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = attrs,
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							} else {
								var $temp$classes = $mdgriffith$elm_ui$Internal$Model$getStyleName(style) + (' ' + classes),
									$temp$node = node,
									$temp$has = A2($mdgriffith$elm_ui$Internal$Flag$add, flag, has),
									$temp$transform = transform,
									$temp$styles = A2($elm$core$List$cons, style, styles),
									$temp$attrs = attrs,
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							}
						}
					case 'TransformComponent':
						var flag = attribute.a;
						var component = attribute.b;
						var $temp$classes = classes,
							$temp$node = node,
							$temp$has = A2($mdgriffith$elm_ui$Internal$Flag$add, flag, has),
							$temp$transform = A2($mdgriffith$elm_ui$Internal$Model$composeTransformation, transform, component),
							$temp$styles = styles,
							$temp$attrs = attrs,
							$temp$children = children,
							$temp$elementAttrs = remaining;
						classes = $temp$classes;
						node = $temp$node;
						has = $temp$has;
						transform = $temp$transform;
						styles = $temp$styles;
						attrs = $temp$attrs;
						children = $temp$children;
						elementAttrs = $temp$elementAttrs;
						continue gatherAttrRecursive;
					case 'Width':
						var width = attribute.a;
						if (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$width, has)) {
							var $temp$classes = classes,
								$temp$node = node,
								$temp$has = has,
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						} else {
							switch (width.$) {
								case 'Px':
									var px = width.a;
									var $temp$classes = ($mdgriffith$elm_ui$Internal$Style$classes.widthExact + (' width-px-' + $elm$core$String$fromInt(px))) + (' ' + classes),
										$temp$node = node,
										$temp$has = A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$width, has),
										$temp$transform = transform,
										$temp$styles = A2(
										$elm$core$List$cons,
										A3(
											$mdgriffith$elm_ui$Internal$Model$Single,
											'width-px-' + $elm$core$String$fromInt(px),
											'width',
											$elm$core$String$fromInt(px) + 'px'),
										styles),
										$temp$attrs = attrs,
										$temp$children = children,
										$temp$elementAttrs = remaining;
									classes = $temp$classes;
									node = $temp$node;
									has = $temp$has;
									transform = $temp$transform;
									styles = $temp$styles;
									attrs = $temp$attrs;
									children = $temp$children;
									elementAttrs = $temp$elementAttrs;
									continue gatherAttrRecursive;
								case 'Content':
									var $temp$classes = classes + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.widthContent),
										$temp$node = node,
										$temp$has = A2(
										$mdgriffith$elm_ui$Internal$Flag$add,
										$mdgriffith$elm_ui$Internal$Flag$widthContent,
										A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$width, has)),
										$temp$transform = transform,
										$temp$styles = styles,
										$temp$attrs = attrs,
										$temp$children = children,
										$temp$elementAttrs = remaining;
									classes = $temp$classes;
									node = $temp$node;
									has = $temp$has;
									transform = $temp$transform;
									styles = $temp$styles;
									attrs = $temp$attrs;
									children = $temp$children;
									elementAttrs = $temp$elementAttrs;
									continue gatherAttrRecursive;
								case 'Fill':
									var portion = width.a;
									if (portion === 1) {
										var $temp$classes = classes + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.widthFill),
											$temp$node = node,
											$temp$has = A2(
											$mdgriffith$elm_ui$Internal$Flag$add,
											$mdgriffith$elm_ui$Internal$Flag$widthFill,
											A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$width, has)),
											$temp$transform = transform,
											$temp$styles = styles,
											$temp$attrs = attrs,
											$temp$children = children,
											$temp$elementAttrs = remaining;
										classes = $temp$classes;
										node = $temp$node;
										has = $temp$has;
										transform = $temp$transform;
										styles = $temp$styles;
										attrs = $temp$attrs;
										children = $temp$children;
										elementAttrs = $temp$elementAttrs;
										continue gatherAttrRecursive;
									} else {
										var $temp$classes = classes + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.widthFillPortion + (' width-fill-' + $elm$core$String$fromInt(portion)))),
											$temp$node = node,
											$temp$has = A2(
											$mdgriffith$elm_ui$Internal$Flag$add,
											$mdgriffith$elm_ui$Internal$Flag$widthFill,
											A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$width, has)),
											$temp$transform = transform,
											$temp$styles = A2(
											$elm$core$List$cons,
											A3(
												$mdgriffith$elm_ui$Internal$Model$Single,
												$mdgriffith$elm_ui$Internal$Style$classes.any + ('.' + ($mdgriffith$elm_ui$Internal$Style$classes.row + (' > ' + $mdgriffith$elm_ui$Internal$Style$dot(
													'width-fill-' + $elm$core$String$fromInt(portion))))),
												'flex-grow',
												$elm$core$String$fromInt(portion * 100000)),
											styles),
											$temp$attrs = attrs,
											$temp$children = children,
											$temp$elementAttrs = remaining;
										classes = $temp$classes;
										node = $temp$node;
										has = $temp$has;
										transform = $temp$transform;
										styles = $temp$styles;
										attrs = $temp$attrs;
										children = $temp$children;
										elementAttrs = $temp$elementAttrs;
										continue gatherAttrRecursive;
									}
								default:
									var _v4 = $mdgriffith$elm_ui$Internal$Model$renderWidth(width);
									var addToFlags = _v4.a;
									var newClass = _v4.b;
									var newStyles = _v4.c;
									var $temp$classes = classes + (' ' + newClass),
										$temp$node = node,
										$temp$has = A2(
										$mdgriffith$elm_ui$Internal$Flag$merge,
										addToFlags,
										A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$width, has)),
										$temp$transform = transform,
										$temp$styles = _Utils_ap(newStyles, styles),
										$temp$attrs = attrs,
										$temp$children = children,
										$temp$elementAttrs = remaining;
									classes = $temp$classes;
									node = $temp$node;
									has = $temp$has;
									transform = $temp$transform;
									styles = $temp$styles;
									attrs = $temp$attrs;
									children = $temp$children;
									elementAttrs = $temp$elementAttrs;
									continue gatherAttrRecursive;
							}
						}
					case 'Height':
						var height = attribute.a;
						if (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$height, has)) {
							var $temp$classes = classes,
								$temp$node = node,
								$temp$has = has,
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						} else {
							switch (height.$) {
								case 'Px':
									var px = height.a;
									var val = $elm$core$String$fromInt(px) + 'px';
									var name = 'height-px-' + val;
									var $temp$classes = $mdgriffith$elm_ui$Internal$Style$classes.heightExact + (' ' + (name + (' ' + classes))),
										$temp$node = node,
										$temp$has = A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$height, has),
										$temp$transform = transform,
										$temp$styles = A2(
										$elm$core$List$cons,
										A3($mdgriffith$elm_ui$Internal$Model$Single, name, 'height ', val),
										styles),
										$temp$attrs = attrs,
										$temp$children = children,
										$temp$elementAttrs = remaining;
									classes = $temp$classes;
									node = $temp$node;
									has = $temp$has;
									transform = $temp$transform;
									styles = $temp$styles;
									attrs = $temp$attrs;
									children = $temp$children;
									elementAttrs = $temp$elementAttrs;
									continue gatherAttrRecursive;
								case 'Content':
									var $temp$classes = $mdgriffith$elm_ui$Internal$Style$classes.heightContent + (' ' + classes),
										$temp$node = node,
										$temp$has = A2(
										$mdgriffith$elm_ui$Internal$Flag$add,
										$mdgriffith$elm_ui$Internal$Flag$heightContent,
										A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$height, has)),
										$temp$transform = transform,
										$temp$styles = styles,
										$temp$attrs = attrs,
										$temp$children = children,
										$temp$elementAttrs = remaining;
									classes = $temp$classes;
									node = $temp$node;
									has = $temp$has;
									transform = $temp$transform;
									styles = $temp$styles;
									attrs = $temp$attrs;
									children = $temp$children;
									elementAttrs = $temp$elementAttrs;
									continue gatherAttrRecursive;
								case 'Fill':
									var portion = height.a;
									if (portion === 1) {
										var $temp$classes = $mdgriffith$elm_ui$Internal$Style$classes.heightFill + (' ' + classes),
											$temp$node = node,
											$temp$has = A2(
											$mdgriffith$elm_ui$Internal$Flag$add,
											$mdgriffith$elm_ui$Internal$Flag$heightFill,
											A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$height, has)),
											$temp$transform = transform,
											$temp$styles = styles,
											$temp$attrs = attrs,
											$temp$children = children,
											$temp$elementAttrs = remaining;
										classes = $temp$classes;
										node = $temp$node;
										has = $temp$has;
										transform = $temp$transform;
										styles = $temp$styles;
										attrs = $temp$attrs;
										children = $temp$children;
										elementAttrs = $temp$elementAttrs;
										continue gatherAttrRecursive;
									} else {
										var $temp$classes = classes + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.heightFillPortion + (' height-fill-' + $elm$core$String$fromInt(portion)))),
											$temp$node = node,
											$temp$has = A2(
											$mdgriffith$elm_ui$Internal$Flag$add,
											$mdgriffith$elm_ui$Internal$Flag$heightFill,
											A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$height, has)),
											$temp$transform = transform,
											$temp$styles = A2(
											$elm$core$List$cons,
											A3(
												$mdgriffith$elm_ui$Internal$Model$Single,
												$mdgriffith$elm_ui$Internal$Style$classes.any + ('.' + ($mdgriffith$elm_ui$Internal$Style$classes.column + (' > ' + $mdgriffith$elm_ui$Internal$Style$dot(
													'height-fill-' + $elm$core$String$fromInt(portion))))),
												'flex-grow',
												$elm$core$String$fromInt(portion * 100000)),
											styles),
											$temp$attrs = attrs,
											$temp$children = children,
											$temp$elementAttrs = remaining;
										classes = $temp$classes;
										node = $temp$node;
										has = $temp$has;
										transform = $temp$transform;
										styles = $temp$styles;
										attrs = $temp$attrs;
										children = $temp$children;
										elementAttrs = $temp$elementAttrs;
										continue gatherAttrRecursive;
									}
								default:
									var _v6 = $mdgriffith$elm_ui$Internal$Model$renderHeight(height);
									var addToFlags = _v6.a;
									var newClass = _v6.b;
									var newStyles = _v6.c;
									var $temp$classes = classes + (' ' + newClass),
										$temp$node = node,
										$temp$has = A2(
										$mdgriffith$elm_ui$Internal$Flag$merge,
										addToFlags,
										A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$height, has)),
										$temp$transform = transform,
										$temp$styles = _Utils_ap(newStyles, styles),
										$temp$attrs = attrs,
										$temp$children = children,
										$temp$elementAttrs = remaining;
									classes = $temp$classes;
									node = $temp$node;
									has = $temp$has;
									transform = $temp$transform;
									styles = $temp$styles;
									attrs = $temp$attrs;
									children = $temp$children;
									elementAttrs = $temp$elementAttrs;
									continue gatherAttrRecursive;
							}
						}
					case 'Describe':
						var description = attribute.a;
						switch (description.$) {
							case 'Main':
								var $temp$classes = classes,
									$temp$node = A2($mdgriffith$elm_ui$Internal$Model$addNodeName, 'main', node),
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = attrs,
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							case 'Navigation':
								var $temp$classes = classes,
									$temp$node = A2($mdgriffith$elm_ui$Internal$Model$addNodeName, 'nav', node),
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = attrs,
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							case 'ContentInfo':
								var $temp$classes = classes,
									$temp$node = A2($mdgriffith$elm_ui$Internal$Model$addNodeName, 'footer', node),
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = attrs,
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							case 'Complementary':
								var $temp$classes = classes,
									$temp$node = A2($mdgriffith$elm_ui$Internal$Model$addNodeName, 'aside', node),
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = attrs,
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							case 'Heading':
								var i = description.a;
								if (i <= 1) {
									var $temp$classes = classes,
										$temp$node = A2($mdgriffith$elm_ui$Internal$Model$addNodeName, 'h1', node),
										$temp$has = has,
										$temp$transform = transform,
										$temp$styles = styles,
										$temp$attrs = attrs,
										$temp$children = children,
										$temp$elementAttrs = remaining;
									classes = $temp$classes;
									node = $temp$node;
									has = $temp$has;
									transform = $temp$transform;
									styles = $temp$styles;
									attrs = $temp$attrs;
									children = $temp$children;
									elementAttrs = $temp$elementAttrs;
									continue gatherAttrRecursive;
								} else {
									if (i < 7) {
										var $temp$classes = classes,
											$temp$node = A2(
											$mdgriffith$elm_ui$Internal$Model$addNodeName,
											'h' + $elm$core$String$fromInt(i),
											node),
											$temp$has = has,
											$temp$transform = transform,
											$temp$styles = styles,
											$temp$attrs = attrs,
											$temp$children = children,
											$temp$elementAttrs = remaining;
										classes = $temp$classes;
										node = $temp$node;
										has = $temp$has;
										transform = $temp$transform;
										styles = $temp$styles;
										attrs = $temp$attrs;
										children = $temp$children;
										elementAttrs = $temp$elementAttrs;
										continue gatherAttrRecursive;
									} else {
										var $temp$classes = classes,
											$temp$node = A2($mdgriffith$elm_ui$Internal$Model$addNodeName, 'h6', node),
											$temp$has = has,
											$temp$transform = transform,
											$temp$styles = styles,
											$temp$attrs = attrs,
											$temp$children = children,
											$temp$elementAttrs = remaining;
										classes = $temp$classes;
										node = $temp$node;
										has = $temp$has;
										transform = $temp$transform;
										styles = $temp$styles;
										attrs = $temp$attrs;
										children = $temp$children;
										elementAttrs = $temp$elementAttrs;
										continue gatherAttrRecursive;
									}
								}
							case 'Paragraph':
								var $temp$classes = classes,
									$temp$node = node,
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = attrs,
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							case 'Button':
								var $temp$classes = classes,
									$temp$node = node,
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = A2(
									$elm$core$List$cons,
									A2($elm$virtual_dom$VirtualDom$attribute, 'role', 'button'),
									attrs),
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							case 'Label':
								var label = description.a;
								var $temp$classes = classes,
									$temp$node = node,
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = A2(
									$elm$core$List$cons,
									A2($elm$virtual_dom$VirtualDom$attribute, 'aria-label', label),
									attrs),
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							case 'LivePolite':
								var $temp$classes = classes,
									$temp$node = node,
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = A2(
									$elm$core$List$cons,
									A2($elm$virtual_dom$VirtualDom$attribute, 'aria-live', 'polite'),
									attrs),
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
							default:
								var $temp$classes = classes,
									$temp$node = node,
									$temp$has = has,
									$temp$transform = transform,
									$temp$styles = styles,
									$temp$attrs = A2(
									$elm$core$List$cons,
									A2($elm$virtual_dom$VirtualDom$attribute, 'aria-live', 'assertive'),
									attrs),
									$temp$children = children,
									$temp$elementAttrs = remaining;
								classes = $temp$classes;
								node = $temp$node;
								has = $temp$has;
								transform = $temp$transform;
								styles = $temp$styles;
								attrs = $temp$attrs;
								children = $temp$children;
								elementAttrs = $temp$elementAttrs;
								continue gatherAttrRecursive;
						}
					case 'Nearby':
						var location = attribute.a;
						var elem = attribute.b;
						var newStyles = function () {
							switch (elem.$) {
								case 'Empty':
									return styles;
								case 'Text':
									var str = elem.a;
									return styles;
								case 'Unstyled':
									var html = elem.a;
									return styles;
								default:
									var styled = elem.a;
									return _Utils_ap(styles, styled.styles);
							}
						}();
						var $temp$classes = classes,
							$temp$node = node,
							$temp$has = has,
							$temp$transform = transform,
							$temp$styles = newStyles,
							$temp$attrs = attrs,
							$temp$children = A3($mdgriffith$elm_ui$Internal$Model$addNearbyElement, location, elem, children),
							$temp$elementAttrs = remaining;
						classes = $temp$classes;
						node = $temp$node;
						has = $temp$has;
						transform = $temp$transform;
						styles = $temp$styles;
						attrs = $temp$attrs;
						children = $temp$children;
						elementAttrs = $temp$elementAttrs;
						continue gatherAttrRecursive;
					case 'AlignX':
						var x = attribute.a;
						if (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$xAlign, has)) {
							var $temp$classes = classes,
								$temp$node = node,
								$temp$has = has,
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						} else {
							var $temp$classes = $mdgriffith$elm_ui$Internal$Model$alignXName(x) + (' ' + classes),
								$temp$node = node,
								$temp$has = function (flags) {
								switch (x.$) {
									case 'CenterX':
										return A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$centerX, flags);
									case 'Right':
										return A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$alignRight, flags);
									default:
										return flags;
								}
							}(
								A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$xAlign, has)),
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						}
					default:
						var y = attribute.a;
						if (A2($mdgriffith$elm_ui$Internal$Flag$present, $mdgriffith$elm_ui$Internal$Flag$yAlign, has)) {
							var $temp$classes = classes,
								$temp$node = node,
								$temp$has = has,
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						} else {
							var $temp$classes = $mdgriffith$elm_ui$Internal$Model$alignYName(y) + (' ' + classes),
								$temp$node = node,
								$temp$has = function (flags) {
								switch (y.$) {
									case 'CenterY':
										return A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$centerY, flags);
									case 'Bottom':
										return A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$alignBottom, flags);
									default:
										return flags;
								}
							}(
								A2($mdgriffith$elm_ui$Internal$Flag$add, $mdgriffith$elm_ui$Internal$Flag$yAlign, has)),
								$temp$transform = transform,
								$temp$styles = styles,
								$temp$attrs = attrs,
								$temp$children = children,
								$temp$elementAttrs = remaining;
							classes = $temp$classes;
							node = $temp$node;
							has = $temp$has;
							transform = $temp$transform;
							styles = $temp$styles;
							attrs = $temp$attrs;
							children = $temp$children;
							elementAttrs = $temp$elementAttrs;
							continue gatherAttrRecursive;
						}
				}
			}
		}
	});
var $mdgriffith$elm_ui$Internal$Model$Untransformed = {$: 'Untransformed'};
var $mdgriffith$elm_ui$Internal$Model$untransformed = $mdgriffith$elm_ui$Internal$Model$Untransformed;
var $mdgriffith$elm_ui$Internal$Model$element = F4(
	function (context, node, attributes, children) {
		return A3(
			$mdgriffith$elm_ui$Internal$Model$createElement,
			context,
			children,
			A8(
				$mdgriffith$elm_ui$Internal$Model$gatherAttrRecursive,
				$mdgriffith$elm_ui$Internal$Model$contextClasses(context),
				node,
				$mdgriffith$elm_ui$Internal$Flag$none,
				$mdgriffith$elm_ui$Internal$Model$untransformed,
				_List_Nil,
				_List_Nil,
				$mdgriffith$elm_ui$Internal$Model$NoNearbyChildren,
				$elm$core$List$reverse(attributes)));
	});
var $mdgriffith$elm_ui$Element$Input$enter = 'Enter';
var $mdgriffith$elm_ui$Internal$Model$NoAttribute = {$: 'NoAttribute'};
var $mdgriffith$elm_ui$Element$Input$hasFocusStyle = function (attr) {
	if (((attr.$ === 'StyleClass') && (attr.b.$ === 'PseudoSelector')) && (attr.b.a.$ === 'Focus')) {
		var _v1 = attr.b;
		var _v2 = _v1.a;
		return true;
	} else {
		return false;
	}
};
var $mdgriffith$elm_ui$Internal$Model$htmlClass = function (cls) {
	return $mdgriffith$elm_ui$Internal$Model$Attr(
		$elm$html$Html$Attributes$class(cls));
};
var $mdgriffith$elm_ui$Element$Input$focusDefault = function (attrs) {
	return A2($elm$core$List$any, $mdgriffith$elm_ui$Element$Input$hasFocusStyle, attrs) ? $mdgriffith$elm_ui$Internal$Model$NoAttribute : $mdgriffith$elm_ui$Internal$Model$htmlClass('focusable');
};
var $mdgriffith$elm_ui$Internal$Model$Height = function (a) {
	return {$: 'Height', a: a};
};
var $mdgriffith$elm_ui$Element$height = $mdgriffith$elm_ui$Internal$Model$Height;
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 'Normal', a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $mdgriffith$elm_ui$Element$Events$onClick = A2($elm$core$Basics$composeL, $mdgriffith$elm_ui$Internal$Model$Attr, $elm$html$Html$Events$onClick);
var $elm$json$Json$Decode$fail = _Json_fail;
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 'MayPreventDefault', a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $mdgriffith$elm_ui$Element$Input$onKeyLookup = function (lookup) {
	var decode = function (code) {
		var _v0 = lookup(code);
		if (_v0.$ === 'Nothing') {
			return $elm$json$Json$Decode$fail('No key matched');
		} else {
			var msg = _v0.a;
			return $elm$json$Json$Decode$succeed(msg);
		}
	};
	var isKey = A2(
		$elm$json$Json$Decode$andThen,
		decode,
		A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string));
	return $mdgriffith$elm_ui$Internal$Model$Attr(
		A2(
			$elm$html$Html$Events$preventDefaultOn,
			'keydown',
			A2(
				$elm$json$Json$Decode$map,
				function (fired) {
					return _Utils_Tuple2(fired, true);
				},
				isKey)));
};
var $mdgriffith$elm_ui$Internal$Model$Class = F2(
	function (a, b) {
		return {$: 'Class', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Flag$cursor = $mdgriffith$elm_ui$Internal$Flag$flag(21);
var $mdgriffith$elm_ui$Element$pointer = A2($mdgriffith$elm_ui$Internal$Model$Class, $mdgriffith$elm_ui$Internal$Flag$cursor, $mdgriffith$elm_ui$Internal$Style$classes.cursorPointer);
var $mdgriffith$elm_ui$Internal$Model$Content = {$: 'Content'};
var $mdgriffith$elm_ui$Element$shrink = $mdgriffith$elm_ui$Internal$Model$Content;
var $mdgriffith$elm_ui$Element$Input$space = ' ';
var $elm$html$Html$Attributes$tabindex = function (n) {
	return A2(
		_VirtualDom_attribute,
		'tabIndex',
		$elm$core$String$fromInt(n));
};
var $mdgriffith$elm_ui$Internal$Model$Width = function (a) {
	return {$: 'Width', a: a};
};
var $mdgriffith$elm_ui$Element$width = $mdgriffith$elm_ui$Internal$Model$Width;
var $mdgriffith$elm_ui$Element$Input$button = F2(
	function (attrs, _v0) {
		var onPress = _v0.onPress;
		var label = _v0.label;
		return A4(
			$mdgriffith$elm_ui$Internal$Model$element,
			$mdgriffith$elm_ui$Internal$Model$asEl,
			$mdgriffith$elm_ui$Internal$Model$div,
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$shrink),
				A2(
					$elm$core$List$cons,
					$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$shrink),
					A2(
						$elm$core$List$cons,
						$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.contentCenterX + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.contentCenterY + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.seButton + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.noTextSelection)))))),
						A2(
							$elm$core$List$cons,
							$mdgriffith$elm_ui$Element$pointer,
							A2(
								$elm$core$List$cons,
								$mdgriffith$elm_ui$Element$Input$focusDefault(attrs),
								A2(
									$elm$core$List$cons,
									$mdgriffith$elm_ui$Internal$Model$Describe($mdgriffith$elm_ui$Internal$Model$Button),
									A2(
										$elm$core$List$cons,
										$mdgriffith$elm_ui$Internal$Model$Attr(
											$elm$html$Html$Attributes$tabindex(0)),
										function () {
											if (onPress.$ === 'Nothing') {
												return A2(
													$elm$core$List$cons,
													$mdgriffith$elm_ui$Internal$Model$Attr(
														$elm$html$Html$Attributes$disabled(true)),
													attrs);
											} else {
												var msg = onPress.a;
												return A2(
													$elm$core$List$cons,
													$mdgriffith$elm_ui$Element$Events$onClick(msg),
													A2(
														$elm$core$List$cons,
														$mdgriffith$elm_ui$Element$Input$onKeyLookup(
															function (code) {
																return _Utils_eq(code, $mdgriffith$elm_ui$Element$Input$enter) ? $elm$core$Maybe$Just(msg) : (_Utils_eq(code, $mdgriffith$elm_ui$Element$Input$space) ? $elm$core$Maybe$Just(msg) : $elm$core$Maybe$Nothing);
															}),
														attrs));
											}
										}()))))))),
			$mdgriffith$elm_ui$Internal$Model$Unkeyed(
				_List_fromArray(
					[label])));
	});
var $mdgriffith$elm_ui$Internal$Flag$fontAlignment = $mdgriffith$elm_ui$Internal$Flag$flag(12);
var $mdgriffith$elm_ui$Element$Font$center = A2($mdgriffith$elm_ui$Internal$Model$Class, $mdgriffith$elm_ui$Internal$Flag$fontAlignment, $mdgriffith$elm_ui$Internal$Style$classes.textCenter);
var $mdgriffith$elm_ui$Internal$Model$CenterX = {$: 'CenterX'};
var $mdgriffith$elm_ui$Element$centerX = $mdgriffith$elm_ui$Internal$Model$AlignX($mdgriffith$elm_ui$Internal$Model$CenterX);
var $mdgriffith$elm_ui$Internal$Model$Colored = F3(
	function (a, b, c) {
		return {$: 'Colored', a: a, b: b, c: c};
	});
var $mdgriffith$elm_ui$Internal$Flag$bgColor = $mdgriffith$elm_ui$Internal$Flag$flag(8);
var $mdgriffith$elm_ui$Internal$Model$formatColorClass = function (_v0) {
	var red = _v0.a;
	var green = _v0.b;
	var blue = _v0.c;
	var alpha = _v0.d;
	return $mdgriffith$elm_ui$Internal$Model$floatClass(red) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(green) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(blue) + ('-' + $mdgriffith$elm_ui$Internal$Model$floatClass(alpha))))));
};
var $mdgriffith$elm_ui$Element$Background$color = function (clr) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$bgColor,
		A3(
			$mdgriffith$elm_ui$Internal$Model$Colored,
			'bg-' + $mdgriffith$elm_ui$Internal$Model$formatColorClass(clr),
			'background-color',
			clr));
};
var $mdgriffith$elm_ui$Internal$Flag$fontColor = $mdgriffith$elm_ui$Internal$Flag$flag(14);
var $mdgriffith$elm_ui$Element$Font$color = function (fontColor) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$fontColor,
		A3(
			$mdgriffith$elm_ui$Internal$Model$Colored,
			'fc-' + $mdgriffith$elm_ui$Internal$Model$formatColorClass(fontColor),
			'color',
			fontColor));
};
var $mdgriffith$elm_ui$Internal$Model$AsColumn = {$: 'AsColumn'};
var $mdgriffith$elm_ui$Internal$Model$asColumn = $mdgriffith$elm_ui$Internal$Model$AsColumn;
var $mdgriffith$elm_ui$Element$column = F2(
	function (attrs, children) {
		return A4(
			$mdgriffith$elm_ui$Internal$Model$element,
			$mdgriffith$elm_ui$Internal$Model$asColumn,
			$mdgriffith$elm_ui$Internal$Model$div,
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.contentTop + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.contentLeft)),
				A2(
					$elm$core$List$cons,
					$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$shrink),
					A2(
						$elm$core$List$cons,
						$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$shrink),
						attrs))),
			$mdgriffith$elm_ui$Internal$Model$Unkeyed(children));
	});
var $mdgriffith$elm_ui$Element$el = F2(
	function (attrs, child) {
		return A4(
			$mdgriffith$elm_ui$Internal$Model$element,
			$mdgriffith$elm_ui$Internal$Model$asEl,
			$mdgriffith$elm_ui$Internal$Model$div,
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$shrink),
				A2(
					$elm$core$List$cons,
					$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$shrink),
					attrs)),
			$mdgriffith$elm_ui$Internal$Model$Unkeyed(
				_List_fromArray(
					[child])));
	});
var $mdgriffith$elm_ui$Internal$Flag$fontWeight = $mdgriffith$elm_ui$Internal$Flag$flag(13);
var $mdgriffith$elm_ui$Element$Font$extraBold = A2($mdgriffith$elm_ui$Internal$Model$Class, $mdgriffith$elm_ui$Internal$Flag$fontWeight, $mdgriffith$elm_ui$Internal$Style$classes.textExtraBold);
var $mdgriffith$elm_ui$Internal$Model$FontFamily = F2(
	function (a, b) {
		return {$: 'FontFamily', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Flag$fontFamily = $mdgriffith$elm_ui$Internal$Flag$flag(5);
var $elm$core$String$toLower = _String_toLower;
var $elm$core$String$words = _String_words;
var $mdgriffith$elm_ui$Internal$Model$renderFontClassName = F2(
	function (font, current) {
		return _Utils_ap(
			current,
			function () {
				switch (font.$) {
					case 'Serif':
						return 'serif';
					case 'SansSerif':
						return 'sans-serif';
					case 'Monospace':
						return 'monospace';
					case 'Typeface':
						var name = font.a;
						return A2(
							$elm$core$String$join,
							'-',
							$elm$core$String$words(
								$elm$core$String$toLower(name)));
					case 'ImportFont':
						var name = font.a;
						var url = font.b;
						return A2(
							$elm$core$String$join,
							'-',
							$elm$core$String$words(
								$elm$core$String$toLower(name)));
					default:
						var name = font.a.name;
						return A2(
							$elm$core$String$join,
							'-',
							$elm$core$String$words(
								$elm$core$String$toLower(name)));
				}
			}());
	});
var $mdgriffith$elm_ui$Element$Font$family = function (families) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$fontFamily,
		A2(
			$mdgriffith$elm_ui$Internal$Model$FontFamily,
			A3($elm$core$List$foldl, $mdgriffith$elm_ui$Internal$Model$renderFontClassName, 'ff-', families),
			families));
};
var $mdgriffith$elm_ui$Internal$Model$Fill = function (a) {
	return {$: 'Fill', a: a};
};
var $mdgriffith$elm_ui$Element$fill = $mdgriffith$elm_ui$Internal$Model$Fill(1);
var $mdgriffith$elm_ui$Internal$Model$FocusStyleOption = function (a) {
	return {$: 'FocusStyleOption', a: a};
};
var $mdgriffith$elm_ui$Element$focusStyle = $mdgriffith$elm_ui$Internal$Model$FocusStyleOption;
var $mdgriffith$elm_ui$Internal$Model$Rgba = F4(
	function (a, b, c, d) {
		return {$: 'Rgba', a: a, b: b, c: c, d: d};
	});
var $mdgriffith$elm_ui$Element$rgba255 = F4(
	function (red, green, blue, a) {
		return A4($mdgriffith$elm_ui$Internal$Model$Rgba, red / 255, green / 255, blue / 255, a);
	});
var $author$project$Main$fontColor = function (timeOfDay) {
	switch (timeOfDay.$) {
		case 'Sunrise':
			return _Utils_Tuple2(
				A4($mdgriffith$elm_ui$Element$rgba255, 255, 255, 255, 0.8),
				'rgba(255, 255, 255, 0.8)');
		case 'Day':
			return _Utils_Tuple2(
				A4($mdgriffith$elm_ui$Element$rgba255, 0, 0, 0, 0.8),
				'rgba(0, 0, 0, 0.8)');
		case 'Sunset':
			return _Utils_Tuple2(
				A4($mdgriffith$elm_ui$Element$rgba255, 0, 0, 0, 0.8),
				'rgba(0, 0, 0, 0.8)');
		default:
			return _Utils_Tuple2(
				A4($mdgriffith$elm_ui$Element$rgba255, 255, 255, 255, 0.45),
				'rgba(255, 255, 255, 0.45)');
	}
};
var $mdgriffith$elm_ui$Element$htmlAttribute = $mdgriffith$elm_ui$Internal$Model$Attr;
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $mdgriffith$elm_ui$Element$Background$image = function (src) {
	return $mdgriffith$elm_ui$Internal$Model$Attr(
		A2($elm$virtual_dom$VirtualDom$style, 'background', 'url(\"' + (src + '\") center / cover no-repeat')));
};
var $author$project$Main$sideMenuWidth = 320;
var $author$project$Main$realPageWidth = F2(
	function (x, isSideMenuOpen) {
		return $author$project$Main$menuSideBySide(x) ? (isSideMenuOpen ? (x - $author$project$Main$sideMenuWidth) : x) : x;
	});
var $author$project$Main$largeScreen = F2(
	function (x, isSideMenuOpen) {
		return A2($author$project$Main$realPageWidth, x, isSideMenuOpen) > 800;
	});
var $mdgriffith$elm_ui$Internal$Flag$letterSpacing = $mdgriffith$elm_ui$Internal$Flag$flag(16);
var $mdgriffith$elm_ui$Element$Font$letterSpacing = function (offset) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$letterSpacing,
		A3(
			$mdgriffith$elm_ui$Internal$Model$Single,
			'ls-' + $mdgriffith$elm_ui$Internal$Model$floatClass(offset),
			'letter-spacing',
			$elm$core$String$fromFloat(offset) + 'px'));
};
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $elm$html$Html$Attributes$rel = _VirtualDom_attribute('rel');
var $mdgriffith$elm_ui$Element$link = F2(
	function (attrs, _v0) {
		var url = _v0.url;
		var label = _v0.label;
		return A4(
			$mdgriffith$elm_ui$Internal$Model$element,
			$mdgriffith$elm_ui$Internal$Model$asEl,
			$mdgriffith$elm_ui$Internal$Model$NodeName('a'),
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Internal$Model$Attr(
					$elm$html$Html$Attributes$href(url)),
				A2(
					$elm$core$List$cons,
					$mdgriffith$elm_ui$Internal$Model$Attr(
						$elm$html$Html$Attributes$rel('noopener noreferrer')),
					A2(
						$elm$core$List$cons,
						$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$shrink),
						A2(
							$elm$core$List$cons,
							$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$shrink),
							A2(
								$elm$core$List$cons,
								$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.contentCenterX + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.contentCenterY + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.link)))),
								attrs))))),
			$mdgriffith$elm_ui$Internal$Model$Unkeyed(
				_List_fromArray(
					[label])));
	});
var $mdgriffith$elm_ui$Internal$Flag$borderColor = $mdgriffith$elm_ui$Internal$Flag$flag(28);
var $mdgriffith$elm_ui$Element$Border$color = function (clr) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$borderColor,
		A3(
			$mdgriffith$elm_ui$Internal$Model$Colored,
			'bc-' + $mdgriffith$elm_ui$Internal$Model$formatColorClass(clr),
			'border-color',
			clr));
};
var $mdgriffith$elm_ui$Internal$Model$Hover = {$: 'Hover'};
var $mdgriffith$elm_ui$Internal$Model$PseudoSelector = F2(
	function (a, b) {
		return {$: 'PseudoSelector', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Flag$hover = $mdgriffith$elm_ui$Internal$Flag$flag(33);
var $mdgriffith$elm_ui$Internal$Model$Nearby = F2(
	function (a, b) {
		return {$: 'Nearby', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$TransformComponent = F2(
	function (a, b) {
		return {$: 'TransformComponent', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$Text = function (a) {
	return {$: 'Text', a: a};
};
var $elm$virtual_dom$VirtualDom$map = _VirtualDom_map;
var $mdgriffith$elm_ui$Internal$Model$map = F2(
	function (fn, el) {
		switch (el.$) {
			case 'Styled':
				var styled = el.a;
				return $mdgriffith$elm_ui$Internal$Model$Styled(
					{
						html: F2(
							function (add, context) {
								return A2(
									$elm$virtual_dom$VirtualDom$map,
									fn,
									A2(styled.html, add, context));
							}),
						styles: styled.styles
					});
			case 'Unstyled':
				var html = el.a;
				return $mdgriffith$elm_ui$Internal$Model$Unstyled(
					A2(
						$elm$core$Basics$composeL,
						$elm$virtual_dom$VirtualDom$map(fn),
						html));
			case 'Text':
				var str = el.a;
				return $mdgriffith$elm_ui$Internal$Model$Text(str);
			default:
				return $mdgriffith$elm_ui$Internal$Model$Empty;
		}
	});
var $elm$virtual_dom$VirtualDom$mapAttribute = _VirtualDom_mapAttribute;
var $mdgriffith$elm_ui$Internal$Model$mapAttrFromStyle = F2(
	function (fn, attr) {
		switch (attr.$) {
			case 'NoAttribute':
				return $mdgriffith$elm_ui$Internal$Model$NoAttribute;
			case 'Describe':
				var description = attr.a;
				return $mdgriffith$elm_ui$Internal$Model$Describe(description);
			case 'AlignX':
				var x = attr.a;
				return $mdgriffith$elm_ui$Internal$Model$AlignX(x);
			case 'AlignY':
				var y = attr.a;
				return $mdgriffith$elm_ui$Internal$Model$AlignY(y);
			case 'Width':
				var x = attr.a;
				return $mdgriffith$elm_ui$Internal$Model$Width(x);
			case 'Height':
				var x = attr.a;
				return $mdgriffith$elm_ui$Internal$Model$Height(x);
			case 'Class':
				var x = attr.a;
				var y = attr.b;
				return A2($mdgriffith$elm_ui$Internal$Model$Class, x, y);
			case 'StyleClass':
				var flag = attr.a;
				var style = attr.b;
				return A2($mdgriffith$elm_ui$Internal$Model$StyleClass, flag, style);
			case 'Nearby':
				var location = attr.a;
				var elem = attr.b;
				return A2(
					$mdgriffith$elm_ui$Internal$Model$Nearby,
					location,
					A2($mdgriffith$elm_ui$Internal$Model$map, fn, elem));
			case 'Attr':
				var htmlAttr = attr.a;
				return $mdgriffith$elm_ui$Internal$Model$Attr(
					A2($elm$virtual_dom$VirtualDom$mapAttribute, fn, htmlAttr));
			default:
				var fl = attr.a;
				var trans = attr.b;
				return A2($mdgriffith$elm_ui$Internal$Model$TransformComponent, fl, trans);
		}
	});
var $mdgriffith$elm_ui$Internal$Model$removeNever = function (style) {
	return A2($mdgriffith$elm_ui$Internal$Model$mapAttrFromStyle, $elm$core$Basics$never, style);
};
var $mdgriffith$elm_ui$Internal$Model$unwrapDecsHelper = F2(
	function (attr, _v0) {
		var styles = _v0.a;
		var trans = _v0.b;
		var _v1 = $mdgriffith$elm_ui$Internal$Model$removeNever(attr);
		switch (_v1.$) {
			case 'StyleClass':
				var style = _v1.b;
				return _Utils_Tuple2(
					A2($elm$core$List$cons, style, styles),
					trans);
			case 'TransformComponent':
				var flag = _v1.a;
				var component = _v1.b;
				return _Utils_Tuple2(
					styles,
					A2($mdgriffith$elm_ui$Internal$Model$composeTransformation, trans, component));
			default:
				return _Utils_Tuple2(styles, trans);
		}
	});
var $mdgriffith$elm_ui$Internal$Model$unwrapDecorations = function (attrs) {
	var _v0 = A3(
		$elm$core$List$foldl,
		$mdgriffith$elm_ui$Internal$Model$unwrapDecsHelper,
		_Utils_Tuple2(_List_Nil, $mdgriffith$elm_ui$Internal$Model$Untransformed),
		attrs);
	var styles = _v0.a;
	var transform = _v0.b;
	return A2(
		$elm$core$List$cons,
		$mdgriffith$elm_ui$Internal$Model$Transform(transform),
		styles);
};
var $mdgriffith$elm_ui$Element$mouseOver = function (decs) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$hover,
		A2(
			$mdgriffith$elm_ui$Internal$Model$PseudoSelector,
			$mdgriffith$elm_ui$Internal$Model$Hover,
			$mdgriffith$elm_ui$Internal$Model$unwrapDecorations(decs)));
};
var $mdgriffith$elm_ui$Element$rgba = $mdgriffith$elm_ui$Internal$Model$Rgba;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $author$project$Main$mouseOverAttrs = _List_fromArray(
	[
		$mdgriffith$elm_ui$Element$mouseOver(
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$Background$color(
				A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 0.2)),
				$mdgriffith$elm_ui$Element$Border$color(
				A4($mdgriffith$elm_ui$Element$rgba, 0, 0, 0, 0))
			])),
		$mdgriffith$elm_ui$Element$htmlAttribute(
		A2($elm$html$Html$Attributes$style, 'transition', 'all 0.2s'))
	]);
var $mdgriffith$elm_ui$Element$rgb = F3(
	function (r, g, b) {
		return A4($mdgriffith$elm_ui$Internal$Model$Rgba, r, g, b, 1);
	});
var $mdgriffith$elm_ui$Internal$Model$BorderWidth = F5(
	function (a, b, c, d, e) {
		return {$: 'BorderWidth', a: a, b: b, c: c, d: d, e: e};
	});
var $mdgriffith$elm_ui$Element$Border$width = function (v) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$borderWidth,
		A5(
			$mdgriffith$elm_ui$Internal$Model$BorderWidth,
			'b-' + $elm$core$String$fromInt(v),
			v,
			v,
			v,
			v));
};
var $mdgriffith$elm_ui$Element$Border$widthXY = F2(
	function (x, y) {
		return A2(
			$mdgriffith$elm_ui$Internal$Model$StyleClass,
			$mdgriffith$elm_ui$Internal$Flag$borderWidth,
			A5(
				$mdgriffith$elm_ui$Internal$Model$BorderWidth,
				'b-' + ($elm$core$String$fromInt(x) + ('-' + $elm$core$String$fromInt(y))),
				y,
				x,
				y,
				x));
	});
var $mdgriffith$elm_ui$Element$Border$widthEach = function (_v0) {
	var bottom = _v0.bottom;
	var top = _v0.top;
	var left = _v0.left;
	var right = _v0.right;
	return (_Utils_eq(top, bottom) && _Utils_eq(left, right)) ? (_Utils_eq(top, right) ? $mdgriffith$elm_ui$Element$Border$width(top) : A2($mdgriffith$elm_ui$Element$Border$widthXY, left, top)) : A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$borderWidth,
		A5(
			$mdgriffith$elm_ui$Internal$Model$BorderWidth,
			'b-' + ($elm$core$String$fromInt(top) + ('-' + ($elm$core$String$fromInt(right) + ('-' + ($elm$core$String$fromInt(bottom) + ('-' + $elm$core$String$fromInt(left))))))),
			top,
			right,
			bottom,
			left));
};
var $author$project$Main$linkAttrsFooter = _Utils_ap(
	_List_fromArray(
		[
			$mdgriffith$elm_ui$Element$Font$color(
			A3($mdgriffith$elm_ui$Element$rgb, 1, 1, 1)),
			$mdgriffith$elm_ui$Element$Border$widthEach(
			{bottom: 1, left: 0, right: 0, top: 0}),
			$mdgriffith$elm_ui$Element$Border$color(
			A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 0.6))
		]),
	$author$project$Main$mouseOverAttrs);
var $mdgriffith$elm_ui$Internal$Model$Max = F2(
	function (a, b) {
		return {$: 'Max', a: a, b: b};
	});
var $mdgriffith$elm_ui$Element$maximum = F2(
	function (i, l) {
		return A2($mdgriffith$elm_ui$Internal$Model$Max, i, l);
	});
var $author$project$Main$Icon_Email = {$: 'Icon_Email'};
var $author$project$Main$Icon_PaperPlane = {$: 'Icon_PaperPlane'};
var $author$project$Main$Icon_TwitterOutlined = {$: 'Icon_TwitterOutlined'};
var $author$project$Main$Icon_WaveHand = {$: 'Icon_WaveHand'};
var $author$project$Main$emailHello = 'hello@elmjapan.org';
var $author$project$Main$emailSponsors = 'sponsors@elmjapan.org';
var $author$project$Main$handleTwitter = '@elmjapanconf';
var $mdgriffith$elm_ui$Internal$Model$AsRow = {$: 'AsRow'};
var $mdgriffith$elm_ui$Internal$Model$asRow = $mdgriffith$elm_ui$Internal$Model$AsRow;
var $mdgriffith$elm_ui$Element$row = F2(
	function (attrs, children) {
		return A4(
			$mdgriffith$elm_ui$Internal$Model$element,
			$mdgriffith$elm_ui$Internal$Model$asRow,
			$mdgriffith$elm_ui$Internal$Model$div,
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.contentLeft + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.contentCenterY)),
				A2(
					$elm$core$List$cons,
					$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$shrink),
					A2(
						$elm$core$List$cons,
						$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$shrink),
						attrs))),
			$mdgriffith$elm_ui$Internal$Model$Unkeyed(children));
	});
var $mdgriffith$elm_ui$Internal$Model$SpacingStyle = F3(
	function (a, b, c) {
		return {$: 'SpacingStyle', a: a, b: b, c: c};
	});
var $mdgriffith$elm_ui$Internal$Flag$spacing = $mdgriffith$elm_ui$Internal$Flag$flag(3);
var $mdgriffith$elm_ui$Internal$Model$spacingName = F2(
	function (x, y) {
		return 'spacing-' + ($elm$core$String$fromInt(x) + ('-' + $elm$core$String$fromInt(y)));
	});
var $mdgriffith$elm_ui$Element$spacing = function (x) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$spacing,
		A3(
			$mdgriffith$elm_ui$Internal$Model$SpacingStyle,
			A2($mdgriffith$elm_ui$Internal$Model$spacingName, x, x),
			x,
			x));
};
var $mdgriffith$elm_ui$Element$text = function (content) {
	return $mdgriffith$elm_ui$Internal$Model$Text(content);
};
var $elm$core$String$toUpper = _String_toUpper;
var $author$project$Main$up = $elm$core$String$toUpper;
var $author$project$Main$linkLabel = F4(
	function (withIcon, color, icon_, string) {
		return withIcon ? A2(
			$mdgriffith$elm_ui$Element$row,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$spacing(10)
				]),
			_List_fromArray(
				[
					A2(
					$mdgriffith$elm_ui$Element$el,
					_List_Nil,
					A3($author$project$Main$icon, icon_, color, 18)),
					$mdgriffith$elm_ui$Element$text(
					$author$project$Main$up(string))
				])) : A2(
			$mdgriffith$elm_ui$Element$el,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
					$mdgriffith$elm_ui$Element$centerX
				]),
			$mdgriffith$elm_ui$Element$text(
				$author$project$Main$up(string)));
	});
var $author$project$Main$linkMailingList = 'http://eepurl.com/gHZECb';
var $author$project$Main$linkTwitter = 'https://twitter.com/ElmJapanConf';
var $elm$html$Html$Attributes$target = $elm$html$Html$Attributes$stringProperty('target');
var $mdgriffith$elm_ui$Element$newTabLink = F2(
	function (attrs, _v0) {
		var url = _v0.url;
		var label = _v0.label;
		return A4(
			$mdgriffith$elm_ui$Internal$Model$element,
			$mdgriffith$elm_ui$Internal$Model$asEl,
			$mdgriffith$elm_ui$Internal$Model$NodeName('a'),
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Internal$Model$Attr(
					$elm$html$Html$Attributes$href(url)),
				A2(
					$elm$core$List$cons,
					$mdgriffith$elm_ui$Internal$Model$Attr(
						$elm$html$Html$Attributes$rel('noopener noreferrer')),
					A2(
						$elm$core$List$cons,
						$mdgriffith$elm_ui$Internal$Model$Attr(
							$elm$html$Html$Attributes$target('_blank')),
						A2(
							$elm$core$List$cons,
							$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$shrink),
							A2(
								$elm$core$List$cons,
								$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$shrink),
								A2(
									$elm$core$List$cons,
									$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.contentCenterX + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.contentCenterY + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.link)))),
									attrs)))))),
			$mdgriffith$elm_ui$Internal$Model$Unkeyed(
				_List_fromArray(
					[label])));
	});
var $author$project$Main$menuContacts = F3(
	function (withIcon, color, attrs) {
		return _List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Element$newTabLink,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_PaperPlane, 'Mailing list'),
					url: $author$project$Main$linkMailingList
				}),
				A2(
				$mdgriffith$elm_ui$Element$newTabLink,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_TwitterOutlined, $author$project$Main$handleTwitter),
					url: $author$project$Main$linkTwitter
				}),
				A2(
				$mdgriffith$elm_ui$Element$newTabLink,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Email, $author$project$Main$emailSponsors),
					url: 'mailto:' + $author$project$Main$emailSponsors
				}),
				A2(
				$mdgriffith$elm_ui$Element$newTabLink,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_WaveHand, $author$project$Main$emailHello),
					url: 'mailto:' + $author$project$Main$emailHello
				})
			]);
	});
var $author$project$Main$Icon_HighFive = {$: 'Icon_HighFive'};
var $author$project$Main$Icon_Microphone = {$: 'Icon_Microphone'};
var $author$project$Main$Icon_Respect = {$: 'Icon_Respect'};
var $author$project$Main$Icon_Startup = {$: 'Icon_Startup'};
var $author$project$Main$Icon_Tickets = {$: 'Icon_Tickets'};
var $author$project$Main$ScrollTo = function (a) {
	return {$: 'ScrollTo', a: a};
};
var $author$project$Main$menuList = F3(
	function (withIcon, color, attrs) {
		return _List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Element$link,
				_Utils_ap(
					attrs,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$Events$onClick(
							$author$project$Main$ScrollTo('#speakers'))
						])),
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Microphone, 'speakers'),
					url: '/'
				}),
				A2(
				$mdgriffith$elm_ui$Element$link,
				_Utils_ap(
					attrs,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$Events$onClick(
							$author$project$Main$ScrollTo('#tickets'))
						])),
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Tickets, 'tickets'),
					url: '/'
				}),
				A2(
				$mdgriffith$elm_ui$Element$link,
				_Utils_ap(
					attrs,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$Events$onClick(
							$author$project$Main$ScrollTo('#sponsors'))
						])),
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Respect, 'sponsors'),
					url: '/'
				}),
				A2(
				$mdgriffith$elm_ui$Element$link,
				_Utils_ap(
					attrs,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$Events$onClick(
							$author$project$Main$ScrollTo('#who-we-are'))
						])),
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_HighFive, 'who we are'),
					url: '/'
				}),
				A2(
				$mdgriffith$elm_ui$Element$link,
				_Utils_ap(
					attrs,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$Events$onClick(
							$author$project$Main$ScrollTo('#top'))
						])),
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Startup, 'elm conferences'),
					url: '/elm-conferences'
				})
			]);
	});
var $author$project$Main$ChangeTimeOfDay = function (a) {
	return {$: 'ChangeTimeOfDay', a: a};
};
var $author$project$Main$Icon_Moon = {$: 'Icon_Moon'};
var $author$project$Main$Icon_QRCodeSmall = {$: 'Icon_QRCodeSmall'};
var $author$project$Main$Icon_Sun = {$: 'Icon_Sun'};
var $author$project$Main$Icon_Sunrise = {$: 'Icon_Sunrise'};
var $author$project$Main$Icon_Sunset = {$: 'Icon_Sunset'};
var $author$project$Main$menuModes = F3(
	function (withIcon, color, attrs) {
		return _List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Element$Input$button,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Sunrise, '[1] SUNRISE MODE'),
					onPress: $elm$core$Maybe$Just(
						$author$project$Main$ChangeTimeOfDay($author$project$FloatingTokyoCity$Sunrise))
				}),
				A2(
				$mdgriffith$elm_ui$Element$Input$button,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Sun, '[2] DAY MODE'),
					onPress: $elm$core$Maybe$Just(
						$author$project$Main$ChangeTimeOfDay($author$project$FloatingTokyoCity$Day))
				}),
				A2(
				$mdgriffith$elm_ui$Element$Input$button,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Sunset, '[3] SUNSET MODE'),
					onPress: $elm$core$Maybe$Just(
						$author$project$Main$ChangeTimeOfDay($author$project$FloatingTokyoCity$Sunset))
				}),
				A2(
				$mdgriffith$elm_ui$Element$Input$button,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_Moon, '[4] NIGHT MODE'),
					onPress: $elm$core$Maybe$Just(
						$author$project$Main$ChangeTimeOfDay($author$project$FloatingTokyoCity$Night))
				}),
				A2(
				$mdgriffith$elm_ui$Element$link,
				attrs,
				{
					label: A4($author$project$Main$linkLabel, withIcon, color, $author$project$Main$Icon_QRCodeSmall, '[Q] QR CODE'),
					url: '/qr-code'
				})
			]);
	});
var $mdgriffith$elm_ui$Internal$Model$MoveY = function (a) {
	return {$: 'MoveY', a: a};
};
var $mdgriffith$elm_ui$Internal$Flag$moveY = $mdgriffith$elm_ui$Internal$Flag$flag(26);
var $mdgriffith$elm_ui$Element$moveDown = function (y) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$TransformComponent,
		$mdgriffith$elm_ui$Internal$Flag$moveY,
		$mdgriffith$elm_ui$Internal$Model$MoveY(y));
};
var $mdgriffith$elm_ui$Internal$Model$PaddingStyle = F5(
	function (a, b, c, d, e) {
		return {$: 'PaddingStyle', a: a, b: b, c: c, d: d, e: e};
	});
var $mdgriffith$elm_ui$Internal$Flag$padding = $mdgriffith$elm_ui$Internal$Flag$flag(2);
var $mdgriffith$elm_ui$Internal$Model$paddingName = F4(
	function (top, right, bottom, left) {
		return 'pad-' + ($elm$core$String$fromInt(top) + ('-' + ($elm$core$String$fromInt(right) + ('-' + ($elm$core$String$fromInt(bottom) + ('-' + $elm$core$String$fromInt(left)))))));
	});
var $mdgriffith$elm_ui$Element$paddingEach = function (_v0) {
	var top = _v0.top;
	var right = _v0.right;
	var bottom = _v0.bottom;
	var left = _v0.left;
	if (_Utils_eq(top, right) && (_Utils_eq(top, bottom) && _Utils_eq(top, left))) {
		var topFloat = top;
		return A2(
			$mdgriffith$elm_ui$Internal$Model$StyleClass,
			$mdgriffith$elm_ui$Internal$Flag$padding,
			A5(
				$mdgriffith$elm_ui$Internal$Model$PaddingStyle,
				'p-' + $elm$core$String$fromInt(top),
				topFloat,
				topFloat,
				topFloat,
				topFloat));
	} else {
		return A2(
			$mdgriffith$elm_ui$Internal$Model$StyleClass,
			$mdgriffith$elm_ui$Internal$Flag$padding,
			A5(
				$mdgriffith$elm_ui$Internal$Model$PaddingStyle,
				A4($mdgriffith$elm_ui$Internal$Model$paddingName, top, right, bottom, left),
				top,
				right,
				bottom,
				left));
	}
};
var $mdgriffith$elm_ui$Element$paddingXY = F2(
	function (x, y) {
		if (_Utils_eq(x, y)) {
			var f = x;
			return A2(
				$mdgriffith$elm_ui$Internal$Model$StyleClass,
				$mdgriffith$elm_ui$Internal$Flag$padding,
				A5(
					$mdgriffith$elm_ui$Internal$Model$PaddingStyle,
					'p-' + $elm$core$String$fromInt(x),
					f,
					f,
					f,
					f));
		} else {
			var yFloat = y;
			var xFloat = x;
			return A2(
				$mdgriffith$elm_ui$Internal$Model$StyleClass,
				$mdgriffith$elm_ui$Internal$Flag$padding,
				A5(
					$mdgriffith$elm_ui$Internal$Model$PaddingStyle,
					'p-' + ($elm$core$String$fromInt(x) + ('-' + $elm$core$String$fromInt(y))),
					yFloat,
					xFloat,
					yFloat,
					xFloat));
		}
	});
var $mdgriffith$elm_ui$Internal$Model$Paragraph = {$: 'Paragraph'};
var $mdgriffith$elm_ui$Element$paragraph = F2(
	function (attrs, children) {
		return A4(
			$mdgriffith$elm_ui$Internal$Model$element,
			$mdgriffith$elm_ui$Internal$Model$asParagraph,
			$mdgriffith$elm_ui$Internal$Model$div,
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Internal$Model$Describe($mdgriffith$elm_ui$Internal$Model$Paragraph),
				A2(
					$elm$core$List$cons,
					$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
					A2(
						$elm$core$List$cons,
						$mdgriffith$elm_ui$Element$spacing(5),
						attrs))),
			$mdgriffith$elm_ui$Internal$Model$Unkeyed(children));
	});
var $mdgriffith$elm_ui$Internal$Model$FontSize = function (a) {
	return {$: 'FontSize', a: a};
};
var $mdgriffith$elm_ui$Internal$Flag$fontSize = $mdgriffith$elm_ui$Internal$Flag$flag(4);
var $mdgriffith$elm_ui$Element$Font$size = function (i) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$fontSize,
		$mdgriffith$elm_ui$Internal$Model$FontSize(i));
};
var $author$project$Main$footer = function (model) {
	var madeAndCopy = _Utils_ap(
		_List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Element$paragraph,
				_List_Nil,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$text('This site is made with '),
						A2(
						$mdgriffith$elm_ui$Element$newTabLink,
						$author$project$Main$linkAttrsFooter,
						{
							label: $mdgriffith$elm_ui$Element$text('elm'),
							url: 'https://elm-lang.org/'
						}),
						$mdgriffith$elm_ui$Element$text(' and '),
						A2(
						$mdgriffith$elm_ui$Element$newTabLink,
						$author$project$Main$linkAttrsFooter,
						{
							label: $mdgriffith$elm_ui$Element$text('elm-ui'),
							url: 'https://package.elm-lang.org/packages/mdgriffith/elm-ui/latest/'
						})
					])),
				A2(
				$mdgriffith$elm_ui$Element$paragraph,
				_List_Nil,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$text('The \"floating city\" is made with '),
						A2(
						$mdgriffith$elm_ui$Element$newTabLink,
						$author$project$Main$linkAttrsFooter,
						{
							label: $mdgriffith$elm_ui$Element$text('elm-playground'),
							url: 'https://package.elm-lang.org/packages/evancz/elm-playground/latest/Playground'
						}),
						$mdgriffith$elm_ui$Element$text(' and '),
						A2(
						$mdgriffith$elm_ui$Element$newTabLink,
						$author$project$Main$linkAttrsFooter,
						{
							label: $mdgriffith$elm_ui$Element$text('elm-playground-3d'),
							url: 'https://github.com/lucamug/elm-playground-3d'
						})
					]))
			]),
		_Utils_ap(
			model.startedOnSmallDevice ? _List_Nil : (A2($elm$core$String$contains, 'without-debugger', model.href) ? _List_fromArray(
				[
					A2(
					$mdgriffith$elm_ui$Element$paragraph,
					_List_Nil,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$text('Version '),
							A2(
							$mdgriffith$elm_ui$Element$link,
							$author$project$Main$linkAttrsFooter,
							{
								label: $mdgriffith$elm_ui$Element$text('with the Elm Debugger'),
								url: '?'
							})
						]))
				]) : _List_fromArray(
				[
					A2(
					$mdgriffith$elm_ui$Element$paragraph,
					_List_Nil,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$text('Version '),
							A2(
							$mdgriffith$elm_ui$Element$link,
							$author$project$Main$linkAttrsFooter,
							{
								label: $mdgriffith$elm_ui$Element$text('without the Elm Debugger'),
								url: '?without-debugger'
							})
						]))
				])),
			_List_fromArray(
				[
					A2(
					$mdgriffith$elm_ui$Element$paragraph,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$moveDown(30)
						]),
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$text('© Elm Japan 2020')
						]))
				])));
	var colsAttrs = _List_fromArray(
		[
			$mdgriffith$elm_ui$Element$alignBottom,
			$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill)
		]);
	var attrs = _Utils_ap(
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
				A2($mdgriffith$elm_ui$Element$paddingXY, 40, 10)
			]),
		$author$project$Main$mouseOverAttrs);
	var col1 = A2(
		$mdgriffith$elm_ui$Element$column,
		colsAttrs,
		A3($author$project$Main$menuContacts, true, 'white', attrs));
	var col2 = A2(
		$mdgriffith$elm_ui$Element$column,
		colsAttrs,
		A3($author$project$Main$menuList, true, 'white', attrs));
	var col3 = A2(
		$mdgriffith$elm_ui$Element$column,
		colsAttrs,
		A3($author$project$Main$menuModes, true, 'white', attrs));
	return A2(
		$mdgriffith$elm_ui$Element$el,
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$Background$image('images/back7.jpg'),
				$mdgriffith$elm_ui$Element$htmlAttribute(
				A2($elm$html$Html$Attributes$style, 'background-position-y', 'top')),
				$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
				$mdgriffith$elm_ui$Element$Font$size(14),
				$mdgriffith$elm_ui$Element$Font$color(
				A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 0.8)),
				$mdgriffith$elm_ui$Element$paddingEach(
				{bottom: 80, left: 20, right: 20, top: 220}),
				$mdgriffith$elm_ui$Element$Font$letterSpacing(2)
			]),
		(!A2($author$project$Main$largeScreen, model.width, model.menuOpen)) ? A2(
			$mdgriffith$elm_ui$Element$column,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$Font$center,
					$mdgriffith$elm_ui$Element$spacing(40),
					$mdgriffith$elm_ui$Element$centerX
				]),
			_List_fromArray(
				[
					A2(
					$mdgriffith$elm_ui$Element$column,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$centerX,
							$mdgriffith$elm_ui$Element$spacing(40)
						]),
					_List_fromArray(
						[col1, col2, col3])),
					A2(
					$mdgriffith$elm_ui$Element$column,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
							$mdgriffith$elm_ui$Element$spacing(20),
							$mdgriffith$elm_ui$Element$Font$letterSpacing(1),
							$mdgriffith$elm_ui$Element$Font$size(15)
						]),
					madeAndCopy)
				])) : A2(
			$mdgriffith$elm_ui$Element$column,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$centerX,
					$mdgriffith$elm_ui$Element$spacing(40)
				]),
			_List_fromArray(
				[
					A2(
					$mdgriffith$elm_ui$Element$row,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$width(
							A2($mdgriffith$elm_ui$Element$maximum, 800, $mdgriffith$elm_ui$Element$fill)),
							$mdgriffith$elm_ui$Element$centerX
						]),
					_List_fromArray(
						[col1, col2, col3])),
					A2(
					$mdgriffith$elm_ui$Element$column,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$centerX,
							$mdgriffith$elm_ui$Element$spacing(10),
							$mdgriffith$elm_ui$Element$Font$center
						]),
					madeAndCopy)
				])));
};
var $author$project$Playground$getMemory = function (_v0) {
	var visibility = _v0.a;
	var memory = _v0.b;
	var computer = _v0.c;
	return memory;
};
var $mdgriffith$elm_ui$Internal$Model$InFront = {$: 'InFront'};
var $mdgriffith$elm_ui$Element$createNearby = F2(
	function (loc, element) {
		if (element.$ === 'Empty') {
			return $mdgriffith$elm_ui$Internal$Model$NoAttribute;
		} else {
			return A2($mdgriffith$elm_ui$Internal$Model$Nearby, loc, element);
		}
	});
var $mdgriffith$elm_ui$Element$inFront = function (element) {
	return A2($mdgriffith$elm_ui$Element$createNearby, $mdgriffith$elm_ui$Internal$Model$InFront, element);
};
var $mdgriffith$elm_ui$Internal$Model$OnlyDynamic = F2(
	function (a, b) {
		return {$: 'OnlyDynamic', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$StaticRootAndDynamic = F2(
	function (a, b) {
		return {$: 'StaticRootAndDynamic', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Model$AllowHover = {$: 'AllowHover'};
var $mdgriffith$elm_ui$Internal$Model$Layout = {$: 'Layout'};
var $mdgriffith$elm_ui$Internal$Model$focusDefaultStyle = {
	backgroundColor: $elm$core$Maybe$Nothing,
	borderColor: $elm$core$Maybe$Nothing,
	shadow: $elm$core$Maybe$Just(
		{
			blur: 0,
			color: A4($mdgriffith$elm_ui$Internal$Model$Rgba, 155 / 255, 203 / 255, 1, 1),
			offset: _Utils_Tuple2(0, 0),
			size: 3
		})
};
var $mdgriffith$elm_ui$Internal$Model$optionsToRecord = function (options) {
	var combine = F2(
		function (opt, record) {
			switch (opt.$) {
				case 'HoverOption':
					var hoverable = opt.a;
					var _v4 = record.hover;
					if (_v4.$ === 'Nothing') {
						return _Utils_update(
							record,
							{
								hover: $elm$core$Maybe$Just(hoverable)
							});
					} else {
						return record;
					}
				case 'FocusStyleOption':
					var focusStyle = opt.a;
					var _v5 = record.focus;
					if (_v5.$ === 'Nothing') {
						return _Utils_update(
							record,
							{
								focus: $elm$core$Maybe$Just(focusStyle)
							});
					} else {
						return record;
					}
				default:
					var renderMode = opt.a;
					var _v6 = record.mode;
					if (_v6.$ === 'Nothing') {
						return _Utils_update(
							record,
							{
								mode: $elm$core$Maybe$Just(renderMode)
							});
					} else {
						return record;
					}
			}
		});
	var andFinally = function (record) {
		return {
			focus: function () {
				var _v0 = record.focus;
				if (_v0.$ === 'Nothing') {
					return $mdgriffith$elm_ui$Internal$Model$focusDefaultStyle;
				} else {
					var focusable = _v0.a;
					return focusable;
				}
			}(),
			hover: function () {
				var _v1 = record.hover;
				if (_v1.$ === 'Nothing') {
					return $mdgriffith$elm_ui$Internal$Model$AllowHover;
				} else {
					var hoverable = _v1.a;
					return hoverable;
				}
			}(),
			mode: function () {
				var _v2 = record.mode;
				if (_v2.$ === 'Nothing') {
					return $mdgriffith$elm_ui$Internal$Model$Layout;
				} else {
					var actualMode = _v2.a;
					return actualMode;
				}
			}()
		};
	};
	return andFinally(
		A3(
			$elm$core$List$foldr,
			combine,
			{focus: $elm$core$Maybe$Nothing, hover: $elm$core$Maybe$Nothing, mode: $elm$core$Maybe$Nothing},
			options));
};
var $mdgriffith$elm_ui$Internal$Model$toHtml = F2(
	function (mode, el) {
		switch (el.$) {
			case 'Unstyled':
				var html = el.a;
				return html($mdgriffith$elm_ui$Internal$Model$asEl);
			case 'Styled':
				var styles = el.a.styles;
				var html = el.a.html;
				return A2(
					html,
					mode(styles),
					$mdgriffith$elm_ui$Internal$Model$asEl);
			case 'Text':
				var text = el.a;
				return $mdgriffith$elm_ui$Internal$Model$textElement(text);
			default:
				return $mdgriffith$elm_ui$Internal$Model$textElement('');
		}
	});
var $mdgriffith$elm_ui$Internal$Model$renderRoot = F3(
	function (optionList, attributes, child) {
		var options = $mdgriffith$elm_ui$Internal$Model$optionsToRecord(optionList);
		var embedStyle = function () {
			var _v0 = options.mode;
			if (_v0.$ === 'NoStaticStyleSheet') {
				return $mdgriffith$elm_ui$Internal$Model$OnlyDynamic(options);
			} else {
				return $mdgriffith$elm_ui$Internal$Model$StaticRootAndDynamic(options);
			}
		}();
		return A2(
			$mdgriffith$elm_ui$Internal$Model$toHtml,
			embedStyle,
			A4(
				$mdgriffith$elm_ui$Internal$Model$element,
				$mdgriffith$elm_ui$Internal$Model$asEl,
				$mdgriffith$elm_ui$Internal$Model$div,
				attributes,
				$mdgriffith$elm_ui$Internal$Model$Unkeyed(
					_List_fromArray(
						[child]))));
	});
var $mdgriffith$elm_ui$Internal$Model$SansSerif = {$: 'SansSerif'};
var $mdgriffith$elm_ui$Internal$Model$Typeface = function (a) {
	return {$: 'Typeface', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$rootStyle = function () {
	var families = _List_fromArray(
		[
			$mdgriffith$elm_ui$Internal$Model$Typeface('Open Sans'),
			$mdgriffith$elm_ui$Internal$Model$Typeface('Helvetica'),
			$mdgriffith$elm_ui$Internal$Model$Typeface('Verdana'),
			$mdgriffith$elm_ui$Internal$Model$SansSerif
		]);
	return _List_fromArray(
		[
			A2(
			$mdgriffith$elm_ui$Internal$Model$StyleClass,
			$mdgriffith$elm_ui$Internal$Flag$bgColor,
			A3(
				$mdgriffith$elm_ui$Internal$Model$Colored,
				'bg-' + $mdgriffith$elm_ui$Internal$Model$formatColorClass(
					A4($mdgriffith$elm_ui$Internal$Model$Rgba, 1, 1, 1, 0)),
				'background-color',
				A4($mdgriffith$elm_ui$Internal$Model$Rgba, 1, 1, 1, 0))),
			A2(
			$mdgriffith$elm_ui$Internal$Model$StyleClass,
			$mdgriffith$elm_ui$Internal$Flag$fontColor,
			A3(
				$mdgriffith$elm_ui$Internal$Model$Colored,
				'fc-' + $mdgriffith$elm_ui$Internal$Model$formatColorClass(
					A4($mdgriffith$elm_ui$Internal$Model$Rgba, 0, 0, 0, 1)),
				'color',
				A4($mdgriffith$elm_ui$Internal$Model$Rgba, 0, 0, 0, 1))),
			A2(
			$mdgriffith$elm_ui$Internal$Model$StyleClass,
			$mdgriffith$elm_ui$Internal$Flag$fontSize,
			$mdgriffith$elm_ui$Internal$Model$FontSize(20)),
			A2(
			$mdgriffith$elm_ui$Internal$Model$StyleClass,
			$mdgriffith$elm_ui$Internal$Flag$fontFamily,
			A2(
				$mdgriffith$elm_ui$Internal$Model$FontFamily,
				A3($elm$core$List$foldl, $mdgriffith$elm_ui$Internal$Model$renderFontClassName, 'font-', families),
				families))
		]);
}();
var $mdgriffith$elm_ui$Element$layoutWith = F3(
	function (_v0, attrs, child) {
		var options = _v0.options;
		return A3(
			$mdgriffith$elm_ui$Internal$Model$renderRoot,
			options,
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Internal$Model$htmlClass(
					A2(
						$elm$core$String$join,
						' ',
						_List_fromArray(
							[$mdgriffith$elm_ui$Internal$Style$classes.root, $mdgriffith$elm_ui$Internal$Style$classes.any, $mdgriffith$elm_ui$Internal$Style$classes.single]))),
				_Utils_ap($mdgriffith$elm_ui$Internal$Model$rootStyle, attrs)),
			child);
	});
var $elm$html$Html$map = $elm$virtual_dom$VirtualDom$map;
var $mdgriffith$elm_ui$Internal$Model$MoveX = function (a) {
	return {$: 'MoveX', a: a};
};
var $mdgriffith$elm_ui$Internal$Flag$moveX = $mdgriffith$elm_ui$Internal$Flag$flag(25);
var $mdgriffith$elm_ui$Element$moveLeft = function (x) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$TransformComponent,
		$mdgriffith$elm_ui$Internal$Flag$moveX,
		$mdgriffith$elm_ui$Internal$Model$MoveX(-x));
};
var $mdgriffith$elm_ui$Element$moveRight = function (x) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$TransformComponent,
		$mdgriffith$elm_ui$Internal$Flag$moveX,
		$mdgriffith$elm_ui$Internal$Model$MoveX(x));
};
var $mdgriffith$elm_ui$Element$moveUp = function (y) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$TransformComponent,
		$mdgriffith$elm_ui$Internal$Flag$moveY,
		$mdgriffith$elm_ui$Internal$Model$MoveY(-y));
};
var $author$project$Main$Icon_VideosOutline = {$: 'Icon_VideosOutline'};
var $mdgriffith$elm_ui$Internal$Model$Top = {$: 'Top'};
var $mdgriffith$elm_ui$Element$alignTop = $mdgriffith$elm_ui$Internal$Model$AlignY($mdgriffith$elm_ui$Internal$Model$Top);
var $mdgriffith$elm_ui$Internal$Flag$overflow = $mdgriffith$elm_ui$Internal$Flag$flag(20);
var $mdgriffith$elm_ui$Element$clip = A2($mdgriffith$elm_ui$Internal$Model$Class, $mdgriffith$elm_ui$Internal$Flag$overflow, $mdgriffith$elm_ui$Internal$Style$classes.clip);
var $elm$html$Html$Attributes$alt = $elm$html$Html$Attributes$stringProperty('alt');
var $elm$html$Html$Attributes$src = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'src',
		_VirtualDom_noJavaScriptOrHtmlUri(url));
};
var $mdgriffith$elm_ui$Element$image = F2(
	function (attrs, _v0) {
		var src = _v0.src;
		var description = _v0.description;
		var imageAttributes = A2(
			$elm$core$List$filter,
			function (a) {
				switch (a.$) {
					case 'Width':
						return true;
					case 'Height':
						return true;
					default:
						return false;
				}
			},
			attrs);
		return A4(
			$mdgriffith$elm_ui$Internal$Model$element,
			$mdgriffith$elm_ui$Internal$Model$asEl,
			$mdgriffith$elm_ui$Internal$Model$div,
			A2(
				$elm$core$List$cons,
				$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.imageContainer),
				attrs),
			$mdgriffith$elm_ui$Internal$Model$Unkeyed(
				_List_fromArray(
					[
						A4(
						$mdgriffith$elm_ui$Internal$Model$element,
						$mdgriffith$elm_ui$Internal$Model$asEl,
						$mdgriffith$elm_ui$Internal$Model$NodeName('img'),
						_Utils_ap(
							_List_fromArray(
								[
									$mdgriffith$elm_ui$Internal$Model$Attr(
									$elm$html$Html$Attributes$src(src)),
									$mdgriffith$elm_ui$Internal$Model$Attr(
									$elm$html$Html$Attributes$alt(description))
								]),
							imageAttributes),
						$mdgriffith$elm_ui$Internal$Model$Unkeyed(_List_Nil))
					])));
	});
var $author$project$Main$linkAttrs = _List_fromArray(
	[
		$mdgriffith$elm_ui$Element$Border$widthEach(
		{bottom: 1, left: 0, right: 0, top: 0}),
		$mdgriffith$elm_ui$Element$Background$color(
		A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 0.1)),
		$mdgriffith$elm_ui$Element$mouseOver(
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$Background$color(
				A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 0.3)),
				$mdgriffith$elm_ui$Element$Border$color(
				A4($mdgriffith$elm_ui$Element$rgba, 0, 0, 0, 0))
			])),
		$mdgriffith$elm_ui$Element$htmlAttribute(
		A2($elm$html$Html$Attributes$style, 'transition', 'all 0.2s')),
		A2($mdgriffith$elm_ui$Element$paddingXY, 3, 0)
	]);
var $mdgriffith$elm_ui$Internal$Model$Min = F2(
	function (a, b) {
		return {$: 'Min', a: a, b: b};
	});
var $mdgriffith$elm_ui$Element$minimum = F2(
	function (i, l) {
		return A2($mdgriffith$elm_ui$Internal$Model$Min, i, l);
	});
var $mdgriffith$elm_ui$Element$padding = function (x) {
	var f = x;
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$padding,
		A5(
			$mdgriffith$elm_ui$Internal$Model$PaddingStyle,
			'p-' + $elm$core$String$fromInt(x),
			f,
			f,
			f,
			f));
};
var $author$project$Main$pageTitleAttrs = _List_fromArray(
	[
		$mdgriffith$elm_ui$Element$Font$size(30)
	]);
var $mdgriffith$elm_ui$Internal$Model$Px = function (a) {
	return {$: 'Px', a: a};
};
var $mdgriffith$elm_ui$Element$px = $mdgriffith$elm_ui$Internal$Model$Px;
var $mdgriffith$elm_ui$Internal$Flag$borderRound = $mdgriffith$elm_ui$Internal$Flag$flag(17);
var $mdgriffith$elm_ui$Element$Border$rounded = function (radius) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$StyleClass,
		$mdgriffith$elm_ui$Internal$Flag$borderRound,
		A3(
			$mdgriffith$elm_ui$Internal$Model$Single,
			'br-' + $elm$core$String$fromInt(radius),
			'border-radius',
			$elm$core$String$fromInt(radius) + 'px'));
};
var $mdgriffith$elm_ui$Internal$Model$Padding = F5(
	function (a, b, c, d, e) {
		return {$: 'Padding', a: a, b: b, c: c, d: d, e: e};
	});
var $mdgriffith$elm_ui$Internal$Model$Spaced = F3(
	function (a, b, c) {
		return {$: 'Spaced', a: a, b: b, c: c};
	});
var $mdgriffith$elm_ui$Internal$Model$extractSpacingAndPadding = function (attrs) {
	return A3(
		$elm$core$List$foldr,
		F2(
			function (attr, _v0) {
				var pad = _v0.a;
				var spacing = _v0.b;
				return _Utils_Tuple2(
					function () {
						if (pad.$ === 'Just') {
							var x = pad.a;
							return pad;
						} else {
							if ((attr.$ === 'StyleClass') && (attr.b.$ === 'PaddingStyle')) {
								var _v3 = attr.b;
								var name = _v3.a;
								var t = _v3.b;
								var r = _v3.c;
								var b = _v3.d;
								var l = _v3.e;
								return $elm$core$Maybe$Just(
									A5($mdgriffith$elm_ui$Internal$Model$Padding, name, t, r, b, l));
							} else {
								return $elm$core$Maybe$Nothing;
							}
						}
					}(),
					function () {
						if (spacing.$ === 'Just') {
							var x = spacing.a;
							return spacing;
						} else {
							if ((attr.$ === 'StyleClass') && (attr.b.$ === 'SpacingStyle')) {
								var _v6 = attr.b;
								var name = _v6.a;
								var x = _v6.b;
								var y = _v6.c;
								return $elm$core$Maybe$Just(
									A3($mdgriffith$elm_ui$Internal$Model$Spaced, name, x, y));
							} else {
								return $elm$core$Maybe$Nothing;
							}
						}
					}());
			}),
		_Utils_Tuple2($elm$core$Maybe$Nothing, $elm$core$Maybe$Nothing),
		attrs);
};
var $mdgriffith$elm_ui$Internal$Model$paddingNameFloat = F4(
	function (top, right, bottom, left) {
		return 'pad-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(top) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(right) + ('-' + ($mdgriffith$elm_ui$Internal$Model$floatClass(bottom) + ('-' + $mdgriffith$elm_ui$Internal$Model$floatClass(left)))))));
	});
var $mdgriffith$elm_ui$Element$wrappedRow = F2(
	function (attrs, children) {
		var _v0 = $mdgriffith$elm_ui$Internal$Model$extractSpacingAndPadding(attrs);
		var padded = _v0.a;
		var spaced = _v0.b;
		if (spaced.$ === 'Nothing') {
			return A4(
				$mdgriffith$elm_ui$Internal$Model$element,
				$mdgriffith$elm_ui$Internal$Model$asRow,
				$mdgriffith$elm_ui$Internal$Model$div,
				A2(
					$elm$core$List$cons,
					$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.contentLeft + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.contentCenterY + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.wrapped)))),
					A2(
						$elm$core$List$cons,
						$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$shrink),
						A2(
							$elm$core$List$cons,
							$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$shrink),
							attrs))),
				$mdgriffith$elm_ui$Internal$Model$Unkeyed(children));
		} else {
			var _v2 = spaced.a;
			var spaceName = _v2.a;
			var x = _v2.b;
			var y = _v2.c;
			var newPadding = function () {
				if (padded.$ === 'Just') {
					var _v5 = padded.a;
					var name = _v5.a;
					var t = _v5.b;
					var r = _v5.c;
					var b = _v5.d;
					var l = _v5.e;
					if ((_Utils_cmp(r, x / 2) > -1) && (_Utils_cmp(b, y / 2) > -1)) {
						var newTop = t - (y / 2);
						var newRight = r - (x / 2);
						var newLeft = l - (x / 2);
						var newBottom = b - (y / 2);
						return $elm$core$Maybe$Just(
							A2(
								$mdgriffith$elm_ui$Internal$Model$StyleClass,
								$mdgriffith$elm_ui$Internal$Flag$padding,
								A5(
									$mdgriffith$elm_ui$Internal$Model$PaddingStyle,
									A4($mdgriffith$elm_ui$Internal$Model$paddingNameFloat, newTop, newRight, newBottom, newLeft),
									newTop,
									newRight,
									newBottom,
									newLeft)));
					} else {
						return $elm$core$Maybe$Nothing;
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}();
			if (newPadding.$ === 'Just') {
				var pad = newPadding.a;
				return A4(
					$mdgriffith$elm_ui$Internal$Model$element,
					$mdgriffith$elm_ui$Internal$Model$asRow,
					$mdgriffith$elm_ui$Internal$Model$div,
					A2(
						$elm$core$List$cons,
						$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.contentLeft + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.contentCenterY + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.wrapped)))),
						A2(
							$elm$core$List$cons,
							$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$shrink),
							A2(
								$elm$core$List$cons,
								$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$shrink),
								_Utils_ap(
									attrs,
									_List_fromArray(
										[pad]))))),
					$mdgriffith$elm_ui$Internal$Model$Unkeyed(children));
			} else {
				var halfY = -(y / 2);
				var halfX = -(x / 2);
				return A4(
					$mdgriffith$elm_ui$Internal$Model$element,
					$mdgriffith$elm_ui$Internal$Model$asEl,
					$mdgriffith$elm_ui$Internal$Model$div,
					attrs,
					$mdgriffith$elm_ui$Internal$Model$Unkeyed(
						_List_fromArray(
							[
								A4(
								$mdgriffith$elm_ui$Internal$Model$element,
								$mdgriffith$elm_ui$Internal$Model$asRow,
								$mdgriffith$elm_ui$Internal$Model$div,
								A2(
									$elm$core$List$cons,
									$mdgriffith$elm_ui$Internal$Model$htmlClass($mdgriffith$elm_ui$Internal$Style$classes.contentLeft + (' ' + ($mdgriffith$elm_ui$Internal$Style$classes.contentCenterY + (' ' + $mdgriffith$elm_ui$Internal$Style$classes.wrapped)))),
									A2(
										$elm$core$List$cons,
										$mdgriffith$elm_ui$Internal$Model$Attr(
											A2(
												$elm$html$Html$Attributes$style,
												'margin',
												$elm$core$String$fromFloat(halfY) + ('px' + (' ' + ($elm$core$String$fromFloat(halfX) + 'px'))))),
										A2(
											$elm$core$List$cons,
											$mdgriffith$elm_ui$Internal$Model$Attr(
												A2(
													$elm$html$Html$Attributes$style,
													'width',
													'calc(100% + ' + ($elm$core$String$fromInt(x) + 'px)'))),
											A2(
												$elm$core$List$cons,
												$mdgriffith$elm_ui$Internal$Model$Attr(
													A2(
														$elm$html$Html$Attributes$style,
														'height',
														'calc(100% + ' + ($elm$core$String$fromInt(y) + 'px)'))),
												A2(
													$elm$core$List$cons,
													A2(
														$mdgriffith$elm_ui$Internal$Model$StyleClass,
														$mdgriffith$elm_ui$Internal$Flag$spacing,
														A3($mdgriffith$elm_ui$Internal$Model$SpacingStyle, spaceName, x, y)),
													_List_Nil))))),
								$mdgriffith$elm_ui$Internal$Model$Unkeyed(children))
							])));
			}
		}
	});
var $author$project$Main$pageConferences = function (model) {
	var memoryFloatingTokyoCity = $author$project$Playground$getMemory(model.floatingTokyoCity);
	var fontColorString = $author$project$Main$fontColor(memoryFloatingTokyoCity.timeOfDay).b;
	var confs = _List_fromArray(
		[
			{
			city: 'St. Louis',
			country: 'Missouri, US',
			editions: _List_fromArray(
				[
					{date: 'Sept. 15', videos: 'https://www.youtube.com/playlist?list=PLglJM3BYAMPH2zuz1nbKHQyeawE4SN0Cd', website: 'https://2016.elm-conf.us/', year: 2016},
					{date: 'Sept. 28', videos: 'https://www.youtube.com/playlist?list=PLglJM3BYAMPFTT61A0Axo_8n0s9n9CixA', website: 'https://2017.elm-conf.us/', year: 2017},
					{date: 'Sept. 26', videos: 'https://www.youtube.com/playlist?list=PLglJM3BYAMPHuB7zrYkH2Kin2vQOkr2xW', website: 'https://2018.elm-conf.us/', year: 2018},
					{date: 'Sept. 12', videos: 'https://www.youtube.com/playlist?list=PLglJM3BYAMPGsAM4QTka7FwJ0xLPS0mkN', website: 'https://2019.elm-conf.com/', year: 2019}
				]),
			logo: '/elm-japan/conference-logos/elm-conf.png',
			name: 'Elm Conf',
			twitter: 'elmconf',
			website: 'https://2019.elm-conf.com/'
		},
			{
			city: 'Paris',
			country: 'France',
			editions: _List_fromArray(
				[
					{date: 'June 8-9', videos: 'https://www.youtube.com/playlist?list=PL-cYi7I913S8cGyZWdN6YVZ028iS9BfpM', website: 'https://2017.elmeurope.org/', year: 2017},
					{date: 'July 5-6', videos: 'https://www.youtube.com/playlist?list=PL-cYi7I913S-VgTSUKWhrUkReM_vMNQxG', website: 'https://2018.elmeurope.org/', year: 2018},
					{date: 'June 27-28', videos: 'https://www.youtube.com/playlist?list=PL-cYi7I913S_oRLJEpsVbSTq_OOMSXlPD', website: 'https://2019.elmeurope.org/', year: 2019}
				]),
			logo: '/elm-japan/conference-logos/elm-europe.jpg',
			name: 'Elm Europe',
			twitter: 'elm_europe',
			website: 'https://2019.elmeurope.org/'
		},
			{
			city: 'Oslo',
			country: 'Norway',
			editions: _List_fromArray(
				[
					{date: 'June 10', videos: 'https://www.youtube.com/playlist?list=PLcAzxXzXQlPZsNcYycHittqeF3UG4dGli', website: 'https://2017.osloelmday.no/', year: 2017},
					{date: 'February 16', videos: 'https://www.youtube.com/playlist?list=PLcAzxXzXQlPbalOfueVbHCRSo26ksIXiF', website: 'https://2019.osloelmday.no/', year: 2019}
				]),
			logo: '/elm-japan/conference-logos/oslo-elm-day.jpg',
			name: 'Oslo Elm Day',
			twitter: 'osloelmday',
			website: 'https://osloelmday.no/'
		},
			{
			city: 'Chicago',
			country: 'Illinois, US',
			editions: _List_fromArray(
				[
					{date: 'April 26', videos: 'https://www.youtube.com/channel/UC_wKoNegfKbmVIPg7YYKLWQ/videos', website: 'https://2019.elminthespring.org/', year: 2019},
					{date: 'May 1', videos: '', website: 'https://elminthespring.org/', year: 2020}
				]),
			logo: '/elm-japan/conference-logos/elm-in-the-spring.jpg',
			name: 'Elm in the Spring',
			twitter: 'ElmInTheSpring',
			website: 'https://elminthespring.org/'
		},
			{
			city: 'Tokyo',
			country: 'Japan',
			editions: _List_fromArray(
				[
					{date: 'April 4', videos: '', website: 'https://elmjapan.org/', year: 2020}
				]),
			logo: '/elm-japan/conference-logos/elm-japan.png',
			name: 'Elm Japan',
			twitter: 'ElmJapanConf',
			website: 'https://elmjapan.org/'
		}
		]);
	return A2(
		$mdgriffith$elm_ui$Element$column,
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$padding(40),
				$mdgriffith$elm_ui$Element$spacing(50),
				$mdgriffith$elm_ui$Element$centerX
			]),
		_List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Element$el,
				_Utils_ap(
					$author$project$Main$pageTitleAttrs,
					_List_fromArray(
						[$mdgriffith$elm_ui$Element$centerX])),
				$mdgriffith$elm_ui$Element$text('Elm Conferences')),
				A2(
				$mdgriffith$elm_ui$Element$wrappedRow,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$centerX,
						$mdgriffith$elm_ui$Element$Font$center,
						$mdgriffith$elm_ui$Element$spacing(20)
					]),
				A2(
					$elm$core$List$map,
					function (conf) {
						return A2(
							$mdgriffith$elm_ui$Element$column,
							_List_fromArray(
								[
									$mdgriffith$elm_ui$Element$spacing(40),
									$mdgriffith$elm_ui$Element$alignTop,
									$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
									$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill),
									$mdgriffith$elm_ui$Element$width(
									A2($mdgriffith$elm_ui$Element$minimum, 200, $mdgriffith$elm_ui$Element$fill)),
									$mdgriffith$elm_ui$Element$Background$color(
									A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 0.2)),
									$mdgriffith$elm_ui$Element$Border$rounded(20),
									$mdgriffith$elm_ui$Element$padding(20)
								]),
							_List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Element$column,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$spacing(10),
											$mdgriffith$elm_ui$Element$centerX
										]),
									_List_fromArray(
										[
											A2(
											$mdgriffith$elm_ui$Element$el,
											_List_fromArray(
												[
													$mdgriffith$elm_ui$Element$centerX,
													$mdgriffith$elm_ui$Element$Font$size(35)
												]),
											$mdgriffith$elm_ui$Element$text(conf.city)),
											A2(
											$mdgriffith$elm_ui$Element$el,
											_List_fromArray(
												[
													$mdgriffith$elm_ui$Element$centerX,
													$mdgriffith$elm_ui$Element$Font$size(20)
												]),
											$mdgriffith$elm_ui$Element$text(conf.country)),
											A2(
											$mdgriffith$elm_ui$Element$el,
											_List_fromArray(
												[
													$mdgriffith$elm_ui$Element$centerX,
													$mdgriffith$elm_ui$Element$Font$size(20)
												]),
											$mdgriffith$elm_ui$Element$text(conf.name)),
											A2(
											$mdgriffith$elm_ui$Element$newTabLink,
											_List_fromArray(
												[$mdgriffith$elm_ui$Element$centerX]),
											{
												label: A3($author$project$Main$icon, $author$project$Main$Icon_TwitterOutlined, fontColorString, 20),
												url: 'https://twitter.com/' + conf.twitter
											})
										])),
									A2(
									$mdgriffith$elm_ui$Element$newTabLink,
									_List_fromArray(
										[$mdgriffith$elm_ui$Element$centerX]),
									{
										label: A2(
											$mdgriffith$elm_ui$Element$image,
											_List_fromArray(
												[
													$mdgriffith$elm_ui$Element$clip,
													$mdgriffith$elm_ui$Element$Border$rounded(100),
													$mdgriffith$elm_ui$Element$width(
													$mdgriffith$elm_ui$Element$px(150))
												]),
											{description: conf.name, src: conf.logo}),
										url: conf.website
									}),
									A2(
									$mdgriffith$elm_ui$Element$column,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$spacing(10),
											$mdgriffith$elm_ui$Element$centerX,
											$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill)
										]),
									A2(
										$elm$core$List$map,
										function (edition) {
											return A2(
												$mdgriffith$elm_ui$Element$row,
												_List_fromArray(
													[
														$mdgriffith$elm_ui$Element$spacing(10)
													]),
												_List_fromArray(
													[
														$elm$core$String$isEmpty(edition.videos) ? A2(
														$mdgriffith$elm_ui$Element$el,
														_List_fromArray(
															[
																$mdgriffith$elm_ui$Element$alpha(0.2)
															]),
														A3($author$project$Main$icon, $author$project$Main$Icon_VideosOutline, fontColorString, 24)) : A2(
														$mdgriffith$elm_ui$Element$newTabLink,
														_List_Nil,
														{
															label: A3($author$project$Main$icon, $author$project$Main$Icon_VideosOutline, fontColorString, 24),
															url: edition.videos
														}),
														A2(
														$mdgriffith$elm_ui$Element$newTabLink,
														$author$project$Main$linkAttrs,
														{
															label: $mdgriffith$elm_ui$Element$text(
																edition.date + (', ' + $elm$core$String$fromInt(edition.year))),
															url: edition.website
														})
													]));
										},
										conf.editions))
								]));
					},
					confs))
			]));
};
var $author$project$Playground$Hex = function (a) {
	return {$: 'Hex', a: a};
};
var $author$project$Playground$blue = $author$project$Playground$Hex('#3465a4');
var $author$project$Playground$Rgb = F3(
	function (a, b, c) {
		return {$: 'Rgb', a: a, b: b, c: c};
	});
var $author$project$Playground$colorClamp = function (number) {
	return A3(
		$elm$core$Basics$clamp,
		0,
		255,
		$elm$core$Basics$round(number));
};
var $author$project$Playground$rgb = F3(
	function (r, g, b) {
		return A3(
			$author$project$Playground$Rgb,
			$author$project$Playground$colorClamp(r),
			$author$project$Playground$colorClamp(g),
			$author$project$Playground$colorClamp(b));
	});
var $author$project$FloatingTokyoCity$colors = {
	nightDark: A3($author$project$Playground$rgb, 30, 30, 40),
	nightLight: A3($author$project$Playground$rgb, 60, 60, 70)
};
var $author$project$Playground$darkBrown = $author$project$Playground$Hex('#8f5902');
var $author$project$Playground$darkGreen = $author$project$Playground$Hex('#4e9a06');
var $author$project$Playground$darkRed = $author$project$Playground$Hex('#a40000');
var $author$project$Playground$darkYellow = $author$project$Playground$Hex('#c4a000');
var $author$project$Playground$gray = $author$project$Playground$Hex('#d3d7cf');
var $author$project$Playground$lightBlue = $author$project$Playground$Hex('#729fcf');
var $author$project$Playground$lightBrown = $author$project$Playground$Hex('#e9b96e');
var $author$project$Playground$lightGray = $author$project$Playground$Hex('#eeeeec');
var $author$project$Playground$lightOrange = $author$project$Playground$Hex('#fcaf3e');
var $author$project$Playground$lightPurple = $author$project$Playground$Hex('#ad7fa8');
var $author$project$Playground$purple = $author$project$Playground$Hex('#75507b');
var $author$project$Playground$red = $author$project$Playground$Hex('#cc0000');
var $author$project$Playground$yellow = $author$project$Playground$Hex('#edd400');
var $author$project$FloatingTokyoCity$palette = function (timeOfDay) {
	switch (timeOfDay.$) {
		case 'Sunrise':
			return {
				backgroundRgb: _Utils_Tuple3(100, 100, 120),
				base: {
					a: A3($author$project$Playground$rgb, 200, 200, 220),
					b: A3($author$project$Playground$rgb, 60, 60, 80)
				},
				buildingBlue: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 100, 100, 120)
				},
				buildingBrown: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 100, 100, 120)
				},
				buildingDistant: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 100, 100, 120)
				},
				buildingDistantLight: {
					a: A3($author$project$Playground$rgb, 240, 240, 260),
					b: A3($author$project$Playground$rgb, 140, 140, 160)
				},
				buildingMetropolitan: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 100, 100, 120)
				},
				buildingNTT: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 100, 100, 120)
				},
				buildingPurpleOrange: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 100, 100, 120)
				},
				buildingYellow: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 100, 100, 120)
				},
				buildingYellowGreen: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 100, 100, 120)
				},
				elm: $author$project$Playground$lightGray,
				fuji: {
					a: A3($author$project$Playground$rgb, 220, 220, 240),
					b: A3($author$project$Playground$rgb, 80, 80, 100)
				},
				fujiSnow: {
					a: A3($author$project$Playground$rgb, 240, 240, 260),
					b: A3($author$project$Playground$rgb, 140, 140, 160)
				}
			};
		case 'Day':
			return {
				backgroundRgb: _Utils_Tuple3(40, 190, 210),
				base: {
					a: $author$project$Playground$gray,
					b: A3($author$project$Playground$rgb, 20, 170, 190)
				},
				buildingBlue: {a: $author$project$Playground$lightBlue, b: $author$project$Playground$blue},
				buildingBrown: {a: $author$project$Playground$lightBrown, b: $author$project$Playground$darkBrown},
				buildingDistant: {
					a: A3($author$project$Playground$rgb, 60, 210, 230),
					b: A3($author$project$Playground$rgb, 20, 170, 190)
				},
				buildingDistantLight: {a: $author$project$Playground$lightGray, b: $author$project$Playground$gray},
				buildingMetropolitan: {a: $author$project$Playground$gray, b: $author$project$Playground$lightBlue},
				buildingNTT: {a: $author$project$Playground$lightPurple, b: $author$project$Playground$purple},
				buildingPurpleOrange: {a: $author$project$Playground$lightOrange, b: $author$project$Playground$purple},
				buildingYellow: {a: $author$project$Playground$yellow, b: $author$project$Playground$darkYellow},
				buildingYellowGreen: {a: $author$project$Playground$yellow, b: $author$project$Playground$darkGreen},
				elm: $author$project$Playground$blue,
				fuji: {
					a: A3($author$project$Playground$rgb, 10, 160, 180),
					b: A3($author$project$Playground$rgb, 10, 160, 180)
				},
				fujiSnow: {
					a: A3($author$project$Playground$rgb, 255, 255, 255),
					b: A3($author$project$Playground$rgb, 220, 220, 220)
				}
			};
		case 'Sunset':
			return {
				backgroundRgb: _Utils_Tuple3(200, 150, 100),
				base: {
					a: A3($author$project$Playground$rgb, 170, 120, 70),
					b: A3($author$project$Playground$rgb, 230, 180, 130)
				},
				buildingBlue: {a: $author$project$Playground$darkBrown, b: $author$project$Playground$lightBrown},
				buildingBrown: {a: $author$project$Playground$darkBrown, b: $author$project$Playground$lightBrown},
				buildingDistant: {a: $author$project$Playground$darkBrown, b: $author$project$Playground$lightBrown},
				buildingDistantLight: {a: $author$project$Playground$lightGray, b: $author$project$Playground$gray},
				buildingMetropolitan: {a: $author$project$Playground$darkBrown, b: $author$project$Playground$lightBrown},
				buildingNTT: {a: $author$project$Playground$darkBrown, b: $author$project$Playground$lightBrown},
				buildingPurpleOrange: {a: $author$project$Playground$darkBrown, b: $author$project$Playground$lightBrown},
				buildingYellow: {a: $author$project$Playground$darkBrown, b: $author$project$Playground$lightBrown},
				buildingYellowGreen: {a: $author$project$Playground$darkBrown, b: $author$project$Playground$lightBrown},
				elm: $author$project$Playground$lightGray,
				fuji: {a: $author$project$Playground$red, b: $author$project$Playground$darkRed},
				fujiSnow: {
					a: A3($author$project$Playground$rgb, 255, 255, 255),
					b: A3($author$project$Playground$rgb, 220, 220, 220)
				}
			};
		default:
			return {
				backgroundRgb: _Utils_Tuple3(20, 20, 20),
				base: {
					a: A3($author$project$Playground$rgb, 35, 35, 45),
					b: A3($author$project$Playground$rgb, 30, 30, 30)
				},
				buildingBlue: {a: $author$project$FloatingTokyoCity$colors.nightLight, b: $author$project$FloatingTokyoCity$colors.nightDark},
				buildingBrown: {a: $author$project$FloatingTokyoCity$colors.nightLight, b: $author$project$FloatingTokyoCity$colors.nightDark},
				buildingDistant: {a: $author$project$FloatingTokyoCity$colors.nightLight, b: $author$project$FloatingTokyoCity$colors.nightDark},
				buildingDistantLight: {a: $author$project$Playground$lightGray, b: $author$project$Playground$gray},
				buildingMetropolitan: {a: $author$project$FloatingTokyoCity$colors.nightLight, b: $author$project$FloatingTokyoCity$colors.nightDark},
				buildingNTT: {a: $author$project$FloatingTokyoCity$colors.nightLight, b: $author$project$FloatingTokyoCity$colors.nightDark},
				buildingPurpleOrange: {a: $author$project$FloatingTokyoCity$colors.nightLight, b: $author$project$FloatingTokyoCity$colors.nightDark},
				buildingYellow: {a: $author$project$FloatingTokyoCity$colors.nightLight, b: $author$project$FloatingTokyoCity$colors.nightDark},
				buildingYellowGreen: {a: $author$project$FloatingTokyoCity$colors.nightLight, b: $author$project$FloatingTokyoCity$colors.nightDark},
				elm: $author$project$Playground$lightGray,
				fuji: {
					a: A3($author$project$Playground$rgb, 60, 60, 80),
					b: A3($author$project$Playground$rgb, 40, 40, 60)
				},
				fujiSnow: {
					a: A3($author$project$Playground$rgb, 100, 100, 120),
					b: A3($author$project$Playground$rgb, 80, 80, 100)
				}
			};
	}
};
var $mdgriffith$elm_ui$Element$rgb255 = F3(
	function (red, green, blue) {
		return A4($mdgriffith$elm_ui$Internal$Model$Rgba, red / 255, green / 255, blue / 255, 1);
	});
var $mdgriffith$elm_ui$Internal$Model$Rotate = F2(
	function (a, b) {
		return {$: 'Rotate', a: a, b: b};
	});
var $mdgriffith$elm_ui$Internal$Flag$rotate = $mdgriffith$elm_ui$Internal$Flag$flag(24);
var $mdgriffith$elm_ui$Element$rotate = function (angle) {
	return A2(
		$mdgriffith$elm_ui$Internal$Model$TransformComponent,
		$mdgriffith$elm_ui$Internal$Flag$rotate,
		A2(
			$mdgriffith$elm_ui$Internal$Model$Rotate,
			_Utils_Tuple3(0, 0, 1),
			angle));
};
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $author$project$Main$section = function (sectionName) {
	return A2(
		$mdgriffith$elm_ui$Element$el,
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$paddingEach(
				{bottom: 0, left: 0, right: 0, top: 100}),
				$mdgriffith$elm_ui$Element$htmlAttribute(
				$elm$html$Html$Attributes$id(sectionName)),
				$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill)
			]),
		$mdgriffith$elm_ui$Element$none);
};
var $author$project$Main$Icon_Logo = {$: 'Icon_Logo'};
var $author$project$Main$logoButton = function (x) {
	return A2(
		$mdgriffith$elm_ui$Element$Input$button,
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill)
			]),
		{
			label: A2(
				$mdgriffith$elm_ui$Element$row,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$spacing(16)
					]),
				_Utils_ap(
					_List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Element$el,
							_List_Nil,
							A3($author$project$Main$icon, $author$project$Main$Icon_Logo, '', 50))
						]),
					(x < 420) ? _List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Element$column,
							_List_fromArray(
								[
									$mdgriffith$elm_ui$Element$spacing(5),
									$mdgriffith$elm_ui$Element$Font$size(14)
								]),
							_List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Element$el,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$Font$color(
											A3($mdgriffith$elm_ui$Element$rgb, 0.5, 0.5, 0.5))
										]),
									$mdgriffith$elm_ui$Element$text('elm')),
									A2(
									$mdgriffith$elm_ui$Element$el,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$moveUp(1)
										]),
									$mdgriffith$elm_ui$Element$text('japan')),
									A2(
									$mdgriffith$elm_ui$Element$el,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$Font$color(
											A3($mdgriffith$elm_ui$Element$rgb, 0.5, 0.5, 0.5))
										]),
									$mdgriffith$elm_ui$Element$text('2020'))
								]))
						]) : _List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Element$row,
							_List_fromArray(
								[
									$mdgriffith$elm_ui$Element$spacing(10),
									$mdgriffith$elm_ui$Element$Font$size(24)
								]),
							_List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Element$el,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$Font$color(
											A3($mdgriffith$elm_ui$Element$rgb, 0.5, 0.5, 0.5))
										]),
									$mdgriffith$elm_ui$Element$text('elm')),
									A2(
									$mdgriffith$elm_ui$Element$el,
									_List_Nil,
									$mdgriffith$elm_ui$Element$text('japan')),
									A2(
									$mdgriffith$elm_ui$Element$el,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$Font$color(
											A3($mdgriffith$elm_ui$Element$rgb, 0.5, 0.5, 0.5))
										]),
									$mdgriffith$elm_ui$Element$text('2020'))
								]))
						]))),
			onPress: $elm$core$Maybe$Just(
				$author$project$Main$ScrollTo('#top'))
		});
};
var $author$project$Main$ChangeLanguage = function (a) {
	return {$: 'ChangeLanguage', a: a};
};
var $author$project$Main$ToggleMenu = {$: 'ToggleMenu'};
var $mdgriffith$elm_ui$Element$Font$bold = A2($mdgriffith$elm_ui$Internal$Model$Class, $mdgriffith$elm_ui$Internal$Flag$fontWeight, $mdgriffith$elm_ui$Internal$Style$classes.bold);
var $author$project$Main$doubleLanguageView = function (x) {
	return x > 800;
};
var $author$project$Main$languageToString = function (language) {
	if (language.$ === 'Ja') {
		return 'JA';
	} else {
		return 'EN';
	}
};
var $author$project$Main$menuIcon = F2(
	function (x, language) {
		return A2(
			$mdgriffith$elm_ui$Element$row,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$spacing(15)
				]),
			_Utils_ap(
				$author$project$Main$doubleLanguageView(x) ? _List_Nil : _List_fromArray(
					[
						_Utils_eq(language, $author$project$Main$En) ? $mdgriffith$elm_ui$Element$text(
						$author$project$Main$languageToString($author$project$Main$En)) : A2(
						$mdgriffith$elm_ui$Element$Input$button,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$Font$bold,
								$mdgriffith$elm_ui$Element$Border$widthEach(
								{bottom: 1, left: 0, right: 0, top: 0})
							]),
						{
							label: $mdgriffith$elm_ui$Element$text(
								$author$project$Main$languageToString($author$project$Main$En)),
							onPress: $elm$core$Maybe$Just(
								$author$project$Main$ChangeLanguage($author$project$Main$En))
						}),
						_Utils_eq(language, $author$project$Main$Ja) ? $mdgriffith$elm_ui$Element$text(
						$author$project$Main$languageToString($author$project$Main$Ja)) : A2(
						$mdgriffith$elm_ui$Element$Input$button,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$Font$bold,
								$mdgriffith$elm_ui$Element$Border$widthEach(
								{bottom: 1, left: 0, right: 0, top: 0})
							]),
						{
							label: $mdgriffith$elm_ui$Element$text(
								$author$project$Main$languageToString($author$project$Main$Ja)),
							onPress: $elm$core$Maybe$Just(
								$author$project$Main$ChangeLanguage($author$project$Main$Ja))
						})
					]),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Element$Input$button,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$moveUp(2),
								$mdgriffith$elm_ui$Element$Font$size(40),
								$mdgriffith$elm_ui$Element$paddingEach(
								{bottom: 0, left: 10, right: 0, top: 0})
							]),
						{
							label: $mdgriffith$elm_ui$Element$text('☰'),
							onPress: $elm$core$Maybe$Just($author$project$Main$ToggleMenu)
						})
					])));
	});
var $author$project$Main$mouseOverAttrsDark = _List_fromArray(
	[
		$mdgriffith$elm_ui$Element$mouseOver(
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$Background$color(
				A4($mdgriffith$elm_ui$Element$rgba, 0, 0, 0, 0.1)),
				$mdgriffith$elm_ui$Element$Border$color(
				A4($mdgriffith$elm_ui$Element$rgba, 0, 0, 0, 0))
			])),
		$mdgriffith$elm_ui$Element$htmlAttribute(
		A2($elm$html$Html$Attributes$style, 'transition', 'all 0.2s'))
	]);
var $mdgriffith$elm_ui$Element$scrollbarY = A2($mdgriffith$elm_ui$Internal$Model$Class, $mdgriffith$elm_ui$Internal$Flag$overflow, $mdgriffith$elm_ui$Internal$Style$classes.scrollbarsY);
var $author$project$Main$sideMenu = function (model) {
	return A2(
		$mdgriffith$elm_ui$Element$el,
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$Background$color(
				A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 1)),
				$mdgriffith$elm_ui$Element$Font$color(
				A3($mdgriffith$elm_ui$Element$rgb, 0.1, 0.1, 0.1)),
				$mdgriffith$elm_ui$Element$width(
				$mdgriffith$elm_ui$Element$px($author$project$Main$sideMenuWidth)),
				$mdgriffith$elm_ui$Element$alignRight,
				$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill),
				$mdgriffith$elm_ui$Element$paddingEach(
				{bottom: 60, left: 0, right: 0, top: 20}),
				$mdgriffith$elm_ui$Element$htmlAttribute(
				A2($elm$html$Html$Attributes$style, 'transition', 'all 0.2s')),
				$mdgriffith$elm_ui$Element$scrollbarY,
				$mdgriffith$elm_ui$Element$moveRight(
				model.menuOpen ? 0 : $author$project$Main$sideMenuWidth)
			]),
		function () {
			var attrs = _Utils_ap(
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$Font$letterSpacing(2),
						$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
						$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill),
						$mdgriffith$elm_ui$Element$Font$size(14),
						A2($mdgriffith$elm_ui$Element$paddingXY, 40, 15)
					]),
				$author$project$Main$mouseOverAttrsDark);
			return A2(
				$mdgriffith$elm_ui$Element$column,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$spacing(30),
						$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill)
					]),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Element$el,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$alignRight,
								$mdgriffith$elm_ui$Element$moveLeft(20)
							]),
						A2($author$project$Main$menuIcon, model.width, model.language)),
						A2(
						$mdgriffith$elm_ui$Element$el,
						_Utils_ap(
							_List_fromArray(
								[
									A2($mdgriffith$elm_ui$Element$paddingXY, 40, 15),
									$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill)
								]),
							$author$project$Main$mouseOverAttrsDark),
						$author$project$Main$logoButton(1000)),
						A2(
						$mdgriffith$elm_ui$Element$column,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill)
							]),
						A3($author$project$Main$menuList, true, 'black', attrs)),
						A2(
						$mdgriffith$elm_ui$Element$column,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill)
							]),
						A3($author$project$Main$menuContacts, true, 'black', attrs)),
						A2(
						$mdgriffith$elm_ui$Element$column,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill)
							]),
						A3($author$project$Main$menuModes, true, 'black', attrs))
					]));
		}());
};
var $author$project$Main$smallMenu = function (x) {
	return x < 1000;
};
var $mdgriffith$elm_ui$Element$Font$alignLeft = A2($mdgriffith$elm_ui$Internal$Model$Class, $mdgriffith$elm_ui$Internal$Flag$fontAlignment, $mdgriffith$elm_ui$Internal$Style$classes.textLeft);
var $mdgriffith$elm_ui$Element$Font$alignRight = A2($mdgriffith$elm_ui$Internal$Model$Class, $mdgriffith$elm_ui$Internal$Flag$fontAlignment, $mdgriffith$elm_ui$Internal$Style$classes.textRight);
var $author$project$Main$Icon_Github = {$: 'Icon_Github'};
var $author$project$Main$Icon_Twitter = {$: 'Icon_Twitter'};
var $author$project$Main$githubAndTwitter = F3(
	function (fontColor_, github, twitter) {
		return _List_fromArray(
			[
				A2(
				$mdgriffith$elm_ui$Element$newTabLink,
				_List_Nil,
				{
					label: A3($author$project$Main$icon, $author$project$Main$Icon_Github, fontColor_, 26),
					url: 'https://github.com/' + github
				}),
				A2(
				$mdgriffith$elm_ui$Element$newTabLink,
				_List_Nil,
				{
					label: A3($author$project$Main$icon, $author$project$Main$Icon_Twitter, fontColor_, 26),
					url: 'https://twitter.com/' + twitter
				})
			]);
	});
var $author$project$Main$leftColumnAttrs = _List_Nil;
var $author$project$Main$mainMargin = function (width) {
	return (width > 1000) ? 80 : ((width > 600) ? 40 : 20);
};
var $author$project$Main$rightColumnAttrs = _List_Nil;
var $author$project$Main$doubleSection = F3(
	function (fontColor_, maybeLanguage, data) {
		var imageWithBorder = function (img) {
			return A2(
				$mdgriffith$elm_ui$Element$column,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$Border$width(5),
						$mdgriffith$elm_ui$Element$Border$rounded(20),
						$mdgriffith$elm_ui$Element$Background$color(
						A4($mdgriffith$elm_ui$Element$rgba, 0.5, 0.5, 0.5, 0.5)),
						$mdgriffith$elm_ui$Element$Border$color(
						A4($mdgriffith$elm_ui$Element$rgba, 0.5, 0.5, 0.5, 0.3)),
						$mdgriffith$elm_ui$Element$centerX
					]),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Element$image,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$centerX,
								$mdgriffith$elm_ui$Element$width(
								$mdgriffith$elm_ui$Element$px(img.imageWidth)),
								$mdgriffith$elm_ui$Element$height(
								$mdgriffith$elm_ui$Element$px(img.imageHeight)),
								$mdgriffith$elm_ui$Element$Border$rounded(14),
								$mdgriffith$elm_ui$Element$clip
							]),
						{description: img.imageDescription, src: img.imageSrc}),
						function () {
						var _v5 = data.githubAndTwitter;
						if (_v5.$ === 'Just') {
							var _v6 = _v5.a;
							var github = _v6.a;
							var twitter = _v6.b;
							return A2(
								$mdgriffith$elm_ui$Element$row,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$padding(10),
										$mdgriffith$elm_ui$Element$alignRight,
										$mdgriffith$elm_ui$Element$spacing(15)
									]),
								A3($author$project$Main$githubAndTwitter, fontColor_.b, github, twitter));
						} else {
							return $mdgriffith$elm_ui$Element$none;
						}
					}()
					]));
		};
		var maybeImageWithBorder = function (image) {
			if (image.$ === 'Nothing') {
				return $mdgriffith$elm_ui$Element$none;
			} else {
				var img = image.a;
				return imageWithBorder(img);
			}
		};
		if (maybeLanguage.$ === 'Just') {
			var language = maybeLanguage.a;
			if (language.$ === 'En') {
				return A2(
					$mdgriffith$elm_ui$Element$column,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
							$mdgriffith$elm_ui$Element$spacing(20),
							$mdgriffith$elm_ui$Element$padding(20)
						]),
					_Utils_ap(
						data.enContent,
						_List_fromArray(
							[
								maybeImageWithBorder(data.image)
							])));
			} else {
				return A2(
					$mdgriffith$elm_ui$Element$column,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
							$mdgriffith$elm_ui$Element$spacing(20),
							$mdgriffith$elm_ui$Element$padding(20)
						]),
					_Utils_ap(
						data.jaContent,
						_List_fromArray(
							[
								maybeImageWithBorder(data.image)
							])));
			}
		} else {
			var paddingAroundImage = 40;
			var mainMargin_ = $author$project$Main$mainMargin(data.width);
			var imageAreaKeeper = function () {
				var _v3 = data.image;
				if (_v3.$ === 'Nothing') {
					return _List_Nil;
				} else {
					var img = _v3.a;
					return _List_fromArray(
						[
							A2(
							$mdgriffith$elm_ui$Element$el,
							_List_fromArray(
								[
									$mdgriffith$elm_ui$Element$width(
									$mdgriffith$elm_ui$Element$px((((img.imageWidth / 2) | 0) + paddingAroundImage) - mainMargin_)),
									$mdgriffith$elm_ui$Element$height(
									$mdgriffith$elm_ui$Element$px((img.imageHeight + paddingAroundImage) + 30))
								]),
							$mdgriffith$elm_ui$Element$none)
						]);
				}
			}();
			var attrs = _List_fromArray(
				[
					$mdgriffith$elm_ui$Element$paddingEach(
					{bottom: 0, left: mainMargin_, right: mainMargin_, top: 0}),
					$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
					$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill),
					$mdgriffith$elm_ui$Element$alignTop
				]);
			return A2(
				$mdgriffith$elm_ui$Element$row,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
						$mdgriffith$elm_ui$Element$inFront(
						function () {
							var _v2 = data.image;
							if (_v2.$ === 'Nothing') {
								return $mdgriffith$elm_ui$Element$none;
							} else {
								var img = _v2.a;
								return imageWithBorder(img);
							}
						}())
					]),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Element$row,
						_Utils_ap(attrs, $author$project$Main$leftColumnAttrs),
						_Utils_ap(
							_List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Element$column,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
											$mdgriffith$elm_ui$Element$alignTop,
											$mdgriffith$elm_ui$Element$spacing(20),
											$mdgriffith$elm_ui$Element$Font$alignRight
										]),
									data.enContent)
								]),
							imageAreaKeeper)),
						A2(
						$mdgriffith$elm_ui$Element$row,
						_Utils_ap(attrs, $author$project$Main$rightColumnAttrs),
						_Utils_ap(
							imageAreaKeeper,
							_List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Element$column,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
											$mdgriffith$elm_ui$Element$alignTop,
											$mdgriffith$elm_ui$Element$spacing(20),
											$mdgriffith$elm_ui$Element$Font$alignLeft
										]),
									data.jaContent)
								])))
					]));
		}
	});
var $author$project$Main$followUsOnTwitter = 'follow ' + ($author$project$Main$handleTwitter + ' on Twitter');
var $author$project$Main$marginAboveTitles = 0;
var $author$project$Main$paragraphAttrs = _List_fromArray(
	[
		$mdgriffith$elm_ui$Element$spacing(12)
	]);
var $author$project$Main$title = F5(
	function (maybeLanguage, x, marginTop, en, ja) {
		var paddingBottom = 0;
		var mainMargin_ = $author$project$Main$mainMargin(x);
		if (maybeLanguage.$ === 'Just') {
			var language = maybeLanguage.a;
			return A2(
				$mdgriffith$elm_ui$Element$paragraph,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
						$mdgriffith$elm_ui$Element$Font$letterSpacing(4),
						$mdgriffith$elm_ui$Element$paddingEach(
						{bottom: paddingBottom, left: mainMargin_, right: mainMargin_, top: marginTop}),
						$mdgriffith$elm_ui$Element$alignTop,
						$mdgriffith$elm_ui$Element$Font$center,
						$mdgriffith$elm_ui$Element$Font$size(24)
					]),
				function () {
					if (language.$ === 'Ja') {
						return _List_fromArray(
							[
								$mdgriffith$elm_ui$Element$text(
								$elm$core$String$toUpper(ja))
							]);
					} else {
						return _List_fromArray(
							[
								$mdgriffith$elm_ui$Element$text(
								$elm$core$String$toUpper(en))
							]);
					}
				}());
		} else {
			return A2(
				$mdgriffith$elm_ui$Element$row,
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
						$mdgriffith$elm_ui$Element$Font$size(24)
					]),
				_List_fromArray(
					[
						A2(
						$mdgriffith$elm_ui$Element$paragraph,
						_Utils_ap(
							_List_fromArray(
								[
									$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
									$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill),
									$mdgriffith$elm_ui$Element$Font$alignRight,
									$mdgriffith$elm_ui$Element$Font$letterSpacing(4),
									$mdgriffith$elm_ui$Element$paddingEach(
									{bottom: paddingBottom, left: mainMargin_, right: mainMargin_, top: marginTop}),
									$mdgriffith$elm_ui$Element$alignTop
								]),
							$author$project$Main$leftColumnAttrs),
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$text(
								$elm$core$String$toUpper(en))
							])),
						A2(
						$mdgriffith$elm_ui$Element$paragraph,
						_Utils_ap(
							_List_fromArray(
								[
									$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
									$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill),
									$mdgriffith$elm_ui$Element$Font$alignLeft,
									$mdgriffith$elm_ui$Element$paddingEach(
									{bottom: 40, left: mainMargin_, right: mainMargin_, top: marginTop}),
									$mdgriffith$elm_ui$Element$alignTop
								]),
							$author$project$Main$rightColumnAttrs),
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$text(ja)
							]))
					]));
		}
	});
var $author$project$Main$titleSubSection = function (content) {
	return A2(
		$mdgriffith$elm_ui$Element$paragraph,
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$Font$size(22),
				$mdgriffith$elm_ui$Element$Font$bold
			]),
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$text(content)
			]));
};
var $author$project$Main$topBody = F2(
	function (model, timeOfDay) {
		var maybeLanguage = A2($author$project$Main$largeScreen, model.width, model.menuOpen) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(model.language);
		return A2(
			$mdgriffith$elm_ui$Element$column,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$width(
					A2($mdgriffith$elm_ui$Element$maximum, 1200, $mdgriffith$elm_ui$Element$fill)),
					$mdgriffith$elm_ui$Element$centerX,
					$mdgriffith$elm_ui$Element$paddingEach(
					{bottom: 0, left: 0, right: 0, top: 80})
				]),
			_List_fromArray(
				[
					A5($author$project$Main$title, maybeLanguage, model.width, 0, 'Saturday April 4, 2020', '2020年4月4日(土)'),
					A3(
					$author$project$Main$doubleSection,
					$author$project$Main$fontColor(timeOfDay),
					maybeLanguage,
					{
						enContent: _List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('The first Elm conference in the Asia-Pacific region!')
									])),
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('It will be a single-day conference in English and Japanese that will take place in Tokyo.')
									])),
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('If you\'re interested in Elm, functional programming, or frontend development in general and want to meet interesting people, join us!')
									]))
							]),
						githubAndTwitter: $elm$core$Maybe$Nothing,
						image: $elm$core$Maybe$Nothing,
						jaContent: _List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('アジア太平洋地域で初のElmカンファレンス！')
									])),
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('東京で一日のみ、英語及び日本語でのカンファレンスになります。')
									])),
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('Elm、関数型プログラミング、フロントエンド開発全般に興味がある方、交流を深めたい方は是非ご参加下さい。')
									]))
							]),
						width: model.width
					}),
					$author$project$Main$section('speakers'),
					A5($author$project$Main$title, maybeLanguage, model.width, $author$project$Main$marginAboveTitles, 'Speakers', 'スピーカー'),
					A2(
					$mdgriffith$elm_ui$Element$column,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$spacing(20)
						]),
					_List_fromArray(
						[
							A3(
							$author$project$Main$doubleSection,
							$author$project$Main$fontColor(timeOfDay),
							maybeLanguage,
							{
								enContent: _List_fromArray(
									[
										$author$project$Main$titleSubSection('Evan Czaplicki'),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('Evan created Elm. He is an open source engineer at NoRedInk, where the front-end code includes more than 300k lines of Elm. He works on Elm full-time, developing the compiler, language, tools, and libraries.')
											]))
									]),
								githubAndTwitter: $elm$core$Maybe$Just(
									_Utils_Tuple2('evancz', 'czaplic')),
								image: $elm$core$Maybe$Just(
									{imageDescription: 'Evan Czaplicki', imageHeight: 300, imageSrc: 'images/speakers/evan_czaplicki.jpg', imageWidth: 245}),
								jaContent: _List_fromArray(
									[
										$author$project$Main$titleSubSection('エヴァン・チャプリキ'),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('EvanはElmの作者。フルタイムのオープンソースエンジニアとして、コンパイラーや言語、ツール、ライブラリなどElmに関する仕事をしている。彼が所属するNoRedInkにはフロントエンドのコードに30万行を超えるElmコードが含まれる。')
											]))
									]),
								width: model.width
							}),
							A3(
							$author$project$Main$doubleSection,
							$author$project$Main$fontColor(timeOfDay),
							maybeLanguage,
							{
								enContent: _List_fromArray(
									[
										$author$project$Main$titleSubSection('Andrey Kuzmin'),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('Andrey is an engineer at SoundCloud. He is the maintainer of WebGL in Elm and an organizer of the Elm Berlin meetup. Apart from work, he enjoys live music in Berlin and is a yoga newbie.')
											]))
									]),
								githubAndTwitter: $elm$core$Maybe$Just(
									_Utils_Tuple2('w0rm', 'unsoundscapes')),
								image: $elm$core$Maybe$Just(
									{imageDescription: 'Andrey Kuzmin', imageHeight: 245, imageSrc: 'images/speakers/andrey_kuzmin.jpg', imageWidth: 245}),
								jaContent: _List_fromArray(
									[
										$author$project$Main$titleSubSection('アンドレイ・クズミン'),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('AndreyはSoundCloudのエンジニア。 Elm製WebGLライブラリのメンテナーであり、Elm Berlin Meetupの主催者。 仕事以外では、ベルリンでライブ音楽を楽しんでおり、ヨガの初心者。')
											]))
									]),
								width: model.width
							}),
							A3(
							$author$project$Main$doubleSection,
							$author$project$Main$fontColor(timeOfDay),
							maybeLanguage,
							{
								enContent: _List_fromArray(
									[
										$author$project$Main$titleSubSection('Matthew Griffith'),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('Matt is the author of Elm UI, Elm Markup, and Elm Style Animation packages. He currently works at Blissfully and organizes the Elm New York meetup.')
											]))
									]),
								githubAndTwitter: $elm$core$Maybe$Just(
									_Utils_Tuple2('mdgriffith', 'mech_elephant')),
								image: $elm$core$Maybe$Just(
									{imageDescription: 'Matthew Griffith', imageHeight: 245, imageSrc: 'images/speakers/matthew_griffith.jpeg', imageWidth: 245}),
								jaContent: _List_fromArray(
									[
										$author$project$Main$titleSubSection('マシュー・グリフィス'),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('MattはElm UI、Elm Markup、およびElm Style Animationパッケージの作者。 現在Blissfullyで働いており、Elm New York meetup の主催者。')
											]))
									]),
								width: model.width
							}),
							A3(
							$author$project$Main$doubleSection,
							$author$project$Main$fontColor(timeOfDay),
							maybeLanguage,
							{
								enContent: _List_fromArray(
									[
										$author$project$Main$titleSubSection('You?'),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('Would you like to speak at '),
												A2(
												$mdgriffith$elm_ui$Element$el,
												_List_fromArray(
													[$mdgriffith$elm_ui$Element$Font$extraBold]),
												$mdgriffith$elm_ui$Element$text('Elm Japan 2020')),
												$mdgriffith$elm_ui$Element$text('? We will open a call for speakers soon. '),
												A2(
												$mdgriffith$elm_ui$Element$newTabLink,
												$author$project$Main$linkAttrs,
												{
													label: $mdgriffith$elm_ui$Element$text('Subscribe to our mailing list'),
													url: $author$project$Main$linkMailingList
												}),
												$mdgriffith$elm_ui$Element$text(' or '),
												A2(
												$mdgriffith$elm_ui$Element$newTabLink,
												$author$project$Main$linkAttrs,
												{
													label: $mdgriffith$elm_ui$Element$text($author$project$Main$followUsOnTwitter),
													url: $author$project$Main$linkTwitter
												}),
												$mdgriffith$elm_ui$Element$text(' to be notified.')
											])),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('We invite speakers of all levels to submit 20-minute talk proposals and we encourage first-time speakers to apply!')
											]))
									]),
								githubAndTwitter: $elm$core$Maybe$Nothing,
								image: $elm$core$Maybe$Nothing,
								jaContent: _List_fromArray(
									[
										$author$project$Main$titleSubSection('あなたも登壇しませんか？'),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('Elm Japan 2020 に登壇しませんか？ 間もなく登壇者の募集を開始いたします。'),
												A2(
												$mdgriffith$elm_ui$Element$newTabLink,
												$author$project$Main$linkAttrs,
												{
													label: $mdgriffith$elm_ui$Element$text('メーリングリストに登録する'),
													url: $author$project$Main$linkMailingList
												}),
												$mdgriffith$elm_ui$Element$text('か、'),
												A2(
												$mdgriffith$elm_ui$Element$newTabLink,
												$author$project$Main$linkAttrs,
												{
													label: $mdgriffith$elm_ui$Element$text('Twitterアカウント @elmjapanconf をフォロー'),
													url: $author$project$Main$linkTwitter
												}),
												$mdgriffith$elm_ui$Element$text('して最新の情報をご確認ください。')
											])),
										A2(
										$mdgriffith$elm_ui$Element$paragraph,
										$author$project$Main$paragraphAttrs,
										_List_fromArray(
											[
												$mdgriffith$elm_ui$Element$text('登壇を希望される方には、20分間の発表を想定したプロポーザルをご提出いただきます。あらゆるレベルの方にご登壇いただけますので、特にこのようなカンファレンスで初登壇の方も歓迎いたします！')
											]))
									]),
								width: model.width
							})
						])),
					$author$project$Main$section('tickets'),
					A5($author$project$Main$title, maybeLanguage, model.width, $author$project$Main$marginAboveTitles, 'Tickets', 'チケット'),
					A3(
					$author$project$Main$doubleSection,
					$author$project$Main$fontColor(timeOfDay),
					maybeLanguage,
					{
						enContent: _List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('Tickets will be available soon. '),
										A2(
										$mdgriffith$elm_ui$Element$newTabLink,
										$author$project$Main$linkAttrs,
										{
											label: $mdgriffith$elm_ui$Element$text('Subscribe to our mailing list'),
											url: $author$project$Main$linkMailingList
										}),
										$mdgriffith$elm_ui$Element$text(' or '),
										A2(
										$mdgriffith$elm_ui$Element$newTabLink,
										$author$project$Main$linkAttrs,
										{
											label: $mdgriffith$elm_ui$Element$text($author$project$Main$followUsOnTwitter),
											url: $author$project$Main$linkTwitter
										}),
										$mdgriffith$elm_ui$Element$text(' to be notified when they are ready.')
									]))
							]),
						githubAndTwitter: $elm$core$Maybe$Nothing,
						image: $elm$core$Maybe$Nothing,
						jaContent: _List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('チケットの受付は間もなく開始いたします。'),
										A2(
										$mdgriffith$elm_ui$Element$newTabLink,
										$author$project$Main$linkAttrs,
										{
											label: $mdgriffith$elm_ui$Element$text('メーリングリストに登録する'),
											url: $author$project$Main$linkMailingList
										}),
										$mdgriffith$elm_ui$Element$text('か、'),
										A2(
										$mdgriffith$elm_ui$Element$newTabLink,
										$author$project$Main$linkAttrs,
										{
											label: $mdgriffith$elm_ui$Element$text('Twitterアカウント @elmjapanconf をフォロー'),
											url: $author$project$Main$linkTwitter
										}),
										$mdgriffith$elm_ui$Element$text('して最新の情報をご確認ください。')
									]))
							]),
						width: model.width
					}),
					$author$project$Main$section('sponsors'),
					A5($author$project$Main$title, maybeLanguage, model.width, $author$project$Main$marginAboveTitles, 'Sponsors', 'スポンサー'),
					A3(
					$author$project$Main$doubleSection,
					$author$project$Main$fontColor(timeOfDay),
					maybeLanguage,
					{
						enContent: _List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										A2(
										$mdgriffith$elm_ui$Element$el,
										_List_fromArray(
											[$mdgriffith$elm_ui$Element$Font$bold]),
										$mdgriffith$elm_ui$Element$text('Elm Japan 2020')),
										$mdgriffith$elm_ui$Element$text(' sponsorships are available at a variety of levels. Request the sponsorship prospectus by sending an email to '),
										A2(
										$mdgriffith$elm_ui$Element$newTabLink,
										$author$project$Main$linkAttrs,
										{
											label: $mdgriffith$elm_ui$Element$text($author$project$Main$emailSponsors),
											url: 'mailto:' + $author$project$Main$emailSponsors
										}),
										$mdgriffith$elm_ui$Element$text('.')
									]))
							]),
						githubAndTwitter: $elm$core$Maybe$Nothing,
						image: $elm$core$Maybe$Nothing,
						jaContent: _List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('Elm Japan 2020 は大小あらゆる形でスポンサーを募集いたします。スポンサーをご希望の方は'),
										A2(
										$mdgriffith$elm_ui$Element$newTabLink,
										$author$project$Main$linkAttrs,
										{
											label: $mdgriffith$elm_ui$Element$text($author$project$Main$emailSponsors),
											url: 'mailto:' + $author$project$Main$emailSponsors
										}),
										$mdgriffith$elm_ui$Element$text('に目論見書をご送付ください。')
									]))
							]),
						width: model.width
					}),
					$author$project$Main$section('who-we-are'),
					A5($author$project$Main$title, maybeLanguage, model.width, $author$project$Main$marginAboveTitles, 'Who we are', '運営団体'),
					A3(
					$author$project$Main$doubleSection,
					$author$project$Main$fontColor(timeOfDay),
					maybeLanguage,
					{
						enContent: _List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('The conference is non-profit and community-driven, organized by enthusiastic members of the Japanese Elm community.')
									]))
							]),
						githubAndTwitter: $elm$core$Maybe$Nothing,
						image: $elm$core$Maybe$Nothing,
						jaContent: _List_fromArray(
							[
								A2(
								$mdgriffith$elm_ui$Element$paragraph,
								$author$project$Main$paragraphAttrs,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$text('本カンファレンスは日本のElmコミュニティの有志によって非営利で運営されています。')
									]))
							]),
						width: model.width
					}),
					A5($author$project$Main$title, maybeLanguage, model.width, $author$project$Main$marginAboveTitles, '', '')
				]));
	});
var $author$project$Counter$View$addSeparator = F2(
	function (separator, list) {
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, acc) {
					var index = _v0.a;
					var item = _v0.b;
					return ((!A2(
						$elm$core$Basics$modBy,
						3,
						($elm$core$List$length(list) - index) - 1)) && (!_Utils_eq(
						$elm$core$List$length(list),
						index + 1))) ? _Utils_ap(
						_List_fromArray(
							[separator, item]),
						acc) : A2($elm$core$List$cons, item, acc);
				}),
			_List_Nil,
			A2(
				$elm$core$List$indexedMap,
				F2(
					function (index, item) {
						return _Utils_Tuple2(index, item);
					}),
				list));
	});
var $author$project$Counter$animationPosition = function (_v0) {
	var data = _v0.a;
	return data.animationPosition;
};
var $author$project$Counter$View$convertToPaddedString = F2(
	function (value, wheelsQuantity) {
		return A3(
			$elm$core$String$padLeft,
			wheelsQuantity,
			_Utils_chr('0'),
			$elm$core$String$fromInt(value));
	});
var $author$project$Counter$View$getCharFromStart = F2(
	function (index, string) {
		return A3($elm$core$String$slice, index, index + 1, string);
	});
var $author$project$Counter$presentValue = function (_v0) {
	var data = _v0.a;
	return data.value;
};
var $author$project$Counter$View$downDirection = F2(
	function (present, target) {
		var _v0 = _Utils_Tuple2(
			$elm$core$String$toInt(present),
			$elm$core$String$toInt(target));
		if ((_v0.a.$ === 'Just') && (_v0.b.$ === 'Just')) {
			var from_ = _v0.a.a;
			var to_ = _v0.b.a;
			return ((to_ - from_) === 1) || _Utils_eq(to_ - from_, -9);
		} else {
			return false;
		}
	});
var $author$project$Counter$View$transition = function (_v0) {
	var present = _v0.present;
	var target = _v0.target;
	var size = _v0.size;
	var position = _v0.position;
	var noTransition = _Utils_eq(present, target);
	return A2(
		$mdgriffith$elm_ui$Element$el,
		_Utils_ap(
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$Font$size(
					$elm$core$Basics$round(size)),
					$mdgriffith$elm_ui$Element$clip,
					$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
					$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill)
				]),
			function () {
				if (noTransition) {
					return _List_Nil;
				} else {
					var realPosition = size * position;
					var downDirection_ = A2($author$project$Counter$View$downDirection, present, target);
					return _List_fromArray(
						[
							$mdgriffith$elm_ui$Element$inFront(
							A2(
								$mdgriffith$elm_ui$Element$el,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$htmlAttribute(
										A2(
											$elm$html$Html$Attributes$style,
											'transform',
											'translateY(' + ((downDirection_ ? $elm$core$String$fromFloat(size - realPosition) : $elm$core$String$fromFloat(0 - (size - realPosition))) + 'px)')))
									]),
								$mdgriffith$elm_ui$Element$text(present))),
							$mdgriffith$elm_ui$Element$inFront(
							A2(
								$mdgriffith$elm_ui$Element$el,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$htmlAttribute(
										A2(
											$elm$html$Html$Attributes$style,
											'transform',
											'translateY(' + ((A2($author$project$Counter$View$downDirection, present, target) ? $elm$core$String$fromFloat(0 - realPosition) : $elm$core$String$fromFloat(realPosition)) + 'px)')))
									]),
								$mdgriffith$elm_ui$Element$text(target)))
						]);
				}
			}()),
		A2(
			$mdgriffith$elm_ui$Element$el,
			noTransition ? _List_Nil : _List_fromArray(
				[
					$mdgriffith$elm_ui$Element$Font$color(
					A4($mdgriffith$elm_ui$Element$rgba, 0, 0, 0, 0))
				]),
			$mdgriffith$elm_ui$Element$text(target)));
};
var $author$project$Counter$View$view = F2(
	function (counter, size) {
		var wheelsQuantity = $author$project$Counter$wheelsQuantity(counter);
		var separator = A2(
			$mdgriffith$elm_ui$Element$el,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$Font$size(
					$elm$core$Basics$round(size))
				]),
			$mdgriffith$elm_ui$Element$text(','));
		var rowAttrs = _List_fromArray(
			[
				$mdgriffith$elm_ui$Element$spacing(1)
			]);
		var paddedPresent = A2(
			$author$project$Counter$View$convertToPaddedString,
			$author$project$Counter$presentValue(counter),
			wheelsQuantity);
		var maybeValueTarget = $author$project$Counter$nextValue(counter);
		if (maybeValueTarget.$ === 'Nothing') {
			return A2(
				$mdgriffith$elm_ui$Element$row,
				rowAttrs,
				$elm$core$List$reverse(
					A2(
						$author$project$Counter$View$addSeparator,
						separator,
						A2(
							$elm$core$List$map,
							function (target) {
								return $author$project$Counter$View$transition(
									{position: 0, present: target, size: size, target: target});
							},
							A2($elm$core$String$split, '', paddedPresent)))));
		} else {
			var valueTarget = maybeValueTarget.a;
			var paddedTarget = A2($author$project$Counter$View$convertToPaddedString, valueTarget, wheelsQuantity);
			return A2(
				$mdgriffith$elm_ui$Element$row,
				rowAttrs,
				$elm$core$List$reverse(
					A2(
						$author$project$Counter$View$addSeparator,
						separator,
						A2(
							$elm$core$List$indexedMap,
							F2(
								function (index, _v1) {
									var target = A2($author$project$Counter$View$getCharFromStart, index, paddedTarget);
									var present = A2($author$project$Counter$View$getCharFromStart, index, paddedPresent);
									return $author$project$Counter$View$transition(
										{
											position: $author$project$Counter$animationPosition(counter),
											present: present,
											size: size,
											target: target
										});
								}),
							A2($elm$core$List$repeat, wheelsQuantity, _Utils_Tuple0)))));
		}
	});
var $elm$svg$Svg$g = $elm$svg$Svg$trustedNode('g');
var $elm$svg$Svg$Attributes$opacity = _VirtualDom_attribute('opacity');
var $author$project$Playground$renderAlpha = function (alpha) {
	return (alpha === 1) ? _List_Nil : _List_fromArray(
		[
			$elm$svg$Svg$Attributes$opacity(
			$elm$core$String$fromFloat(
				A3($elm$core$Basics$clamp, 0, 1, alpha)))
		]);
};
var $author$project$Playground$renderColor = function (color) {
	if (color.$ === 'Hex') {
		var str = color.a;
		return str;
	} else {
		var r = color.a;
		var g = color.b;
		var b = color.c;
		return 'rgb(' + ($elm$core$String$fromInt(r) + (',' + ($elm$core$String$fromInt(g) + (',' + ($elm$core$String$fromInt(b) + ')')))));
	}
};
var $author$project$Playground$renderTransform = F4(
	function (x, y, a, s) {
		return (!a) ? ((s === 1) ? ('translate(' + ($elm$core$String$fromFloat(x) + (',' + ($elm$core$String$fromFloat(-y) + ')')))) : ('translate(' + ($elm$core$String$fromFloat(x) + (',' + ($elm$core$String$fromFloat(-y) + (') scale(' + ($elm$core$String$fromFloat(s) + ')'))))))) : ((s === 1) ? ('translate(' + ($elm$core$String$fromFloat(x) + (',' + ($elm$core$String$fromFloat(-y) + (') rotate(' + ($elm$core$String$fromFloat(-a) + ')')))))) : ('translate(' + ($elm$core$String$fromFloat(x) + (',' + ($elm$core$String$fromFloat(-y) + (') rotate(' + ($elm$core$String$fromFloat(-a) + (') scale(' + ($elm$core$String$fromFloat(s) + ')')))))))));
	});
var $elm$svg$Svg$Attributes$transform = _VirtualDom_attribute('transform');
var $author$project$Playground$renderCircle = F7(
	function (color, radius, x, y, angle, s, alpha) {
		return A2(
			$elm$svg$Svg$circle,
			A2(
				$elm$core$List$cons,
				$elm$svg$Svg$Attributes$r(
					$elm$core$String$fromFloat(radius)),
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$fill(
						$author$project$Playground$renderColor(color)),
					A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$transform(
							A4($author$project$Playground$renderTransform, x, y, angle, s)),
						$author$project$Playground$renderAlpha(alpha)))),
			_List_Nil);
	});
var $elm$svg$Svg$image = $elm$svg$Svg$trustedNode('image');
var $author$project$Playground$renderRectTransform = F6(
	function (width, height, x, y, angle, s) {
		return A4($author$project$Playground$renderTransform, x, y, angle, s) + (' translate(' + ($elm$core$String$fromFloat((-width) / 2) + (',' + ($elm$core$String$fromFloat((-height) / 2) + ')'))));
	});
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $author$project$Playground$renderImage = F8(
	function (w, h, src, x, y, angle, s, alpha) {
		return A2(
			$elm$svg$Svg$image,
			A2(
				$elm$core$List$cons,
				$elm$svg$Svg$Attributes$xlinkHref(src),
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$width(
						$elm$core$String$fromFloat(w)),
					A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$height(
							$elm$core$String$fromFloat(h)),
						A2(
							$elm$core$List$cons,
							$elm$svg$Svg$Attributes$transform(
								A6($author$project$Playground$renderRectTransform, w, h, x, y, angle, s)),
							$author$project$Playground$renderAlpha(alpha))))),
			_List_Nil);
	});
var $elm$svg$Svg$Attributes$points = _VirtualDom_attribute('points');
var $elm$svg$Svg$polygon = $elm$svg$Svg$trustedNode('polygon');
var $elm$core$Basics$cos = _Basics_cos;
var $elm$core$Basics$sin = _Basics_sin;
var $elm$core$Basics$pi = _Basics_pi;
var $elm$core$Basics$turns = function (angleInTurns) {
	return (2 * $elm$core$Basics$pi) * angleInTurns;
};
var $author$project$Playground$toNgonPoints = F4(
	function (i, n, radius, string) {
		toNgonPoints:
		while (true) {
			if (_Utils_eq(i, n)) {
				return string;
			} else {
				var a = $elm$core$Basics$turns((i / n) - 0.25);
				var x = radius * $elm$core$Basics$cos(a);
				var y = radius * $elm$core$Basics$sin(a);
				var $temp$i = i + 1,
					$temp$n = n,
					$temp$radius = radius,
					$temp$string = string + ($elm$core$String$fromFloat(x) + (',' + ($elm$core$String$fromFloat(y) + ' ')));
				i = $temp$i;
				n = $temp$n;
				radius = $temp$radius;
				string = $temp$string;
				continue toNgonPoints;
			}
		}
	});
var $author$project$Playground$renderNgon = F8(
	function (color, n, radius, x, y, angle, s, alpha) {
		return A2(
			$elm$svg$Svg$polygon,
			A2(
				$elm$core$List$cons,
				$elm$svg$Svg$Attributes$points(
					A4($author$project$Playground$toNgonPoints, 0, n, radius, '')),
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$fill(
						$author$project$Playground$renderColor(color)),
					A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$transform(
							A4($author$project$Playground$renderTransform, x, y, angle, s)),
						$author$project$Playground$renderAlpha(alpha)))),
			_List_Nil);
	});
var $elm$svg$Svg$ellipse = $elm$svg$Svg$trustedNode('ellipse');
var $elm$svg$Svg$Attributes$rx = _VirtualDom_attribute('rx');
var $elm$svg$Svg$Attributes$ry = _VirtualDom_attribute('ry');
var $author$project$Playground$renderOval = F8(
	function (color, width, height, x, y, angle, s, alpha) {
		return A2(
			$elm$svg$Svg$ellipse,
			A2(
				$elm$core$List$cons,
				$elm$svg$Svg$Attributes$rx(
					$elm$core$String$fromFloat(width / 2)),
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$ry(
						$elm$core$String$fromFloat(height / 2)),
					A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$fill(
							$author$project$Playground$renderColor(color)),
						A2(
							$elm$core$List$cons,
							$elm$svg$Svg$Attributes$transform(
								A4($author$project$Playground$renderTransform, x, y, angle, s)),
							$author$project$Playground$renderAlpha(alpha))))),
			_List_Nil);
	});
var $author$project$Playground$addPoint = F2(
	function (_v0, str) {
		var x = _v0.a;
		var y = _v0.b;
		return str + ($elm$core$String$fromFloat(x) + (',' + ($elm$core$String$fromFloat(y) + ' ')));
	});
var $author$project$Playground$renderPolygon = F7(
	function (color, coordinates, x, y, angle, s, alpha) {
		return A2(
			$elm$svg$Svg$polygon,
			A2(
				$elm$core$List$cons,
				$elm$svg$Svg$Attributes$points(
					A3($elm$core$List$foldl, $author$project$Playground$addPoint, '', coordinates)),
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$fill(
						$author$project$Playground$renderColor(color)),
					A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$transform(
							A4($author$project$Playground$renderTransform, x, y, angle, s)),
						$author$project$Playground$renderAlpha(alpha)))),
			_List_Nil);
	});
var $elm$svg$Svg$rect = $elm$svg$Svg$trustedNode('rect');
var $author$project$Playground$renderRectangle = F8(
	function (color, w, h, x, y, angle, s, alpha) {
		return A2(
			$elm$svg$Svg$rect,
			A2(
				$elm$core$List$cons,
				$elm$svg$Svg$Attributes$width(
					$elm$core$String$fromFloat(w)),
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$height(
						$elm$core$String$fromFloat(h)),
					A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$fill(
							$author$project$Playground$renderColor(color)),
						A2(
							$elm$core$List$cons,
							$elm$svg$Svg$Attributes$transform(
								A6($author$project$Playground$renderRectTransform, w, h, x, y, angle, s)),
							$author$project$Playground$renderAlpha(alpha))))),
			_List_Nil);
	});
var $elm$svg$Svg$Attributes$dominantBaseline = _VirtualDom_attribute('dominant-baseline');
var $elm$svg$Svg$Attributes$textAnchor = _VirtualDom_attribute('text-anchor');
var $author$project$Playground$renderWords = F7(
	function (color, string, x, y, angle, s, alpha) {
		return A2(
			$elm$svg$Svg$text_,
			A2(
				$elm$core$List$cons,
				$elm$svg$Svg$Attributes$textAnchor('middle'),
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$dominantBaseline('central'),
					A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$fill(
							$author$project$Playground$renderColor(color)),
						A2(
							$elm$core$List$cons,
							$elm$svg$Svg$Attributes$transform(
								A4($author$project$Playground$renderTransform, x, y, angle, s)),
							$author$project$Playground$renderAlpha(alpha))))),
			_List_fromArray(
				[
					$elm$svg$Svg$text(string)
				]));
	});
var $author$project$Playground$renderShape = function (_v0) {
	var x = _v0.a;
	var y = _v0.b;
	var angle = _v0.c;
	var s = _v0.d;
	var alpha = _v0.e;
	var form = _v0.f;
	switch (form.$) {
		case 'Circle':
			var color = form.a;
			var radius = form.b;
			return A7($author$project$Playground$renderCircle, color, radius, x, y, angle, s, alpha);
		case 'Oval':
			var color = form.a;
			var width = form.b;
			var height = form.c;
			return A8($author$project$Playground$renderOval, color, width, height, x, y, angle, s, alpha);
		case 'Rectangle':
			var color = form.a;
			var width = form.b;
			var height = form.c;
			return A8($author$project$Playground$renderRectangle, color, width, height, x, y, angle, s, alpha);
		case 'Ngon':
			var color = form.a;
			var n = form.b;
			var radius = form.c;
			return A8($author$project$Playground$renderNgon, color, n, radius, x, y, angle, s, alpha);
		case 'Polygon':
			var color = form.a;
			var points = form.b;
			return A7($author$project$Playground$renderPolygon, color, points, x, y, angle, s, alpha);
		case 'Image':
			var width = form.a;
			var height = form.b;
			var src = form.c;
			return A8($author$project$Playground$renderImage, width, height, src, x, y, angle, s, alpha);
		case 'Words':
			var color = form.a;
			var string = form.b;
			return A7($author$project$Playground$renderWords, color, string, x, y, angle, s, alpha);
		default:
			var shapes = form.a;
			return A2(
				$elm$svg$Svg$g,
				A2(
					$elm$core$List$cons,
					$elm$svg$Svg$Attributes$transform(
						A4($author$project$Playground$renderTransform, x, y, angle, s)),
					$author$project$Playground$renderAlpha(alpha)),
				A2($elm$core$List$map, $author$project$Playground$renderShape, shapes));
	}
};
var $author$project$Playground$render = F2(
	function (screen, shapes) {
		var y = $elm$core$String$fromFloat(screen.bottom);
		var x = $elm$core$String$fromFloat(screen.left);
		var w = $elm$core$String$fromFloat(screen.width);
		var h = $elm$core$String$fromFloat(screen.height);
		return A2(
			$elm$svg$Svg$svg,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$viewBox(x + (' ' + (y + (' ' + (w + (' ' + h)))))),
					$elm$svg$Svg$Attributes$width('100%'),
					$elm$svg$Svg$Attributes$height('100%')
				]),
			A2($elm$core$List$map, $author$project$Playground$renderShape, shapes));
	});
var $author$project$Playground$viewGame = F2(
	function (viewMemory, _v0) {
		var memory = _v0.b;
		var computer = _v0.c;
		var newComputerScreen = {bottom: -300, height: 600, left: -400, right: 400, top: 300, width: 800};
		return {
			body: _List_fromArray(
				[
					A2(
					$author$project$Playground$render,
					computer.screen,
					A2(viewMemory, computer, memory))
				]),
			title: 'Playground'
		};
	});
var $ianmackenzie$elm_units$Quantity$Quantity = function (a) {
	return {$: 'Quantity', a: a};
};
var $ianmackenzie$elm_units$Angle$radians = function (numRadians) {
	return $ianmackenzie$elm_units$Quantity$Quantity(numRadians);
};
var $ianmackenzie$elm_units$Angle$degrees = function (numDegrees) {
	return $ianmackenzie$elm_units$Angle$radians($elm$core$Basics$pi * (numDegrees / 180));
};
var $author$project$Playground$Shape = F6(
	function (a, b, c, d, e, f) {
		return {$: 'Shape', a: a, b: b, c: c, d: d, e: e, f: f};
	});
var $author$project$Playground$fade = F2(
	function (o, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		var a = _v0.c;
		var s = _v0.d;
		var f = _v0.f;
		return A6($author$project$Playground$Shape, x, y, a, s, o, f);
	});
var $ianmackenzie$elm_units$Length$inMeters = function (_v0) {
	var numMeters = _v0.a;
	return numMeters;
};
var $ianmackenzie$elm_geometry$Geometry$Types$Point2d = function (a) {
	return {$: 'Point2d', a: a};
};
var $ianmackenzie$elm_geometry$Point2d$meters = F2(
	function (x, y) {
		return $ianmackenzie$elm_geometry$Geometry$Types$Point2d(
			{x: x, y: y});
	});
var $ianmackenzie$elm_3d_camera$Camera3d$Types$Viewpoint3d = function (a) {
	return {$: 'Viewpoint3d', a: a};
};
var $ianmackenzie$elm_geometry$Geometry$Types$Vector3d = function (a) {
	return {$: 'Vector3d', a: a};
};
var $ianmackenzie$elm_geometry$Vector3d$cross = F2(
	function (_v0, _v1) {
		var v2 = _v0.a;
		var v1 = _v1.a;
		return $ianmackenzie$elm_geometry$Geometry$Types$Vector3d(
			{x: (v1.y * v2.z) - (v1.z * v2.y), y: (v1.z * v2.x) - (v1.x * v2.z), z: (v1.x * v2.y) - (v1.y * v2.x)});
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Direction3d = function (a) {
	return {$: 'Direction3d', a: a};
};
var $elm$core$Basics$sqrt = _Basics_sqrt;
var $ianmackenzie$elm_geometry$Vector3d$direction = function (_v0) {
	var v = _v0.a;
	var largestComponent = A2(
		$elm$core$Basics$max,
		$elm$core$Basics$abs(v.x),
		A2(
			$elm$core$Basics$max,
			$elm$core$Basics$abs(v.y),
			$elm$core$Basics$abs(v.z)));
	if (!largestComponent) {
		return $elm$core$Maybe$Nothing;
	} else {
		var scaledZ = v.z / largestComponent;
		var scaledY = v.y / largestComponent;
		var scaledX = v.x / largestComponent;
		var scaledLength = $elm$core$Basics$sqrt(((scaledX * scaledX) + (scaledY * scaledY)) + (scaledZ * scaledZ));
		return $elm$core$Maybe$Just(
			$ianmackenzie$elm_geometry$Geometry$Types$Direction3d(
				{x: scaledX / scaledLength, y: scaledY / scaledLength, z: scaledZ / scaledLength}));
	}
};
var $ianmackenzie$elm_geometry$Vector3d$from = F2(
	function (_v0, _v1) {
		var p1 = _v0.a;
		var p2 = _v1.a;
		return $ianmackenzie$elm_geometry$Geometry$Types$Vector3d(
			{x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z});
	});
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (maybeValue.$ === 'Just') {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $ianmackenzie$elm_geometry$Vector3d$dot = F2(
	function (_v0, _v1) {
		var v2 = _v0.a;
		var v1 = _v1.a;
		return $ianmackenzie$elm_units$Quantity$Quantity(((v1.x * v2.x) + (v1.y * v2.y)) + (v1.z * v2.z));
	});
var $ianmackenzie$elm_units$Quantity$greaterThan = F2(
	function (_v0, _v1) {
		var y = _v0.a;
		var x = _v1.a;
		return _Utils_cmp(x, y) > 0;
	});
var $ianmackenzie$elm_units$Quantity$lessThan = F2(
	function (_v0, _v1) {
		var y = _v0.a;
		var x = _v1.a;
		return _Utils_cmp(x, y) < 0;
	});
var $ianmackenzie$elm_geometry$Vector3d$minus = F2(
	function (_v0, _v1) {
		var v2 = _v0.a;
		var v1 = _v1.a;
		return $ianmackenzie$elm_geometry$Geometry$Types$Vector3d(
			{x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z});
	});
var $ianmackenzie$elm_geometry$Vector3d$projectionIn = F2(
	function (_v0, _v1) {
		var d = _v0.a;
		var v = _v1.a;
		var projectedLength = ((v.x * d.x) + (v.y * d.y)) + (v.z * d.z);
		return $ianmackenzie$elm_geometry$Geometry$Types$Vector3d(
			{x: d.x * projectedLength, y: d.y * projectedLength, z: d.z * projectedLength});
	});
var $ianmackenzie$elm_geometry$Vector3d$reverse = function (_v0) {
	var v = _v0.a;
	return $ianmackenzie$elm_geometry$Geometry$Types$Vector3d(
		{x: -v.x, y: -v.y, z: -v.z});
};
var $ianmackenzie$elm_units$Quantity$zero = $ianmackenzie$elm_units$Quantity$Quantity(0);
var $ianmackenzie$elm_geometry$Vector3d$zero = $ianmackenzie$elm_geometry$Geometry$Types$Vector3d(
	{x: 0, y: 0, z: 0});
var $ianmackenzie$elm_geometry$Direction3d$orthonormalize = F3(
	function (xVector, xyVector, xyzVector) {
		return A2(
			$elm$core$Maybe$andThen,
			function (xDirection) {
				var yVector = A2(
					$ianmackenzie$elm_geometry$Vector3d$minus,
					A2($ianmackenzie$elm_geometry$Vector3d$projectionIn, xDirection, xyVector),
					xyVector);
				return A2(
					$elm$core$Maybe$andThen,
					function (yDirection) {
						var rightHandedZVector = A2($ianmackenzie$elm_geometry$Vector3d$cross, xyVector, xVector);
						var tripleProduct = A2($ianmackenzie$elm_geometry$Vector3d$dot, xyzVector, rightHandedZVector);
						var zVector = A2($ianmackenzie$elm_units$Quantity$greaterThan, $ianmackenzie$elm_units$Quantity$zero, tripleProduct) ? rightHandedZVector : (A2($ianmackenzie$elm_units$Quantity$lessThan, $ianmackenzie$elm_units$Quantity$zero, tripleProduct) ? $ianmackenzie$elm_geometry$Vector3d$reverse(rightHandedZVector) : $ianmackenzie$elm_geometry$Vector3d$zero);
						return A2(
							$elm$core$Maybe$map,
							function (zDirection) {
								return _Utils_Tuple3(xDirection, yDirection, zDirection);
							},
							$ianmackenzie$elm_geometry$Vector3d$direction(zVector));
					},
					$ianmackenzie$elm_geometry$Vector3d$direction(yVector));
			},
			$ianmackenzie$elm_geometry$Vector3d$direction(xVector));
	});
var $ianmackenzie$elm_geometry$Direction3d$perpendicularTo = function (_v0) {
	var d = _v0.a;
	var absZ = $elm$core$Basics$abs(d.z);
	var absY = $elm$core$Basics$abs(d.y);
	var absX = $elm$core$Basics$abs(d.x);
	if (_Utils_cmp(absX, absY) < 1) {
		if (_Utils_cmp(absX, absZ) < 1) {
			var scale = $elm$core$Basics$sqrt((d.z * d.z) + (d.y * d.y));
			return $ianmackenzie$elm_geometry$Geometry$Types$Direction3d(
				{x: 0, y: (-d.z) / scale, z: d.y / scale});
		} else {
			var scale = $elm$core$Basics$sqrt((d.y * d.y) + (d.x * d.x));
			return $ianmackenzie$elm_geometry$Geometry$Types$Direction3d(
				{x: (-d.y) / scale, y: d.x / scale, z: 0});
		}
	} else {
		if (_Utils_cmp(absY, absZ) < 1) {
			var scale = $elm$core$Basics$sqrt((d.z * d.z) + (d.x * d.x));
			return $ianmackenzie$elm_geometry$Geometry$Types$Direction3d(
				{x: d.z / scale, y: 0, z: (-d.x) / scale});
		} else {
			var scale = $elm$core$Basics$sqrt((d.x * d.x) + (d.y * d.y));
			return $ianmackenzie$elm_geometry$Geometry$Types$Direction3d(
				{x: (-d.y) / scale, y: d.x / scale, z: 0});
		}
	}
};
var $ianmackenzie$elm_geometry$Direction3d$perpendicularBasis = function (direction) {
	var xDirection = $ianmackenzie$elm_geometry$Direction3d$perpendicularTo(direction);
	var _v0 = xDirection;
	var dX = _v0.a;
	var _v1 = direction;
	var d = _v1.a;
	var yDirection = $ianmackenzie$elm_geometry$Geometry$Types$Direction3d(
		{x: (d.y * dX.z) - (d.z * dX.y), y: (d.z * dX.x) - (d.x * dX.z), z: (d.x * dX.y) - (d.y * dX.x)});
	return _Utils_Tuple2(xDirection, yDirection);
};
var $ianmackenzie$elm_geometry$Direction3d$toVector = function (_v0) {
	var components = _v0.a;
	return $ianmackenzie$elm_geometry$Geometry$Types$Vector3d(components);
};
var $ianmackenzie$elm_geometry$Geometry$Types$Frame3d = function (a) {
	return {$: 'Frame3d', a: a};
};
var $ianmackenzie$elm_geometry$Frame3d$unsafe = function (properties) {
	return $ianmackenzie$elm_geometry$Geometry$Types$Frame3d(properties);
};
var $ianmackenzie$elm_geometry$Frame3d$withZDirection = F2(
	function (givenZDirection, givenOrigin) {
		var _v0 = $ianmackenzie$elm_geometry$Direction3d$perpendicularBasis(givenZDirection);
		var computedXDirection = _v0.a;
		var computedYDirection = _v0.b;
		return $ianmackenzie$elm_geometry$Frame3d$unsafe(
			{originPoint: givenOrigin, xDirection: computedXDirection, yDirection: computedYDirection, zDirection: givenZDirection});
	});
var $ianmackenzie$elm_3d_camera$Viewpoint3d$lookAt = function (_arguments) {
	var zVector = A2($ianmackenzie$elm_geometry$Vector3d$from, _arguments.focalPoint, _arguments.eyePoint);
	var yVector = $ianmackenzie$elm_geometry$Direction3d$toVector(_arguments.upDirection);
	var xVector = A2($ianmackenzie$elm_geometry$Vector3d$cross, zVector, yVector);
	var _v0 = A3($ianmackenzie$elm_geometry$Direction3d$orthonormalize, zVector, yVector, xVector);
	if (_v0.$ === 'Just') {
		var _v1 = _v0.a;
		var normalizedZDirection = _v1.a;
		var normalizedYDirection = _v1.b;
		var normalizedXDirection = _v1.c;
		return $ianmackenzie$elm_3d_camera$Camera3d$Types$Viewpoint3d(
			$ianmackenzie$elm_geometry$Frame3d$unsafe(
				{originPoint: _arguments.eyePoint, xDirection: normalizedXDirection, yDirection: normalizedYDirection, zDirection: normalizedZDirection}));
	} else {
		var _v2 = $ianmackenzie$elm_geometry$Vector3d$direction(zVector);
		if (_v2.$ === 'Just') {
			var zDirection = _v2.a;
			return $ianmackenzie$elm_3d_camera$Camera3d$Types$Viewpoint3d(
				A2($ianmackenzie$elm_geometry$Frame3d$withZDirection, zDirection, _arguments.eyePoint));
		} else {
			var _v3 = $ianmackenzie$elm_geometry$Direction3d$perpendicularBasis(_arguments.upDirection);
			var arbitraryZDirection = _v3.a;
			var arbitraryXDirection = _v3.b;
			return $ianmackenzie$elm_3d_camera$Camera3d$Types$Viewpoint3d(
				$ianmackenzie$elm_geometry$Frame3d$unsafe(
					{originPoint: _arguments.eyePoint, xDirection: arbitraryXDirection, yDirection: _arguments.upDirection, zDirection: arbitraryZDirection}));
		}
	}
};
var $ianmackenzie$elm_units$Length$meters = function (numMeters) {
	return $ianmackenzie$elm_units$Quantity$Quantity(numMeters);
};
var $ianmackenzie$elm_3d_camera$Camera3d$Types$Camera3d = function (a) {
	return {$: 'Camera3d', a: a};
};
var $ianmackenzie$elm_3d_camera$Camera3d$Types$Perspective = function (a) {
	return {$: 'Perspective', a: a};
};
var $ianmackenzie$elm_units$Quantity$abs = function (_v0) {
	var value = _v0.a;
	return $ianmackenzie$elm_units$Quantity$Quantity(
		$elm$core$Basics$abs(value));
};
var $ianmackenzie$elm_units$Quantity$half = function (_v0) {
	var value = _v0.a;
	return $ianmackenzie$elm_units$Quantity$Quantity(0.5 * value);
};
var $ianmackenzie$elm_geometry$Geometry$Types$Point3d = function (a) {
	return {$: 'Point3d', a: a};
};
var $ianmackenzie$elm_geometry$Point3d$along = F2(
	function (_v0, _v1) {
		var axis = _v0.a;
		var distance = _v1.a;
		var _v2 = axis.originPoint;
		var p0 = _v2.a;
		var _v3 = axis.direction;
		var d = _v3.a;
		return $ianmackenzie$elm_geometry$Geometry$Types$Point3d(
			{x: p0.x + (distance * d.x), y: p0.y + (distance * d.y), z: p0.z + (distance * d.z)});
	});
var $ianmackenzie$elm_units$Quantity$negate = function (_v0) {
	var value = _v0.a;
	return $ianmackenzie$elm_units$Quantity$Quantity(-value);
};
var $ianmackenzie$elm_geometry$Direction3d$reverse = function (_v0) {
	var d = _v0.a;
	return $ianmackenzie$elm_geometry$Geometry$Types$Direction3d(
		{x: -d.x, y: -d.y, z: -d.z});
};
var $ianmackenzie$elm_geometry$Geometry$Types$Plane3d = function (a) {
	return {$: 'Plane3d', a: a};
};
var $ianmackenzie$elm_geometry$Plane3d$through = F2(
	function (givenPoint, givenNormalDirection) {
		return $ianmackenzie$elm_geometry$Geometry$Types$Plane3d(
			{normalDirection: givenNormalDirection, originPoint: givenPoint});
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Axis3d = function (a) {
	return {$: 'Axis3d', a: a};
};
var $ianmackenzie$elm_geometry$Axis3d$through = F2(
	function (givenPoint, givenDirection) {
		return $ianmackenzie$elm_geometry$Geometry$Types$Axis3d(
			{direction: givenDirection, originPoint: givenPoint});
	});
var $ianmackenzie$elm_geometry$Frame3d$zAxis = function (_v0) {
	var frame = _v0.a;
	return A2($ianmackenzie$elm_geometry$Axis3d$through, frame.originPoint, frame.zDirection);
};
var $ianmackenzie$elm_geometry$Frame3d$zDirection = function (_v0) {
	var properties = _v0.a;
	return properties.zDirection;
};
var $ianmackenzie$elm_3d_camera$Camera3d$offsetClipPlane = F2(
	function (_v0, depth) {
		var frame = _v0.a;
		return A2(
			$ianmackenzie$elm_geometry$Plane3d$through,
			A2(
				$ianmackenzie$elm_geometry$Point3d$along,
				$ianmackenzie$elm_geometry$Frame3d$zAxis(frame),
				$ianmackenzie$elm_units$Quantity$negate(depth)),
			$ianmackenzie$elm_geometry$Direction3d$reverse(
				$ianmackenzie$elm_geometry$Frame3d$zDirection(frame)));
	});
var $elm$core$Basics$tan = _Basics_tan;
var $ianmackenzie$elm_units$Angle$tan = function (_v0) {
	var angle = _v0.a;
	return $elm$core$Basics$tan(angle);
};
var $ianmackenzie$elm_3d_camera$Camera3d$perspective = function (_arguments) {
	var halfFieldOfView = $ianmackenzie$elm_units$Quantity$half(
		$ianmackenzie$elm_units$Quantity$abs(_arguments.verticalFieldOfView));
	var frustumSlope = $ianmackenzie$elm_units$Angle$tan(halfFieldOfView);
	var absoluteClipDepth = $ianmackenzie$elm_units$Quantity$abs(_arguments.clipDepth);
	return $ianmackenzie$elm_3d_camera$Camera3d$Types$Camera3d(
		{
			clipDepth: absoluteClipDepth,
			clipPlane: A2($ianmackenzie$elm_3d_camera$Camera3d$offsetClipPlane, _arguments.viewpoint, absoluteClipDepth),
			projection: $ianmackenzie$elm_3d_camera$Camera3d$Types$Perspective(frustumSlope),
			viewpoint: _arguments.viewpoint
		});
};
var $ianmackenzie$elm_geometry$Point3d$meters = F3(
	function (x, y, z) {
		return $ianmackenzie$elm_geometry$Geometry$Types$Point3d(
			{x: x, y: y, z: z});
	});
var $author$project$Playground3d$point = $ianmackenzie$elm_geometry$Point3d$meters;
var $ianmackenzie$elm_geometry$Direction3d$unsafe = function (components) {
	return $ianmackenzie$elm_geometry$Geometry$Types$Direction3d(components);
};
var $ianmackenzie$elm_geometry$Direction3d$positiveZ = $ianmackenzie$elm_geometry$Direction3d$unsafe(
	{x: 0, y: 0, z: 1});
var $ianmackenzie$elm_3d_camera$Camera3d$clipPlane = function (_v0) {
	var camera = _v0.a;
	return camera.clipPlane;
};
var $ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo = F2(
	function (_v0, _v1) {
		var y = _v0.a;
		var x = _v1.a;
		return _Utils_cmp(x, y) > -1;
	});
var $ianmackenzie$elm_geometry$Point3d$signedDistanceFrom = F2(
	function (_v0, _v1) {
		var plane = _v0.a;
		var p = _v1.a;
		var _v2 = plane.originPoint;
		var p0 = _v2.a;
		var _v3 = plane.normalDirection;
		var n = _v3.a;
		return $ianmackenzie$elm_units$Quantity$Quantity((((p.x - p0.x) * n.x) + ((p.y - p0.y) * n.y)) + ((p.z - p0.z) * n.z));
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Frame2d = function (a) {
	return {$: 'Frame2d', a: a};
};
var $ianmackenzie$elm_geometry$Frame2d$copy = function (_v0) {
	var properties = _v0.a;
	return $ianmackenzie$elm_geometry$Geometry$Types$Frame2d(properties);
};
var $ianmackenzie$elm_geometry$Rectangle2d$axes = function (_v0) {
	var rectangle = _v0.a;
	return $ianmackenzie$elm_geometry$Frame2d$copy(rectangle.axes);
};
var $ianmackenzie$elm_geometry$Rectangle2d$dimensions = function (_v0) {
	var rectangle = _v0.a;
	return rectangle.dimensions;
};
var $ianmackenzie$elm_units$Quantity$multiplyBy = F2(
	function (scale, _v0) {
		var value = _v0.a;
		return $ianmackenzie$elm_units$Quantity$Quantity(scale * value);
	});
var $ianmackenzie$elm_units$Quantity$ratio = F2(
	function (_v0, _v1) {
		var x = _v0.a;
		var y = _v1.a;
		return x / y;
	});
var $ianmackenzie$elm_geometry$Point3d$xCoordinateIn = F2(
	function (_v0, _v1) {
		var frame = _v0.a;
		var p = _v1.a;
		var _v2 = frame.originPoint;
		var p0 = _v2.a;
		var _v3 = frame.xDirection;
		var d = _v3.a;
		return $ianmackenzie$elm_units$Quantity$Quantity((((p.x - p0.x) * d.x) + ((p.y - p0.y) * d.y)) + ((p.z - p0.z) * d.z));
	});
var $ianmackenzie$elm_geometry$Point2d$xyIn = F3(
	function (_v0, _v1, _v2) {
		var frame = _v0.a;
		var x = _v1.a;
		var y = _v2.a;
		var _v3 = frame.originPoint;
		var p0 = _v3.a;
		var _v4 = frame.yDirection;
		var j = _v4.a;
		var _v5 = frame.xDirection;
		var i = _v5.a;
		return $ianmackenzie$elm_geometry$Geometry$Types$Point2d(
			{x: (p0.x + (x * i.x)) + (y * j.x), y: (p0.y + (x * i.y)) + (y * j.y)});
	});
var $ianmackenzie$elm_geometry$Point3d$yCoordinateIn = F2(
	function (_v0, _v1) {
		var frame = _v0.a;
		var p = _v1.a;
		var _v2 = frame.originPoint;
		var p0 = _v2.a;
		var _v3 = frame.yDirection;
		var d = _v3.a;
		return $ianmackenzie$elm_units$Quantity$Quantity((((p.x - p0.x) * d.x) + ((p.y - p0.y) * d.y)) + ((p.z - p0.z) * d.z));
	});
var $ianmackenzie$elm_geometry$Point3d$zCoordinateIn = F2(
	function (_v0, _v1) {
		var frame = _v0.a;
		var p = _v1.a;
		var _v2 = frame.originPoint;
		var p0 = _v2.a;
		var _v3 = frame.zDirection;
		var d = _v3.a;
		return $ianmackenzie$elm_units$Quantity$Quantity((((p.x - p0.x) * d.x) + ((p.y - p0.y) * d.y)) + ((p.z - p0.z) * d.z));
	});
var $ianmackenzie$elm_3d_camera$Camera3d$Internal$unsafeProjection = F3(
	function (_v0, screen, point) {
		var camera = _v0.a;
		var _v1 = camera.viewpoint;
		var viewpointFrame = _v1.a;
		var viewX = A2($ianmackenzie$elm_geometry$Point3d$xCoordinateIn, viewpointFrame, point);
		var viewY = A2($ianmackenzie$elm_geometry$Point3d$yCoordinateIn, viewpointFrame, point);
		var viewZ = A2($ianmackenzie$elm_geometry$Point3d$zCoordinateIn, viewpointFrame, point);
		var depth = $ianmackenzie$elm_units$Quantity$negate(viewZ);
		var _v2 = $ianmackenzie$elm_geometry$Rectangle2d$dimensions(screen);
		var screenWidth = _v2.a;
		var screenHeight = _v2.b;
		var aspectRatio = A2($ianmackenzie$elm_units$Quantity$ratio, screenWidth, screenHeight);
		var _v3 = camera.projection;
		if (_v3.$ === 'Perspective') {
			var frustumSlope = _v3.a;
			var ndcY = A2($ianmackenzie$elm_units$Quantity$ratio, viewY, depth) / frustumSlope;
			var ndcX = A2($ianmackenzie$elm_units$Quantity$ratio, viewX, depth) / (aspectRatio * frustumSlope);
			return A3(
				$ianmackenzie$elm_geometry$Point2d$xyIn,
				$ianmackenzie$elm_geometry$Rectangle2d$axes(screen),
				A2($ianmackenzie$elm_units$Quantity$multiplyBy, ndcX / 2, screenWidth),
				A2($ianmackenzie$elm_units$Quantity$multiplyBy, ndcY / 2, screenHeight));
		} else {
			var viewportHeight = _v3.a;
			var halfNdcY = A2($ianmackenzie$elm_units$Quantity$ratio, viewY, viewportHeight);
			var halfNdcX = A2(
				$ianmackenzie$elm_units$Quantity$ratio,
				viewX,
				A2($ianmackenzie$elm_units$Quantity$multiplyBy, aspectRatio, viewportHeight));
			return A3(
				$ianmackenzie$elm_geometry$Point2d$xyIn,
				$ianmackenzie$elm_geometry$Rectangle2d$axes(screen),
				A2($ianmackenzie$elm_units$Quantity$multiplyBy, halfNdcX, screenWidth),
				A2($ianmackenzie$elm_units$Quantity$multiplyBy, halfNdcY, screenHeight));
		}
	});
var $ianmackenzie$elm_3d_camera$Point3d$Projection$toScreenSpace = F3(
	function (camera, screen, point) {
		return A2(
			$ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo,
			$ianmackenzie$elm_units$Quantity$zero,
			A2(
				$ianmackenzie$elm_geometry$Point3d$signedDistanceFrom,
				$ianmackenzie$elm_3d_camera$Camera3d$clipPlane(camera),
				point)) ? $elm$core$Maybe$Just(
			A3($ianmackenzie$elm_3d_camera$Camera3d$Internal$unsafeProjection, camera, screen, point)) : $elm$core$Maybe$Nothing;
	});
var $author$project$Playground$wave = F4(
	function (lo, hi, period, time) {
		return lo + (((hi - lo) * (1 + $elm$core$Basics$cos(
			$elm$core$Basics$turns(
				A2($author$project$Playground$toFrac, period, time))))) / 2);
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Rectangle2d = function (a) {
	return {$: 'Rectangle2d', a: a};
};
var $ianmackenzie$elm_units$Quantity$midpoint = F2(
	function (_v0, _v1) {
		var x = _v0.a;
		var y = _v1.a;
		return $ianmackenzie$elm_units$Quantity$Quantity(x + (0.5 * (y - x)));
	});
var $ianmackenzie$elm_units$Quantity$minus = F2(
	function (_v0, _v1) {
		var y = _v0.a;
		var x = _v1.a;
		return $ianmackenzie$elm_units$Quantity$Quantity(x - y);
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Direction2d = function (a) {
	return {$: 'Direction2d', a: a};
};
var $ianmackenzie$elm_geometry$Direction2d$negativeX = $ianmackenzie$elm_geometry$Geometry$Types$Direction2d(
	{x: -1, y: 0});
var $ianmackenzie$elm_geometry$Direction2d$negativeY = $ianmackenzie$elm_geometry$Geometry$Types$Direction2d(
	{x: 0, y: -1});
var $ianmackenzie$elm_geometry$Direction2d$positiveX = $ianmackenzie$elm_geometry$Geometry$Types$Direction2d(
	{x: 1, y: 0});
var $ianmackenzie$elm_geometry$Direction2d$positiveY = $ianmackenzie$elm_geometry$Geometry$Types$Direction2d(
	{x: 0, y: 1});
var $ianmackenzie$elm_geometry$Frame2d$unsafe = function (properties) {
	return $ianmackenzie$elm_geometry$Geometry$Types$Frame2d(properties);
};
var $ianmackenzie$elm_geometry$Point2d$xy = F2(
	function (_v0, _v1) {
		var x = _v0.a;
		var y = _v1.a;
		return $ianmackenzie$elm_geometry$Geometry$Types$Point2d(
			{x: x, y: y});
	});
var $ianmackenzie$elm_geometry$Rectangle2d$axisAligned = F4(
	function (x1, y1, x2, y2) {
		var computedYDirection = A2($ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo, y1, y2) ? $ianmackenzie$elm_geometry$Direction2d$positiveY : $ianmackenzie$elm_geometry$Direction2d$negativeY;
		var computedXDirection = A2($ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo, x1, x2) ? $ianmackenzie$elm_geometry$Direction2d$positiveX : $ianmackenzie$elm_geometry$Direction2d$negativeX;
		var computedDimensions = _Utils_Tuple2(
			$ianmackenzie$elm_units$Quantity$abs(
				A2($ianmackenzie$elm_units$Quantity$minus, x1, x2)),
			$ianmackenzie$elm_units$Quantity$abs(
				A2($ianmackenzie$elm_units$Quantity$minus, y1, y2)));
		var computedCenterPoint = A2(
			$ianmackenzie$elm_geometry$Point2d$xy,
			A2($ianmackenzie$elm_units$Quantity$midpoint, x1, x2),
			A2($ianmackenzie$elm_units$Quantity$midpoint, y1, y2));
		var computedAxes = $ianmackenzie$elm_geometry$Frame2d$unsafe(
			{originPoint: computedCenterPoint, xDirection: computedXDirection, yDirection: computedYDirection});
		return $ianmackenzie$elm_geometry$Geometry$Types$Rectangle2d(
			{axes: computedAxes, dimensions: computedDimensions});
	});
var $ianmackenzie$elm_geometry$Rectangle2d$with = function (_v0) {
	var x1 = _v0.x1;
	var y1 = _v0.y1;
	var x2 = _v0.x2;
	var y2 = _v0.y2;
	return A4($ianmackenzie$elm_geometry$Rectangle2d$axisAligned, x1, y1, x2, y2);
};
var $author$project$Playground3d$projectPoint = F3(
	function (model, computer, point3d) {
		var rectOfView = $ianmackenzie$elm_geometry$Rectangle2d$with(
			{
				x1: $ianmackenzie$elm_units$Length$meters(0),
				x2: $ianmackenzie$elm_units$Length$meters(1),
				y1: $ianmackenzie$elm_units$Length$meters(600),
				y2: $ianmackenzie$elm_units$Length$meters(0)
			});
		var cameraViewpoint = function (computer_) {
			return $ianmackenzie$elm_3d_camera$Viewpoint3d$lookAt(
				{
					eyePoint: (model.devMode && computer_.keyboard.enter) ? A3($author$project$Playground3d$point, 500, 500, 4000) : ((model.devMode && computer_.keyboard.shift) ? A3($author$project$Playground3d$point, 2000, 2000, 4000) : A3(
						$author$project$Playground3d$point,
						A4($author$project$Playground$wave, 2250, 2340, 13, computer_.time),
						A4($author$project$Playground$wave, 2250, 2350, 7, computer_.time),
						A4($author$project$Playground$wave, 20, 60, 3, computer_.time))),
					focalPoint: (model.devMode && computer_.keyboard.enter) ? A3($author$project$Playground3d$point, 0, 0, -100000) : ((model.devMode && computer_.keyboard.shift) ? A3($author$project$Playground3d$point, 0, 0, 0) : A3(
						$author$project$Playground3d$point,
						0,
						0,
						A4($author$project$Playground$wave, (-380) - 40, (-380) + 40, 5, computer_.time))),
					upDirection: $ianmackenzie$elm_geometry$Direction3d$positiveZ
				});
		};
		var perspectiveCamera = function (computer_) {
			return $ianmackenzie$elm_3d_camera$Camera3d$perspective(
				{
					clipDepth: $ianmackenzie$elm_units$Length$meters(1),
					verticalFieldOfView: $ianmackenzie$elm_units$Angle$degrees(
						(model.devMode && computer_.keyboard.enter) ? (-20) : ((model.devMode && computer_.keyboard.shift) ? (-40) : (-40))),
					viewpoint: cameraViewpoint(computer_)
				});
		};
		return A3(
			$ianmackenzie$elm_3d_camera$Point3d$Projection$toScreenSpace,
			perspectiveCamera(computer),
			rectOfView,
			point3d);
	});
var $ianmackenzie$elm_geometry$Point2d$xCoordinate = function (_v0) {
	var p = _v0.a;
	return $ianmackenzie$elm_units$Quantity$Quantity(p.x);
};
var $ianmackenzie$elm_geometry$Point2d$yCoordinate = function (_v0) {
	var p = _v0.a;
	return $ianmackenzie$elm_units$Quantity$Quantity(p.y);
};
var $ianmackenzie$elm_geometry$Point2d$toTuple = F2(
	function (fromQuantity, point) {
		return _Utils_Tuple2(
			fromQuantity(
				$ianmackenzie$elm_geometry$Point2d$xCoordinate(point)),
			fromQuantity(
				$ianmackenzie$elm_geometry$Point2d$yCoordinate(point)));
	});
var $author$project$Playground3d$from3dTo2d = F3(
	function (model, computer, points) {
		return A2(
			$elm$core$List$map,
			function (point_) {
				var _v0 = A3($author$project$Playground3d$projectPoint, model, computer, point_);
				if (_v0.$ === 'Just') {
					var p = _v0.a;
					return A2($ianmackenzie$elm_geometry$Point2d$toTuple, $ianmackenzie$elm_units$Length$inMeters, p);
				} else {
					return A2(
						$ianmackenzie$elm_geometry$Point2d$toTuple,
						$ianmackenzie$elm_units$Length$inMeters,
						A2($ianmackenzie$elm_geometry$Point2d$meters, 0, 0));
				}
			},
			points);
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Polyline3d = function (a) {
	return {$: 'Polyline3d', a: a};
};
var $ianmackenzie$elm_geometry$Polyline3d$fromVertices = function (givenVertices) {
	return $ianmackenzie$elm_geometry$Geometry$Types$Polyline3d(givenVertices);
};
var $author$project$FloatingTokyoCity$letters = {
	e: _List_fromArray(
		[
			A3($author$project$Playground3d$point, 0, 0, 0),
			A3($author$project$Playground3d$point, 8, 0, 0),
			A3($author$project$Playground3d$point, 8, 0, 2),
			A3($author$project$Playground3d$point, 2, 0, 2),
			A3($author$project$Playground3d$point, 2, 0, 6),
			A3($author$project$Playground3d$point, 6, 0, 6),
			A3($author$project$Playground3d$point, 6, 0, 8),
			A3($author$project$Playground3d$point, 2, 0, 8),
			A3($author$project$Playground3d$point, 2, 0, 10),
			A3($author$project$Playground3d$point, 8, 0, 10),
			A3($author$project$Playground3d$point, 8, 0, 12),
			A3($author$project$Playground3d$point, 0, 0, 12)
		]),
	l: _List_fromArray(
		[
			A3($author$project$Playground3d$point, 10, 0, 0),
			A3($author$project$Playground3d$point, 12, 0, 0),
			A3($author$project$Playground3d$point, 12, 0, 12),
			A3($author$project$Playground3d$point, 10, 0, 12)
		]),
	m: _List_fromArray(
		[
			A3($author$project$Playground3d$point, 14, 0, 0),
			A3($author$project$Playground3d$point, 16, 0, 0),
			A3($author$project$Playground3d$point, 16, 0, 5),
			A3($author$project$Playground3d$point, 17, 0, 6),
			A3($author$project$Playground3d$point, 18, 0, 6),
			A3($author$project$Playground3d$point, 18, 0, 0),
			A3($author$project$Playground3d$point, 20, 0, 0),
			A3($author$project$Playground3d$point, 20, 0, 5),
			A3($author$project$Playground3d$point, 21, 0, 6),
			A3($author$project$Playground3d$point, 22, 0, 6),
			A3($author$project$Playground3d$point, 22, 0, 0),
			A3($author$project$Playground3d$point, 24, 0, 0),
			A3($author$project$Playground3d$point, 24, 0, 7),
			A3($author$project$Playground3d$point, 23, 0, 8),
			A3($author$project$Playground3d$point, 21, 0, 8),
			A3($author$project$Playground3d$point, 20, 0, 7),
			A3($author$project$Playground3d$point, 19, 0, 8),
			A3($author$project$Playground3d$point, 17, 0, 8),
			A3($author$project$Playground3d$point, 16, 0, 7),
			A3($author$project$Playground3d$point, 16, 0, 8),
			A3($author$project$Playground3d$point, 14, 0, 8)
		])
};
var $author$project$Playground$lightGreen = $author$project$Playground$Hex('#8ae234');
var $author$project$Playground$lightRed = $author$project$Playground$Hex('#ef2929');
var $ianmackenzie$elm_geometry$Polyline3d$vertices = function (_v0) {
	var polylineVertices = _v0.a;
	return polylineVertices;
};
var $ianmackenzie$elm_geometry$Polyline3d$mapVertices = F2(
	function (_function, polyline) {
		return $ianmackenzie$elm_geometry$Polyline3d$fromVertices(
			A2(
				$elm$core$List$map,
				_function,
				$ianmackenzie$elm_geometry$Polyline3d$vertices(polyline)));
	});
var $ianmackenzie$elm_geometry$Point3d$translateBy = F2(
	function (_v0, _v1) {
		var v = _v0.a;
		var p = _v1.a;
		return $ianmackenzie$elm_geometry$Geometry$Types$Point3d(
			{x: p.x + v.x, y: p.y + v.y, z: p.z + v.z});
	});
var $ianmackenzie$elm_geometry$Polyline3d$translateBy = F2(
	function (vector, polyline) {
		return A2(
			$ianmackenzie$elm_geometry$Polyline3d$mapVertices,
			$ianmackenzie$elm_geometry$Point3d$translateBy(vector),
			polyline);
	});
var $author$project$Playground3d$movePolyline = $ianmackenzie$elm_geometry$Polyline3d$translateBy;
var $ianmackenzie$elm_geometry$Axis3d$moveTo = F2(
	function (newOrigin, _v0) {
		var axis = _v0.a;
		return A2($ianmackenzie$elm_geometry$Axis3d$through, newOrigin, axis.direction);
	});
var $author$project$Playground$Polygon = F2(
	function (a, b) {
		return {$: 'Polygon', a: a, b: b};
	});
var $author$project$Playground$polygon = F2(
	function (color, points) {
		return A6(
			$author$project$Playground$Shape,
			0,
			0,
			0,
			1,
			1,
			A2($author$project$Playground$Polygon, color, points));
	});
var $ianmackenzie$elm_geometry$Point3d$rotateAround = F3(
	function (_v0, _v1, _v2) {
		var axis = _v0.a;
		var angle = _v1.a;
		var p = _v2.a;
		var halfAngle = 0.5 * angle;
		var qw = $elm$core$Basics$cos(halfAngle);
		var sinHalfAngle = $elm$core$Basics$sin(halfAngle);
		var _v3 = axis.originPoint;
		var p0 = _v3.a;
		var deltaX = p.x - p0.x;
		var deltaY = p.y - p0.y;
		var deltaZ = p.z - p0.z;
		var _v4 = axis.direction;
		var d = _v4.a;
		var qx = d.x * sinHalfAngle;
		var wx = qw * qx;
		var xx = qx * qx;
		var qy = d.y * sinHalfAngle;
		var wy = qw * qy;
		var xy = qx * qy;
		var yy = qy * qy;
		var a22 = 1 - (2 * (xx + yy));
		var qz = d.z * sinHalfAngle;
		var wz = qw * qz;
		var a01 = 2 * (xy - wz);
		var a10 = 2 * (xy + wz);
		var xz = qx * qz;
		var a02 = 2 * (xz + wy);
		var a20 = 2 * (xz - wy);
		var yz = qy * qz;
		var a12 = 2 * (yz - wx);
		var a21 = 2 * (yz + wx);
		var zz = qz * qz;
		var a00 = 1 - (2 * (yy + zz));
		var a11 = 1 - (2 * (xx + zz));
		return $ianmackenzie$elm_geometry$Geometry$Types$Point3d(
			{x: ((p0.x + (a00 * deltaX)) + (a01 * deltaY)) + (a02 * deltaZ), y: ((p0.y + (a10 * deltaX)) + (a11 * deltaY)) + (a12 * deltaZ), z: ((p0.z + (a20 * deltaX)) + (a21 * deltaY)) + (a22 * deltaZ)});
	});
var $ianmackenzie$elm_geometry$Polyline3d$rotateAround = F3(
	function (axis, angle, polyline) {
		return A2(
			$ianmackenzie$elm_geometry$Polyline3d$mapVertices,
			A2($ianmackenzie$elm_geometry$Point3d$rotateAround, axis, angle),
			polyline);
	});
var $author$project$Playground3d$rotatePolyline = $ianmackenzie$elm_geometry$Polyline3d$rotateAround;
var $author$project$FloatingTokyoCity$scaleLettersRatio = 4;
var $ianmackenzie$elm_geometry$Point3d$scaleAbout = F3(
	function (_v0, k, _v1) {
		var p0 = _v0.a;
		var p = _v1.a;
		return $ianmackenzie$elm_geometry$Geometry$Types$Point3d(
			{x: p0.x + (k * (p.x - p0.x)), y: p0.y + (k * (p.y - p0.y)), z: p0.z + (k * (p.z - p0.z))});
	});
var $ianmackenzie$elm_geometry$Polyline3d$scaleAbout = F3(
	function (point, scale, polyline) {
		return A2(
			$ianmackenzie$elm_geometry$Polyline3d$mapVertices,
			A2($ianmackenzie$elm_geometry$Point3d$scaleAbout, point, scale),
			polyline);
	});
var $author$project$Playground3d$scalePolyline = $ianmackenzie$elm_geometry$Polyline3d$scaleAbout;
var $author$project$FloatingTokyoCity$shapes = {
	star: _List_fromArray(
		[
			A3($author$project$Playground3d$point, 0, 0, 0),
			A3($author$project$Playground3d$point, 1, 0, 0),
			A3($author$project$Playground3d$point, 1, 0, 1),
			A3($author$project$Playground3d$point, 0, 0, 1)
		])
};
var $author$project$Playground$spin = F2(
	function (period, time) {
		return 360 * A2($author$project$Playground$toFrac, period, time);
	});
var $ianmackenzie$elm_geometry$Vector3d$meters = F3(
	function (x, y, z) {
		return $ianmackenzie$elm_geometry$Geometry$Types$Vector3d(
			{x: x, y: y, z: z});
	});
var $author$project$Playground3d$vector = $ianmackenzie$elm_geometry$Vector3d$meters;
var $ianmackenzie$elm_geometry$Point3d$origin = $ianmackenzie$elm_geometry$Geometry$Types$Point3d(
	{x: 0, y: 0, z: 0});
var $ianmackenzie$elm_geometry$Direction3d$positiveY = $ianmackenzie$elm_geometry$Direction3d$unsafe(
	{x: 0, y: 1, z: 0});
var $ianmackenzie$elm_geometry$Direction3d$y = $ianmackenzie$elm_geometry$Direction3d$positiveY;
var $ianmackenzie$elm_geometry$Axis3d$y = A2($ianmackenzie$elm_geometry$Axis3d$through, $ianmackenzie$elm_geometry$Point3d$origin, $ianmackenzie$elm_geometry$Direction3d$y);
var $ianmackenzie$elm_geometry$Direction3d$z = $ianmackenzie$elm_geometry$Direction3d$positiveZ;
var $ianmackenzie$elm_geometry$Axis3d$z = A2($ianmackenzie$elm_geometry$Axis3d$through, $ianmackenzie$elm_geometry$Point3d$origin, $ianmackenzie$elm_geometry$Direction3d$z);
var $author$project$FloatingTokyoCity$billboard = F4(
	function (model, computer, showAll, fadeValue) {
		var shapesOnBillboard4 = function (shape) {
			return $ianmackenzie$elm_geometry$Polyline3d$vertices(
				A2(
					$author$project$Playground3d$movePolyline,
					A3($author$project$Playground3d$vector, 950, 400, 210 + (400 * fadeValue)),
					A3(
						$author$project$Playground3d$scalePolyline,
						A3($author$project$Playground3d$point, 0, 0, 0),
						fadeValue * 100,
						A3(
							$author$project$Playground3d$rotatePolyline,
							A2(
								$ianmackenzie$elm_geometry$Axis3d$moveTo,
								A3($author$project$Playground3d$point, 0.5, 0, 0.5),
								$ianmackenzie$elm_geometry$Axis3d$y),
							$ianmackenzie$elm_units$Angle$degrees(180 + (fadeValue * 1000)),
							$ianmackenzie$elm_geometry$Polyline3d$fromVertices(shape)))));
		};
		var shapesOnBillboard3 = function (shape) {
			return $ianmackenzie$elm_geometry$Polyline3d$vertices(
				A2(
					$author$project$Playground3d$movePolyline,
					A3($author$project$Playground3d$vector, 950, 400, 210 - (400 * fadeValue)),
					A3(
						$author$project$Playground3d$scalePolyline,
						A3($author$project$Playground3d$point, 0, 0, 0),
						fadeValue * 100,
						A3(
							$author$project$Playground3d$rotatePolyline,
							A2(
								$ianmackenzie$elm_geometry$Axis3d$moveTo,
								A3($author$project$Playground3d$point, 0.5, 0, 0.5),
								$ianmackenzie$elm_geometry$Axis3d$y),
							$ianmackenzie$elm_units$Angle$degrees(180 + (fadeValue * 1000)),
							$ianmackenzie$elm_geometry$Polyline3d$fromVertices(shape)))));
		};
		var shapesOnBillboard2 = function (shape) {
			return $ianmackenzie$elm_geometry$Polyline3d$vertices(
				A2(
					$author$project$Playground3d$movePolyline,
					A3($author$project$Playground3d$vector, 950, 400 - (400 * fadeValue), 210),
					A3(
						$author$project$Playground3d$scalePolyline,
						A3($author$project$Playground3d$point, 0, 0, 0),
						fadeValue * 100,
						A3(
							$author$project$Playground3d$rotatePolyline,
							A2(
								$ianmackenzie$elm_geometry$Axis3d$moveTo,
								A3($author$project$Playground3d$point, 0.5, 0, 0.5),
								$ianmackenzie$elm_geometry$Axis3d$y),
							$ianmackenzie$elm_units$Angle$degrees(180 + (fadeValue * 1000)),
							$ianmackenzie$elm_geometry$Polyline3d$fromVertices(shape)))));
		};
		var shapesOnBillboard = function (shape) {
			return $ianmackenzie$elm_geometry$Polyline3d$vertices(
				A2(
					$author$project$Playground3d$movePolyline,
					A3($author$project$Playground3d$vector, 950, 400 + (400 * fadeValue), 210),
					A3(
						$author$project$Playground3d$scalePolyline,
						A3($author$project$Playground3d$point, 0, 0, 0),
						fadeValue * 100,
						A3(
							$author$project$Playground3d$rotatePolyline,
							A2(
								$ianmackenzie$elm_geometry$Axis3d$moveTo,
								A3($author$project$Playground3d$point, 0.5, 0, 0.5),
								$ianmackenzie$elm_geometry$Axis3d$y),
							$ianmackenzie$elm_units$Angle$degrees(180 - (fadeValue * 1500)),
							$ianmackenzie$elm_geometry$Polyline3d$fromVertices(shape)))));
		};
		var letterOnBillboard = function (letter) {
			return $ianmackenzie$elm_geometry$Polyline3d$vertices(
				A2(
					$author$project$Playground3d$movePolyline,
					A3($author$project$Playground3d$vector, 1000, 400, 210),
					A3(
						$author$project$Playground3d$scalePolyline,
						A3($author$project$Playground3d$point, 0, 0, 0),
						$author$project$FloatingTokyoCity$scaleLettersRatio,
						A3(
							$author$project$Playground3d$rotatePolyline,
							$ianmackenzie$elm_geometry$Axis3d$z,
							$ianmackenzie$elm_units$Angle$degrees(180),
							$ianmackenzie$elm_geometry$Polyline3d$fromVertices(letter)))));
		};
		var fade2 = function () {
			if (showAll) {
				return A4($author$project$Playground$wave, 0.5, 1, 2, computer.time);
			} else {
				var angle = A2($author$project$Playground$spin, 1, computer.time) + A2($author$project$Playground$spin, 7, computer.time);
				return ((angle < 20) || (((35 < angle) && (angle < 100)) || ((150 < angle) && (angle < 170)))) ? 0.2 : 1;
			}
		}();
		return _List_fromArray(
			[
				A2(
				$author$project$Playground$fade,
				showAll ? fade2 : 0.1,
				A2(
					$author$project$Playground$fade,
					fade2,
					A2(
						$author$project$Playground$polygon,
						function ($) {
							return $.elm;
						}(
							$author$project$FloatingTokyoCity$palette(model.timeOfDay)),
						A3(
							$author$project$Playground3d$from3dTo2d,
							model,
							computer,
							letterOnBillboard($author$project$FloatingTokyoCity$letters.e))))),
				A2(
				$author$project$Playground$fade,
				fade2,
				A2(
					$author$project$Playground$polygon,
					function ($) {
						return $.elm;
					}(
						$author$project$FloatingTokyoCity$palette(model.timeOfDay)),
					A3(
						$author$project$Playground3d$from3dTo2d,
						model,
						computer,
						letterOnBillboard($author$project$FloatingTokyoCity$letters.l)))),
				A2(
				$author$project$Playground$fade,
				fade2,
				A2(
					$author$project$Playground$polygon,
					function ($) {
						return $.elm;
					}(
						$author$project$FloatingTokyoCity$palette(model.timeOfDay)),
					A3(
						$author$project$Playground3d$from3dTo2d,
						model,
						computer,
						letterOnBillboard($author$project$FloatingTokyoCity$letters.m)))),
				A2(
				$author$project$Playground$fade,
				1 - fadeValue,
				A2(
					$author$project$Playground$polygon,
					$author$project$Playground$yellow,
					A3(
						$author$project$Playground3d$from3dTo2d,
						model,
						computer,
						shapesOnBillboard($author$project$FloatingTokyoCity$shapes.star)))),
				A2(
				$author$project$Playground$fade,
				1 - fadeValue,
				A2(
					$author$project$Playground$polygon,
					$author$project$Playground$lightBlue,
					A3(
						$author$project$Playground3d$from3dTo2d,
						model,
						computer,
						shapesOnBillboard2($author$project$FloatingTokyoCity$shapes.star)))),
				A2(
				$author$project$Playground$fade,
				1 - fadeValue,
				A2(
					$author$project$Playground$polygon,
					$author$project$Playground$lightGreen,
					A3(
						$author$project$Playground3d$from3dTo2d,
						model,
						computer,
						shapesOnBillboard3($author$project$FloatingTokyoCity$shapes.star)))),
				A2(
				$author$project$Playground$fade,
				1 - fadeValue,
				A2(
					$author$project$Playground$polygon,
					$author$project$Playground$lightRed,
					A3(
						$author$project$Playground3d$from3dTo2d,
						model,
						computer,
						shapesOnBillboard4($author$project$FloatingTokyoCity$shapes.star))))
			]);
	});
var $author$project$Playground$Group = function (a) {
	return {$: 'Group', a: a};
};
var $author$project$Playground$group = function (shapes) {
	return A6(
		$author$project$Playground$Shape,
		0,
		0,
		0,
		1,
		1,
		$author$project$Playground$Group(shapes));
};
var $author$project$Playground$moveY = F2(
	function (dy, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		var a = _v0.c;
		var s = _v0.d;
		var o = _v0.e;
		var f = _v0.f;
		return A6($author$project$Playground$Shape, x, y + dy, a, s, o, f);
	});
var $author$project$Playground$moveUp = $author$project$Playground$moveY;
var $author$project$Playground$black = $author$project$Playground$Hex('#000000');
var $author$project$Playground$charcoal = $author$project$Playground$Hex('#555753');
var $author$project$Playground3d$cuboid = F5(
	function (model, computer, pos, size, color) {
		var sideB = _List_fromArray(
			[
				A3($author$project$Playground3d$point, pos.x, pos.y + size.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z + size.z),
				A3($author$project$Playground3d$point, pos.x, pos.y + size.y, pos.z + size.z)
			]);
		var sideA = _List_fromArray(
			[
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z + size.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y, pos.z + size.z)
			]);
		return _List_fromArray(
			[
				A2(
				$author$project$Playground$polygon,
				color.a,
				A3($author$project$Playground3d$from3dTo2d, model, computer, sideA)),
				A2(
				$author$project$Playground$polygon,
				color.b,
				A3($author$project$Playground3d$from3dTo2d, model, computer, sideB))
			]);
	});
var $author$project$Playground$darkCharcoal = $author$project$Playground$Hex('#2e3436');
var $elm$core$Basics$degrees = function (angleInDegrees) {
	return (angleInDegrees * $elm$core$Basics$pi) / 180;
};
var $author$project$FloatingTokyoCity$crow = F4(
	function (model, computer, delta, cycle) {
		return A5(
			$author$project$Playground3d$cuboid,
			model,
			computer,
			{
				x: (500 + delta.x) + (500 * $elm$core$Basics$sin(
					$elm$core$Basics$degrees(
						A2($author$project$Playground$spin, 43, computer.time)))),
				y: (500 + delta.y) + (500 * $elm$core$Basics$cos(
					$elm$core$Basics$degrees(
						A2($author$project$Playground$spin, 47, computer.time)))),
				z: A4($author$project$Playground$wave, 300, 400, cycle, computer.time)
			},
			{x: 5, y: 5, z: 5},
			{a: $author$project$Playground$darkCharcoal, b: $author$project$Playground$charcoal});
	});
var $author$project$FloatingTokyoCity$crowsFlock = F2(
	function (model, computer) {
		return _List_fromArray(
			[
				A2(
				$author$project$Playground$fade,
				0.3,
				$author$project$Playground$group(
					_Utils_ap(
						A4(
							$author$project$FloatingTokyoCity$crow,
							model,
							computer,
							{x: 0, y: 0, z: 0},
							18),
						_Utils_ap(
							A4(
								$author$project$FloatingTokyoCity$crow,
								model,
								computer,
								{x: 25, y: 0, z: 0},
								19),
							_Utils_ap(
								A4(
									$author$project$FloatingTokyoCity$crow,
									model,
									computer,
									{x: 25, y: 25, z: 0},
									20),
								_Utils_ap(
									A4(
										$author$project$FloatingTokyoCity$crow,
										model,
										computer,
										{x: 0, y: 25, z: 0},
										21),
									_Utils_ap(
										A4(
											$author$project$FloatingTokyoCity$crow,
											model,
											computer,
											{x: 50, y: 0, z: 0},
											22),
										_Utils_ap(
											A4(
												$author$project$FloatingTokyoCity$crow,
												model,
												computer,
												{x: 50, y: 50, z: 0},
												23),
											A4(
												$author$project$FloatingTokyoCity$crow,
												model,
												computer,
												{x: 0, y: 50, z: 0},
												24)))))))))
			]);
	});
var $author$project$FloatingTokyoCity$easeOutQuart = function (t) {
	return t * (2 - t);
};
var $author$project$FloatingTokyoCity$startFading = function (gameState) {
	if (gameState.$ === 'Playing') {
		var fadeValue = gameState.a;
		return fadeValue;
	} else {
		return 1;
	}
};
var $author$project$FloatingTokyoCity$extraHeight1 = function (gameState) {
	var fade_ = $author$project$FloatingTokyoCity$startFading(gameState);
	return (1 - $author$project$FloatingTokyoCity$easeOutQuart(fade_)) * 1500;
};
var $elm$core$Basics$pow = _Basics_pow;
var $author$project$FloatingTokyoCity$easeOutQuart2 = function (t) {
	return A2($elm$core$Basics$pow, t, 1.1) * (2 - t);
};
var $author$project$FloatingTokyoCity$extraHeight2 = function (gameState) {
	var fade_ = $author$project$FloatingTokyoCity$startFading(gameState);
	return (1 - $author$project$FloatingTokyoCity$easeOutQuart2(fade_)) * 1500;
};
var $author$project$FloatingTokyoCity$easeOutQuart3 = function (t) {
	return A2($elm$core$Basics$pow, t, 1.2) * (2 - t);
};
var $author$project$FloatingTokyoCity$extraHeight3 = function (gameState) {
	var fade_ = $author$project$FloatingTokyoCity$startFading(gameState);
	return (1 - $author$project$FloatingTokyoCity$easeOutQuart3(fade_)) * 1500;
};
var $author$project$Playground3d$cuboidExtra = F6(
	function (model, computer, extraHeight, pos, size, color) {
		var sideB = _List_fromArray(
			[
				A3($author$project$Playground3d$point, pos.x, pos.y + size.y, pos.z + extraHeight),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z + extraHeight),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, (pos.z + extraHeight) + size.z),
				A3($author$project$Playground3d$point, pos.x, pos.y + size.y, (pos.z + extraHeight) + size.z)
			]);
		var sideA = _List_fromArray(
			[
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y, pos.z + extraHeight),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z + extraHeight),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, (pos.z + extraHeight) + size.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y, (pos.z + extraHeight) + size.z)
			]);
		return _List_fromArray(
			[
				A2(
				$author$project$Playground$polygon,
				color.a,
				A3($author$project$Playground3d$from3dTo2d, model, computer, sideA)),
				A2(
				$author$project$Playground$polygon,
				color.b,
				A3($author$project$Playground3d$from3dTo2d, model, computer, sideB))
			]);
	});
var $ianmackenzie$elm_geometry$Point3d$xCoordinate = function (_v0) {
	var p = _v0.a;
	return $ianmackenzie$elm_units$Quantity$Quantity(p.x);
};
var $ianmackenzie$elm_geometry$Point3d$yCoordinate = function (_v0) {
	var p = _v0.a;
	return $ianmackenzie$elm_units$Quantity$Quantity(p.y);
};
var $ianmackenzie$elm_geometry$Point3d$zCoordinate = function (_v0) {
	var p = _v0.a;
	return $ianmackenzie$elm_units$Quantity$Quantity(p.z);
};
var $ianmackenzie$elm_geometry$Point3d$toRecord = F2(
	function (fromQuantity, point) {
		return {
			x: fromQuantity(
				$ianmackenzie$elm_geometry$Point3d$xCoordinate(point)),
			y: fromQuantity(
				$ianmackenzie$elm_geometry$Point3d$yCoordinate(point)),
			z: fromQuantity(
				$ianmackenzie$elm_geometry$Point3d$zCoordinate(point))
		};
	});
var $author$project$Playground3d$move3d = F2(
	function (displacement, point_) {
		return A2(
			$ianmackenzie$elm_geometry$Point3d$toRecord,
			$ianmackenzie$elm_units$Length$inMeters,
			A2($ianmackenzie$elm_geometry$Point3d$translateBy, displacement, point_));
	});
var $author$project$Playground3d$piramid = F5(
	function (model, computer, pos, size, color) {
		var sideB = _List_fromArray(
			[
				A3($author$project$Playground3d$point, pos.x, pos.y + size.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + (size.x / 2), (pos.y + size.y) - (size.x / 2), pos.z + size.z)
			]);
		var sideA = _List_fromArray(
			[
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z),
				A3($author$project$Playground3d$point, (pos.x + size.x) - (size.y / 2), pos.y + (size.y / 2), pos.z + size.z)
			]);
		return _List_fromArray(
			[
				A2(
				$author$project$Playground$polygon,
				color.a,
				A3($author$project$Playground3d$from3dTo2d, model, computer, sideA)),
				A2(
				$author$project$Playground$polygon,
				color.b,
				A3($author$project$Playground3d$from3dTo2d, model, computer, sideB))
			]);
	});
var $author$project$FloatingTokyoCity$hyattPark = F3(
	function (model, computer, vector_) {
		return _Utils_ap(
			A5(
				$author$project$Playground3d$piramid,
				model,
				computer,
				A2(
					$author$project$Playground3d$move3d,
					vector_,
					A3(
						$author$project$Playground3d$point,
						0,
						0,
						500 + $author$project$FloatingTokyoCity$extraHeight1(model.gameState))),
				{x: 50, y: 50, z: 50},
				function ($) {
					return $.buildingBrown;
				}(
					$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
			_Utils_ap(
				A5(
					$author$project$Playground3d$piramid,
					model,
					computer,
					A2(
						$author$project$Playground3d$move3d,
						vector_,
						A3(
							$author$project$Playground3d$point,
							0,
							100,
							550 + $author$project$FloatingTokyoCity$extraHeight2(model.gameState))),
					{x: 50, y: 50, z: 50},
					function ($) {
						return $.buildingBrown;
					}(
						$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
				_Utils_ap(
					A5(
						$author$project$Playground3d$piramid,
						model,
						computer,
						A2(
							$author$project$Playground3d$move3d,
							vector_,
							A3(
								$author$project$Playground3d$point,
								0,
								200,
								600 + $author$project$FloatingTokyoCity$extraHeight3(model.gameState))),
						{x: 50, y: 50, z: 50},
						function ($) {
							return $.buildingBrown;
						}(
							$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
					_Utils_ap(
						A6(
							$author$project$Playground3d$cuboidExtra,
							model,
							computer,
							0,
							A2(
								$author$project$Playground3d$move3d,
								vector_,
								A3(
									$author$project$Playground3d$point,
									0,
									0,
									$author$project$FloatingTokyoCity$extraHeight1(model.gameState))),
							{x: 70, y: 70, z: 500},
							function ($) {
								return $.buildingBrown;
							}(
								$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
						_Utils_ap(
							A5(
								$author$project$Playground3d$cuboid,
								model,
								computer,
								A2(
									$author$project$Playground3d$move3d,
									vector_,
									A3(
										$author$project$Playground3d$point,
										0,
										100,
										$author$project$FloatingTokyoCity$extraHeight2(model.gameState))),
								{x: 70, y: 70, z: 550},
								function ($) {
									return $.buildingBrown;
								}(
									$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
							A5(
								$author$project$Playground3d$cuboid,
								model,
								computer,
								A2(
									$author$project$Playground3d$move3d,
									vector_,
									A3(
										$author$project$Playground3d$point,
										0,
										200,
										$author$project$FloatingTokyoCity$extraHeight3(model.gameState))),
								{x: 70, y: 70, z: 600},
								function ($) {
									return $.buildingBrown;
								}(
									$author$project$FloatingTokyoCity$palette(model.timeOfDay))))))));
	});
var $author$project$FloatingTokyoCity$isGameOver = function (gameState) {
	if (gameState.$ === 'GameOver') {
		return true;
	} else {
		return false;
	}
};
var $author$project$Playground3d$redLight = F4(
	function (day, model, computer, pos) {
		var size = {x: 20, y: 20, z: 15};
		var sideA = _List_fromArray(
			[
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y + size.y, pos.z + size.z),
				A3($author$project$Playground3d$point, pos.x + size.x, pos.y, pos.z + size.z)
			]);
		return day ? _List_Nil : _List_fromArray(
			[
				A2(
				$author$project$Playground$fade,
				A4($author$project$Playground$wave, 0, 1, 2, computer.time),
				A2(
					$author$project$Playground$polygon,
					$author$project$Playground$red,
					A3($author$project$Playground3d$from3dTo2d, model, computer, sideA)))
			]);
	});
var $author$project$FloatingTokyoCity$landmarkTower = F3(
	function (model, computer, vector_) {
		return _Utils_ap(
			A5(
				$author$project$Playground3d$piramid,
				model,
				computer,
				A2(
					$author$project$Playground3d$move3d,
					vector_,
					A3($author$project$Playground3d$point, 0, 0, 0)),
				{x: 200, y: 200, z: 600},
				function ($) {
					return $.buildingDistant;
				}(
					$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
			_Utils_ap(
				A5(
					$author$project$Playground3d$cuboid,
					model,
					computer,
					A2(
						$author$project$Playground3d$move3d,
						vector_,
						A3($author$project$Playground3d$point, 50, 50, 0)),
					{x: 100, y: 100, z: 600},
					function ($) {
						return $.buildingDistant;
					}(
						$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
				A4(
					$author$project$Playground3d$redLight,
					_Utils_eq(model.timeOfDay, $author$project$FloatingTokyoCity$Day),
					model,
					computer,
					A2(
						$author$project$Playground3d$move3d,
						vector_,
						A3($author$project$Playground3d$point, 70, 50, 610)))));
	});
var $author$project$FloatingTokyoCity$metropolitanBuilding = F3(
	function (model, computer, vector_) {
		return _Utils_ap(
			A5(
				$author$project$Playground3d$cuboid,
				model,
				computer,
				A2(
					$author$project$Playground3d$move3d,
					vector_,
					A3($author$project$Playground3d$point, 0, 0, 0)),
				{x: 70, y: 70, z: 600},
				function ($) {
					return $.buildingMetropolitan;
				}(
					$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
			_Utils_ap(
				A5(
					$author$project$Playground3d$cuboid,
					model,
					computer,
					A2(
						$author$project$Playground3d$move3d,
						vector_,
						A3($author$project$Playground3d$point, 70, 0, 0)),
					{x: 80, y: 50, z: 450},
					function ($) {
						return $.buildingMetropolitan;
					}(
						$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
				_Utils_ap(
					A5(
						$author$project$Playground3d$cuboid,
						model,
						computer,
						A2(
							$author$project$Playground3d$move3d,
							vector_,
							A3($author$project$Playground3d$point, 150, 0, 0)),
						{x: 70, y: 70, z: 600},
						function ($) {
							return $.buildingMetropolitan;
						}(
							$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
					A4(
						$author$project$Playground3d$redLight,
						_Utils_eq(model.timeOfDay, $author$project$FloatingTokyoCity$Day),
						model,
						computer,
						A2(
							$author$project$Playground3d$move3d,
							vector_,
							A3($author$project$Playground3d$point, 158, 10, 610))))));
	});
var $author$project$Playground$moveDown = F2(
	function (dy, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		var a = _v0.c;
		var s = _v0.d;
		var o = _v0.e;
		var f = _v0.f;
		return A6($author$project$Playground$Shape, x, y - dy, a, s, o, f);
	});
var $author$project$FloatingTokyoCity$nttTower = F3(
	function (model, computer, vector_) {
		return _Utils_ap(
			A5(
				$author$project$Playground3d$cuboid,
				model,
				computer,
				A2(
					$author$project$Playground3d$move3d,
					vector_,
					A3($author$project$Playground3d$point, 40, 40, 490)),
				{x: 10, y: 10, z: 100},
				function ($) {
					return $.buildingMetropolitan;
				}(
					$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
			_Utils_ap(
				A5(
					$author$project$Playground3d$cuboid,
					model,
					computer,
					A2(
						$author$project$Playground3d$move3d,
						vector_,
						A3($author$project$Playground3d$point, 0, 0, 480)),
					{x: 30, y: 30, z: 30},
					function ($) {
						return $.buildingNTT;
					}(
						$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
				_Utils_ap(
					A5(
						$author$project$Playground3d$cuboid,
						model,
						computer,
						A2(
							$author$project$Playground3d$move3d,
							vector_,
							A3($author$project$Playground3d$point, 0, 0, 450)),
						{x: 50, y: 50, z: 30},
						function ($) {
							return $.buildingNTT;
						}(
							$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
					_Utils_ap(
						A5(
							$author$project$Playground3d$cuboid,
							model,
							computer,
							A2(
								$author$project$Playground3d$move3d,
								vector_,
								A3($author$project$Playground3d$point, 0, 0, 400)),
							{x: 60, y: 60, z: 50},
							function ($) {
								return $.buildingNTT;
							}(
								$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
						_Utils_ap(
							A5(
								$author$project$Playground3d$cuboid,
								model,
								computer,
								A2(
									$author$project$Playground3d$move3d,
									vector_,
									A3($author$project$Playground3d$point, 0, 0, 0)),
								{x: 80, y: 80, z: 400},
								function ($) {
									return $.buildingNTT;
								}(
									$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
							A4(
								$author$project$Playground3d$redLight,
								_Utils_eq(model.timeOfDay, $author$project$FloatingTokyoCity$Day),
								model,
								computer,
								{x: 80, y: 90, z: 580}))))));
	});
var $author$project$FloatingTokyoCity$rotatingCrane = F4(
	function (model, computer, isGameOver_, vector_) {
		var scaleCraneRatio = 1.2;
		var position = {x: 800, y: 400, z: 0};
		var interactiveData_ = isGameOver_ ? {angle: 0, letterEHorizontal: 0, letterEVertical: 0} : $author$project$FloatingTokyoCity$interactiveData(computer);
		var letterOnCrane = function (letter) {
			return $ianmackenzie$elm_geometry$Polyline3d$vertices(
				A2(
					$author$project$Playground3d$movePolyline,
					A3($author$project$Playground3d$vector, 0, 0, interactiveData_.letterEVertical),
					A2(
						$author$project$Playground3d$movePolyline,
						A3($author$project$Playground3d$vector, interactiveData_.letterEHorizontal, 0, 0),
						A2(
							$author$project$Playground3d$movePolyline,
							A3($author$project$Playground3d$vector, 215, 0, 210 - (12 * $author$project$FloatingTokyoCity$scaleLettersRatio)),
							A3(
								$author$project$Playground3d$scalePolyline,
								A3($author$project$Playground3d$point, 0, 0, 0),
								$author$project$FloatingTokyoCity$scaleLettersRatio / scaleCraneRatio,
								A3(
									$author$project$Playground3d$rotatePolyline,
									A2(
										$ianmackenzie$elm_geometry$Axis3d$moveTo,
										A3($author$project$Playground3d$point, 4, 0, 0),
										$ianmackenzie$elm_geometry$Axis3d$z),
									$ianmackenzie$elm_units$Angle$degrees(
										A2($author$project$Playground$spin, 2, computer.time)),
									$ianmackenzie$elm_geometry$Polyline3d$fromVertices(letter)))))));
		};
		var craneRope = function (height) {
			return _List_fromArray(
				[
					A3($author$project$Playground3d$point, 230, -2, 300),
					A3($author$project$Playground3d$point, 230, 2, 300),
					A3($author$project$Playground3d$point, 230, 2, height),
					A3($author$project$Playground3d$point, 230, -2, height)
				]);
		};
		var ropeProcessing = $ianmackenzie$elm_geometry$Polyline3d$vertices(
			A2(
				$author$project$Playground3d$movePolyline,
				A3($author$project$Playground3d$vector, interactiveData_.letterEHorizontal, 0, 0),
				$ianmackenzie$elm_geometry$Polyline3d$fromVertices(
					craneRope(200 + interactiveData_.letterEVertical))));
		var craneHorizontalPartVertical = _List_fromArray(
			[
				A3($author$project$Playground3d$point, -30, 0, 300),
				A3($author$project$Playground3d$point, -30, 0, 310),
				A3($author$project$Playground3d$point, 250, 0, 310),
				A3($author$project$Playground3d$point, 250, 0, 300)
			]);
		var craneHorizontalPart = _List_fromArray(
			[
				A3($author$project$Playground3d$point, -30, -5, 300),
				A3($author$project$Playground3d$point, -30, 5, 300),
				A3($author$project$Playground3d$point, 250, 5, 300),
				A3($author$project$Playground3d$point, 250, -5, 300)
			]);
		var angleDegrees = $ianmackenzie$elm_units$Angle$degrees(interactiveData_.angle);
		var craneProcessing = function (polyline_) {
			return $ianmackenzie$elm_geometry$Polyline3d$vertices(
				A2(
					$author$project$Playground3d$movePolyline,
					A3($author$project$Playground3d$vector, position.x, position.y, position.z),
					A3(
						$author$project$Playground3d$scalePolyline,
						A3($author$project$Playground3d$point, 0, 0, 0),
						scaleCraneRatio,
						A3(
							$author$project$Playground3d$rotatePolyline,
							$ianmackenzie$elm_geometry$Axis3d$z,
							angleDegrees,
							$ianmackenzie$elm_geometry$Polyline3d$fromVertices(polyline_)))));
		};
		return _Utils_ap(
			A5(
				$author$project$Playground3d$cuboid,
				model,
				computer,
				A2(
					$author$project$Playground3d$move3d,
					vector_,
					A3($author$project$Playground3d$point, position.x, position.y, position.z)),
				{x: 10, y: 10, z: 400},
				{a: $author$project$Playground$lightRed, b: $author$project$Playground$darkRed}),
			_Utils_ap(
				_List_fromArray(
					[
						A2(
						$author$project$Playground$polygon,
						$author$project$Playground$darkRed,
						A3(
							$author$project$Playground3d$from3dTo2d,
							model,
							computer,
							craneProcessing(craneHorizontalPart))),
						A2(
						$author$project$Playground$polygon,
						$author$project$Playground$darkRed,
						A3(
							$author$project$Playground3d$from3dTo2d,
							model,
							computer,
							craneProcessing(craneHorizontalPartVertical))),
						A2(
						$author$project$Playground$fade,
						0.1,
						A2(
							$author$project$Playground$polygon,
							$author$project$Playground$black,
							A3(
								$author$project$Playground3d$from3dTo2d,
								model,
								computer,
								craneProcessing(ropeProcessing))))
					]),
				isGameOver_ ? _List_Nil : _List_fromArray(
					[
						A2(
						$author$project$Playground$polygon,
						function ($) {
							return $.elm;
						}(
							$author$project$FloatingTokyoCity$palette(model.timeOfDay)),
						A3(
							$author$project$Playground3d$from3dTo2d,
							model,
							computer,
							craneProcessing(
								letterOnCrane($author$project$FloatingTokyoCity$letters.e))))
					])));
	});
var $author$project$Playground$scale = F2(
	function (ns, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		var a = _v0.c;
		var s = _v0.d;
		var o = _v0.e;
		var f = _v0.f;
		return A6($author$project$Playground$Shape, x, y, a, s * ns, o, f);
	});
var $author$project$FloatingTokyoCity$sumidaTower = F3(
	function (model, computer, vector_) {
		var fade1 = _Utils_eq(model.timeOfDay, $author$project$FloatingTokyoCity$Night) ? A4($author$project$Playground$zigzag, 0.2, 1, 3, computer.time) : 1;
		return _Utils_ap(
			A5(
				$author$project$Playground3d$piramid,
				model,
				computer,
				A2(
					$author$project$Playground3d$move3d,
					vector_,
					A3($author$project$Playground3d$point, 0, 0, 0)),
				{x: 80, y: 80, z: 500},
				function ($) {
					return $.buildingDistant;
				}(
					$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
			_Utils_ap(
				_List_fromArray(
					[
						A2(
						$author$project$Playground$fade,
						fade1,
						$author$project$Playground$group(
							A5(
								$author$project$Playground3d$cuboid,
								model,
								computer,
								A2(
									$author$project$Playground3d$move3d,
									vector_,
									A3($author$project$Playground3d$point, 20, 20, 300)),
								{x: 40, y: 40, z: 40},
								function ($) {
									return $.buildingDistantLight;
								}(
									$author$project$FloatingTokyoCity$palette(model.timeOfDay)))))
					]),
				_Utils_ap(
					_List_fromArray(
						[
							A2(
							$author$project$Playground$fade,
							fade1,
							$author$project$Playground$group(
								A5(
									$author$project$Playground3d$cuboid,
									model,
									computer,
									A2(
										$author$project$Playground3d$move3d,
										vector_,
										A3($author$project$Playground3d$point, 25, 25, 400)),
									{x: 30, y: 30, z: 30},
									function ($) {
										return $.buildingDistantLight;
									}(
										$author$project$FloatingTokyoCity$palette(model.timeOfDay)))))
						]),
					A5(
						$author$project$Playground3d$cuboid,
						model,
						computer,
						A2(
							$author$project$Playground3d$move3d,
							vector_,
							A3($author$project$Playground3d$point, 35, 35, 450)),
						{x: 10, y: 10, z: 100},
						function ($) {
							return $.buildingDistant;
						}(
							$author$project$FloatingTokyoCity$palette(model.timeOfDay))))));
	});
var $author$project$FloatingTokyoCity$surface = F2(
	function (model, computer) {
		return _List_fromArray(
			[
				A2(
				$author$project$Playground$polygon,
				$author$project$Playground$lightOrange,
				A3(
					$author$project$Playground3d$from3dTo2d,
					model,
					computer,
					_List_fromArray(
						[
							A3($author$project$Playground3d$point, 0, 0, 0),
							A3($author$project$Playground3d$point, 1000, 0, 0),
							A3($author$project$Playground3d$point, 1000, 1000, 0),
							A3($author$project$Playground3d$point, 0, 1000, 0)
						])))
			]);
	});
var $author$project$Playground$grey = $author$project$Playground$Hex('#d3d7cf');
var $author$project$FloatingTokyoCity$tokyoTower = F3(
	function (model, computer, vector_) {
		return _Utils_ap(
			A5(
				$author$project$Playground3d$piramid,
				model,
				computer,
				A2(
					$author$project$Playground3d$move3d,
					vector_,
					A3($author$project$Playground3d$point, 0, 0, 0)),
				{x: 100, y: 100, z: 300},
				{a: $author$project$Playground$lightRed, b: $author$project$Playground$darkRed}),
			_Utils_ap(
				A5(
					$author$project$Playground3d$cuboid,
					model,
					computer,
					A2(
						$author$project$Playground3d$move3d,
						vector_,
						A3($author$project$Playground3d$point, 25, 25, 200)),
					{x: 50, y: 50, z: 20},
					{a: $author$project$Playground$lightGray, b: $author$project$Playground$grey}),
				_Utils_ap(
					A5(
						$author$project$Playground3d$piramid,
						model,
						computer,
						A2(
							$author$project$Playground3d$move3d,
							vector_,
							A3($author$project$Playground3d$point, 35, 35, 220)),
						{x: 30, y: 30, z: 200},
						{a: $author$project$Playground$lightRed, b: $author$project$Playground$darkRed}),
					_Utils_ap(
						A5(
							$author$project$Playground3d$cuboid,
							model,
							computer,
							A2(
								$author$project$Playground3d$move3d,
								vector_,
								A3($author$project$Playground3d$point, 45, 45, 350)),
							{x: 10, y: 10, z: 50},
							{a: $author$project$Playground$lightGray, b: $author$project$Playground$grey}),
						A5(
							$author$project$Playground3d$cuboid,
							model,
							computer,
							A2(
								$author$project$Playground3d$move3d,
								vector_,
								A3($author$project$Playground3d$point, 45, 45, 400)),
							{x: 10, y: 10, z: 50},
							{a: $author$project$Playground$lightRed, b: $author$project$Playground$darkRed})))));
	});
var $author$project$Playground$darkGray = $author$project$Playground$Hex('#babdb6');
var $author$project$FloatingTokyoCity$train = F3(
	function (model, computer, vector_) {
		var trainPosition = (A4($author$project$Playground$wave, 100, 900, 40, computer.time) < 500) ? A4($author$project$Playground$wave, 100, 900, 20, computer.time) : 100;
		return _Utils_ap(
			A5(
				$author$project$Playground3d$cuboid,
				model,
				computer,
				A2(
					$author$project$Playground3d$move3d,
					vector_,
					A3($author$project$Playground3d$point, 200, 0, 0)),
				{x: 20, y: 20, z: 80},
				{a: $author$project$Playground$darkGray, b: $author$project$Playground$charcoal}),
			_Utils_ap(
				A5(
					$author$project$Playground3d$cuboid,
					model,
					computer,
					A2(
						$author$project$Playground3d$move3d,
						vector_,
						A3($author$project$Playground3d$point, 400, 0, 0)),
					{x: 20, y: 20, z: 80},
					{a: $author$project$Playground$darkGray, b: $author$project$Playground$charcoal}),
				_Utils_ap(
					A5(
						$author$project$Playground3d$cuboid,
						model,
						computer,
						A2(
							$author$project$Playground3d$move3d,
							vector_,
							A3($author$project$Playground3d$point, 600, 0, 0)),
						{x: 20, y: 20, z: 80},
						{a: $author$project$Playground$darkGray, b: $author$project$Playground$charcoal}),
					_Utils_ap(
						A5(
							$author$project$Playground3d$cuboid,
							model,
							computer,
							A2(
								$author$project$Playground3d$move3d,
								vector_,
								A3($author$project$Playground3d$point, 800, 0, 0)),
							{x: 20, y: 20, z: 80},
							{a: $author$project$Playground$darkGray, b: $author$project$Playground$charcoal}),
						_Utils_ap(
							A5(
								$author$project$Playground3d$cuboid,
								model,
								computer,
								A2(
									$author$project$Playground3d$move3d,
									vector_,
									A3($author$project$Playground3d$point, 100, 0, 70)),
								{x: 900, y: 10, z: 10},
								{a: $author$project$Playground$darkGray, b: $author$project$Playground$charcoal}),
							A5(
								$author$project$Playground3d$cuboid,
								model,
								computer,
								A2(
									$author$project$Playground3d$move3d,
									vector_,
									A3($author$project$Playground3d$point, trainPosition, 0, 80)),
								{x: 50, y: 10, z: 10},
								{a: $author$project$Playground$red, b: $author$project$Playground$darkRed}))))));
	});
var $author$project$Playground$Words = F2(
	function (a, b) {
		return {$: 'Words', a: a, b: b};
	});
var $author$project$Playground$words = F2(
	function (color, string) {
		return A6(
			$author$project$Playground$Shape,
			0,
			0,
			0,
			1,
			1,
			A2($author$project$Playground$Words, color, string));
	});
var $author$project$FloatingTokyoCity$viewGame = F3(
	function (computer, model, fadeValue) {
		return _List_fromArray(
			[
				A2(
				$author$project$Playground$fade,
				fadeValue,
				$author$project$Playground$group(
					_List_fromArray(
						[
							A2(
							$author$project$Playground$moveUp,
							180,
							$author$project$Playground$group(
								_Utils_ap(
									A2($author$project$FloatingTokyoCity$surface, model, computer),
									_Utils_ap(
										A5(
											$author$project$Playground3d$piramid,
											model,
											computer,
											{x: -1500, y: -1500, z: 0},
											{x: 1500, y: 1500, z: 500},
											function ($) {
												return $.fuji;
											}(
												$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
										_Utils_ap(
											A5(
												$author$project$Playground3d$piramid,
												model,
												computer,
												{x: -1000, y: -1000, z: 334},
												{x: 500, y: 500, z: 166},
												function ($) {
													return $.fujiSnow;
												}(
													$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
											_Utils_ap(
												A3(
													$author$project$FloatingTokyoCity$landmarkTower,
													model,
													computer,
													A3(
														$author$project$Playground3d$vector,
														0,
														-1000,
														$author$project$FloatingTokyoCity$extraHeight2(model.gameState))),
												_Utils_ap(
													A3(
														$author$project$FloatingTokyoCity$nttTower,
														model,
														computer,
														A3(
															$author$project$Playground3d$vector,
															0,
															0,
															$author$project$FloatingTokyoCity$extraHeight2(model.gameState))),
													_Utils_ap(
														A3(
															$author$project$FloatingTokyoCity$metropolitanBuilding,
															model,
															computer,
															A3(
																$author$project$Playground3d$vector,
																200,
																0,
																$author$project$FloatingTokyoCity$extraHeight1(model.gameState))),
														_Utils_ap(
															A3(
																$author$project$FloatingTokyoCity$sumidaTower,
																model,
																computer,
																A3(
																	$author$project$Playground3d$vector,
																	-1000,
																	0,
																	$author$project$FloatingTokyoCity$extraHeight3(model.gameState))),
															_Utils_ap(
																A3(
																	$author$project$FloatingTokyoCity$hyattPark,
																	model,
																	computer,
																	A3($author$project$Playground3d$vector, 0, 300, 0)),
																_Utils_ap(
																	A3(
																		$author$project$FloatingTokyoCity$tokyoTower,
																		model,
																		computer,
																		A3(
																			$author$project$Playground3d$vector,
																			400,
																			500,
																			$author$project$FloatingTokyoCity$extraHeight2(model.gameState))),
																	_Utils_ap(
																		A5(
																			$author$project$Playground3d$cuboid,
																			model,
																			computer,
																			{
																				x: 900,
																				y: 0,
																				z: $author$project$FloatingTokyoCity$extraHeight1(model.gameState)
																			},
																			{x: 100, y: 200, z: 100},
																			function ($) {
																				return $.buildingPurpleOrange;
																			}(
																				$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																		_Utils_ap(
																			A5(
																				$author$project$Playground3d$cuboid,
																				model,
																				computer,
																				{
																					x: 0,
																					y: 900,
																					z: $author$project$FloatingTokyoCity$extraHeight2(model.gameState)
																				},
																				{x: 100, y: 100, z: 100},
																				function ($) {
																					return $.buildingPurpleOrange;
																				}(
																					$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																			_Utils_ap(
																				A5(
																					$author$project$Playground3d$cuboid,
																					model,
																					computer,
																					{
																						x: 900,
																						y: 300,
																						z: $author$project$FloatingTokyoCity$extraHeight3(model.gameState)
																					},
																					{x: 100, y: 100, z: 200},
																					function ($) {
																						return $.buildingYellowGreen;
																					}(
																						$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																				_Utils_ap(
																					A4(
																						$author$project$FloatingTokyoCity$rotatingCrane,
																						model,
																						computer,
																						$author$project$FloatingTokyoCity$isGameOver(model.gameState),
																						A3($author$project$Playground3d$vector, 0, 0, 0)),
																					_Utils_ap(
																						A4(
																							$author$project$FloatingTokyoCity$billboard,
																							model,
																							computer,
																							$author$project$FloatingTokyoCity$isGameOver(model.gameState),
																							0),
																						_Utils_ap(
																							A5(
																								$author$project$Playground3d$cuboid,
																								model,
																								computer,
																								{
																									x: 900,
																									y: 550,
																									z: $author$project$FloatingTokyoCity$extraHeight2(model.gameState)
																								},
																								{x: 150, y: 50, z: 100},
																								function ($) {
																									return $.buildingNTT;
																								}(
																									$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																							_Utils_ap(
																								A5(
																									$author$project$Playground3d$cuboid,
																									model,
																									computer,
																									{
																										x: 900,
																										y: 600,
																										z: $author$project$FloatingTokyoCity$extraHeight3(model.gameState)
																									},
																									{x: 100, y: 100, z: 150},
																									function ($) {
																										return $.buildingBlue;
																									}(
																										$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																								_Utils_ap(
																									A5(
																										$author$project$Playground3d$cuboid,
																										model,
																										computer,
																										{
																											x: 800,
																											y: 700,
																											z: $author$project$FloatingTokyoCity$extraHeight1(model.gameState)
																										},
																										{x: 150, y: 50, z: 200},
																										function ($) {
																											return $.buildingYellow;
																										}(
																											$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																									_Utils_ap(
																										A5(
																											$author$project$Playground3d$cuboid,
																											model,
																											computer,
																											{
																												x: 300,
																												y: 900,
																												z: $author$project$FloatingTokyoCity$extraHeight2(model.gameState)
																											},
																											{x: 150, y: 150, z: 50},
																											function ($) {
																												return $.buildingYellowGreen;
																											}(
																												$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																										_Utils_ap(
																											A5(
																												$author$project$Playground3d$cuboid,
																												model,
																												computer,
																												{
																													x: 600,
																													y: 900,
																													z: $author$project$FloatingTokyoCity$extraHeight3(model.gameState)
																												},
																												{x: 50, y: 150, z: 250},
																												function ($) {
																													return $.buildingBlue;
																												}(
																													$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																											_Utils_ap(
																												A3(
																													$author$project$FloatingTokyoCity$train,
																													model,
																													computer,
																													A3($author$project$Playground3d$vector, 0, 950, 0)),
																												_Utils_ap(
																													A5(
																														$author$project$Playground3d$cuboid,
																														model,
																														computer,
																														{
																															x: 900,
																															y: 900,
																															z: $author$project$FloatingTokyoCity$extraHeight2(model.gameState)
																														},
																														{x: 100, y: 100, z: 100},
																														function ($) {
																															return $.buildingPurpleOrange;
																														}(
																															$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																													_Utils_ap(
																														A5(
																															$author$project$Playground3d$cuboid,
																															model,
																															computer,
																															{
																																x: 700,
																																y: 1000,
																																z: $author$project$FloatingTokyoCity$extraHeight3(model.gameState)
																															},
																															{x: 100, y: 50, z: 180},
																															function ($) {
																																return $.buildingYellowGreen;
																															}(
																																$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																														_Utils_ap(
																															A2($author$project$FloatingTokyoCity$crowsFlock, model, computer),
																															_Utils_ap(
																																A5(
																																	$author$project$Playground3d$cuboid,
																																	model,
																																	computer,
																																	{x: 0, y: 0, z: -120},
																																	{x: 1100, y: 1100, z: 130},
																																	function ($) {
																																		return $.base;
																																	}(
																																		$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																																_Utils_ap(
																																	A5(
																																		$author$project$Playground3d$cuboid,
																																		model,
																																		computer,
																																		{x: 0, y: 0, z: -260},
																																		{x: 800, y: 800, z: 80},
																																		function ($) {
																																			return $.base;
																																		}(
																																			$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																																	_Utils_ap(
																																		A5(
																																			$author$project$Playground3d$cuboid,
																																			model,
																																			computer,
																																			{x: 0, y: 0, z: -345},
																																			{x: 700, y: 700, z: 50},
																																			function ($) {
																																				return $.base;
																																			}(
																																				$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																																		_Utils_ap(
																																			A5(
																																				$author$project$Playground3d$cuboid,
																																				model,
																																				computer,
																																				{x: 0, y: 0, z: -420},
																																				{x: 600, y: 600, z: 30},
																																				function ($) {
																																					return $.base;
																																				}(
																																					$author$project$FloatingTokyoCity$palette(model.timeOfDay))),
																																			model.devMode ? _List_fromArray(
																																				[
																																					A2(
																																					$author$project$Playground$moveDown,
																																					100,
																																					A2(
																																						$author$project$Playground$scale,
																																						2,
																																						A2($author$project$Playground$words, $author$project$Playground$black, 'dev')))
																																				]) : _List_Nil)))))))))))))))))))))))))))))
						])))
			]);
	});
var $author$project$FloatingTokyoCity$view3d = F2(
	function (computer, model) {
		var _v0 = model.gameState;
		switch (_v0.$) {
			case 'Playing':
				var fadeValue = _v0.a;
				return A3($author$project$FloatingTokyoCity$viewGame, computer, model, fadeValue);
			case 'Won':
				var fadeValue = _v0.a;
				return _List_fromArray(
					[
						A2(
						$author$project$Playground$moveUp,
						180,
						$author$project$Playground$group(
							A4($author$project$FloatingTokyoCity$billboard, model, computer, true, fadeValue)))
					]);
			default:
				var fadeValue = _v0.a;
				return A3($author$project$FloatingTokyoCity$viewGame, computer, model, fadeValue);
		}
	});
var $author$project$FloatingTokyoCity$viewMemory = $author$project$FloatingTokyoCity$view3d;
var $author$project$FloatingTokyoCity$view = $author$project$Playground$viewGame($author$project$FloatingTokyoCity$viewMemory);
var $author$project$Main$headerHeight = 80;
var $author$project$Main$menuItemAttrs = _Utils_ap(
	_List_fromArray(
		[
			$mdgriffith$elm_ui$Element$Font$letterSpacing(4),
			$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
			$mdgriffith$elm_ui$Element$height($mdgriffith$elm_ui$Element$fill),
			$mdgriffith$elm_ui$Element$Font$size(16)
		]),
	$author$project$Main$mouseOverAttrs);
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$Main$viewHeader = F2(
	function (language, x) {
		return A2(
			$mdgriffith$elm_ui$Element$row,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
					$mdgriffith$elm_ui$Element$Font$center,
					$mdgriffith$elm_ui$Element$Background$color(
					A3($mdgriffith$elm_ui$Element$rgb255, 0, 0, 0)),
					$mdgriffith$elm_ui$Element$Font$color(
					A3($mdgriffith$elm_ui$Element$rgb255, 200, 200, 200)),
					$mdgriffith$elm_ui$Element$alpha(0.8),
					$mdgriffith$elm_ui$Element$height(
					$mdgriffith$elm_ui$Element$px($author$project$Main$headerHeight)),
					A2($mdgriffith$elm_ui$Element$paddingXY, ($author$project$Main$headerHeight / 4) | 0, 0)
				]),
			_Utils_ap(
				_List_fromArray(
					[
						$author$project$Main$logoButton(x)
					]),
				$author$project$Main$smallMenu(x) ? _List_fromArray(
					[
						A2($author$project$Main$menuIcon, x, language)
					]) : _Utils_ap(
					A2(
						$elm$core$List$take,
						4,
						A3($author$project$Main$menuList, false, 'white', $author$project$Main$menuItemAttrs)),
					_List_fromArray(
						[
							A2($author$project$Main$menuIcon, x, language)
						]))));
	});
var $author$project$Main$Icon_Close = {$: 'Icon_Close'};
var $author$project$Main$ToggleQrCode = function (a) {
	return {$: 'ToggleQrCode', a: a};
};
var $mdgriffith$elm_ui$Internal$Model$CenterY = {$: 'CenterY'};
var $mdgriffith$elm_ui$Element$centerY = $mdgriffith$elm_ui$Internal$Model$AlignY($mdgriffith$elm_ui$Internal$Model$CenterY);
var $author$project$Main$viewQrCode = function (model) {
	var timeOfDay = $author$project$FloatingTokyoCity$Day;
	var newTokyoModel = A2(
		$author$project$Playground$changeMemory,
		model.floatingTokyoCity,
		function (memory) {
			return _Utils_update(
				memory,
				{timeOfDay: $author$project$FloatingTokyoCity$Night});
		});
	var tokyoView = $author$project$FloatingTokyoCity$view(newTokyoModel);
	var fontColorAsString = $author$project$Main$fontColor(timeOfDay).b;
	var fontColorAsColor = $author$project$Main$fontColor(timeOfDay).a;
	var floatingCityWidth = (model.width < 650) ? A2($elm$core$Basics$max, model.width - 400, 120) : 250;
	var fontSize = (floatingCityWidth / 5) | 0;
	return A3(
		$mdgriffith$elm_ui$Element$layoutWith,
		{
			options: _List_fromArray(
				[
					$mdgriffith$elm_ui$Element$focusStyle(
					{backgroundColor: $elm$core$Maybe$Nothing, borderColor: $elm$core$Maybe$Nothing, shadow: $elm$core$Maybe$Nothing})
				])
		},
		_List_fromArray(
			[
				$mdgriffith$elm_ui$Element$Font$family(_List_Nil),
				$mdgriffith$elm_ui$Element$Font$color(fontColorAsColor),
				$mdgriffith$elm_ui$Element$Font$size(fontSize),
				$mdgriffith$elm_ui$Element$Background$color(
				A3($mdgriffith$elm_ui$Element$rgb255, 41, 190, 210)),
				$mdgriffith$elm_ui$Element$inFront(
				A2(
					$mdgriffith$elm_ui$Element$link,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$alignRight,
							$mdgriffith$elm_ui$Element$padding(25),
							$mdgriffith$elm_ui$Element$Events$onClick(
							$author$project$Main$ToggleQrCode(false))
						]),
					{
						label: A3($author$project$Main$icon, $author$project$Main$Icon_Close, fontColorAsString, 30),
						url: '/'
					}))
			]),
		A2(
			$mdgriffith$elm_ui$Element$column,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$centerX,
					$mdgriffith$elm_ui$Element$centerY,
					$mdgriffith$elm_ui$Element$spacing(20),
					$mdgriffith$elm_ui$Element$padding(20)
				]),
			_List_fromArray(
				[
					A2(
					$mdgriffith$elm_ui$Element$el,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$inFront(
							A2(
								$mdgriffith$elm_ui$Element$el,
								_List_fromArray(
									[
										$mdgriffith$elm_ui$Element$clip,
										$mdgriffith$elm_ui$Element$centerX,
										$mdgriffith$elm_ui$Element$centerY,
										$mdgriffith$elm_ui$Element$width(
										$mdgriffith$elm_ui$Element$px(floatingCityWidth))
									]),
								$mdgriffith$elm_ui$Element$html(
									A2(
										$elm$html$Html$map,
										$author$project$Main$FloatingTokyoCityMsg,
										A2($elm$html$Html$div, _List_Nil, tokyoView.body)))))
						]),
					model.cachedQrCodeBlack),
					A2(
					$mdgriffith$elm_ui$Element$el,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$centerX,
							$mdgriffith$elm_ui$Element$Font$size(
							(model.width > 600) ? 60 : ((model.width > 450) ? 40 : 14)),
							$mdgriffith$elm_ui$Element$htmlAttribute(
							A2($elm$html$Html$Attributes$style, 'letter-spacing', '13px'))
						]),
					$mdgriffith$elm_ui$Element$text('elmjapan.org'))
				])));
};
var $author$project$Main$view = function (model) {
	var tokyoView = $author$project$FloatingTokyoCity$view(model.floatingTokyoCity);
	var memoryFloatingTokyoCity = $author$project$Playground$getMemory(model.floatingTokyoCity);
	var qrCode = memoryFloatingTokyoCity.qrCode;
	var timeOfDay = memoryFloatingTokyoCity.timeOfDay;
	var colors = $author$project$FloatingTokyoCity$palette(timeOfDay);
	var _v0 = function ($) {
		return $.backgroundRgb;
	}(colors);
	var r = _v0.a;
	var g = _v0.b;
	var b = _v0.c;
	return ((model.url.path === '/qr-code') || qrCode) ? $author$project$Main$viewQrCode(model) : A3(
		$mdgriffith$elm_ui$Element$layoutWith,
		{
			options: _List_fromArray(
				[
					$mdgriffith$elm_ui$Element$focusStyle(
					{backgroundColor: $elm$core$Maybe$Nothing, borderColor: $elm$core$Maybe$Nothing, shadow: $elm$core$Maybe$Nothing})
				])
		},
		_Utils_ap(
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$Font$family(_List_Nil),
					$mdgriffith$elm_ui$Element$Font$color(
					$author$project$Main$fontColor(memoryFloatingTokyoCity.timeOfDay).a),
					$mdgriffith$elm_ui$Element$Font$size(18),
					$mdgriffith$elm_ui$Element$Background$color(
					A3(
						$mdgriffith$elm_ui$Element$rgb255,
						$elm$core$Basics$round(r),
						$elm$core$Basics$round(g),
						$elm$core$Basics$round(b))),
					$mdgriffith$elm_ui$Element$htmlAttribute(
					A2($elm$html$Html$Attributes$style, 'transition', 'all 0.5s')),
					$mdgriffith$elm_ui$Element$inFront(
					A2($author$project$Main$viewHeader, model.language, model.width))
				]),
			_Utils_ap(
				A2($elm$core$String$contains, 'without-debugger', model.href) ? _List_Nil : ($author$project$Main$smallMenu(model.width) ? _List_Nil : _List_fromArray(
					[
						$mdgriffith$elm_ui$Element$inFront(
						A2(
							$mdgriffith$elm_ui$Element$el,
							_List_fromArray(
								[
									$mdgriffith$elm_ui$Element$alignBottom,
									$mdgriffith$elm_ui$Element$alignRight,
									$mdgriffith$elm_ui$Element$moveUp(110),
									$mdgriffith$elm_ui$Element$moveRight(45),
									$mdgriffith$elm_ui$Element$rotate(1.7)
								]),
							A3(
								$author$project$Main$icon,
								$author$project$Main$Icon_LookInside,
								$author$project$Main$fontColor(memoryFloatingTokyoCity.timeOfDay).b,
								200)))
					])),
				_List_fromArray(
					[
						$mdgriffith$elm_ui$Element$inFront(
						$author$project$Main$sideMenu(
							{language: model.language, menuOpen: model.menuOpen, width: model.width}))
					]))),
		A2(
			$mdgriffith$elm_ui$Element$column,
			_List_fromArray(
				[
					$mdgriffith$elm_ui$Element$width($mdgriffith$elm_ui$Element$fill),
					$mdgriffith$elm_ui$Element$paddingEach(
					{
						bottom: 0,
						left: 0,
						right: $author$project$Main$menuSideBySide(model.width) ? (model.menuOpen ? $author$project$Main$sideMenuWidth : 0) : 0,
						top: 0
					}),
					$mdgriffith$elm_ui$Element$htmlAttribute(
					A2($elm$html$Html$Attributes$style, 'transition', 'all 0.2s'))
				]),
			((model.url.path === '/elm-conferences') || qrCode) ? _List_fromArray(
				[
					$author$project$Main$section('top'),
					$author$project$Main$pageConferences(model),
					$author$project$Main$footer(model)
				]) : _List_fromArray(
				[
					$author$project$Main$section('top'),
					A2(
					$mdgriffith$elm_ui$Element$paragraph,
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$Font$center,
							$mdgriffith$elm_ui$Element$alpha(0.2),
							$mdgriffith$elm_ui$Element$Font$size(
							A2(
								$elm$core$Basics$min,
								120,
								$elm$core$Basics$round(((2 / 17) * model.width) + (40 / 17)))),
							$mdgriffith$elm_ui$Element$Font$extraBold,
							$mdgriffith$elm_ui$Element$moveDown(
							A2($elm$core$Basics$min, 90, ((1 / 17) * model.width) + (530 / 17)))
						]),
					_List_fromArray(
						[
							$mdgriffith$elm_ui$Element$text('elm japan 2020')
						])),
					function () {
					var counterWithButton = A2(
						$mdgriffith$elm_ui$Element$row,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$spacing(10)
							]),
						_Utils_ap(
							_List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Element$el,
									_List_Nil,
									A3(
										$author$project$Main$icon,
										model.pause ? $author$project$Main$Icon_Play : $author$project$Main$Icon_Pause,
										$author$project$Main$fontColor(memoryFloatingTokyoCity.timeOfDay).b,
										25))
								]),
							model.startedOnSmallDevice ? _List_Nil : _List_fromArray(
								[
									A2(
									$mdgriffith$elm_ui$Element$row,
									_List_Nil,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$text('- '),
											A2($author$project$Counter$View$view, model.countdown, 20)
										]))
								])));
					return A2(
						$mdgriffith$elm_ui$Element$el,
						_List_fromArray(
							[
								$mdgriffith$elm_ui$Element$centerX,
								$mdgriffith$elm_ui$Element$height(
								A2(
									$mdgriffith$elm_ui$Element$maximum,
									$elm$core$Basics$round((400 / 600) * model.width),
									$mdgriffith$elm_ui$Element$fill)),
								$mdgriffith$elm_ui$Element$width(
								A2($mdgriffith$elm_ui$Element$maximum, 600, $mdgriffith$elm_ui$Element$fill)),
								$mdgriffith$elm_ui$Element$inFront(
								A2(
									$mdgriffith$elm_ui$Element$Input$button,
									_List_fromArray(
										[
											$mdgriffith$elm_ui$Element$alpha(0.5),
											$mdgriffith$elm_ui$Element$alignBottom,
											$mdgriffith$elm_ui$Element$alignRight,
											$mdgriffith$elm_ui$Element$moveLeft(35),
											$mdgriffith$elm_ui$Element$moveUp(40),
											$mdgriffith$elm_ui$Element$Border$rounded(20),
											$mdgriffith$elm_ui$Element$paddingEach(
											{bottom: 3, left: 5, right: 5, top: 3}),
											$mdgriffith$elm_ui$Element$Background$color(
											function () {
												switch (timeOfDay.$) {
													case 'Sunrise':
														return A4($mdgriffith$elm_ui$Element$rgba, 0, 0, 0.1, 0.4);
													case 'Day':
														return A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 0.4);
													case 'Sunset':
														return A4($mdgriffith$elm_ui$Element$rgba, 1, 1, 1, 0.4);
													default:
														return A4($mdgriffith$elm_ui$Element$rgba, 0, 0, 0, 0.6);
												}
											}())
										]),
									{
										label: counterWithButton,
										onPress: $elm$core$Maybe$Just($author$project$Main$TogglePause)
									}))
							]),
						$mdgriffith$elm_ui$Element$html(
							A2(
								$elm$html$Html$map,
								$author$project$Main$FloatingTokyoCityMsg,
								A2($elm$html$Html$div, _List_Nil, tokyoView.body))));
				}(),
					A2(
					$author$project$Main$topBody,
					{language: model.language, menuOpen: model.menuOpen, width: model.width},
					memoryFloatingTokyoCity.timeOfDay),
					$author$project$Main$footer(
					{href: 'model.href', menuOpen: model.menuOpen, startedOnSmallDevice: model.startedOnSmallDevice, width: model.width})
				])));
};
var $author$project$Main$viewDocument = function (model) {
	return {
		body: _List_fromArray(
			[
				$author$project$Main$view(model)
			]),
		title: 'Elm Japan 2020'
	};
};
var $author$project$Main$main = $elm$browser$Browser$application(
	{init: $author$project$Main$init, onUrlChange: $author$project$Main$OnUrlChange, onUrlRequest: $author$project$Main$OnUrlRequest, subscriptions: $author$project$Main$subscriptions, update: $author$project$Main$update, view: $author$project$Main$viewDocument});
_Platform_export({'Main':{'init':$author$project$Main$main(
	A2(
		$elm$json$Json$Decode$andThen,
		function (width) {
			return A2(
				$elm$json$Json$Decode$andThen,
				function (language) {
					return A2(
						$elm$json$Json$Decode$andThen,
						function (href) {
							return A2(
								$elm$json$Json$Decode$andThen,
								function (height) {
									return $elm$json$Json$Decode$succeed(
										{height: height, href: href, language: language, width: width});
								},
								A2($elm$json$Json$Decode$field, 'height', $elm$json$Json$Decode$int));
						},
						A2($elm$json$Json$Decode$field, 'href', $elm$json$Json$Decode$string));
				},
				A2($elm$json$Json$Decode$field, 'language', $elm$json$Json$Decode$string));
		},
		A2($elm$json$Json$Decode$field, 'width', $elm$json$Json$Decode$int)))(0)}});}(this));