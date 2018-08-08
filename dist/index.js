var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import 'reflect-metadata';
import { Injectable, ReflectiveInjector } from 'injection-js';
import * as CryptoJS from 'crypto-js';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { fromJS } from 'immutable';
import * as LZUTF8 from 'lzutf8';
var StateStoreService = /** @class */ (function () {
    function StateStoreService() {
        this.dataChanged = new Subject();
        this.config = {
            version: 'v1.0',
            appName: 'Insta State App',
            encryptionKey: 'B7aTOSBV4iyfDYHbcyRtefWc6NUO21DI',
            initialState: {
                testStateValue: 'Hello World',
            },
            migrateFunction: function (initialState, savedState) {
            }
        };
    }
    StateStoreService.prototype.initStateStore = function (config) {
        this.config = config;
        this.config.initialState.version = this.config.version;
        this.loadFromStorage();
    };
    StateStoreService.prototype.setValue = function (key, value, saveToStorage) {
        if (saveToStorage === void 0) { saveToStorage = true; }
        this.state[key] = value;
        this.dataChanged.next(key);
        if (saveToStorage) {
            if (!localStorage.getItem(this.config.appName)) {
                return;
            }
            var savedState = this.loadState();
            if (!savedState) {
                return;
            }
            var storedData = savedState;
            storedData[key] = value;
            this.saveState();
        }
    };
    StateStoreService.prototype.saveState = function () {
        var encrypted = this.encrypt(JSON.stringify(this.state)).toString();
        var state = LZUTF8.compress(encrypted);
        localStorage.setItem(this.config.appName, state);
    };
    StateStoreService.prototype.loadState = function () {
        if (!localStorage.getItem(this.config.appName)) {
            return null;
        }
        var nums = localStorage.getItem(this.config.appName).split(',').map(function (n) { return parseInt(n); });
        var bytes = new Uint8Array(nums);
        var data = LZUTF8.decompress(bytes);
        if (!JSON.parse(this.decrypt(data))) {
            return null;
        }
        return JSON.parse(this.decrypt(data));
    };
    StateStoreService.prototype.setBulkValues = function (dataObject, saveToStorage) {
        var _this = this;
        if (saveToStorage === void 0) { saveToStorage = true; }
        Object.keys(dataObject).forEach(function (key) {
            _this.state[key] = dataObject[key];
        });
        if (saveToStorage) {
            var savedState = this.loadState();
            if (!savedState) {
                return;
            }
            var storedData_1 = savedState;
            Object.keys(dataObject).forEach(function (key) {
                storedData_1[key] = dataObject[key];
            });
            this.saveState();
        }
        Object.keys(dataObject).forEach(function (key) {
            setTimeout(function () {
                _this.dataChanged.next(key);
            }, 100);
        });
    };
    StateStoreService.prototype.getValue = function (key) {
        return fromJS(this.state).toJS()[key];
    };
    StateStoreService.prototype.getState = function () {
        return fromJS(this.state).toJS();
    };
    StateStoreService.prototype.loadFromStorage = function () {
        if (!localStorage.getItem(this.config.appName)) {
            this.state = fromJS(this.config.initialState).toJS();
            this.saveState();
            return;
        }
        var savedState = this.loadState();
        if (!savedState) {
            this.saveState();
            return;
        }
        var state = savedState;
        if (state.version !== this.config.initialState.version) {
            state = this.config.migrateFunction(this.config.initialState, state);
            state.version = this.config.initialState.version;
        }
        this.state = state;
        this.saveState();
        this.dataChanged.next('');
    };
    StateStoreService.prototype.encrypt = function (data) {
        return CryptoJS.AES.encrypt(data, this.config.encryptionKey);
    };
    StateStoreService.prototype.decrypt = function (data) {
        return CryptoJS.AES.decrypt(data, this.config.encryptionKey).toString(CryptoJS.enc.Utf8);
    };
    StateStoreService.prototype.stateChanged = function (key) {
        var _this = this;
        if (key === void 0) { key = null; }
        return this.dataChanged.pipe(filter(function (storeKey) { return !key || key == storeKey || storeKey == ''; }), map(function () { return key ? _this.state[key] : _this.state; }));
    };
    StateStoreService = __decorate([
        Injectable()
    ], StateStoreService);
    return StateStoreService;
}());
export { StateStoreService };
var ServicesInjector = ReflectiveInjector.resolveAndCreate([StateStoreService]);
export function getStateStoreService() {
    return ServicesInjector.get(StateStoreService);
}
