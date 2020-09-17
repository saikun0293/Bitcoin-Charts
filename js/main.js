/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/
// Time parser for x-scale
let modifiedData;
let lineChart1,lineChart2,lineChart3,lineChart4,lineChart5;
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
    

//---DETECTION IN CHANGE-----
$("#coin-select").on("change",updateCharts);
$("#var-select").on("change",updateCharts);


//-----SLIDER---------------
//.getTime() function returns the number of milliseconds since 1 January 1970
//In date object we can provide the date in string or milliseconds or year,month,day format


$("#date-slider").slider({
    min: parseTime("12/05/2013").getTime(),
    max: parseTime("31/10/2017").getTime(),
    step:86400000, //number of milliseconds in a day
    range:true,
    values:[parseTime("12/05/2013").getTime(),parseTime("31/10/2017").getTime()],
    slide: function(event,ui){
        $("#dateLabel1").html(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").html(formatTime(new Date(ui.values[1])));
        updateCharts();
    }
})

//-----Details---------
//data is a js object with options of coins arrays
//each coins arrays is of numerous js objects with keys as 24h_vol date market_cap and price_usd which can also be selected using select dropdown


d3.json("data/coins.json").then(function(data) {

    //----.hasOwnProperty()--------
    //A Boolean indicating whether or not the object has the specified property as own property

    //----DATA FORMATTING------------
    for(var x in data){
        if(!data.hasOwnProperty(x)){
            continue;
        }

        let d=data[x];
        d.forEach(function(day){
            (day["24h_vol"]!==null) && (day["24h_vol"]=+day["24h_vol"]);
            (day.date!==null) && (day.date=parseTime(day.date));
            (day.market_cap!==null) && (day.market_cap=+day.market_cap);
            (day.price_usd!==null) && (day.price_usd=+day.price_usd);
        })
    }

    modifiedData=data;
    lineChart1=new LineChart("#chart-area1","bitcoin");
    lineChart2=new LineChart("#chart-area2","ethereum");
    lineChart3=new LineChart("#chart-area3","bitcoin_cash");
    lineChart4=new LineChart("#chart-area4","litecoin");
    lineChart5=new LineChart("#chart-area5","ripple");
});


function updateCharts(){
    lineChart1.wrangleData();
    lineChart2.wrangleData();
    lineChart3.wrangleData();
    lineChart4.wrangleData();
    lineChart5.wrangleData();
}


















