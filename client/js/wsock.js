var wsUrl = location.origin.replace(/^http/, 'ws')
let websocket = null;//new WebSocket(wsUrl);

function startWS() {
    websocket = new WebSocket(wsUrl);

    websocket.mysend = function (message) {

        if (websocket.OPEN == websocket.readyState) {
            websocket.send(message); return;
        }

        window.setTimeout(() => {
            websocket.mysend(message);
        }, 1000);

    }

    websocket.senddata = function (data) {
        let message = JSON.stringify(data).toString();
        websocket.mysend(message);
        console.log(data);
    }



    websocket.onopen = (evt) => { console.log(evt) };
    websocket.onclose = function (evt) {
        //console.log(evt);
        document.getElementById("loginbutton").hidden = false;
        document.getElementById("room").hidden = false;
        document.getElementById("login").hidden = false;
        document.getElementById("startgamebutton").hidden = true;
        console.error(evt.reason);
        TextLabels.ErrorLabelText(evt.reason);

        if (evt.code == '1006' || evt.code == '1001') { startWS(); start(); sendLogin(); return };
        window.update();
        startWS();

    };
    websocket.onerror = function (evt) { console.log(evt) };

    websocket.onmessage = function (evt) {


        let message = JSON.parse(evt.data);
        switch (message.messagetype) {
            case 'playerguid':
                let shader = game.shader;
                game = new Game(message.guid);
                game.shader = shader;
                if (game.shader != null)
                    game.shader.FadeOut(() => game.shader = null);
                document.cookie = evt.data;
                document.getElementById("loginbutton").hidden = true;
                document.getElementById("room").hidden = true;
                document.getElementById("login").hidden = true;
                document.getElementById("startgamebutton").hidden = false;
                document.getElementById("instruction").hidden = true;

                break;
            case 'playerlist':
                game.parsePlayerList(message);
                document.getElementById("logindiv").hidden = game.isStarted;
                console.log(evt.data);
                //game.shader = null;
                break;
            case 'gamelog':
                game.parseGamelog(message);
                break;
            case 'chat':
                game.parseChat(message);
                break;
            case 'gameend':
                game.parseGameEnd(message);
                break;
            case 'youburned':
                game.parseYouBurned(message);
                break;
            case 'confirmStart':
                //console.log(message);
                
                //let modal = document.querySelector('dialog');
                let modalBox = document.getElementById('modalBoxText');
                document.getElementById('Yes-modal-btn').hidden = false;
                //closeModalBtn.hidden = false;
                let loosetime = (message.timestamp - message.startConfirm);
                let duration = message.waitFor * 1000 - loosetime;
                let startshow = Date.now();
                let estim = (duration - (Date.now() - startshow)) / 1000;
                modalBox.innerText = "Начало через:\n" + Math.round(estim) + " секунд\nВы готовы?";
                //modal.showModal();
                ShowModalDialog();
                let timerId =  setInterval(() => {
                    let estim = (duration - (Date.now() - startshow)) / 1000;
                    modalBox.innerText = "Начало через:\n" + Math.round(estim) + " секунд\nВы готовы?";
                }, 500);

                setTimeout(() => { //modal.close();
                    ShowModalDialog.Close();
                    clearInterval(timerId);
                }, duration);
                break;


        }

    };
    autoping();

}

function ShowModalDialog() {
    const modalActive = document.getElementsByClassName("modalActive")[0];
    modalActive.classList.remove("off");

    let documentClick = () => { Close(); }

    let Close = () => {
        modalActive.classList.add("off");
        document.removeEventListener('click', documentClick);
    }

    //modalClose.addEventListener('click', (e) => { Close(); });
    document.addEventListener('click', documentClick);//если нажимаем мимо , то ...

}

function autoping() {
    window.setTimeout(() => {
        let ping = JSON.stringify({ messagetype: 'ping' }).toString();
        if (websocket.OPEN == websocket.readyState)
            websocket.send(ping);
        autoping();

    }, 2000);
}


function ChangePlaceNear(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "ChangePlaceNear";
    p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}



function ChangePlace(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "ChangePlace";
    p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}


function Analysis(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "Analysis";
    p.place = game.me.selectedCard.cardplace;
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}

function BurnPlayer2(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "BurnPlayer2";
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}


function BurnPlayer(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "BurnPlayer";
    p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}

function Axe(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "Axe";
    p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}

function SetQuarantine(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "Quarantine";
    p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}


function SetDoor(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "Door";
    p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}


function selectPerseverance(pl) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "SelectPerseverance";

    p.place = pl.cardplace;

    websocket.senddata(p);

}

function usePerseverance(pl) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "StartPerseverance";

    p.bymycardplace = pl.cardplace;

    websocket.senddata(p);

}

function useTemptation(pl) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "StartTemptation";

    p.bymycardplace = pl.cardplace;

    websocket.senddata(p);

}

function AcceptChangePlace(pl) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "AcceptChangePlace";

    //p.bymycardplace = pl.cardplace;

    websocket.senddata(p);

}

