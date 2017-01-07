let W_C = 80; //cell
let W_AX = 80; //axis
let H_C = 30; //cell
let H_AX = 40; //axis
let MGN = 2.5; //margin

let COLOR_BG1 = "#FFFFFF";
let COLOR_BG2 = "#DDDDFF";
let COLOR_LINE = "#000000";
let COLOR_TEXT = "#000000";
let FONT_TEXT = "13px dotum";

let TIME_NAME = ["01A","01B","02A","02B","03A","03B","04A","04B","05A","05B","06A","06B","07A","07B","08A","08B","09A","09B"];
let CLOCK_NAME = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
let WEEK_NAME = ["월요일", "화요일", "수요일", "목요일", "금요일"];

function drawFrame(ctx)
{
    let xs;
    let ys;

    ctx.beginPath();

    let grd = ctx.createLinearGradient(0, 0, 0, 600);
    grd.addColorStop(0, COLOR_BG1);
    grd.addColorStop(1, COLOR_BG2);

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = COLOR_LINE;
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = FONT_TEXT;
    //ctx.rect(MGN, MGN, canvas.width-MGN*2, canvas.height-MGN*2);


    ctx.rect(MGN, MGN, W_AX, H_AX);
    for(let i=0; i<18; i++) {
        xs = MGN;
        ys = MGN+i*H_C+H_AX;
        let divWidth = 38;
        ctx.rect(xs, ys, divWidth, H_C);
        ctx.rect(xs+divWidth, ys, W_AX-divWidth, H_C);
        ctx.fillText(TIME_NAME[i],xs+8,ys+19);
        ctx.fillText(CLOCK_NAME[i],xs+4+W_AX/2,ys+19);
    }
    ctx.rect(xs, ys+H_C, W_AX, H_C*2);
    ctx.fillText("이후",xs+26,ys+H_C+34);

    ctx.lineWidth = 1;
    for(let j=0; j<WEEK_NAME.length; j++) {
        ctx.rect(MGN+j*W_C+W_AX, MGN, W_C, H_AX);
        ctx.fillText(WEEK_NAME[j],MGN+j*W_C+W_AX+21,MGN+25);
        for(let i=0; i<18; i++) {
            xs = MGN+j*W_C+W_AX;
            ys = MGN+i*H_C+H_AX;
            ctx.rect(xs, ys, W_C, H_C);
        }
        ctx.rect(xs, ys+H_C, W_C, H_C*2);
    }

    ctx.stroke();
}