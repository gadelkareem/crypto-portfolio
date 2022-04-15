function kucoinPrivate(endpoint, method) {
    var key = keysSheet.getRange('B7').getValue()
    var api_secret = keysSheet.getRange('C7').getValue()
    var api_passphrase = keysSheet.getRange('D7').getValue()
    var url = 'https://api.kucoin.com' + endpoint
    var api_nonce = Date.now().toString()
    var str_to_sign = api_nonce + method + endpoint

    var signature = Utilities.base64Encode(Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, str_to_sign, api_secret))
    var passphrase = Utilities.base64Encode(Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, api_passphrase, api_secret))

    var headers = {
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': api_nonce,
        'KC-API-KEY': key,
        'KC-API-PASSPHRASE': passphrase,
        'KC-API-KEY-VERSION': '2'
    }
    // console.log(headers)
    var response = UrlFetchApp.fetch(url, {
        'method': 'get',
        'headers': headers,
        'muteHttpExceptions': true
    })

    return response.getContentText()
}


function kucoinAssets() {
    var key = keysSheet.getRange('B7').getValue()
    if (!key || key === 'test') {
        return {}
    }
    var listKey = `kucoinAssets`;
    var response = cache.get(listKey);
    if (!response) {
        response = kucoinPrivate('/api/v1/accounts', 'GET')
        cache.put(listKey, response, 21600); //6 Hours
    }
    // console.log(response)
    var l = JSON.parse(response)
    if (!l || !l.data) {
        console.log(response)
        cache.remove(listKey)
        throw new Error('kucoin Error: ' + response)
    }
    var assets = {}
    for (a of l.data) {
        assets[a.currency] = parseFloat(a.balance)
    }

    assets = mergeObjects([assets, kucoinLockedAssets()])
    // console.log(assets)
    return removeZeros(assets)
}


function kucoinLockedAssets() {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crypto: Kucoin Locked"),
        rows = ss.getDataRange().getNumRows(),
        l = ss.getRange(2, 1, rows, 2).getValues()

    var assets = {}
    for (a of l) {
        if (a[0] in assets) {
            throw new Error('Kucoin locked error: repeated coin ' + a[0])
        }
        assets[a[0]] = a[1]
    }

    return removeZeros(assets)
}








