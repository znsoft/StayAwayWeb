
class Card {
     CardsByPlayers = {
         UnknownPanic: { num: -2, players: [], firstDeck: false, playDeck: false, isPanic: true, exchangeAfter:true},
         UnknownAction: { num: -1, players: [], firstDeck: false, playDeck: false, isPanic: false, exchangeAfter: true },
         Thing: { num: 0, players: [], firstDeck: false, playDeck: false, isPanic: false, exchangeAfter: true },
         Infect: { num: 1, players: [8, 8, 10, 12, 13, 15, 17, 20, 20], firstDeck: false, playDeck: true, isPanic: false, exchangeAfter: true},
         Suspicion: { num: 2, players: [4, 4, 4, 5, 6, 7, 8, 8, 8], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         Analysis: { num: 3, players: [0, 1, 2, 2, 2, 3, 3, 3, 3], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         BurnFire: { num: 4, players: [2, 2, 3, 3, 3, 4, 4, 5, 5], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         FireResist: { num: 5, players: [1, 1, 2, 2, 2, 2, 2, 3, 3], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         Temptation: { num: 6, players: [2, 2, 3, 4, 5, 5, 6, 7, 7], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true },
         Perseverance: { num: 7, players: [2, 2, 3, 3, 3, 4, 5, 5, 5], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true },
         GetOff: { num: 8, players: [2, 2, 2, 3, 3, 4, 4, 5, 5], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         ChangeDirection: { num: 9, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         ChangePlace: { num: 10, players: [2, 2, 2, 3, 3, 4, 4, 5, 5], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         Whiski: { num: 11, players: [1, 1, 2, 2, 2, 2, 3, 3, 3], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         Axe: { num: 12, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},

         NoThanks: { num: 13, players: [1, 1, 2, 2, 3, 3, 3, 4, 4], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         Fear: { num: 14, players: [0, 1, 2, 2, 3, 3, 3, 4, 4], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         Past: { num: 15, players: [1, 1, 2, 2, 2, 2, 2, 3, 3], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         StayHere: { num: 16, players: [1, 1, 2, 2, 2, 2, 2, 3, 3], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         Door: { num: 17, players: [1, 1, 1, 2, 2, 2, 2, 3, 3], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},
         Quarantine: { num: 18, players: [0, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: true, playDeck: true, isPanic: false, exchangeAfter: true},

         PanicOldRopes: { num: 19, players: [0, 0, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicThreeFour: { num: 20, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicUPS: { num: 21, players: [0, 0, 0, 0, 0, 0, 1, 1, 1], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicConfessionTime: { num: 22, players: [0, 0, 0, 0, 1, 1, 1, 1, 1], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicBetweenUs: { num: 23, players: [0, 0, 0, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicForgot: { num: 24, players: [1, 1, 1, 1, 1, 1, 1, 1, 1], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicFriend: { num: 25, players: [0, 0, 0, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicMeet: { num: 26, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicChain: { num: 27, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicOneTwo: { num: 28, players: [0, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicGoAway: { num: 29, players: [0, 1, 1, 1, 1, 1, 1, 1, 1], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},
         PanicParty: { num: 30, players: [0, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true, exchangeAfter: true},


    }

    constructor(clientDB, cardNum,  room, place) {
        this.clientDB = clientDB;
        this.card = this.findCardByNum(cardNum);
        //console.log(cardNum +' '+   this.card.num);
        this.place = place;
        this.guid = this.generateGUID();
        this.room = room;
        this.nextplayerforcard = null;
    }

    getCardTypes() {
        return new Map(Object.entries(this.CardsByPlayers));
    }

    findCardByNum(num) {

        let m = new Map(Object.entries(this.CardsByPlayers));
        let find = this.CardsByPlayers.UnknownAction;
        m.forEach((v, k) => {
            if (v.num == num) find = v;

        });

        return find;
    }

    generateGUID() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
}

module.exports = Card
