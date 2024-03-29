"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pinatastore = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class Pinatastore {
    constructor(apiKey, apiSecret) {
        if (!apiKey || !apiSecret)
            throw new Error("API Key, API Secret and JWT Token required");
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    /**
     * Returns the ipfs hash of the data file
     * @param {string} collection Name of the collection
     * @param {string} document Name/ID of the Document
     * @returns ipfs hash
     */
    getDocHash(collection, document) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${collection}/${document}`;
            return axios_1.default
                .get(`https://api.pinata.cloud/data/pinList?metadata[name]=${path}&status=pinned`, {
                headers: {
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.apiSecret,
                },
            })
                .then((res) => {
                return res.data.rows[0].metadata;
            });
        });
    }
    /**
     * Returns the data of the given document
     * @param {string} collection Name of the collection
     * @param {string} document Name/ID of the Document
     * @returns data of the specified document
     */
    getDoc(collection, document) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${collection}/${document}`;
            return axios_1.default
                .get(`https://api.pinata.cloud/data/pinList?metadata[name]=${path}&status=pinned`, {
                headers: {
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.apiSecret,
                },
            })
                .then((res) => {
                if (res.data.count > 0) {
                    return getContent(res.data.rows[0].ipfs_pin_hash, res.data.rows[0].metadata.keyvalues.document);
                }
                else {
                    return null;
                }
            });
        });
    }
    /**
     * Returns an array of documents
     * @param {string} collection Name of the collection
     * @returns Array of documents
     */
    getCollection(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default
                .get(`https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"collection":{"value":"users", "op": "eq"}}&status=pinned`, {
                headers: {
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.apiSecret,
                },
            })
                .then((res) => {
                let finalData = [];
                if (res.data.count > 0) {
                    for (let i = 0; i < res.data.count; i++) {
                        finalData.push(getContent(res.data.rows[i].ipfs_pin_hash, res.data.rows[i].metadata.keyvalues.document));
                    }
                }
                return Promise.all(finalData).then((res) => {
                    return res;
                });
            });
        });
    }
    /**
     * Returns an array of the ipfs hashes of the documents. These can be used to retrieve data on the client side
     * @param {string} collection Name of the collection
     * @returns Array of ipfs hashes
     */
    getCollectionHashes(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default
                .get(`https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"collection":{"value":"${collection}", "op": "eq"}}&status=pinned`, {
                headers: {
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.apiSecret,
                },
            })
                .then((res) => {
                let finalData = [];
                if (res.data.count > 0) {
                    for (let i = 0; i < res.data.count; i++) {
                        finalData.push(res.data.rows[i].ipfs_pin_hash);
                    }
                }
                return finalData;
            });
        });
    }
    /**
     * Adds data to a given collection. This will auto-generate a unique ID for the document
     * @param {string} collection Name of the collection
     * @param {Object} data JSON data
     * @param {Array<PrimaryKey>} [primaryKeys] An array of primary key(s) eg: [{keyName: "uid", keyValue: "abcd123"}]
     * @returns Autogenerated ID of the document
     */
    add(collection, data, primaryKeys = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (0, uuid_1.v4)();
            return pinData(collection, id, data, this.apiKey, this.apiSecret, primaryKeys).then((response) => {
                return id;
            });
        });
    }
    /**
     * set() will create a new document or rewrite the existing document of the given ID with the provided data
     * @param {string} collection Name of the collection
     * @param {string} document Name/ID of the Document
     * @param {Object} data JSON data
     * @param {Array<PrimaryKey>} [primaryKeys] An array of primary key(s) eg: [{keyName: "uid", keyValue: "abcd123"}]
     * @returns ipfs hash of the document
     */
    set(collection, document, data, primaryKeys = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = `${collection}/${document}.json`;
            return axios_1.default
                .get(`https://api.pinata.cloud/data/pinList?metadata[name]=${filename}&status=pinned`, {
                headers: {
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.apiSecret,
                },
            })
                .then((res) => {
                if (res.data.count === 0) {
                    // create a new file
                    return pinData(collection, document, data, this.apiKey, this.apiSecret, primaryKeys).then((response) => {
                        return response.data.IpfsHash;
                    });
                }
                else {
                    // delete old file and replace it with a new file
                    return unpinData(res.data.rows[0].ipfs_pin_hash, this.apiKey, this.apiSecret).then(() => {
                        return pinData(collection, document, data, this.apiKey, this.apiSecret, primaryKeys).then((response) => {
                            return response.data.IpfsHash;
                        });
                    });
                }
            });
        });
    }
}
exports.Pinatastore = Pinatastore;
function pinData(collection, document, data, apiKey, apiSecret, primaryKeys = []) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${collection}/${document}.json`;
        let pin = {
            pinataMetadata: {
                name: path,
                keyvalues: {
                    collection: collection,
                    document: document,
                },
            },
            pinataContent: {
                pushId: (0, uuid_1.v4)(),
                data: data,
            },
        };
        primaryKeys.forEach((pair) => {
            pin.pinataMetadata.keyvalues[pair["keyName"]] = pair["keyValue"];
        });
        return yield axios_1.default.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", pin, {
            headers: {
                pinata_api_key: apiKey,
                pinata_secret_api_key: apiSecret,
            },
        });
    });
}
function unpinData(cid, apiKey, apiSecret) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield axios_1.default.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            headers: {
                pinata_api_key: apiKey,
                pinata_secret_api_key: apiSecret,
            },
        });
    });
}
function getContent(cid, document) {
    return __awaiter(this, void 0, void 0, function* () {
        return axios_1.default.get(`https://gateway.pinata.cloud/ipfs/${cid}`).then((res) => {
            return {
                documentId: document,
                data: res.data.data,
            };
        });
    });
}
