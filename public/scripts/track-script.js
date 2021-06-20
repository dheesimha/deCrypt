// var tags = [ 
//   "Bitcoin",
//   "Ethereum",
//   "Cardano",
//   "Tether",
//   "Binancecoin",
//   "Dogecoin",
//   "XRP",
//   "Polygon",
//   "Polkadot",
//   "Litecoin",
//   "Bitcoin Cash",
//   "Chainlink"
//     ];

//     /*list of available options*/
//    var n= tags.length;   

//    function ac(value) {
//       document.getElementById('datalist').innerHTML = '';
//        //setting datalist empty at the start of function

//        l=value.length;
//        //input query length
//    for (var i = 0; i<n; i++) {
//        if(((tags[i].toLowerCase()).indexOf(value.toLowerCase()))>-1)
//        {
//            //comparing if input string is existing in tags[i] string

//            var node = document.createElement("option");
//            var val = document.createTextNode(tags[i]);
//             node.appendChild(val);

//              document.getElementById("datalist").appendChild(node);
//                  //creating and appending new elements in data list
//            }
//        }
//    }