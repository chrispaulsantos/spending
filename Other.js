var csvData;
var myChart = null;
var storeList = [];
var pieData = [];
var lineData = {
    labels: ["January","February","March","April","May", "June", "July","August","September","October","November","December"],
    datasets: [
        {
            label: "Gas",
            fillColor: "rgba(0,0,0,0.6)",
            strokeColor: "rgba(0,0,0,.2)",
            data: []
        }
    ]
};

var options = {
    //Number - Amount of animation steps
    animationSteps : 100,
    //String - Animation easing effect
    animationEasing : "easeOutBounce",
    //Boolean - Whether we animate the rotation of the Doughnut
    animateRotate : true,
    //Boolean - Whether we animate scaling the Doughnut from the centre
    animateScale : false,
};
var colors = ['#51574a','#447c69','#74c493','#8e8c6d','#e4bf80','#e9d78e','#e2975d','#f19670','#e16552',
              '#c94a53','#be5168','#a34974','#993767','#65387d','#4e2472','#9163b6','#e279a3','#e0598b',
              '#7c9fb0','#5698c4','#9abf88'];

$(document).ready(function(){
    $('.ui.dropdown').dropdown();
    $.ajax({
        type: 'GET',
        url: 'Store Info.json',
        dataType: 'json',
        success: function(stores){
            $.each(stores, function(i, store) {
                storeList[i] = store;
            });
        }
    }).done(function() {
        $("#file").change(handleFileSelect);
    });
});

function handleFileSelect(evt) {
    $('label.ui.icon.button').addClass("loading");
    var file = evt.target.files[0];
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            csvData = results["data"];
            placeHolder();
            $('label.ui.icon.button').delay(2000).queue(function() {
                           $(this).removeClass("loading");
                           $(this).dequeue();
                       });
        }
    });
}

function placeHolder() {
    var chart = $("#chart-select").val();
    var type = $("#type-select").val();
    var ctx = document.getElementById("myChart").getContext("2d");
    $('tbody').empty();

    if(myChart != null){
        myChart.destroy();
    }

    if(chart == "Pie") {
        $('#stats').show();
        pieData = [];
        if(type == "All") {
            getPieData();
            myChart = new Chart(ctx).Doughnut(pieData,options);
        }
    }
    if(chart == "Bar") {
        $('#stats').hide();
        lineData["datasets"][0]["data"] = [];
        getLineData(type);
        myChart = new Chart(ctx).Bar(lineData,options);
    }
}
function getLineData(type) {
    var total = 0;
    //$('#date').append("Date: " + csvData[0]["Date"] + " - " + csvData[csvData.length-2]["Date"] + "<br/>");
    if(type == "All") {
        for(var k = 1; k < 13; k++) {
            total = 0;
            for(var j = 0; j < storeList.length; j++) {
                for(var i = 0; i < csvData.length-1; i++) {
                    if(csvData[i]["Date"].indexOf(k.toString()) == csvData[i]["Date"].indexOf('/')-1) {
                        if(csvData[i]["Description"].toLowerCase().indexOf(storeList[j]["Code"]) > -1 && csvData[i]["Amount"] < 0){
                                total = total + (csvData[i]["Amount"] * -1);
                        }
                    }
                }
            }
            lineData["datasets"][0]["data"].push(total.toFixed(2));
        }
    } else if(type != "All") {
        for(var k = 1; k < 13; k++) {
            total = 0;
            for(var j = 0; j < storeList.length; j++) {
                for(var i = 0; i < csvData.length-1; i++) {
                    if(csvData[i]["Date"].indexOf(k.toString()) == csvData[i]["Date"].indexOf('/')-1) {
                        if(csvData[i]["Description"].toLowerCase().indexOf(storeList[j]["Code"]) > -1 && csvData[i]["Amount"] < 0 && storeList[j]["Type"] == type){
                                total = total + (csvData[i]["Amount"] * -1);
                        }
                    }
                }
            }
            lineData["datasets"][0]["data"].push(total.toFixed(2));
        }
    }
}

function getPieData() {
    var k = 0, total, grandTotal = 0, other = 0;
    //$('#date').append("Date: " + csvData[0]["Date"] + " - " + csvData[csvData.length-2]["Date"] + "<br/>");

    for(var j = 0; j < storeList.length; j++) {
        total = 0;
        for(var i = 0; i < csvData.length-1; i++) {
            if(csvData[i]["Description"].toLowerCase().indexOf(storeList[j]["Code"]) > -1 && csvData[i]["Amount"] < 0){
                    total = total + (csvData[i]["Amount"] * -1);
            }
        }
        if(total < 20) {
            other = other + total;
        } else {
            var color = colors[k];
            pieData.push({
                value: total.toFixed(2),
                color: color,
                highlight: color,
                label: storeList[j]["Name"]
            });
        }
        grandTotal = grandTotal + total;
        if(total != 0) {
            $('#tableBody').append("<tr><td>" + storeList[j]["Name"] + "</td>" + "<td>$" + total.toFixed(2) + "</td><br/>");
            if(k == colors.length){ k = 0; }
            k++;
        }
    }
    pieData.push({
        value: other.toFixed(2),
        color: '#999999',
        highlight: '#999999',
        label: 'Other'
    });
    //$('#stats').prepend("Grand Total: $" + grandTotal.toFixed(2));
    $("#stats").mCustomScrollbar({
        scrollbarPosition: "outside",
        axis: "y"
    });
}
