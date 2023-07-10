
const Actions = {
    Nothing: { id: - 1, },
    Drop: { id: 0, Button: { Text: "Скинуть", action: dropcard }, },
    outChange: { id: 1, Button: { Text: "Обмен", action: exchangecard }, isOutExchange: true },// OnSelectAction: exchangecard },
    inChange: { id: 1, Button: { Text: "Обмен", action: exchangecardin }, isInExchange: true },// OnSelectAction: exchangecard },
    SawOneCard: { id: 2, HiLightText: "Выбери карту игрока", MayMove: true, HiLightRLPlayers: true, selectNearPlayersCards: true, actionOnSelectSecondCard: ShowMeCard },
    SawAllCards: { id: 3, HiLightText: "Выбери игрока", MayMove: true, HiLightRLPlayers: true, selectPlayer: true, OnSelectPlayer: Analysis },
    Burn: { id: 5, HiLightText: "Выбери игрока", MayMove: true, HiLightRLPlayers: true, selectPlayer: true, OnSelectPlayer: BurnPlayer, Button: { Text: "Использовать", action: PrepareBurn } },
    DefendFromFire: { id: 6, Button: { Text: "Шашлык", action: DefendFromFire } },
    exChange: { id: 7, Button: { Text: "Обмен", action: exchangecardin } },
    ShowAllCards: { id: 8, HiLightText: "Показать все карты", Button: { Text: "Использовать", action: showAllCards }, },
    Temptation: { id: 9, HiLightText: "Обмен с любым игроком", Button: { Text: "Использовать", action: useTemptation } },
    Perseverance: { id: 10, HiLightText: "Выбери карту из колоды", Button: { Text: "Использовать", action: usePerseverance } },
    NoThanks: { id: 11, HiLightText: "Отклонить обмен", Button: { Text: "Отклонить", action: nothanks } },
    ChangeDirection: { id: 12, HiLightText: "Сменить направление хода", Button: { Text: "Использовать", action: ChangeDirection }, },
    Panic: { id: 13, HiLightText: "Паника", Button: { Text: "Паника", action: Panic }, },
    ShowAllCardsTo: { id: 14, HiLightText: "Выбери игрока", HiLightRLPlayers: true, selectPlayer: true, OnSelectPlayer: ShowAllCardsToPlayer },
    SelectCardForDeck: { id: 15, Button: { Text: "Подложить в колоду", action: PanicMeet }, },
    PanicOnlyOneCardStayInHand: { id: 16, Button: { Text: "Оставить эту карту", action: PanicForgot }, },
    Mist: { id: 17, HiLightText: "Отклонить обмен", Button: { Text: "Отклонить", action: mist } },
    Fear: { id: 18, HiLightText: "Отклонить обмен", Button: { Text: "Отклонить и посмотреть", action: fear } },
    ChangePlaceNear: { id: 19, HiLightText: "Выбери игрока", MayMove: true, HiLightRLPlayers: true, selectPlayer: true, OnSelectPlayer: ChangePlaceNear },
    inChangePlace: { id: 20, Button: { Text: "Пересесть", action: AcceptChangePlace }, isInExchangePlace: true },// OnSelectAction: exchangecard },
    StayHere: { id: 21, Button: { Text: "Остаться", action: DefendFromChangePlace }, isInExchangePlace: true },// OnSelectAction: exchangecard },
    ChangePlace: { id: 22, HiLightText: "Выбери игрока", MayMove: true, HLAllNonQuarantine: true, selectPlayer: true, OnSelectPlayer: ChangePlace },
    Quarantine: { id: 23, HiLightText: "Выбери игрока", MayMove: true, HiLightRLPlayers: true, selectPlayer: true, OnSelectPlayer: SetQuarantine },
    PanicGoAway: { id: 24, HiLightText: "Выбери игрока", MayMove: true, HLAllNonQuarantine: true, selectPlayer: true, OnSelectPlayer: PanicGoAway },
    Axe: { id: 25, HiLightText: "Выбери игрока", MayMove: true, HiLightRLPlayers: true, selectPlayer: true, OnSelectPlayer: Axe },
    Door: { id: 26, HiLightText: "Выбери игрока", MayMove: true, HiLightRLPlayers: true, selectPlayer: true, OnSelectPlayer: SetDoor },
    PanicOneTwo: { id: 27, HiLightText: "Выбери игрока", MayMove: true, HLThridPlayers: true, selectPlayer: true, OnSelectPlayer: PanicOneTwo },
    PanicConfessionTime: { id: 28, HiLightText: "Время признаний", Button: { Text: "Показать карты всем", action: PanicConfessionTime } },
    PanicNoConfessionTime: { id: 29, Button: { Text: "Не показывать карты всем", action: PanicNoConfessionTime } },
    PanicStopConfessionTime: { id: 30, Button: { Text: "Остановить время признаний", action: PanicStopConfessionTime } },

    Burn2: { id: 31, HiLightText: "Выбери игрока", HiLightRLPlayers: true, selectPlayer: true, OnSelectPlayer: BurnPlayer2 },
};

