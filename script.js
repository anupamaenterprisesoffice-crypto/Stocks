const firebaseConfig={
apiKey:"AIzaSyApLpqXTnuPsT5rdDG04jLMlW-a0ERkbpM",
authDomain:"stockgameultra.firebaseapp.com",
databaseURL:"https://stockgameultra-default-rtdb.firebaseio.com",
projectId:"stockgameultra"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.database();

let currentUser,price=100,candles=[];

function login(){
let u=username.value,p=password.value;
if(!u||!p)return alert("Enter");

let ref=db.ref("users/"+u);

ref.once("value").then(s=>{
if(s.exists()&&s.val().banned)return alert("Banned");

if(!s.exists()){
ref.set({password:p,balance:10000,stocks:0,bank:0});
}else if(s.val().password!==p){
return alert("Wrong");
}

currentUser=u;

if((u==="Virat"&&p==="1234")||(u==="YUG1ADMIN"&&p==="4231")){
ref.update({balance:999999999});
adminBtn.style.display="flex";
}

loginPage.style.display="none";
app.style.display="block";

listenUser();
startMarket();
});
}

function listenUser(){
db.ref("users/"+currentUser).on("value",s=>{
let d=s.val();
balance.innerText=d.balance+" Lot £";
bank.innerText="Bank: "+d.bank;
});
}

function startMarket(){
setInterval(()=>{
let o=price;
let c=price+(Math.random()-0.5)*10;
let h=Math.max(o,c)+5;
let l=Math.min(o,c)-5;
price=Math.round(c);

candles.push({o,c,h,l});
if(candles.length>20)candles.shift();

priceEl.innerText="£"+price;
drawChart();
},1000);
}

const priceEl=document.getElementById("price");

function drawChart(){
let ctx=chart.getContext("2d");
ctx.clearRect(0,0,300,150);

candles.forEach((c,i)=>{
let x=i*12;
let color=c.c>c.o?"lime":"red";

ctx.strokeStyle=color;
ctx.beginPath();
ctx.moveTo(x,150-c.h);
ctx.lineTo(x,150-c.l);
ctx.stroke();

ctx.fillStyle=color;
ctx.fillRect(x-2,150-c.o,4,c.o-c.c);
});
}

// CHAT
function sendChat(){
let msg=chatInput.value;
if(!msg)return;
db.ref("chat").push({user:currentUser,text:msg});
chatInput.value="";
}

db.ref("chat").limitToLast(20).on("value",snap=>{
let html="";
snap.forEach(s=>{
let d=s.val();
html+=`<p><b>${d.user}:</b> ${d.text}</p>`;
});
chatBox.innerHTML=html;
});

// LEADERBOARD
db.ref("users").on("value",snap=>{
let arr=[];
snap.forEach(s=>{
arr.push({name:s.key,balance:s.val().balance||0});
});
arr.sort((a,b)=>b.balance-a.balance);

let html="";
arr.slice(0,10).forEach((u,i)=>{
html+=`<p>#${i+1} ${u.name} - ${u.balance} Lot £</p>`;
});
leaderboard.innerHTML=html;
});
