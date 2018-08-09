# insta-state

Reactive state store that works  with Angular, React, Vue or any nodejs based front-end app. The module allows you to have a state store thats shared among all your app, allow your components to listen to state changes and it auto syncronises your state with browser local storage while encrypting and compressing the state before saving it. The module also allows you to migrate your state to a newer version when you push changes to the state schema

## Getting Started

These instructions will guide you to install and integrate the insta-state module in your app.

### Prerequisites

The module uses  [RxJS](https://github.com/ReactiveX/rxjs) observables for notifying your components abour state changes, so a basic knowldge about RxJS is prefered before using this module

### Installing

install the module through npm
```
npm install --save insta-state
```
Go the the main file in your app and initialize the store, the main file will be `main.ts` in Angular, `index.jsx` or `index.tsx` in React, its required to initialize the store before any of your components starts.
In your main file import the `getStateStoreService` function

```
import { getStateStoreService } from 'insta-state';
```

use the function to get a new reference to state store service

```
const stateService = getStateStoreService();
```

init the state service with the following parameters

```
stateService.initStateStore({
 version: 'v1.0', // state version,
 encryptionKey: '9QNAoahRzs', // state encryption key,
 appName: 'My App', // app name to be used in local storage,
 initialState:  { // inital state of the app
   color: 'blue',
   fontSize: '16pt',
   userSavedConfigs: {},
  },
 migrateFunction: function(initialState, savedState) { // migration method
    const state = savedState;
   state.color = initialState.color;
   state.fontSize = initialState.fontSize;
    return state;
  },

});

```

here you find details of  paramters you need to pass

| Parameter  | Description |
| ------------- | ------------- |
| version  | The version of your state, its important to change version whenever you apply changes to state schema, so the module detects the version change and applies migration  |
| encryptionKey  | key used to encrypt your state store before saving it  |
| appName  | The key name of your state in the browser localstorage  |
| initialState  | Your default state values |
| migrateFunction  | A method specifies what to do when module detects state version change, for example if use has on his device state version 1.0 and you pushed a new version with state v1.5, the module will automatically call the migrateFunction, its always a function with 2 arguments of intialState and savedState where you specifiy what to do between both version, in the above example we took the values of color and fontSize from the initialState to the savedState without refreshing the userSavedConfigs, the function should always return the migrated state object|

Now the state store is up and running, run your app and   check your browser local storage you will find a key of the `appName` which is `My App` in the above example, and its value is array of binary data, the data saved in binary because its encrypted and compressed before going to localstorage.


## Accessing The State

You can access the state from any component in your app, import the `getStateStoreService` in your component

```
import { getStateStoreService } from 'insta-state';
```

inside your component class create a new reference to your state

```
export class ComponentA {
  stateStore = getStateStoreService();
  constractor() {}
 ```

 to get the whole state you can use the method `getState()`
 ```
    var state = this.stateStore.getState();
 ```

 now if you do 

 ```
console.log('STATE',state);
 ```
 it will show the whole state in your console.

to get a single value from your state use the method `getValue(key)`

```
 this.stateStore.getValue('color')

```

## Changing The State

to set a value in your state use the method `setValue(key,value)`

```
  this.stateStore.setValue('color','yellow');
```
it will update the value in both state and localstorage, if you want to only update the state only without the localstorage pass `false` as a third argument

```
  this.stateStore.setValue('color','yellow',false);
```

to update multi values in one call you can use the function `setBulkValues(dataObject)`

```
this.stateStore.setBulkValues({color:'yellow',fontSize:'12pt'});
```
and similar to `setValue()` you can pass an optional argumant to apply changes to state only without localStorage

```
this.stateStore.setBulkValues({color:'yellow',fontSize:'12pt'},false);
```



## Listen to State Changes

Lets say we have a method in ComponentA that applies  changes to the `color` value in our state, and we want ComponentB to get notified whenever state is changed, we will create a new reference of stateService in ComponentB

```
import { getStateStoreService } from 'insta-state';
```

```
export class ComponentB {
  stateStore = getStateStoreService();
  constractor() {}
 ```

 Now in ComponentB we can subscribe to state changes, to get notified about any state change use the method `stateChanged()` which returns an RxJS observable

 ```
 this.stateStore.stateChanged().subscribe((state) => {
       console.log('State changed:'+ state);
   });

 ```


 this will listen to any change happens in the state and gives you the new updated state. To listen to specific value change in the state use the same method while passing the key to it `stateChanged(key)`

```
  this.stateStore.stateChanged('color').subscribe((value) => {
       console.log('Color changed:', value); 
   });
```
This will only listen to changes happens on `color`, so if `fontSize` is changed this listener will ignore it.

## State Migration

State migration happens automatically when you change the version of your initial state, lets try at first to change the inital state values without the version

```
stateService.initStateStore({
 version: 'v1.0', // state version,
 encryptionKey: '9QNAoahRzs', // state encryption key,
 appName: 'My App', // app name to be used in local storage,
 initialState:  { // inital state of the app
   color: 'red',
   fontSize: '15pt',
   userSavedConfigs: {},
  },
 migrateFunction: function(initialState, savedState) { // migration method
    const state = savedState;
   state.color = initialState.color;
   state.fontSize = initialState.fontSize;
    return state;
  },

});

```

start the app and print your state, you will see that color is still `blue` and fontSize still `16pt`, this is because the version didn't change so the app will ignore the initalSate on devices that has a saved state and will only apply it on devices that runs your app for the first time. To make sure that all devices get your new values change the version


```
stateService.initStateStore({
 version: 'v1.1', // state version,
 encryptionKey: '9QNAoahRzs', // state encryption key,
 appName: 'My App', // app name to be used in local storage,
 initialState:  { // inital state of the app
   color: 'red',
   fontSize: '15pt',
   userSavedConfigs: {},
  },
 migrateFunction: function(initialState, savedState) { // migration method
    const state = savedState;
   state.color = initialState.color;
   state.fontSize = initialState.fontSize;
    return state;
  },

});

```
Now if you print the state in any device you will notice that it has the new valus from initalState applied to savedState using the `migrateFunction`

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/walid1992d/insta-state/tags). 

## Authors

* Walid Abou Ali - *Initial work* - [walid1992d](https://github.com/walid1992d)



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


