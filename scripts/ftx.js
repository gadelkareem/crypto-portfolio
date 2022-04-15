function ftxPrivate(endpoint, method) {
    var key = keysSheet.getRange('B8').getValue()
    var secret = keysSheet.getRange('C8').getValue()
    var host = 'https://ftx.com';
    var url = host + endpoint;
    var timestamp = '' + new Date().getTime();
    var payload = timestamp + method + endpoint + '';
    var signature = Utilities.computeHmacSha256Signature(payload, secret).map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
    var options = {
        method: method,
        headers: {
            'FTX-KEY': key,
            'FTX-TS': timestamp,
            'FTX-SIGN': signature
        },
        muteHttpExceptions: true
    }
    var response = UrlFetchApp.fetch(url, options);
    // console.log(response.getContentText())
    return response.getContentText()
}


function ftxAssets() {
    var key = keysSheet.getRange('B8').getValue()
    if (!key || key == 'test') {
        return {}
    }
    var listKey = `ftxAssets`;
    var response = cache.get(listKey);
    if (!response) {
        response = ftxPrivate('/api/wallet/all_balances', 'GET')
        cache.put(listKey, response, 21600); //6 Hours
    }
    // console.log(response)
    var l = JSON.parse(response)
    if (!l || !l.result) {
        console.log(response)
        cache.remove(listKey)
        throw new Error('FTX Error: ' + response)
    }
    var assets = {}
    for (a of l.result.main) {
        assets[a.coin] = parseFloat(a.total)
    }

    // console.log(assets)
    return removeZeros(assets)
}



