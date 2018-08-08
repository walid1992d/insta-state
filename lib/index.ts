import 'reflect-metadata';
import { Injectable,ReflectiveInjector,Injector } from 'injection-js';
import * as CryptoJS from 'crypto-js';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { fromJS } from 'immutable';
import * as LZUTF8 from 'lzutf8';

@Injectable()
export class StateStoreService {
    private dataChanged: Subject<string> = new Subject<string>();
    private state: any;
    private config: StateConfig =  {
        version: 'v1.0',
        appName: 'Insta State App',
        encryptionKey: 'B7aTOSBV4iyfDYHbcyRtefWc6NUO21DI',
        initialState: {
            testStateValue: 'Hello World',
        },
        migrateFunction: (initialState:any, savedState: any) => {

        }
    }

    public initStateStore(config: StateConfig) {
        this.config =  config;
        this.config.initialState.version = this.config.version;
        this.loadFromStorage();

    }
   
    public setValue(key: string, value: any, saveToStorage: boolean = true) {
  
          this.state[key] = value;
          this.dataChanged.next(key);
          if (saveToStorage) {
              if (!localStorage.getItem(this.config.appName)) {
                  return;
              }
              const savedState = this.loadState();
              if(!savedState) {
      
                  return;
              }
              
              const storedData = savedState;
              storedData[key] = value;
              this.saveState();
          }
      }
  
      private saveState() {
          const encrypted = this.encrypt(JSON.stringify(this.state)).toString();
         const state = LZUTF8.compress(encrypted);
          localStorage.setItem(this.config.appName, state);
  
      }
  
      private loadState() {
  
          if(!localStorage.getItem(this.config.appName)) {
              return null;
          }
          const nums = localStorage.getItem(this.config.appName)!.split(',').map((n) => parseInt(n));
         const bytes = new Uint8Array(nums);
          const data = LZUTF8.decompress(bytes);
          if (!JSON.parse(this.decrypt(data))) {
              return null;
          }
          return JSON.parse(this.decrypt(data));
       }
  
      public setBulkValues(dataObject: any, saveToStorage: boolean = true) {
          Object.keys(dataObject).forEach((key) => {
              this.state[key] = dataObject[key];
          
          });
          if (saveToStorage) {
  
              const savedState = this.loadState();
              if(!savedState) {
                  return;
              }
              
              const storedData = savedState;
              Object.keys(dataObject).forEach((key) => {
                  storedData[key] = dataObject[key];
              });
              this.saveState();
          }
          Object.keys(dataObject).forEach((key) => {
              setTimeout(() => {
                  this.dataChanged.next(key);
              }, 100);
          
          });
      }
  
      public getValue(key: string) {
          return fromJS(this.state).toJS()[key];
      }
  
      public getState():any {
          return fromJS(this.state).toJS();
      }
      private loadFromStorage() {
          if (!localStorage.getItem(this.config.appName)) {
  
              this.state = fromJS(this.config.initialState).toJS();
              this.saveState();
              return;
          }
          const savedState = this.loadState();
          if(!savedState) {
              this.saveState();
  
              return;
          }
          
  
          let state = savedState;
          if(state.version !== this.config.initialState.version) {
            state =  this.config.migrateFunction(this.config.initialState, state);
            state.version = this.config.initialState.version;
          }

          this.state = state;
          this.saveState();
  
          
          this.dataChanged.next('');
      }
  
  
      
  
      private encrypt(data: string): string {
          return (CryptoJS.AES.encrypt(data, this.config.encryptionKey) as any);
      }
  
      private decrypt(data: string): string {
          return CryptoJS.AES.decrypt(data, this.config.encryptionKey).toString(CryptoJS.enc.Utf8);
      }


    public stateChanged(key = null): Observable<any> {
        return this.dataChanged.pipe(
            filter(storeKey =>  !key || key == storeKey || storeKey == ''),
            map(() => key ? this.state[key] : this.state)
        );
    }
  
  
  



}

 const ServicesInjector: Injector = ReflectiveInjector.resolveAndCreate([StateStoreService]);
export function getStateStoreService(): StateStoreService {
    return ServicesInjector.get(StateStoreService);
}
export interface StateConfig {
    version: string;
    appName: string;
    initialState: any;
    encryptionKey: string;
    migrateFunction: any;

}

