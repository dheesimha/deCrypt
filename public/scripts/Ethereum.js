let ws = new WebSocket("wss://stream.binance.com:9443/ws/ethusdt@trade")
let stockPriceElement = document.getElementById("stock-price")
let lastPrice = null;

ws.onmessage = (event) => {
    console.log(event.srcElement.url)
    let stockObject = JSON.parse(event.data);
    let price = parseFloat(stockObject.p * 75).toFixed(2)
    stockPriceElement.innerText = "₹ " + parseFloat(stockObject.p * 75).toFixed(2);

    stockPriceElement.style.color = !lastPrice || lastPrice === price ? "gray" : price > lastPrice ? "#32CD32" : " #FF4433";

    lastPrice = price;
    console.log(stockObject.p);



}


let deleteEth = document.getElementById("removeEth")

deleteEth.addEventListener("click", () => {
    fetch("/track", {
        method: "delete",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "Ethereum"
        })
    })

        .then(res => {
            if (res.ok) {
                return res.json()
            }
        })
        .then(ws.close())

        .then(alert("Ethereum was deleted.Refresh the track page"))
})


