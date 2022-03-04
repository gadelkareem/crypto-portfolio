# Crypto Portfolio

Cryptocurrency portfolio Google sheet to collect and analyze cryptocurrency data and generate reports from your accounts on several crypto exchanges.

![](img/graph1.png)
![](img/graph2.png)

# Features:
- [x] Collect cryptocurrency data from multiple exchanges.
- [x] Generate reports from your accounts.
- [x] Generate graphs from your portfolio.
- [x] Cache data to reduce API calls.
- [x] Gather coin prices from multiple exchanges.

# Supported exchanges:
 - [Binance](https://accounts.binance.com/en/register?ref=114054479)
 - [Kraken](https://www.kraken.com/en-us/register)
 - [Coinbase](https://www.coinbase.com/join/gadelk_p)
 - [Crypto.com](https://crypto.com/exch/8e8ju9mark)

Coin price data is collected from CoinMarketCap and CoinGecko in addition to the exchanges above.

# Installation:
- Open ready template [https://docs.google.com/spreadsheets/d/1Xt03dgaP-d1wFatrncyyR6mOnwE_oFHZpaQQRjpw-_s/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1Xt03dgaP-d1wFatrncyyR6mOnwE_oFHZpaQQRjpw-_s/edit?usp=sharing)
- Open File > Make a copy to be able to edit the document.
- Open Extensions >  Apps Script.
- Press 'Run' from top menu and give permissions to the Crypto Balance project.
- Add your API keys to the Keys sheet and leave out the ones you do not need.
- Clear the 'Crypto: History' sheet from test data, so it tracks your own portfolio history.
- Add these two 'on edit' triggers to Apps Script:
![](img/trigger1.png)
![](img/trigger2.png)
- The Crypto sheet should now update on every edit.
- To switch back to the test data, add 'test' to the binance API Key cell.
- Sign up on the exchanges using our referral link:
    - [https://accounts.binance.com/en/register?ref=114054479](https://accounts.binance.com/en/register?ref=114054479)
    - [https://www.coinbase.com/join/gadelk_p](https://www.coinbase.com/join/gadelk_p)
    - [https://crypto.com/exch/8e8ju9mark](https://crypto.com/exch/8e8ju9mark)
    
    - [https://pro.coinmarketcap.com/signup/](https://pro.coinmarketcap.com/signup/)
