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
exports.id = "pages/api/rewards-history";
exports.ids = ["pages/api/rewards-history"];
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

/***/ "(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Frewards-history&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Frewards-history.ts&middlewareConfigBase64=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Frewards-history&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Frewards-history.ts&middlewareConfigBase64=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/pages-api/module.compiled */ \"(api)/./node_modules/next/dist/server/future/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(api)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _src_pages_api_rewards_history_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/pages/api/rewards-history.ts */ \"(api)/./src/pages/api/rewards-history.ts\");\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_src_pages_api_rewards_history_ts__WEBPACK_IMPORTED_MODULE_3__, \"default\"));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_src_pages_api_rewards_history_ts__WEBPACK_IMPORTED_MODULE_3__, \"config\");\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/rewards-history\",\n        pathname: \"/api/rewards-history\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\"\n    },\n    userland: _src_pages_api_rewards_history_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LXJvdXRlLWxvYWRlci9pbmRleC5qcz9raW5kPVBBR0VTX0FQSSZwYWdlPSUyRmFwaSUyRnJld2FyZHMtaGlzdG9yeSZwcmVmZXJyZWRSZWdpb249JmFic29sdXRlUGFnZVBhdGg9LiUyRnNyYyUyRnBhZ2VzJTJGYXBpJTJGcmV3YXJkcy1oaXN0b3J5LnRzJm1pZGRsZXdhcmVDb25maWdCYXNlNjQ9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNMO0FBQzFEO0FBQytEO0FBQy9EO0FBQ0EsaUVBQWUsd0VBQUssQ0FBQyw4REFBUSxZQUFZLEVBQUM7QUFDMUM7QUFDTyxlQUFlLHdFQUFLLENBQUMsOERBQVE7QUFDcEM7QUFDTyx3QkFBd0IsZ0hBQW1CO0FBQ2xEO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLFlBQVk7QUFDWixDQUFDOztBQUVEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZW1hdGgtZnJvbnRlbmQvP2Q3NGIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFnZXNBUElSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL3BhZ2VzLWFwaS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBob2lzdCB9IGZyb20gXCJuZXh0L2Rpc3QvYnVpbGQvdGVtcGxhdGVzL2hlbHBlcnNcIjtcbi8vIEltcG9ydCB0aGUgdXNlcmxhbmQgY29kZS5cbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIuL3NyYy9wYWdlcy9hcGkvcmV3YXJkcy1oaXN0b3J5LnRzXCI7XG4vLyBSZS1leHBvcnQgdGhlIGhhbmRsZXIgKHNob3VsZCBiZSB0aGUgZGVmYXVsdCBleHBvcnQpLlxuZXhwb3J0IGRlZmF1bHQgaG9pc3QodXNlcmxhbmQsIFwiZGVmYXVsdFwiKTtcbi8vIFJlLWV4cG9ydCBjb25maWcuXG5leHBvcnQgY29uc3QgY29uZmlnID0gaG9pc3QodXNlcmxhbmQsIFwiY29uZmlnXCIpO1xuLy8gQ3JlYXRlIGFuZCBleHBvcnQgdGhlIHJvdXRlIG1vZHVsZSB0aGF0IHdpbGwgYmUgY29uc3VtZWQuXG5leHBvcnQgY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgUGFnZXNBUElSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuUEFHRVNfQVBJLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcmV3YXJkcy1oaXN0b3J5XCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvcmV3YXJkcy1oaXN0b3J5XCIsXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgYXJlbid0IHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgICAgYnVuZGxlUGF0aDogXCJcIixcbiAgICAgICAgZmlsZW5hbWU6IFwiXCJcbiAgICB9LFxuICAgIHVzZXJsYW5kXG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFnZXMtYXBpLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Frewards-history&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Frewards-history.ts&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getCurrentUser: () => (/* binding */ getCurrentUser),\n/* harmony export */   getUserFromRequest: () => (/* binding */ getUserFromRequest)\n/* harmony export */ });\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__);\n\nfunction getCurrentUser(req) {\n    try {\n        const token = req.cookies.token;\n        if (!token) return null;\n        const user = jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().verify(token, process.env.JWT_SECRET);\n        return user;\n    } catch (err) {\n        return null;\n    }\n}\nasync function getUserFromRequest(req) {\n    return getCurrentUser(req);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUMrQztBQUV4QyxTQUFTQyxlQUFlQyxHQUFtQjtJQUNoRCxJQUFJO1FBQ0YsTUFBTUMsUUFBUUQsSUFBSUUsT0FBTyxDQUFDRCxLQUFLO1FBQy9CLElBQUksQ0FBQ0EsT0FBTyxPQUFPO1FBQ25CLE1BQU1FLE9BQU9MLDBEQUFVLENBQUNHLE9BQU9JLFFBQVFDLEdBQUcsQ0FBQ0MsVUFBVTtRQUNyRCxPQUFPSjtJQUNULEVBQUUsT0FBT0ssS0FBSztRQUNaLE9BQU87SUFDVDtBQUNGO0FBRU8sZUFBZUMsbUJBQW1CVCxHQUFtQjtJQUMxRCxPQUFPRCxlQUFlQztBQUN4QiIsInNvdXJjZXMiOlsid2VicGFjazovL2VtYXRoLWZyb250ZW5kLy4vc3JjL2xpYi9hdXRoLnRzPzY2OTIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEFwaVJlcXVlc3QgfSBmcm9tIFwibmV4dFwiO1xuaW1wb3J0IGp3dCwgeyBKd3RQYXlsb2FkIH0gZnJvbSBcImpzb253ZWJ0b2tlblwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFVzZXIocmVxOiBOZXh0QXBpUmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHRva2VuID0gcmVxLmNvb2tpZXMudG9rZW47XG4gICAgaWYgKCF0b2tlbikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgdXNlciA9IGp3dC52ZXJpZnkodG9rZW4sIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQhKSBhcyBqd3QuSnd0UGF5bG9hZCAmIHsgaWQ6IG51bWJlciB9O1xuICAgIHJldHVybiB1c2VyO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VXNlckZyb21SZXF1ZXN0KHJlcTogTmV4dEFwaVJlcXVlc3QpIHtcbiAgcmV0dXJuIGdldEN1cnJlbnRVc2VyKHJlcSk7XG59Il0sIm5hbWVzIjpbImp3dCIsImdldEN1cnJlbnRVc2VyIiwicmVxIiwidG9rZW4iLCJjb29raWVzIiwidXNlciIsInZlcmlmeSIsInByb2Nlc3MiLCJlbnYiLCJKV1RfU0VDUkVUIiwiZXJyIiwiZ2V0VXNlckZyb21SZXF1ZXN0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(api)/./src/lib/db.ts":
/*!***********************!*\
  !*** ./src/lib/db.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mysql2_promise__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mysql2/promise */ \"mysql2/promise\");\n/* harmony import */ var mysql2_promise__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mysql2_promise__WEBPACK_IMPORTED_MODULE_0__);\n// frontend/lib/db.ts\n\nconst pool = mysql2_promise__WEBPACK_IMPORTED_MODULE_0___default().createPool({\n    host: \"localhost\",\n    user: \"root\",\n    password: \"\",\n    database: \"EdexcelMath\",\n    waitForConnections: true,\n    connectionLimit: 10,\n    queueLimit: 0\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (pool);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvbGliL2RiLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFCQUFxQjtBQUNjO0FBRW5DLE1BQU1DLE9BQU9ELGdFQUFnQixDQUFDO0lBQzVCRyxNQUFNO0lBQ05DLE1BQU07SUFDTkMsVUFBVTtJQUNWQyxVQUFVO0lBQ1ZDLG9CQUFvQjtJQUNwQkMsaUJBQWlCO0lBQ2pCQyxZQUFZO0FBQ2Q7QUFFQSxpRUFBZVIsSUFBSUEsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2VtYXRoLWZyb250ZW5kLy4vc3JjL2xpYi9kYi50cz85ZTRmIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGZyb250ZW5kL2xpYi9kYi50c1xuaW1wb3J0IG15c3FsIGZyb20gXCJteXNxbDIvcHJvbWlzZVwiO1xuXG5jb25zdCBwb29sID0gbXlzcWwuY3JlYXRlUG9vbCh7XG4gIGhvc3Q6IFwibG9jYWxob3N0XCIsXG4gIHVzZXI6IFwicm9vdFwiLFxuICBwYXNzd29yZDogXCJcIixcbiAgZGF0YWJhc2U6IFwiRWRleGNlbE1hdGhcIixcbiAgd2FpdEZvckNvbm5lY3Rpb25zOiB0cnVlLFxuICBjb25uZWN0aW9uTGltaXQ6IDEwLFxuICBxdWV1ZUxpbWl0OiAwLFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHBvb2w7Il0sIm5hbWVzIjpbIm15c3FsIiwicG9vbCIsImNyZWF0ZVBvb2wiLCJob3N0IiwidXNlciIsInBhc3N3b3JkIiwiZGF0YWJhc2UiLCJ3YWl0Rm9yQ29ubmVjdGlvbnMiLCJjb25uZWN0aW9uTGltaXQiLCJxdWV1ZUxpbWl0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./src/lib/db.ts\n");

