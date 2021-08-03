let ws = new WebSocket("wss://stream.binance.com:9443/ws/ltcusdt@trade")
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


let deleteLtc = document.getElementById("removeLtc")

deleteLtc.addEventListener("click", () => {
    fetch("/track", {
        method: "delete",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "Litecoin"
        })
    })

        .then(res => {
            if (res.ok) {
                return res.json()
            }
        })

        .then(alert("Litecoin was deleted.Refresh the track page"))
})


