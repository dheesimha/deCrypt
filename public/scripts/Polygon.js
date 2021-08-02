let ws = new WebSocket("wss://stream.binance.com:9443/ws/maticusdt@trade")
let stockPriceElement = document.getElementById("stock-price")
let lastPrice = null;

ws.onmessage = (event) => {
    console.log(event.srcElement.url)
    let stockObject = JSON.parse(event.data);
    let price = parseFloat(stockObject.p * 75).toFixed(2)
    stockPriceElement.innerText = "₹ "+parseFloat(stockObject.p * 75).toFixed(2);

    stockPriceElement.style.color = !lastPrice || lastPrice === price ? "gray" : price > lastPrice ? "#32CD32" : " #FF4433";

    lastPrice = price;
    console.log(stockObject.p);



}