const Algoritms = {
    MayGiveInfect: function (me, other) {
        if (me.Thing == true) return Actions.outChange;
        if (me.Infected == true && other.Thing == true && me.InfectCount > 1) return Actions.outChange;
        return Actions.Nothing;
    },
    MayGiveInfectIn: function (me, other) {
        if (me.Thing == true) return Actions.inChange;
        if (me.Infected == true && other.Thing == true && me.InfectCount > 1) return Actions.inChange;
        return Actions.Nothing;
    },
    MayDropInfect: function (me) {
        if (me.Infected == true && me.InfectCount == 1) return Actions.Nothing;
        return Actions.Drop;
    },
    OnlyDropAction: (me) => Actions.Drop,
    SimpleExchange: (me, other) => Actions.outChange,
    SimpleAnswer: (me, other) => {
        if (me.state == States.IncomeExchange) return Actions.inChange;
        return Actions.Nothing;
    },
    ActionSuspicion: (me) => {
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.SawOneCard]
    },
    ActionAnalysis: (me) => {
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.SawAllCards]
    },
    ActionBurnFire: (me) => {
        //if (game.selectedOpponent == null) return Actions.Drop;
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.Burn]
    },
    ActionWhiski: (me) => {

        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.ShowAllCards]
    },
    ActionTemptation: (me) => {
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.Temptation]
    },
    ActionBurn2: (me, card) => {
        //if (game.selectedOpponent == null) return Actions.Nothing;
        return [Actions.Burn2];
    }, ActionTemptation2: (me, card) => {
        if (game.selectedOpponent == null) return Actions.Nothing;
        return card.GetExchangeArray(me, game.selectedOpponent);
    },
    FireResistance: (me, other) => {
        if (me.state == States.DefendFireSelectCard) return Actions.DefendFromFire;
        return Actions.inChange;
    },
    Perseverance: (me) => {
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.Perseverance]
    },
    Perseverance2: (me, card) => [],
    NoThanks: (me, other) => {
        if (me.state == States.IncomeExchange) return [Actions.inChange, Actions.NoThanks];
        return Actions.Nothing;
    },
    ChangeDirection: (me) => {
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.ChangeDirection]
    },
    Panic: (me) => [Actions.Panic],
    ChainPanic: (me, card) => {
        return card.GetExchangeArray(me, game.opponent);
    },
    PanicBetweenUs: (me, card) => [Actions.ShowAllCardsTo],
    PanicGoAway: (me, card) => {
        //if(game.opponent.quarantineCount>0)return Actions.Nothing;
        return Actions.PanicGoAway
    },
    PanicMeet: (me, card) => {
        if (card == Cards.Thing) return Actions.Nothing;
        if (me.Infected == true && me.InfectCount == 1 && card == Cards.Infect) return Actions.Nothing;
        return Actions.SelectCardForDeck
    },
    PanicOnlyOneCardStayInHand: (me, card) => {
        if (me.Thing == true && card != Cards.Thing) return Actions.Nothing;
        if (me.Infected == true && me.Thing == false && card != Cards.Infect) return Actions.Nothing;
        return Actions.PanicOnlyOneCardStayInHand;
    },
    Mist: (me, other) => {
        if (me.state == States.IncomeExchange) return [Actions.inChange, Actions.Mist];
        return Actions.Nothing;
    },
    Fear: (me, other) => {
        if (me.state == States.IncomeExchange) return [Actions.inChange, Actions.Fear];
        return Actions.Nothing;
    },
    ChangePlaceNear: (me) => {
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.ChangePlaceNear];
    },
    ChangePlace: (me) => {
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.ChangePlace];
    },
    StayHere: (me, other) => {
        if (me.state == States.DefendPlaceChange) return [Actions.inChangePlace, Actions.StayHere];
        return Actions.inChange;
    },
    Quarantine: (me) => {
        if (me.QuarantineCount > 0) return Actions.Drop;
        return [Actions.Drop, Actions.Quarantine];
    },
    Axe: (me) => {
        return [Actions.Drop, Actions.Axe];
    },
    Door: (me) => {
        return [Actions.Drop, Actions.Door];
    },

    Friends: (me, card) => {
        return card.GetExchangeArray(me, game.opponent);
    },

    PanicOneTwo: (me, card) => {
        return Actions.PanicOneTwo;

    }
    ,
    PanicConfessionTime: (me, card) => {
        if (card == Cards.Infect) return [Actions.PanicConfessionTime, Actions.PanicNoConfessionTime, Actions.PanicStopConfessionTime];
        return [Actions.PanicConfessionTime, Actions.PanicNoConfessionTime];

    }


};



