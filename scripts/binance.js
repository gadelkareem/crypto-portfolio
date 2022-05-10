function binanceCoinPrice(symbol) {
    var listKey = 'binancePriceList'
    var runningKey = 'running_binance'
    var response = cache.get(listKey)

    while (cache.get(runningKey) && !response) {
        Utilities.sleep(500)
    }

    if (!response) {
        cache.put(runningKey, true, 1)
        const url = `https://api1.binance.com/api/v1/ticker/allPrices`
        response = UrlFetchApp.fetch(url, {
            'method': 'get',
            'muteHttpExceptions': true
        }).getContentText()
        cache.put(listKey, response, 21600) //6 Hours
        cache.put(runningKey, false, 1)
    }
    var l = JSON.parse(response) || []
    if (!l.length) {
        cache.remove(listKey)
        console.log('Binance Error: ' + response)
        return 0
    }
    var price = 0
    fullSymbol = symbol + 'USDT'
    for (i of l) {
        if (i.symbol.toLowerCase() === fullSymbol.toLowerCase()) {
            price = i.price
            break
        }
    }


    return price
}

function binanceAssets() {
    var listKey = `binanceAssets`
    var response = cache.get(listKey)
    var key = keysSheet.getRange('B3').getValue()
    if (!key || key == 'test') {
        return {}
    }
    if (!response) {
        var params = 'recvWindow=60000&timestamp=' + googleCurrentTime(false)
        var url = 'https://api1.binance.com/api/v3/account?' + params + '&signature=' + computeHmacSignature(params, keysSheet.getRange('C3').getValue())
        response = UrlFetchApp.fetch(url, {
            'method': 'get',
            'headers': {
                'X-MBX-APIKEY': key,
            },
            'muteHttpExceptions': true
        }).getContentText()
        cache.put(listKey, response, 15)
    }

    l = JSON.parse(response).balances
    if (!l) {
        console.log(response)
        cache.remove(listKey)
        throw new Error('Binance Error: ' + response)
    }

    var assets = {}
    for (a of l) {
        var t = parseFloat(a.free) + parseFloat(a.locked)
        if (a.asset in assets) {
            t += assets[a.asset]
        }
        assets[a.asset] = t
    }
    var rx = /(^LD|DOWN$|UP$)/ig
    for (k in assets) {
        if (!k.match(rx)) {
            continue
        }
        nk = k.replace('LDBAKET', 'LDBAKE').replace(rx, '')
        if (nk in assets) {
            assets[nk] += assets[k]
            delete assets[k]
        }
    }

    assets = mergeObjects([assets, binanceLockedAssets()])

    return removeZeros(assets)
}


function binanceLockedAssets() {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crypto: Binance Locked"),
        rows = ss.getDataRange().getNumRows(),
        l = ss.getRange(2, 1, rows, 2).getValues()

    var assets = {}
    for (a of l) {
        if (a[0] in assets) {
            throw new Error('Binance locked error: repeated coin ' + a[0])
        }
        assets[a[0]] = a[1]
    }

    return removeZeros(assets)
}