/***/ }),

/***/ "(api)/./src/pages/api/rewards-history.ts":
/*!******************************************!*\
  !*** ./src/pages/api/rewards-history.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/db */ \"(api)/./src/lib/db.ts\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(api)/./src/lib/auth.ts\");\n\n\nasync function handler(req, res) {\n    const user = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__.getUserFromRequest)(req);\n    if (!user) return res.status(401).json({\n        error: \"Unauthorized\"\n    });\n    const [rows] = await _lib_db__WEBPACK_IMPORTED_MODULE_0__[\"default\"].query(`SELECT r.id as reward_id, r.session_id, r.amount, r.confirmed,\n            s.started_at, p.paper_name,\n            (SELECT SUM(score) FROM student_scores WHERE session_id = s.id) AS score,\n            (SELECT SUM(q.marks) FROM student_scores ss JOIN question_bank q ON ss.question_id = q.id WHERE ss.session_id = s.id) AS fullScore\n     FROM reward_log r\n     JOIN exam_sessions s ON r.session_id = s.id\n     JOIN exam_papers p ON s.exam_paper_id = p.id\n     WHERE r.user_id = ? AND r.type = 'score_rate'\n     ORDER BY s.started_at DESC`, [\n        user.id\n    ]);\n    const result = rows.map((r)=>({\n            ...r,\n            accuracy: r.fullScore ? r.score / r.fullScore : 0\n        }));\n    return res.status(200).json(result);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvcGFnZXMvYXBpL3Jld2FyZHMtaGlzdG9yeS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFDMEI7QUFDc0I7QUFFakMsZUFBZUUsUUFBUUMsR0FBbUIsRUFBRUMsR0FBb0I7SUFDN0UsTUFBTUMsT0FBTyxNQUFNSiw2REFBa0JBLENBQUNFO0lBQ3RDLElBQUksQ0FBQ0UsTUFBTSxPQUFPRCxJQUFJRSxNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDO1FBQUVDLE9BQU87SUFBZTtJQUUvRCxNQUFNLENBQUNDLEtBQUssR0FBVSxNQUFNVCxxREFBUSxDQUNsQyxDQUFDOzs7Ozs7OzsrQkFRMEIsQ0FBQyxFQUM1QjtRQUFDSyxLQUFLTSxFQUFFO0tBQUM7SUFHWCxNQUFNQyxTQUFTSCxLQUFLSSxHQUFHLENBQUMsQ0FBQ0MsSUFBWTtZQUNuQyxHQUFHQSxDQUFDO1lBQ0pDLFVBQVVELEVBQUVFLFNBQVMsR0FBR0YsRUFBRUcsS0FBSyxHQUFHSCxFQUFFRSxTQUFTLEdBQUc7UUFDbEQ7SUFFQSxPQUFPWixJQUFJRSxNQUFNLENBQUMsS0FBS0MsSUFBSSxDQUFDSztBQUM5QiIsInNvdXJjZXMiOlsid2VicGFjazovL2VtYXRoLWZyb250ZW5kLy4vc3JjL3BhZ2VzL2FwaS9yZXdhcmRzLWhpc3RvcnkudHM/YjljNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE5leHRBcGlSZXF1ZXN0LCBOZXh0QXBpUmVzcG9uc2UgfSBmcm9tIFwibmV4dFwiO1xuaW1wb3J0IGRiIGZyb20gXCJAL2xpYi9kYlwiO1xuaW1wb3J0IHsgZ2V0VXNlckZyb21SZXF1ZXN0IH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXE6IE5leHRBcGlSZXF1ZXN0LCByZXM6IE5leHRBcGlSZXNwb25zZSkge1xuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckZyb21SZXF1ZXN0KHJlcSk7XG4gIGlmICghdXNlcikgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5qc29uKHsgZXJyb3I6IFwiVW5hdXRob3JpemVkXCIgfSk7XG5cbiAgY29uc3QgW3Jvd3NdOiBhbnlbXSA9IGF3YWl0IGRiLnF1ZXJ5KFxuICAgIGBTRUxFQ1Qgci5pZCBhcyByZXdhcmRfaWQsIHIuc2Vzc2lvbl9pZCwgci5hbW91bnQsIHIuY29uZmlybWVkLFxuICAgICAgICAgICAgcy5zdGFydGVkX2F0LCBwLnBhcGVyX25hbWUsXG4gICAgICAgICAgICAoU0VMRUNUIFNVTShzY29yZSkgRlJPTSBzdHVkZW50X3Njb3JlcyBXSEVSRSBzZXNzaW9uX2lkID0gcy5pZCkgQVMgc2NvcmUsXG4gICAgICAgICAgICAoU0VMRUNUIFNVTShxLm1hcmtzKSBGUk9NIHN0dWRlbnRfc2NvcmVzIHNzIEpPSU4gcXVlc3Rpb25fYmFuayBxIE9OIHNzLnF1ZXN0aW9uX2lkID0gcS5pZCBXSEVSRSBzcy5zZXNzaW9uX2lkID0gcy5pZCkgQVMgZnVsbFNjb3JlXG4gICAgIEZST00gcmV3YXJkX2xvZyByXG4gICAgIEpPSU4gZXhhbV9zZXNzaW9ucyBzIE9OIHIuc2Vzc2lvbl9pZCA9IHMuaWRcbiAgICAgSk9JTiBleGFtX3BhcGVycyBwIE9OIHMuZXhhbV9wYXBlcl9pZCA9IHAuaWRcbiAgICAgV0hFUkUgci51c2VyX2lkID0gPyBBTkQgci50eXBlID0gJ3Njb3JlX3JhdGUnXG4gICAgIE9SREVSIEJZIHMuc3RhcnRlZF9hdCBERVNDYCxcbiAgICBbdXNlci5pZF1cbiAgKTtcblxuICBjb25zdCByZXN1bHQgPSByb3dzLm1hcCgocjogYW55KSA9PiAoe1xuICAgIC4uLnIsXG4gICAgYWNjdXJhY3k6IHIuZnVsbFNjb3JlID8gci5zY29yZSAvIHIuZnVsbFNjb3JlIDogMFxuICB9KSk7XG5cbiAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3VsdCk7XG59XG4iXSwibmFtZXMiOlsiZGIiLCJnZXRVc2VyRnJvbVJlcXVlc3QiLCJoYW5kbGVyIiwicmVxIiwicmVzIiwidXNlciIsInN0YXR1cyIsImpzb24iLCJlcnJvciIsInJvd3MiLCJxdWVyeSIsImlkIiwicmVzdWx0IiwibWFwIiwiciIsImFjY3VyYWN5IiwiZnVsbFNjb3JlIiwic2NvcmUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./src/pages/api/rewards-history.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Frewards-history&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Frewards-history.ts&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();