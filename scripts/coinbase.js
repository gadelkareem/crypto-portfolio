function coinbaseCoinPrice(symbol) {
    var listKey = `coinbasePriceList_${symbol}`
    var runningKey = 'running_coinbase'
    var response = cache.get(listKey)

    while (cache.get(runningKey) && !response) {
        Utilities.sleep(500)
    }

    if (!response) {
        cache.put(runningKey, true, 1)
        const url = `https://api.coinbase.com/v2/prices/${symbol}-USD/spot`
        response = UrlFetchApp.fetch(url, {
            'method': 'get',
            'muteHttpExceptions': true
        }).getContentText()
        cache.put(listKey, response, 21600) //6 Hours
        cache.put(runningKey, false, 1)
    }
    var l = JSON.parse(response)
    if (!l || !l.data || !l.data.amount) {
        cache.remove(listKey)
        console.log('Coinbase Error: ' + response)
        return 0
    }


    return l.data.amount
}

function coinbaseAssets() {
    var listKey = `coinbaseAssets`
    var response = cache.get(listKey)
    var key = keysSheet.getRange('B5').getValue()
    if (!key || key == 'test') {
        return {}
    }
    var secret = keysSheet.getRange('C5').getValue()
    if (!response) {
        var timestamp = googleCurrentTime(true),
            method = 'GET',
            path = '/v2/accounts',
            params = timestamp + method + path,
            url = 'https://api.coinbase.com' + path
        response = UrlFetchApp.fetch(url, {
            'method': method,
            'headers': {
                'CB-ACCESS-KEY': key,
                'CB-ACCESS-SIGN': computeHmacSignature(params, secret),
                'CB-ACCESS-TIMESTAMP': timestamp,
                'CB-VERSION': '2017-12-31',
            },
            'muteHttpExceptions': true
        }).getContentText()
        cache.put(listKey, response, 15)
    }

    l = JSON.parse(response).data
    if (!l) {
        console.log(response)
        cache.remove(listKey)
        throw new Error('Coinbase Error: ' + response)
    }
    var assets = {}
    for (a of l) {
        assets[a.currency.code] = assets[a.currency.code] || 0
        assets[a.currency.code] += parseFloat(a.balance.amount)
    }


    return removeZeros(assets)
}


