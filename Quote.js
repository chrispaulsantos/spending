var count = 1;
var chartData = {
    labels : [],
    datasets : [
        {
            fillColor : "rgba(0,255,127,.1)",
            strokeColor : "rgba(0,255,127,1)",
            data : []
        },
        {
            fillColor : "rgba(0,0,0,0)",
            strokeColor : "rgba(0,0,0,.8)",
            data : []
        },
        {
            fillColor : "rgba(0,0,0,0)",
            strokeColor : "rgba(0,255,127,.8)",
            data : []
        },
        {
            fillColor : "rgba(0,0,0,0)",
            strokeColor : "rgba(255,0,127,.8)",
            data : []
        }
    ]
}
var time = [];
var optionsAnimation = {
    scaleFontColor: "#000",
    scaleOverride : true,
    scaleSteps : 10,
    scaleStepWidth : 1,
    scaleStartValue : 47,
    scaleLineColor: "rgba(0,0,0,.8)",
}
var optionsNoAnimation = {
    animation : false,
    scaleOverride : true,
    scaleSteps : 10,
    scaleStepWidth : 1,
    scaleStartValue : 47,
}

$(document).ready(function(){
    //Get the context of the canvas element we want to select
    var ctx = document.getElementById("myChart").getContext("2d");
    var intid = 0;
    var flag = 0;
    var myNewChart = new Chart(ctx);
    myNewChart.Line(chartData, optionsAnimation);

    $('#run').click(function() {
        var sym = $('#symbol').val();

        if(flag == 1) {
            flag = 0;
            intid = clearInt(intid);
        }

        if(sym.length <= 5) {
            if(sym != "" && flag == 0){
                intid = setInterval(function() {
                        var d = new Date();
                        if(d.getHours() >= 9 && d.getHours() < 20){
                            if(d.getHours() == 9 && d.getMinutes() >= 30){
                                getPrice(myNewChart, sym);
                            } else if(d.getHours() >= 10) {
                                getPrice(myNewChart, sym);
                            }
                        }
                }, 20000);
                flag = 1;
            }
        }
    });
    $('#stop').click(function() {
        clearInt(intid);
    });
});

function clearInt(e) {
    clearInterval(e);
    return e = 0;
}

function getPrice(myNewChart, sym) {
    var optionsNoAnimation = {
        animation : false,
        scaleFontColor: "#000",
        scaleLineColor: "rgba(0,0,0,.8)",
        scaleSteps : 10,
        showTooltips: false,
        scaleStepWidth : 1,
        scaleStartValue : 47,
        pointDotStroke : false,
        pointDot : false,
    }
    var symbol = sym;
    var url = 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + symbol;

    $.ajax({
        url,
        dataType: "jsonp"
    }).done(function (data) {
        var priceData = {
            openPrice: data.Open,
            currPrice: data.LastPrice,
            high: data.High,
            low: data.Low,
            percent: data.ChangePercent,
            prev: data.LastPrice + (data.Change*-1)
        };

            if(priceData.currPrice > priceData.prev) {
                $('#price .value').css("color","rgba(0,255,127,1)");
                var arrow = "small angle up";
            } else if(priceData.currPrice < priceData.prev) {
                $('#price .value').css("color","rgba(255,0,127,1)");
                var arrow = "small angle down";
            }else if(priceData.currPrice == priceData.prev) {
                $('#price .value').css("color","black");
                var arrow = "";
            }
            //percent = percent.toFixed(3);
            $('.ui.statistics').show();
            $('#price .label').text(symbol)
            $('#price .value').text(priceData.currPrice.toFixed(2));
            $('#percentChange .value').empty();
            $('#percentChange .value').append("<i class='icon " + arrow + "'" + "></i>" + priceData.percent.toFixed(2) + "%");
            $('#open .value').text(priceData.openPrice);
            $('#prev .value').text(priceData.prev);
            $('#high .value').text(priceData.high);
            $('#low .value').text(priceData.low);

            updateData(chartData, priceData);
            myNewChart.Line(chartData, optionsNoAnimation);
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log('Request failed: ' + err);
        });
}
var updateData = function(oldData, priceData){
    var d = new Date();
    var labels = oldData["labels"];
    var index = labels.length;
    var dataA = oldData["datasets"][0]["data"];
    var dataB = oldData["datasets"][1]["data"];
    var dataC = oldData["datasets"][2]["data"];
    var dataD = oldData["datasets"][3]["data"];

    if(d.getMinutes() != 0){
        labels.push("");
    } else if((d.getMinutes() == 0) && (oldData["labels"][index-1] != d.getHours())) {
        labels.push(d.getHours() % 12 || 12);
    }

    time.push(d.getHours() % 12 || 12 + ":" + d.getMinutes() + ":" + d.getSeconds());
    dataA.push(priceData.currPrice);
    dataB.push(priceData.prev);
    dataC.push(priceData.high);
    dataD.push(priceData.low);

    if(oldData["datasets"][2]["data"][index-1] != priceData.high){
        for(var i = 0; i < index; i++){
            dataC.shift();
        }
        for(var i = 0; i < index; i++){
            dataC.push(priceData.high);
        }
    }
    if(oldData["datasets"][3]["data"][index-1] != priceData.low){
        for(var i = 0; i < index; i++){
            dataD.shift();
        }
        for(var i = 0; i < index; i++){
            dataD.push(priceData.low);
        }
    }
};
function convertArrayOfObjectsToCSV() {
    var data = "Time, " +
                time.toString() + "\n" +
                "Open, " +
                chartData["datasets"][1]["data"].toString() + "\n" +
                "Current, " +
                chartData["datasets"][0]["data"].toString() + "\n" +
                "High, " +
                chartData["datasets"][2]["data"].toString() + "\n" +
                "Low, " +
                chartData["datasets"][3]["data"].toString();
    return data;
}
window.downloadCSV = function(args) {
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV();
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}
