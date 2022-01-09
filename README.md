# 🦄 Pinatastore
A  simple module to store and retrieve simple JSON data from a decentralized databse. (Pinata IPFS) Pinatastore uses a structure similar to firebase and stores them in ipfs through Pinata. (Collections and Documents)

_Note: This project was made for educational puposes only. But feel free to use it in your projects_

## Coming soon
- Query by primary key

## Use this if ...
- Your data is not complex
- You plan to use this on the server side
- Your data doesn't need encryption


## Installation
```
npm install pinatastore
```
or
```
yarn add pinatastore
```

## Setup
```
import { Pinatastore } from "pinatastore"
const db = new Pinatastore(API_KEY, API_SECRET)
```
You can get the API key and API secret from the Pinata dashboard.

## Methods
`db.add(collection, data [, primaryKeys] `  ➔ returns the autogenerated ID of the document

Adds data to a given collection. This will auto-generate a unique ID for the document

- collection `String`
  - Name of the collection
- data `Object`
  - A JS Object with data you want to store
- primaryKeys 
  - (Coming soon)

### Example
```
db.add("users", {
    name: "John",
    age: 34
});
```
 
`db.set(collection, document, data [, primaryKeys] `  ➔ returns the ipfs hash ID of the document

set() will create a new document or rewrite the existing document of the given ID with the provided data

- collection `String`
  - Name of the collection
- document `String`
  - Name of the document
- data `Object`
  - A JS Object with data you want to store
- primaryKeys 
  - (Coming soon)
  - 

### Example
```
db.set("cities", "london", {
    population: "8.982 million"
});
```


---
_Keep in mind that this was made entirely because I was bored so there might be bugs here and there. Please feel free to open issues or contribute to the project :)_
