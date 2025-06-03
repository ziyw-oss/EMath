"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/login";
exports.ids = ["pages/api/login"];
exports.modules = {

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "mysql2/promise":
/*!*********************************!*\
  !*** external "mysql2/promise" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("mysql2/promise");

/***/ }),

/***/ "next/dist/compiled/next-server/pages-api.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages-api.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages-api.runtime.dev.js");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = import("bcryptjs");;

/***/ }),

/***/ "(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Flogin&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Flogin.ts&middlewareConfigBase64=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Flogin&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Flogin.ts&middlewareConfigBase64=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/pages-api/module.compiled */ \"(api)/./node_modules/next/dist/server/future/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(api)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _src_pages_api_login_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/pages/api/login.ts */ \"(api)/./src/pages/api/login.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_src_pages_api_login_ts__WEBPACK_IMPORTED_MODULE_3__]);\n_src_pages_api_login_ts__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_src_pages_api_login_ts__WEBPACK_IMPORTED_MODULE_3__, \"default\"));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_src_pages_api_login_ts__WEBPACK_IMPORTED_MODULE_3__, \"config\");\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/login\",\n        pathname: \"/api/login\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\"\n    },\n    userland: _src_pages_api_login_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LXJvdXRlLWxvYWRlci9pbmRleC5qcz9raW5kPVBBR0VTX0FQSSZwYWdlPSUyRmFwaSUyRmxvZ2luJnByZWZlcnJlZFJlZ2lvbj0mYWJzb2x1dGVQYWdlUGF0aD0uJTJGc3JjJTJGcGFnZXMlMkZhcGklMkZsb2dpbi50cyZtaWRkbGV3YXJlQ29uZmlnQmFzZTY0PWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDTDtBQUMxRDtBQUNxRDtBQUNyRDtBQUNBLGlFQUFlLHdFQUFLLENBQUMsb0RBQVEsWUFBWSxFQUFDO0FBQzFDO0FBQ08sZUFBZSx3RUFBSyxDQUFDLG9EQUFRO0FBQ3BDO0FBQ08sd0JBQXdCLGdIQUFtQjtBQUNsRDtBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZQUFZO0FBQ1osQ0FBQzs7QUFFRCxxQyIsInNvdXJjZXMiOlsid2VicGFjazovL2VtYXRoLWZyb250ZW5kLz9mMWQxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBhZ2VzQVBJUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9wYWdlcy1hcGkvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgaG9pc3QgfSBmcm9tIFwibmV4dC9kaXN0L2J1aWxkL3RlbXBsYXRlcy9oZWxwZXJzXCI7XG4vLyBJbXBvcnQgdGhlIHVzZXJsYW5kIGNvZGUuXG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiLi9zcmMvcGFnZXMvYXBpL2xvZ2luLnRzXCI7XG4vLyBSZS1leHBvcnQgdGhlIGhhbmRsZXIgKHNob3VsZCBiZSB0aGUgZGVmYXVsdCBleHBvcnQpLlxuZXhwb3J0IGRlZmF1bHQgaG9pc3QodXNlcmxhbmQsIFwiZGVmYXVsdFwiKTtcbi8vIFJlLWV4cG9ydCBjb25maWcuXG5leHBvcnQgY29uc3QgY29uZmlnID0gaG9pc3QodXNlcmxhbmQsIFwiY29uZmlnXCIpO1xuLy8gQ3JlYXRlIGFuZCBleHBvcnQgdGhlIHJvdXRlIG1vZHVsZSB0aGF0IHdpbGwgYmUgY29uc3VtZWQuXG5leHBvcnQgY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgUGFnZXNBUElSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuUEFHRVNfQVBJLFxuICAgICAgICBwYWdlOiBcIi9hcGkvbG9naW5cIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9sb2dpblwiLFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGFyZW4ndCB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcIlwiXG4gICAgfSxcbiAgICB1c2VybGFuZFxufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhZ2VzLWFwaS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Flogin&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Flogin.ts&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api)/./src/lib/db.ts":
/*!***********************!*\
  !*** ./src/lib/db.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mysql2_promise__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mysql2/promise */ \"mysql2/promise\");\n/* harmony import */ var mysql2_promise__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mysql2_promise__WEBPACK_IMPORTED_MODULE_0__);\n// frontend/lib/db.ts\n\nconst pool = mysql2_promise__WEBPACK_IMPORTED_MODULE_0___default().createPool({\n    host: \"localhost\",\n    user: \"root\",\n    password: \"\",\n    database: \"EdexcelMath\",\n    waitForConnections: true,\n    connectionLimit: 10,\n    queueLimit: 0\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (pool);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvbGliL2RiLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFCQUFxQjtBQUNjO0FBRW5DLE1BQU1DLE9BQU9ELGdFQUFnQixDQUFDO0lBQzVCRyxNQUFNO0lBQ05DLE1BQU07SUFDTkMsVUFBVTtJQUNWQyxVQUFVO0lBQ1ZDLG9CQUFvQjtJQUNwQkMsaUJBQWlCO0lBQ2pCQyxZQUFZO0FBQ2Q7QUFFQSxpRUFBZVIsSUFBSUEsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2VtYXRoLWZyb250ZW5kLy4vc3JjL2xpYi9kYi50cz85ZTRmIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGZyb250ZW5kL2xpYi9kYi50c1xuaW1wb3J0IG15c3FsIGZyb20gXCJteXNxbDIvcHJvbWlzZVwiO1xuXG5jb25zdCBwb29sID0gbXlzcWwuY3JlYXRlUG9vbCh7XG4gIGhvc3Q6IFwibG9jYWxob3N0XCIsXG4gIHVzZXI6IFwicm9vdFwiLFxuICBwYXNzd29yZDogXCJcIixcbiAgZGF0YWJhc2U6IFwiRWRleGNlbE1hdGhcIixcbiAgd2FpdEZvckNvbm5lY3Rpb25zOiB0cnVlLFxuICBjb25uZWN0aW9uTGltaXQ6IDEwLFxuICBxdWV1ZUxpbWl0OiAwLFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHBvb2w7Il0sIm5hbWVzIjpbIm15c3FsIiwicG9vbCIsImNyZWF0ZVBvb2wiLCJob3N0IiwidXNlciIsInBhc3N3b3JkIiwiZGF0YWJhc2UiLCJ3YWl0Rm9yQ29ubmVjdGlvbnMiLCJjb25uZWN0aW9uTGltaXQiLCJxdWV1ZUxpbWl0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./src/lib/db.ts\n");

