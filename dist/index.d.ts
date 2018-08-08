import 'reflect-metadata';
import { Observable } from 'rxjs';
export declare class StateStoreService {
    private dataChanged;
    private state;
    private config;
    initStateStore(config: StateConfig): void;
    setValue(key: string, value: any, saveToStorage?: boolean): void;
    private saveState;
    private loadState;
    setBulkValues(dataObject: any, saveToStorage?: boolean): void;
    getValue(key: string): any;
    getState(): any;
    private loadFromStorage;
    private encrypt;
    private decrypt;
    stateChanged(key?: any): Observable<any>;
}
export declare function getStateStoreService(): StateStoreService;
export interface StateConfig {
    version: string;
    appName: string;
    initialState: any;
    encryptionKey: string;
    migrateFunction: any;
}
