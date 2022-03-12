"use strict";
(() => {
var exports = {};
exports.id = 920;
exports.ids = [920];
exports.modules = {

/***/ 81:
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ 414:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ handler)
});

// EXTERNAL MODULE: external "child_process"
var external_child_process_ = __webpack_require__(81);
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_namespaceObject);
;// CONCATENATED MODULE: ./pages/api/wifi/join.ts


async function handler(req, res) {
    console.log('start');
    if (req.method !== 'POST') {
        console.log('wrong method', req.method);
        return res.status(405);
    }
    // This is ... not great.. come up with something better
    const scriptRoot = __dirname.split('configurator/')[0] + 'configurator/';
    const body = req.body;
    return new Promise((resolve, reject)=>{
        var _country;
        (0,external_child_process_.exec)(`sudo ${external_path_default().join(scriptRoot, 'scripts/add-wifi-network.sh')} ${body.ssid} ${body.passphrase} ${(_country = body.country) !== null && _country !== void 0 ? _country : 'GB'}`, (err, stdout)=>{
            if (err) {
                console.log(err);
                return reject(res.status(200).json({
                    result: 'error',
                    type: 'UnknownError',
                    data: {
                        message: 'failed to add network'
                    }
                }));
            }
            if (stdout.indexOf('Wifi failed to connect, falling back to Hotspot.') > -1) {
                return reject(res.status(200).json({
                    result: 'error',
                    type: 'PasswordError',
                    data: {
                        message: 'failed to join network, password incorrect, please try again'
                    }
                }));
            }
            resolve(res.status(200).json({
                result: 'success'
            }));
        });
    });
};


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(414));
module.exports = __webpack_exports__;

})();