const Cards = {
    UnknownPanic: new CardType("Panic", -2, "", "", "/panic.png", null, null, null, null, true, true),//неизвестная паника
    UnknownAction: new CardType("Event", -1, "", "", "/event.png", null, null, null, null, false, true),//неизвестное событие
    Thing: new CardType("Thing", 0, "Нечто", "Вы нечто! эту карту нельзя передать", "/thing.jpg", null, null, null, null),//нечто
    Infect: new CardType("Infect", 1, "Заражение", "Получив эту карту от другого игрока\nвы становитесь зараженным\nи обязаны держать ее на руке до конца игры", "/infect.png", Algoritms.MayGiveInfect, Algoritms.MayGiveInfectIn, Algoritms.MayDropInfect, null),//заражение
    Suspicion: new CardType("Suspicion", 2, "Подозрение", "Посмотрите одну карту на руке соседнего игрока", "/suspiction.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.ActionSuspicion, null),//подозрение
    Analysis: new CardType("Analysis", 3, "Анализ", "Посмотрите все карты на руке соседнего игрока", "/analysis.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.ActionAnalysis, null),//анализ
    BurnFire: new CardType("Burn", 4, "Огнемет", "Соседний игрок выбывает из игры", "/fire.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.ActionBurnFire, Algoritms.ActionBurn2),//огнемет
    FireResist: new CardType("Defend\nfrom Fire", 5, "Никакого шашлыка", "Отмените эффект карты огнемет,\nесли стали ее целью.\n возьмите 1 карту событие", "/nofire.png", Algoritms.SimpleExchange, Algoritms.FireResistance, Algoritms.OnlyDropAction, null),//шашлык
    Temptation: new CardType("Temptation", 6, "Соблазн", "Поменяйтесь одной картой с любым игроком,\nесли он не на карантине.\nВаш ход заканчивается", "/temptation.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.ActionTemptation, Algoritms.ActionTemptation2),//соблазн
    Perseverance: new CardType("Perseverance", 7, "Упорство", "Возьмите 3 карты событий,\nоставтье на руке одну.\nЗатем сыграйте или сбросьте одну карту", "/perseverance.jpg", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.Perseverance, Algoritms.Perseverance2),//Упорство
    GetOff: new CardType("Get Off", 8, "Сматывай удочки", "Поменяйтесь местами с любым игроком\nпо вашему выбору если он не на карантине.\nИгнорируйте заколоченные двери", "/udochki.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.ChangePlace, null),

    ChangeDirection: new CardType("Change\nDirection", 9, "Гляди по сторонам", "Очередность хода передается в другую сторону.\nМеняется порядок ход и направление обмена картами", "/direction.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.ChangeDirection, null),
    ChangePlace: new CardType("Change place", 10, "Меняемся местами", "Поменяйтесь местами с соседним игроком,\nесли он не на карантие и не за заколоченной дверью", "/changeplace.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.ChangePlaceNear, null),
    Whiski: new CardType("Whiski", 11, "Виски", "Покажи все на руке карты всем игрокам", "/whiski.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.ActionWhiski, null),
    Axe: new CardType("Axe", 12, "Топор", "Сбросте сыгранную на вас\nили на соседнего игрока карту Карантин\nили выложенную между вами карту Заколоченная дверь", "/axe.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.Axe, null),

    NoThanks: new CardType("No Thanks", 13, "Нет уж, спасибо", "Откажитесь от обмена картами.\nвозьмите 1 карту событие", "/nothanx.png", Algoritms.SimpleExchange, Algoritms.NoThanks, Algoritms.OnlyDropAction, null),
    Fear: new CardType("Fear", 14, "Страх", "Откажитесь от обмена картами\nи посмотрите карту, от которой отказались.\n возьмите 1 карту событие", "/fear.png", Algoritms.SimpleExchange, Algoritms.Fear, Algoritms.OnlyDropAction, null),
    Past: new CardType("Past", 15, "Мимо", "Откажитесь от обмена картами.\nВместо вас картами меняется следующий за вами игрок.\n возьмите 1 карту события", "/mimo.png", Algoritms.SimpleExchange, Algoritms.Mist, Algoritms.OnlyDropAction, null),
    StayHere: new CardType("i Stay Here", 16, "Мне и здесь неплохо", "Отмените эффект карты\nменяемся местами или сматывай удочки,\n если стали ее целью.\nвозьмите 1 карту события", "/stay.png", Algoritms.SimpleExchange, Algoritms.StayHere, Algoritms.OnlyDropAction, null),
    Door: new CardType("Door", 17, "Заколоченная дверь", "Положите эту карту между собой и соседним игроком.\nМежду вами не может совершаться никаких действий и обменов", "/door.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.Door, null),
    Quarantine: new CardType("Quarantine", 18, "Карантин", "Сыграйте эту карту на соседнего игрока,\nследующие 3 хода игрок не может играть карты событий", "/quarantine.png", Algoritms.SimpleExchange, Algoritms.SimpleAnswer, Algoritms.Quarantine, null),

    PanicOldRopes: new CardType("Old Ropes down", 19, "Старые веревки", "Все сыгранные карты карантин сбрасываются", "/oldropes.png", null, null, Algoritms.Panic, null, true),
    PanicThreeFour: new CardType("Panic Three Four", 20, "Три четыре", "Все сыгранные карты закалоченная дверь сбрасываются", "/pthreefour.png", null, null, Algoritms.Panic, null, true),
    PanicUPS: new CardType("UPS", 21, "Уупс", "Покажите все свои карты на руке остальным игрокам", "/ups.png", null, null, Algoritms.Panic, null, true),
    PanicConfessionTime: new CardType("PanicConfessionTime", 22, "Время признаний", "Начиная с вас и по порядку хода каждый\nпоказывает либо не показывает все карты на руке остальным игрокам.\n Время признаний завершается когда кто то из игроков показывает карту заражения", "/priznania.png", null, null, Algoritms.Panic, Algoritms.PanicConfessionTime, true),
    PanicBetweenUs: new CardType("PanicBetweenUs", 23, "Только между нами", "Покажите все карты на руке соседнему игроку\nпо вашему выбору", "/betweenus.png", null, null, Algoritms.Panic, Algoritms.PanicBetweenUs, true),
    PanicForgot: new CardType("PanicForgot", 24, "Забывчивость", "Сбросьте три карты с руки и возьмите 3 новые карты из колоды,\nсбрасывая паники ", "/forgot.png", null, null, Algoritms.Panic, Algoritms.PanicOnlyOneCardStayInHand, true),
    PanicFriend: new CardType("", 25, "Давай дружить", "Поменяйтесь одной картой\nс любым игроком если он не на карантине", "/friend.png", null, null, Algoritms.Panic, Algoritms.Friends, true),
    PanicMeet: new CardType("", 26, "Свидание вслепую", "Поменяйте одну карту с руки\nна верхнюю карту колоды сбрасывая паники.\n Ваш ход заканчивается", "/meet.png", null, null, Algoritms.Panic, Algoritms.PanicMeet, true),
    PanicChain: new CardType("", 27, "Цепная реакция", "Каждый игрок одновременно с остальными\nотдает одну карту следующему по порядку хода игроку\nигнорируя все сыгранные карты карантин и заколоченная дверь. вы не можете отказаться от обмена. нечто может заразить другого передав заражение. ваш ход заканчивается", "/chain.png", null, null, Algoritms.Panic, Algoritms.ChainPanic, true),
    PanicOneTwo: new CardType("One two", 28, "Раз два", "Поменяйтесь местами с третим от вас игроком\nслева или справа (по вашему выбору).\nИгнорируйте все заколоченные двери.\n Если игрок на карантине, смены мес т не происходит", "/onetwo.png", null, null, Algoritms.Panic, Algoritms.PanicOneTwo, true),
    PanicGoAway: new CardType("Go away", 29, "Убирайся прочь", "Поменяйтесь местами с любым игроком\nесли он не на карантине", "/goaway.png", null, null, Algoritms.Panic, Algoritms.PanicGoAway, true),
    PanicParty: new CardType("", 30, "Вечеринка", "Все сыгранные карты карантин и заколоченная дверь сбрасываются.\nЗатем начиная с вас и по часовой стрелке все парами меняются местами.\n в случае нечетного числа игроков последний игрок остается на месте", "/party.png", null, null, Algoritms.Panic, null, true),

};

function findCardByNum(num) {
    for (i in Cards)
        if (Cards[i].num == num) return Cards[i];
    return Cards.UnknownAction;

}


class Card {
    constructor(cardtype, owner, cardplace, props) {
        this.card = cardtype;
        this.owner = owner;
        this.cardplace = cardplace;
        this.props = props;
        this.x = 0;
        this.y = 0;
        this.isSelected = false;
        for (let i in props) this[i] = props[i];
        if (this.isMove == true) Animator.AddCardmove(this, this.from, this.to);
        if (this.lineTo != undefined) Lines.AddLine(this, this.lineTo);

    }

    Draw(ctx, e) {

        let scrCard = ctx.getCanvasToWindow(CardType.width / 2, CardType.height / 2);
        this.x = scrCard.x;//-CardType.width/2;//this.transform.e;
        this.y = scrCard.y;//-CardType.height/2;//this.transform.f
        if (Animator.IsNotMove(this))
            return this.card.Draw(ctx, e);

    }


}