/***/ }),

/***/ "(api)/./src/pages/api/login.ts":
/*!********************************!*\
  !*** ./src/pages/api/login.ts ***!
  \********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/db */ \"(api)/./src/lib/db.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"bcryptjs\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([bcryptjs__WEBPACK_IMPORTED_MODULE_1__]);\nbcryptjs__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\nasync function handler(req, res) {\n    if (req.method !== \"POST\") return res.status(405).end();\n    const { email, password } = req.body;\n    if (!email || !password) {\n        return res.status(400).json({\n            error: \"Missing email or password\"\n        });\n    }\n    try {\n        const [rows] = await _lib_db__WEBPACK_IMPORTED_MODULE_0__[\"default\"].query(\"SELECT * FROM users WHERE email = ?\", [\n            email\n        ]);\n        const user = rows[0];\n        if (!user) return res.status(401).json({\n            error: \"User not found\"\n        });\n        const passwordMatch = await bcryptjs__WEBPACK_IMPORTED_MODULE_1__[\"default\"].compare(password, user.password_hash);\n        if (!passwordMatch) return res.status(401).json({\n            error: \"Incorrect password\"\n        });\n        const token = jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default().sign({\n            id: user.id,\n            email: user.email,\n            role: user.role\n        }, process.env.JWT_SECRET, {\n            expiresIn: \"7d\"\n        });\n        res.setHeader(\"Set-Cookie\", `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`);\n        res.status(200).json({\n            message: \"Login successful\",\n            token,\n            user: {\n                id: user.id,\n                role: user.role\n            }\n        });\n    } catch (err) {\n        console.error(\"Login error:\", err);\n        res.status(500).json({\n            error: \"Internal server error\"\n        });\n    }\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvcGFnZXMvYXBpL2xvZ2luLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQzBCO0FBQ0k7QUFDQztBQUVoQixlQUFlRyxRQUFRQyxHQUFtQixFQUFFQyxHQUFvQjtJQUM3RSxJQUFJRCxJQUFJRSxNQUFNLEtBQUssUUFBUSxPQUFPRCxJQUFJRSxNQUFNLENBQUMsS0FBS0MsR0FBRztJQUVyRCxNQUFNLEVBQUVDLEtBQUssRUFBRUMsUUFBUSxFQUFFLEdBQUdOLElBQUlPLElBQUk7SUFDcEMsSUFBSSxDQUFDRixTQUFTLENBQUNDLFVBQVU7UUFDdkIsT0FBT0wsSUFBSUUsTUFBTSxDQUFDLEtBQUtLLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQTRCO0lBQ25FO0lBRUEsSUFBSTtRQUNGLE1BQU0sQ0FBQ0MsS0FBSyxHQUFVLE1BQU1kLHFEQUFRLENBQUMsdUNBQXVDO1lBQUNTO1NBQU07UUFDbkYsTUFBTU8sT0FBT0YsSUFBSSxDQUFDLEVBQUU7UUFDcEIsSUFBSSxDQUFDRSxNQUFNLE9BQU9YLElBQUlFLE1BQU0sQ0FBQyxLQUFLSyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFpQjtRQUVqRSxNQUFNSSxnQkFBZ0IsTUFBTWhCLHdEQUFjLENBQUNTLFVBQVVNLEtBQUtHLGFBQWE7UUFDdkUsSUFBSSxDQUFDRixlQUFlLE9BQU9aLElBQUlFLE1BQU0sQ0FBQyxLQUFLSyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFxQjtRQUU5RSxNQUFNTyxRQUFRbEIsd0RBQVEsQ0FDcEI7WUFBRW9CLElBQUlOLEtBQUtNLEVBQUU7WUFBRWIsT0FBT08sS0FBS1AsS0FBSztZQUFFYyxNQUFNUCxLQUFLTyxJQUFJO1FBQUMsR0FDbERDLFFBQVFDLEdBQUcsQ0FBQ0MsVUFBVSxFQUN0QjtZQUFFQyxXQUFXO1FBQUs7UUFHcEJ0QixJQUFJdUIsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUVSLE1BQU0sbURBQW1ELENBQUM7UUFDL0ZmLElBQUlFLE1BQU0sQ0FBQyxLQUFLSyxJQUFJLENBQUM7WUFDbkJpQixTQUFTO1lBQ1RUO1lBQ0FKLE1BQU07Z0JBQUVNLElBQUlOLEtBQUtNLEVBQUU7Z0JBQUVDLE1BQU1QLEtBQUtPLElBQUk7WUFBQztRQUN2QztJQUNGLEVBQUUsT0FBT08sS0FBVTtRQUNqQkMsUUFBUWxCLEtBQUssQ0FBQyxnQkFBZ0JpQjtRQUM5QnpCLElBQUlFLE1BQU0sQ0FBQyxLQUFLSyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUF3QjtJQUN4RDtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZW1hdGgtZnJvbnRlbmQvLi9zcmMvcGFnZXMvYXBpL2xvZ2luLnRzP2RhOWIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEFwaVJlcXVlc3QsIE5leHRBcGlSZXNwb25zZSB9IGZyb20gXCJuZXh0XCI7XG5pbXBvcnQgZGIgZnJvbSBcIkAvbGliL2RiXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuaW1wb3J0IGp3dCBmcm9tIFwianNvbndlYnRva2VuXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxOiBOZXh0QXBpUmVxdWVzdCwgcmVzOiBOZXh0QXBpUmVzcG9uc2UpIHtcbiAgaWYgKHJlcS5tZXRob2QgIT09IFwiUE9TVFwiKSByZXR1cm4gcmVzLnN0YXR1cyg0MDUpLmVuZCgpO1xuXG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSByZXEuYm9keTtcbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogXCJNaXNzaW5nIGVtYWlsIG9yIHBhc3N3b3JkXCIgfSk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IFtyb3dzXTogYW55W10gPSBhd2FpdCBkYi5xdWVyeShcIlNFTEVDVCAqIEZST00gdXNlcnMgV0hFUkUgZW1haWwgPSA/XCIsIFtlbWFpbF0pO1xuICAgIGNvbnN0IHVzZXIgPSByb3dzWzBdO1xuICAgIGlmICghdXNlcikgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6IFwiVXNlciBub3QgZm91bmRcIiB9KTtcblxuICAgIGNvbnN0IHBhc3N3b3JkTWF0Y2ggPSBhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgdXNlci5wYXNzd29yZF9oYXNoKTtcbiAgICBpZiAoIXBhc3N3b3JkTWF0Y2gpIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiBcIkluY29ycmVjdCBwYXNzd29yZFwiIH0pO1xuXG4gICAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbihcbiAgICAgIHsgaWQ6IHVzZXIuaWQsIGVtYWlsOiB1c2VyLmVtYWlsLCByb2xlOiB1c2VyLnJvbGUgfSxcbiAgICAgIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQhLFxuICAgICAgeyBleHBpcmVzSW46IFwiN2RcIiB9XG4gICAgKTtcblxuICAgIHJlcy5zZXRIZWFkZXIoXCJTZXQtQ29va2llXCIsIGB0b2tlbj0ke3Rva2VufTsgUGF0aD0vOyBIdHRwT25seTsgU2FtZVNpdGU9U3RyaWN0OyBNYXgtQWdlPTYwNDgwMGApO1xuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgIG1lc3NhZ2U6IFwiTG9naW4gc3VjY2Vzc2Z1bFwiLFxuICAgICAgdG9rZW4sXG4gICAgICB1c2VyOiB7IGlkOiB1c2VyLmlkLCByb2xlOiB1c2VyLnJvbGUgfVxuICAgIH0pO1xuICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dpbiBlcnJvcjpcIiwgZXJyKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIkludGVybmFsIHNlcnZlciBlcnJvclwiIH0pO1xuICB9XG59Il0sIm5hbWVzIjpbImRiIiwiYmNyeXB0Iiwiand0IiwiaGFuZGxlciIsInJlcSIsInJlcyIsIm1ldGhvZCIsInN0YXR1cyIsImVuZCIsImVtYWlsIiwicGFzc3dvcmQiLCJib2R5IiwianNvbiIsImVycm9yIiwicm93cyIsInF1ZXJ5IiwidXNlciIsInBhc3N3b3JkTWF0Y2giLCJjb21wYXJlIiwicGFzc3dvcmRfaGFzaCIsInRva2VuIiwic2lnbiIsImlkIiwicm9sZSIsInByb2Nlc3MiLCJlbnYiLCJKV1RfU0VDUkVUIiwiZXhwaXJlc0luIiwic2V0SGVhZGVyIiwibWVzc2FnZSIsImVyciIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./src/pages/api/login.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Flogin&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Flogin.ts&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();