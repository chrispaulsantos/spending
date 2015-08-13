var csvData;
var myChart = null;
var storeList = [];
var pieData = [];
var lineData = {
    labels: [],
    datasets: [
        {
            label: "Data",
            fillColor: "rgba(0,0,0,0.6)",
            strokeColor: "rgba(0,0,0,.2)",
            data: []
        }
    ]
};

var options = {
    animation: false,
    animationSteps : 100,
    animationEasing : "easeOutBounce",
    animateRotate : true,
    animateScale : false,
    scaleFontColor: "#FFF",
    scaleFontFamily: "Lato"
};
var colors = ['#51574a','#447c69','#74c493','#8e8c6d','#e4bf80','#e9d78e','#e2975d','#f19670','#e16552',
              '#c94a53','#be5168','#a34974','#993767','#65387d','#4e2472','#9163b6','#e279a3','#e0598b',
              '#7c9fb0','#5698c4','#9abf88'];

$(document).ready(function(){
    inactivityTime();
    $('#welcome.dimmer').dimmer({duration: {show : 500, hide : 500}});
    $('#welcome.dimmer').dimmer("show");
    $('.ui.dropdown').dropdown();
    $('.ui.accordion').accordion();
    $("#stats").mCustomScrollbar({
        scrollbarPosition: "outside",
        axis: "y",
        autoHideScrollbar: true
    });
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
        $('#welcome.dimmer').delay(2000).queue(function() {
                       $(this).dimmer("hide");
                       $(this).dequeue();
                   });
        $("#file").change(handleFileSelect);
    });
});

function handleFileSelect(evt) {
    $('#load .dimmer').addClass("active");
    var file = evt.target.files[0];
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            csvData = results["data"];
            $('#stats').width($(window).width()-1000);
            placeHolder();
            $('#load .dimmer').delay(2000).queue(function() {
                           $(this).removeClass("active");
                           $(this).dequeue();
                       });
        }
    });
}
function contentRemove($selector) {
    $($selector).empty();
}
function placeHolder() {
    var chart = $("#chart-select").val();
    var type = $("#type-select").val();
    var ctx = document.getElementById("myChart").getContext("2d");
    $('tbody .accordion').empty();

    if(myChart != null){
        myChart.destroy();
    }

    if(chart == "Pie") {
        $('#stats .statistics').hide();
        $('#stats table').show();
        getPieData(type);
        myChart = new Chart(ctx).Doughnut(pieData,options);
        pieData = [];
    }
    if(chart == "Bar") {
        $('#stats table').hide();
        getLineData(type);
        myChart = new Chart(ctx).Bar(lineData,options);
        lineData["datasets"][0]["data"] = [];
        lineData["labels"] = [];
    }
}
function getLineData(type) {
    var total = 0, transac = 0, grandTotal = 0, dates = [], deposit = 0, count = 0;
    setLabels();

    for(var i = 0; i < csvData.length; i ++) {
        dates[i] = getDate(csvData[i]["Date"]);
    }

    if(type == "All") {
        for(var k = 0; k < 12; k++) {
            total = 0;
            for(var j = 0; j < storeList.length; j++) {
                var store = storeList[j]["Code"];
                for(var i = 0; i < csvData.length-1; i++) {
                    var currDateMonth = dates[i]["monthStr"];
                    if(currDateMonth == lineData["labels"][k]) {
                        if(csvData[i]["Description"].toLowerCase().indexOf(store) > -1 && csvData[i]["Amount"] < 0) {
                                total = total + (csvData[i]["Amount"] * -1);
                                transac++;
                        }
                    }
                }
            }
            grandTotal = grandTotal + total;
            lineData["datasets"][0]["data"].push(total.toFixed(2));
        }
    } else if(type != "All") {
        for(var k = 0; k < 12; k++) {
            total = 0;
            for(var j = 0; j < storeList.length; j++) {
                var store = storeList[j]["Code"];
                for(var i = 0; i < csvData.length-1; i++) {
                    var currDateMonth = dates[i]["monthStr"];
                    if(currDateMonth == lineData["labels"][k]) {
                        if(csvData[i]["Description"].toLowerCase().indexOf(storeList[j]["Code"]) > -1 && csvData[i]["Amount"] < 0 && storeList[j]["Type"] == type){
                                total = total + (csvData[i]["Amount"] * -1);
                                transac++;
                        }
                    }
                }
            }
            grandTotal = grandTotal + total;
            lineData["datasets"][0]["data"].push(total.toFixed(2));
        }
    }
    for(var i = 0; i < csvData.length; i ++) {
        if(csvData[i]["Amount"] > 0 && count != 1) {
            deposit = deposit + csvData[i]["Amount"];
        }
    }
    $('#transac .value').text(transac);
    $('#deposit .value').text("$" + deposit);
    $('#gtotal .value').text("$" + grandTotal.toFixed(2));
    $('#date .value').text(csvData[0]["Date"] + " - " + csvData[csvData.length-2]["Date"]);
    $('#stats .statistics').show();
}