function DefendFromChangePlace(pl) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "DefendFromChangePlace";

    p.bymycardplace = pl.cardplace;

    websocket.senddata(p);

}

function DefendFromFire(pl) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "DefendFromFire";

    p.bymycardplace = pl.cardplace;

    websocket.senddata(p);

}

function Panic(pl) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "Panic";
    p.place = pl.cardplace;//
    //console.log(place);
    websocket.senddata(p);

}

function ChangeDirection(pl) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "ChangeDirection";
    p.place = pl.cardplace;//
    //console.log(place);
    websocket.senddata(p);
}

function showAllCards(place) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "ShowAllCards";
    p.place = place.cardplace;//
    //console.log(place);
    websocket.senddata(p);

}

function ShowAllCardsToPlayer(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "ShowAllCardsTo";
    //       p.place = pl.place;//
    //        p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = pl.name;
    //console.log(place);
    websocket.senddata(p);
}

function dropcard(place) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "DropCard";
    p.place = place.cardplace;//
    console.log(place);
    websocket.senddata(p);

}

function ShowMeCard(otherplayername, place) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "ShowMeCard";
    p.place = place.cardplace;//
    p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = otherplayername;
    //console.log(p);
    websocket.senddata(p);
    // game.me.selected = null;

}

function exchangecard(place) {
    if (States.IncomeExchange == game.me.state) return exchangecardin(place);
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "outExchangeCard";
    p.place = place.cardplace;
    p.opponent = game.opponent.playername;
    websocket.senddata(p);
}

function exchangecardin(place) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "inExchangeCard";
    p.place = place.cardplace;
    p.opponent = game.opponent.playername;
    websocket.senddata(p);
}

function PrepareBurn(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "PrepareBurn";
    p.place = pl.cardplace;//
    p.bymycardplace = game.me.selectedCard.cardplace;

    websocket.senddata(p);
}

function nothanks(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "NoThanks";
    p.place = pl.cardplace;
    p.opponent = game.opponent.playername;
    websocket.senddata(p);
}

function fear(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "Fear";
    p.place = pl.cardplace;
    p.opponent = game.opponent.playername;
    websocket.senddata(p);
}

function mist(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "Mist";
    p.place = pl.cardplace;
    p.opponent = game.opponent.playername;
    websocket.senddata(p);
}

function PanicOneTwo(player) {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "PanicOneTwo";
    //p.bymycardplace = game.me.selectedCard.cardplace;
    p.otherPlayerName = player.name;
    websocket.senddata(p);

}


function PanicNoConfessionTime(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "PanicNoConfessionTime";
    p.place = pl.cardplace;
    websocket.senddata(p);


}

function PanicConfessionTime(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "PanicConfessionTime";
    p.place = pl.cardplace;
    websocket.senddata(p);


}

function PanicStopConfessionTime(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "PanicStopConfessionTime";
    p.place = pl.cardplace;
    websocket.senddata(p);


}

function PanicGoAway(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "PanicGoAway";
    p.place = pl.cardplace;
    p.opponent = game.opponent.playername;
    websocket.senddata(p);
}

function PanicForgot(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "PanicForgot";
    p.place = pl.cardplace;
    websocket.senddata(p);

}

function PanicMeet(pl) {
    let p = JSON.parse(document.cookie);
    p.messagetype = 'playeraction';
    p.action = "PanicMeet";
    p.place = pl.cardplace;
    websocket.senddata(p);

}


function sendLogin() {
    let loginelement = document.getElementById("login");
    let thing = false;
    try {
        let pre = JSON.parse(document.cookie);
        thing = pre.thing;
    } catch { }
    let p = {
        messagetype: 'newplayer',
        roomname: document.getElementById("room").value,
        password: '1',
        numofPlayers: 1,
        playername: loginelement.value,
        guid: game == null ? '' : game.guid,
        thing: thing

    };

    websocket.senddata(p);
    document.getElementById("startgamebutton").hidden = false;
    document.getElementById("instruction").hidden = false;
}


function confirmStart(btn) {
    let p = JSON.parse(document.cookie);

    p.messagetype = 'confirmStart';

    websocket.senddata(p);
    btn.hidden = true;
    //closeModalBtn.hidden = true;
    //modal.close();
}


function LogoutGame() {

    let p = JSON.parse(document.cookie);
    p.messagetype = 'logoutgame';

    websocket.senddata(p);


}

function startGame() {

    try {
        let p = JSON.parse(document.cookie);
        p.messagetype = 'startgame';

        websocket.senddata(p);
        //document.getElementById("logindiv").hidden = true;
        //document.getElementById("startgamebutton").hidden = true;

    } catch { }
}



function sendChat() {
    let q = document.getElementById("chatmessage");
    let p = JSON.parse(document.cookie);
    p.messagetype = 'chatmessage';
    if (q.value.trim() == "") return;
    p.message = q.value;

    websocket.senddata(p);
    q.value = "";

}
