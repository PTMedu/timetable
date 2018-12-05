function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        displayContents(contents);
    };
    reader.readAsText(file);
}

function displayContents(contents) {
    var rawData = "{\"list\":" + contents.slice(19,-1) + "}"
    rawData = rawData.replace(/,]]/gi, "]]");
    rawData = rawData.replace(/]],\r\n]}/gi, "]]\r\n]}");
    var subjectData = JSON.parse(rawData).list;
    console.log(subjectData)
    
}


function saveAs(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}




var grid1;
var softLoaderInterval;

var MIN_GRIDBOX_WIDTH = 230;
var CANVAS_PADDING = 10;
var CANVAS_WIDTH = 250;

var selection = null;

var D_COD = 0;
var D_CAT = 1;
var D_SUB = 2;
var D_DSC = 3;
var D_CLA = 4;
var D_PRC = 5;
var D_TAR = 6;
var D_CAP = 7;
var D_TME = 8;

function periodToHH(p)
{
    var hour = 9 + Math.floor(p/2);
    var min = (p%2 == 0)?"00":"30";

    return ((hour<10)?("0"+hour):(hour)) + ":" + min;
}


$(window).on("load", function()
{

    grid1 = new dhtmlXGridObject("grid1");

    initGrid(grid1);

    setSizes();
    grid1.setSizes();
  

    loadCatalog(grid1, [""]);

    var weeks = ["월", "화", "수", "목", "금", "토", "일"];
    for(var i=0; i<weeks.length; i++) {
        $("#dayOfWeek").append(new Option(weeks[i], i));
    }
    for(var i=0; i<31; i++) {
        $("#startTime").append(new Option(periodToHH(i), i));
        $("#endTime").append(new Option(periodToHH(i), i));
    }
    for(var i=2; i<=8; i++) {
        var $tc = $("#timeChunk1").clone().prop("id", "timeChunk"+i);
        $("#timeChunk"+(i-1)).after($tc);
    }


    grid1.attachEvent("onRowSelect", onSelectCatalog);

    $("#btnEnter").on("click", onClickBtnEnter);
    $("#btnInfo").on("click", onClickBtnInfo);
    $("#btnSave").on("click", onClickBtnSave);
    $("#btnAdd").on("click", onClickBtnAdd);
    $("#btnRemove").on("click", onClickBtnRemove);
    $("#btnModify").on("click", onClickBtnModify);


    $("#comboDep").change(onSelectDep);
    $("#filter").change(onChangeFilter);


});



function setSizes()
{
    var docuWidth = $(document).width();
    var size = docuWidth - (CANVAS_WIDTH+CANVAS_PADDING);
    if(size > MIN_GRIDBOX_WIDTH) {
        $(gridBox).width(docuWidth - CANVAS_WIDTH - 3*CANVAS_PADDING);
    }
    else {
        $(gridBox).width(docuWidth-2*CANVAS_WIDTH);
    }
}


function initGrid(grid)
{
    //grid.setImagePath("dhtmlx/skins/web/imgs/dhxgrid_terrace/");
    grid.setHeader("분류,과목명,분반,수강료,대상,정원,설명");
    grid.setInitWidths("50,60,40,70,40,40,200");
    grid.setColAlign("left,left,left,left,left,left");
    grid.setColTypes("txt,txt,txt,txt,txt,txt,txt");
    grid.setColSorting("str,str,str,str,str,str,str");
    grid.setEditable(false);
    dhtmlxEvent(window, "resize", function(){grid.setSizes();});
    grid.init();


}


function loadCatalog(grid, filter)
{

    var k = 0;
    var fLen = filter.length;
    var keyword = filter[0].toUpperCase();
    var delay;

    if(fLen == 1) delay = 60;
    else delay = 2;

    grid.clearAll();

    clearInterval(softLoaderInterval);
    softLoaderInterval = setInterval(function()
    {
        if(k*100 >= SUBJECT_DATA.length) {
            clearInterval(softLoaderInterval);
            return;
        }
        for(var i=k*100; i<(k+1)*100 && i<SUBJECT_DATA.length; i++) {
            if(fLen == 1) {
                addRow(grid, i, i+1);
            }
            else {
                for(var j=1; j<fLen; j++) {
                    if(SUBJECT_DATA[i][filter[j]].toUpperCase().indexOf(keyword)
                    != -1) {
                        addRow(grid, i, i+1);
                        break;
                    }
                }
            }
        }
        ++k;
    }, delay);
}


function addRow(grid, idx, row)
{
    var cat = SUBJECT_DATA[idx][D_CAT]; //category
    var sub = SUBJECT_DATA[idx][D_SUB]; //subject
    var dsc = SUBJECT_DATA[idx][D_DSC]; //description
    var cla = SUBJECT_DATA[idx][D_CLA]; //class no.
    var prc = SUBJECT_DATA[idx][D_PRC]; //price
    var tar = SUBJECT_DATA[idx][D_TAR]; //target
    var cap = SUBJECT_DATA[idx][D_CAP]; //capacity
    //var tme = SUBJECT_DATA[idx][D_TME]; //design credits


    grid.addRow(row, [cat, sub, cla, numberWithCommas(prc), tar, cap, dsc]);
}



//*********************
// Events
//********************



window.onresize = function()
{
    setSizes();
}


