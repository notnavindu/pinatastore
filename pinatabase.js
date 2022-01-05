import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

export default class Pinatabase {
    constructor(apiKey, apiSecret) {
        if (!apiKey || !apiSecret) throw new Error('API Key, API Secret and JWT Token required');

        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }


    async add(collection, data) {
        return pinData(collection, uuidv4(), data, this.apiKey, this.apiSecret).then(response => { return response.data.IpfsHash })
    }

    async set(collection, document, data) {
        const filename = `${collection}/${document}.json`

        axios.get(`https://api.pinata.cloud/data/pinList?metadata[name]=${filename}&status=pinned`, {
            headers: {
                pinata_api_key: this.apiKey,
                pinata_secret_api_key: this.apiSecret
            }
        }).then(res => {
            if (res.data.count === 0) {
                return pinData(collection, document, data, this.apiKey, this.apiSecret).then(response => { return response.data.IpfsHash })
            } else {
                return unpinData(res.data.rows[0].ipfs_pin_hash, this.apiKey, this.apiSecret).then(() => {
                    return pinData(collection, document, data, this.apiKey, this.apiSecret).then(response => { return response.data.IpfsHash })
                })
            }
        })
    }
}


async function pinData(collection, document, data, apiKey, apiSecret) {
    const path = `${collection}/${document}`

    const pin = {
        pinataMetadata: {
            name: `${path}.json`
        },
        pinataContent: {
            pushId: uuidv4(),
            data: data
        }
    }

    return await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", pin, {
        headers: {
            pinata_api_key: apiKey,
            pinata_secret_api_key: apiSecret
        }
    })
}

async function unpinData(cid, apiKey, apiSecret) {
    return await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
        headers: {
            pinata_api_key: apiKey,
            pinata_secret_api_key: apiSecret
        }
    })
}