function getPieData(type) {
    var k = 0, total, grandTotal = 0, other = 0, accord = "";

    if(type == "All"){
        for(var j = 0; j < storeList.length; j++) {
            total = 0, accord = "";
            for(var i = 0; i < csvData.length-1; i++) {
                var dateObj = getDate(csvData[i]["Date"]);
                if(csvData[i]["Description"].toLowerCase().indexOf(storeList[j]["Code"]) > -1 && csvData[i]["Amount"] < 0){
                        total = total + (csvData[i]["Amount"] * -1);
                        accord  += (csvData[i]["Date"] + ": $" + csvData[i]["Amount"]*-1 + "<br/>");
                }
            }
            if(total <= 20) {
                other = other + total;
            } else {
                if(total != 0){
                    var color = colors[k];
                    pieData.push({
                        value: total.toFixed(2),
                        color: color,
                        highlight: color,
                        label: storeList[j]["Name"]
                    });
                }
            }
            grandTotal = grandTotal + total;
            if(total != 0) {
                $('#tableBody .accordion').append("<div class='title'>" +
                                                  "<i class='dropdown icon'></i>" +
                                                      storeList[j]["Name"] + ": $" + total.toFixed(2) +
                                                  "</div>" +
                                                  "<div class='content'>" +
                                                      "<p>" + accord +"</p>" +
                                                  "</div>");
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
    } else if(type != "All"){
        for(var j = 0; j < storeList.length; j++) {
            total = 0, accord = "";
            for(var i = 0; i < csvData.length-1; i++) {
                if(csvData[i]["Description"].toLowerCase().indexOf(storeList[j]["Code"]) > -1 && csvData[i]["Amount"] < 0 && storeList[j]["Type"] == type){
                        total = total + (csvData[i]["Amount"] * -1);
                        accord  += (csvData[i]["Date"] + ": $" + csvData[i]["Amount"]*-1 + "<br/>");
                }
            }

            if(total != 0){
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
                $('#tableBody .accordion').append("<div class='title'>" +
                                                  "<i class='dropdown icon'></i>" +
                                                      storeList[j]["Name"] + ": $" + total.toFixed(2) +
                                                  "</div>" +
                                                  "<div class='content'>" +
                                                      "<p>" + accord +"</p>" +
                                                  "</div>");
                if(k == colors.length){ k = 0; }
                k++;
            }
        }
    }
}
var inactivityTime = function () {
    var t;
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    function logout() {
        window.history.back();
        // window.location.href = 'login.html';
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(logout, 300000)
        // 1000 milisec = 1 sec
    }
};
function getDate(dateStr) {
    var dateObj = {fullDate: "", monthStr: "", monthNum: "", year: ""};

    var mth = dateStr.substring(0,dateStr.indexOf('/'));
    var yr = dateStr.substring(dateStr.length-2, dateStr.length);
    mth = parseInt(mth);
    var mthNum = mth;
    yr = parseInt(yr);

    if(mth == 1){mth = "January";}
    if(mth == 2){mth = "February";}
    if(mth == 3){mth = "March";}
    if(mth == 4){mth = "April";}
    if(mth == 5){mth = "May";}
    if(mth == 6){mth = "June";}
    if(mth == 7){mth = "July";}
    if(mth == 8){mth = "August";}
    if(mth == 9){mth = "September";}
    if(mth == 10){mth = "October";}
    if(mth == 11){mth = "November";}
    if(mth == 12){mth = "December";}

    return dateObj = {fullDate: dateStr, monthStr: mth, monthNum: mthNum, year: yr};
}
function setLabels() {
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    var startMth = csvData[0]["Date"];
    startMth = startMth.substring(0,startMth.indexOf('/'));
    startMth = parseInt(startMth)-1;

    for(var i = startMth; i < 12; i++) {
        if(lineData["labels"].length != 12){
            if(i == 11) {
                i = -1;
            }
        }else {
            i = 12;
        }
        if(i != 12) {
            if(i == -1){
                i = 11;
                lineData["labels"].push(months[i]);
                i = -1;
            }else {
                lineData["labels"].push(months[i]);
            }
        }
    }
}
