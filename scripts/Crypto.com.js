function cryptoComPrivate(endpoint, method, params) {
    var key = keysSheet.getRange('B6').getValue()
    request = {id: 11, 'method': endpoint, "params": params || {}, "nonce": googleCurrentTime(false), 'api_key': key}
    api_secret = keysSheet.getRange('C6').getValue()
    paramsString =
        params == null
            ? ""
            : Object.keys(params)
                .sort()
                .reduce((a, b) => {
                    return a + b + params[b];
                }, "");
    sigPayload = endpoint + 11 + request.api_key + paramsString + request.nonce

    request.sig = computeHmacSignature(sigPayload, api_secret)

    requestBody = JSON.stringify(request)
    http_options = {'method': method, 'payload': requestBody, contentType: "application/json"}
    http_response = UrlFetchApp.fetch('https://api.crypto.com/v2/' + endpoint, http_options)
    return http_response.getContentText()
}


function cryptoComAssets() {
    var key = keysSheet.getRange('B6').getValue()
    if (!key || key == 'test') {
        return {}
    }
    var listKey = `cryptoComAssets`;
    var response = cache.get(listKey);
    if (!response) {
        response = cryptoComPrivate('private/get-account-summary', 'POST', '')
        cache.put(listKey, response, 15)
    }
    // console.log(response)
    var l = JSON.parse(response).result
    if (!l || !l.accounts) {
        console.log(response)
        cache.remove(listKey)
        throw new Error('Crypto.com Error: ' + response)
    }
    var assets = {}
    for (a of l.accounts) {
        assets[a.currency] = parseFloat(a.balance)
    }
    assets = mergeObjects([assets, cryptoComLockedAssets()])
    // console.log(assets)
    return removeZeros(assets)
}

function cryptoComLockedAssets() {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crypto: Crypto.com APP"),
        rows = ss.getDataRange().getNumRows(),
        l = ss.getRange(2, 1, rows, 2).getValues()

    var assets = {}
    for (a of l) {
        if (a[0] in assets) {
            throw new Error('Crypto.com locked error: repeated coin ' + a[0])
        }
        assets[a[0]] = a[1]
    }

    return removeZeros(assets)
}




