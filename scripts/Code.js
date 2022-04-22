var cryptoSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crypto"),
    cryptoHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crypto: History"),
    keysSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Keys"),
    cache = CacheService.getScriptCache()


function onOpen() {
    displayCryptoAssets()
}

function googleCurrentTime(ms) {
    var date = new Date()
    var t = date.getTime()
    if (ms) {
        t = t / 1000
    }

    return Math.floor(t).toString()
}

function computeHmacSignature(inputs, secret) {
    return Utilities
        .computeHmacSha256Signature(inputs, secret)
        .reduce(function (str, chr) {
            chr = (chr < 0 ? chr + 256 : chr).toString(16)
            return str + (chr.length === 1 ? '0' : '') + chr
        }, '')
}

function removeZeros(o) {
    return Object.fromEntries(Object.entries(o).filter(([k, v]) => !!v))
}

function mergeObjects(obs) {
    return obs.reduce((as, as1) => {
        for (const [k, v] of Object.entries(as1)) {
            as[k] = as[k] || 0
            as[k] += v
        }

        return as
    }, {})
}

function randomCoin(n) {
    var cs = ['BTC', 'LTC', 'ETH', 'NEO', 'BNB', 'QTUM', 'EOS', 'BNT', 'BCC', 'USDT', 'MCO', 'ZRX', 'OMG', 'LRC', 'KNC', 'IOTA', 'LINK', 'REP', 'MTL', 'STX', 'ETC', 'ZEC', 'BAT', 'DASH', 'POWR', 'BTG', 'XMR', 'ENJ', 'XRP', 'STORJ', 'MANA', 'GXS', 'XZC', 'LSK', 'ADA', 'LEND', 'WAVES', 'ICX', 'RLC', 'NANO', 'SYS', 'ONT', 'TUSD', 'ZEN', 'THETA', 'ONG', 'HC', 'PAX', 'DCR', 'USDC', 'BCHABC', 'BCHSV', 'USDS', 'MATIC', 'ATOM', 'FTM', 'USDSB', 'ALGO', 'COCOS', 'TOMO', 'BUSD', 'BAND', 'XTZ', 'GBP', 'EUR', 'KAVA', 'BCH', 'FTT', 'AUD', 'DREP', 'BULL', 'BEAR', 'ETHBULL', 'ETHBEAR', 'XRPBULL', 'XRPBEAR', 'EOSBULL', 'EOSBEAR', 'WRX', 'BNBBULL', 'BNBBEAR', 'HIVE', 'SOL', 'BTCUP', 'HNT', 'PNT', 'COMP', 'MKR', 'SXP', 'SNX', 'DAI', 'ETHUP', 'ETHDOWN', 'ADAUP', 'DOT', 'RUNE', 'BNBUP', 'XTZDOWN', 'AVA', 'BAL', 'YFI', 'SRM', 'ANT', 'CRV', 'SAND', 'NMR', 'LUNA', 'PAXG', 'WNXM', 'TRB', 'EGLD', 'WBTC', 'KSM', 'SUSHI', 'YFII', 'DIA', 'BEL', 'UMA', 'TRXDOWN', 'XRPUP', 'DOTUP', 'DOTDOWN', 'WING', 'LTCDOWN', 'UNI', 'AVAX', 'BURGER', 'BAKE', 'SCRT', 'XVS', 'CAKE', 'UNIUP', 'UNIDOWN', 'ORN', 'NEAR', 'AAVE', 'FIL', 'INJ', 'YFIDOWN', 'CTK', 'AUDIO', 'AXS', 'KP3R', 'STRAX', 'UNFI', 'CVP', 'FRONT', 'AAVEUP', 'BETH', 'SUSD', 'GHST', 'SUSHIDOWN', 'XLMDOWN', 'JUV', 'PSG', 'CELO', 'TWT', 'OG', 'ATM', 'ASR', '1INCH', 'BTCST', 'DEXE', 'FIRO', 'LIT', 'SFP', 'FXS', 'AUCTION', 'ACM', 'BADGER', 'FIS', 'ALICE', 'DEGO']
    var result = new Array(n),
        len = cs.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("randomCoin: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = cs[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function randomNum(min, max) {
    return Math.floor((Math.random()) * (max - min + 1)) + min;
}


function testAssets() {
    var cs = randomCoin(20)
    var assets = {}
    for (var c of cs) {
        var num = randomNum(100, 10000) / coinPrice(c)
        if (!isFinite(num)) {
            num = randomNum(Number.MAX_SAFE_INTEGER - (Number.MAX_SAFE_INTEGER / 2), Number.MAX_SAFE_INTEGER)
        }
        assets[c] = num
    }

    return assets
}

function displayCryptoAssets() {
    var ka, ba, cba, ofa, cca, kca, ftx, bfi, cls, nxo

    if (keysSheet.getRange('B3').getValue() === 'test') {
        ka = testAssets()
        ba = testAssets()
        cba = testAssets()
        ofa = offlineAssets()
        cca = testAssets()
        kca = testAssets()
        ftx = testAssets()
        bfi = testAssets()
        cls = testAssets()
        nxo = testAssets()
    } else {
        ka = krakenAssets()
        ba = binanceAssets()
        cba = coinbaseAssets()
        ofa = offlineAssets()
        cca = cryptoComAssets()
        kca = kucoinAssets()
        ftx = ftxAssets()
        bfi = blockfiAssets()
        cls = celsiusAssets()
        nxo = nexoAssets()
    }


    var assets = mergeObjects([ka, ba, cba, ofa, cca, kca, ftx, bfi, cls, nxo])
    if (!Object.keys(assets).length) {
        throw new Error('No assets found!')
    }

    var l = [], i = 1
    for (k in assets) {
        if (!assets[k]) {
            continue
        }
        var p = coinPrice(k)
        i++
        l.push([k, assets[k], p * assets[k], '', '', '', p, ka[k], ba[k], cba[k], ofa[k], cca[k], kca[k], ftx[k], bfi[k], cls[k], nxo[k]])
    }
    l.sort(function (a, b) {
        return b[2] - a[2]
    })
    var t = l.length
    l.unshift(['', '', '', `=SUM(C2:C${t})`, `=D1*GOOGLEFINANCE("CURRENCY:USDEUR")`, '', 'Coin Price', 'Kraken', 'Binance', 'Coinbase', 'Offline', 'Crypto.com', 'KuCoin', 'FTX', 'BlockFi', 'Celsius', 'Nexo', ''])
    var ln = l[0].length - 1
    for (var i = 1; i < l.length; i++) {
        l[i][3] = '=(C' + (i + 1) + ')/D1'
        l[i][ln] = `=HYPERLINK(CONCATENATE("https://www.tradingview.com/symbols/${l[i][0]}USD/"),"${l[i][0]}")`
    }


    cryptoSheet.clearContents()
    cryptoSheet.getRange(1, 1, l.length, l[0].length).setValues(l)
}

function totalAssetsBalance(assets) {
    var t = 0
    for (k in assets) {
        t += coinPrice(k) * assets[k]
    }
    return t
}

function fillCryptoHistory() {
    var rows = cryptoHistorySheet.getDataRange().getNumRows(),
        l = cryptoHistorySheet.getRange(rows, 1, 1, 10).getValues()

    var today = new Date(),
        rowDate = l[0][0]


    if (rowDate != 'Date' && rowDate.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)) {
        return
    }
    l = [
        totalAssetsBalance(offlineAssets()),
        totalAssetsBalance(binanceAssets()),
        totalAssetsBalance(krakenAssets()),
        totalAssetsBalance(coinbaseAssets()),
        totalAssetsBalance(cryptoComAssets()),
        totalAssetsBalance(kucoinAssets()),
        totalAssetsBalance(ftxAssets()),
        totalAssetsBalance(blockfiAssets()),
        totalAssetsBalance(celsiusAssets()),
        totalAssetsBalance(nexoAssets()),
    ]
    l.unshift(l.reduce((a, b) => a + b, 0))
    l.unshift(today)

    cryptoHistorySheet.getRange(rows + 1, 1, 1, l.length).setValues([l])
}

function coinPrice(symbol) {
    return binanceCoinPrice(symbol) || coinbaseCoinPrice(symbol) || coinMarketCapCoinPrice(symbol) || krakenCoinPrice(symbol) || coingeckoCoinPrice(symbol)
}