function onSelectCatalog(row, col)
{
  
    $("#formCode").val("");
    $("#formSubject").val("");
    $("#formClass").val("");
    $("#formPrice").val("");
    $("#formTarget" ).val("");
    $("#formCap").val("");
    $("#formDesc").val("");
    for(var i=0; i<8; i++) {
        $("#timeChunk"+(i+1)).find("#dayOfWeek").val("null");
        $("#timeChunk"+(i+1)).find("#startTime").val("null");
        $("#timeChunk"+(i+1)).find("#endTime").val("null");
    }

    //console.log(idxToPk(row-1));
    //same code, different class
    for(var i in SUBJECT_DATA) {
        if(SUBJECT_DATA[i][D_COD] == SUBJECT_DATA[row-1][D_COD]) {
            selection = i;
            console.log(SUBJECT_DATA[i])
            $("#formCode").val(SUBJECT_DATA[i][D_COD]);
            $("#formSubject").val(SUBJECT_DATA[i][D_SUB]);
            $("#formClass").val(SUBJECT_DATA[i][D_CLA]);
            $("#formPrice").val(SUBJECT_DATA[i][D_PRC]);
            $("#formTarget" ).val(SUBJECT_DATA[i][D_TAR]);
            $("#formCap").val(SUBJECT_DATA[i][D_CAP]);
            $("#formDesc").val(SUBJECT_DATA[i][D_DSC]);

            var merged = mergeNum(SUBJECT_DATA[i][D_TME])
            for(var j=0; j<merged.length; j++) {
                var week = Math.floor(merged[j][0]/100);
                var stime = merged[j][0]%100;
                var etime = stime+merged[j][1];
                $("#timeChunk"+(j+1)).find("#dayOfWeek").val(week);
                $("#timeChunk"+(j+1)).find("#startTime").val(stime);
                $("#timeChunk"+(j+1)).find("#endTime").val(etime);
            }
        }
    }
}


function onSelectDep(e)
{
    loadCatalog(grid1, [e.target.value, D_CAT]);
}


function onChangeFilter()
{
    $("#comboDep")[0].selectedIndex = 0;
    if($("#filter")[0].value.length > 0) {
        loadCatalog(grid1, [$("#filter")[0].value, D_COD, D_CAT, D_SUB]);
    }
    else {
        loadCatalog(grid1, [""]);
    }
}

function sortNumber(a,b)
{
    return a - b;
}


function onClickBtnModify()
{
    if(selection) {
        SUBJECT_DATA[selection][D_COD] = $("#formCode").val();
        SUBJECT_DATA[selection][D_SUB] = $("#formSubject").val();
        SUBJECT_DATA[selection][D_CLA] = $("#formClass").val();
        SUBJECT_DATA[selection][D_PRC] = $("#formPrice").val().replace(/,/gi, "");
        SUBJECT_DATA[selection][D_TAR] = $("#formTarget" ).val();
        SUBJECT_DATA[selection][D_CAP] = $("#formCap").val();
        SUBJECT_DATA[selection][D_DSC] = $("#formDesc").val();

        timeChunks = [];
        for(var i=0; i<8; i++) {
            var week = Number($("#timeChunk"+(i+1)).find("#dayOfWeek").val());
            if(!isNaN(week)) {
                
                var stime = Number($("#timeChunk"+(i+1)).find("#startTime").val());
                var etime = Number($("#timeChunk"+(i+1)).find("#endTime").val());
                if(isNaN(stime) || isNaN(etime)) {
                    window.alert("시작 시간과 종료시간을 모두 입력해야 합니다.");
                    return;
                }
                if(stime >= etime) {
                    window.alert("종료시간은 시작시간 이후여야 합니다.");
                    return;
                }
        
                for(var j=stime; j<etime; j++) 
                    timeChunks.push(week*100+j);
            }
             
        }
        timeChunks = timeChunks.sort(sortNumber);
        for(var i=1; i<timeChunks.length; i++) {
            if(timeChunks[i] == timeChunks[i-1]) {
                window.alert("시간이 중복됩니다.");
                return;
            }
        }
        SUBJECT_DATA[selection][D_TME] = timeChunks;

        loadCatalog(grid1, [""]);
        selection = null;
    }
    else {
        window.alert("과목을 다시 선택해 주세요.");
        return;
    }
}


function onClickBtnEnter()
{
    onChangeFilter();
}


function onClickBtnInfo()
{
    openPopup("info.html?v=49", 484, 645);
}


function onClickBtnSave()
{
    var output = "var SUBJECT_DATA = [\r\n";
    for(var i in SUBJECT_DATA) {
        output += "["
        for(var j=0; j<8; j++) {
            output += "\"" + SUBJECT_DATA[i][j] + "\",";
        }
        output += "["
        output += SUBJECT_DATA[i][8];
        output += "]],\r\n"
    }
    output += "];"
    //console.log(output);
    saveAs("data.dat", output);
}

function getRandomId()
{
    var pool = "ABCDEFGHJKLMNPQRSTUVWXYZ3456789"
    var id = ""
    for(var i=0; i<12; i++) {
        id += pool[Math.floor(Math.random()*pool.length)];
    }
    return id;
}

function onClickBtnAdd()
{
    SUBJECT_DATA.push([getRandomId(), "분류", "과목명", "과목설명", "01", 0, "대상", "0", []])
    loadCatalog(grid1, [""]);
    selection = null;
} 


function onClickBtnRemove()
{
    if(selection) {
        SUBJECT_DATA = SUBJECT_DATA.slice(0, selection).concat(SUBJECT_DATA.slice(Number(selection)+1, 10))
        loadCatalog(grid1, [""]);
        selection = null;
    }
    else {
        window.alert("과목을 선택해 주세요")
    }
}




//document.getElementById('file-input').addEventListener('change', readSingleFile, false);