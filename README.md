
Нечто (Stay Away)
    Создатели: Antonio Ferrara, Sebastiano Fiorillo. Игра подкупает своей ценой - 590 рублей. Расcчитана на количество от 4 до 12 игроков, но оптимальное количество игроков -  6 или 8. Рекомендуемый возраст 12+ . Среднее время игры: 15-60 минут.

    По данным портала www.boardgamegeek.com игру Нечто можно отнести к следующим категориям:
Блеф (bluffing) - необходимость скрывать свои цели и играть свою роль.

Карточная игра (card game) - игра содержит только карты и правила.

Дедукция (deduction) - обязательная составляющая победы, игрокам нужно выяснить кто Нечто.

Хоррор (horror) - атмосфера, которую создаёт игра посредством дизайна карт и сюжетной линии.

Пати (party) - игра рассчитана на большое количество человек: от 4 человек.

Драфт карт (card drafting) - колода содержит карты, которые вводят элемент неожиданности в игру. 

    Запуск игры:

    npm -i install

    node server.js

    требуется  nodejs версии 16 и выше

    открывается браузер на странице

    http://localhost:3000




Что нужно знать перед началом игры 
     В состав игры входят правила и две колоды карт: 88 карт Событие и 20 карт Паника. Для игры необходим стол (желательно круглый для удобства пересадок игроков). Для правильного рассчета хода можно добавить в коробку маленькие фишки.
Предыстория
    Всё начинается с разговора по рации с последним живым археологом Джеком, который рассказывает странные вещи. Позже слышен выстрел........
    Поисково-спасательная группа отправляется на поднявшийся из воды остров, чтобы выяснить судьбу первой группы учёных-археологов. Пребывая на остров группа попадает в плохие погодные условия и укрывается в бараке. Там они находят Джека, лежащего на столе с пистолетом в руке.....
    Прибывшие осматривают барак и видят в одном из чуланов дыру в полу, где видна тёмная жидкость.....
    Дверь быстро захлопывают, но уже поздно..... один из членов группы становится инфицированным Нечто....
Как победить
    Цель игры для команды людей - найти Нечто и уничтожить.
    Цель игры для Нечто и заражённых им людей - избавиться от оставшихся людей: заразить их или уничтожить.

    Игра заканчивается в одном из двух случаев:
    Нечто уничтожен.
Все вскрывают карты и все выжившие люди являются победителями.
Нечто и заражённые - проигравшими.
    В игре не остаётся людей.
Нечто может объявить что за столом не осталось больше незаражённых людей.
Все вскрывают карты: 
Если Нечто прав - люди проиграли. Заражённые и Нечто - победили. 
Если не прав, то победили люди, остальные проиграли.
Особый случай 1: Если последний человек в игре был заражён (не уничтожен), то он не становится победителем вместе с Нечто и заражёнными.
Особый случай 2: Если Нечто заразил всех людей и никто не был уничтожен, то победителем становится только Нечто.

Ход игры
    Игроки делают ход по очереди. Направление передачи хода по умолчанию - по часовой стрелке, но может меняться (например, картой Гляди по сторонам). 

    В свой ход игрок обязан последовательно выполнить 4 фазы:
    Взять верхнюю карту из колоды "в закрытую".
    Если это карта Паника, то игрок обязан её показать всем и сыграть. Далее сбросить лицевой стороной вниз (в стопку сброса).
    Если это карта Событие, то игрок берёт её в руку и делает одно из действий:
Сбросить на выбор игрока с руки одну из карт "в закрытую".
Сыграть одну из карт Событие и сбросить лицевой стороной вниз.
    Выбрать одну из карт с руки и положить "в закрытую" для обмена с игроком, в чью сторону направлена карта-указатель (этот игрок делает аналогично). Игрок не выполняет фазу обмена и завершает свой ход, если следующий игрок на Карантине или между ними лежит карта Заколоченная дверь.  
    Завершив ход, передать карту-указатель следующему игроку по направлению стрелки. 
    В начале и конце хода у игроков всегда должно быть 4 карты на руке.
    Игроки не должны показывать карты остальным, кроме случаев, когда карта это предписывает (например, Виски или Анализ). 
    Во время игры рекомендуется разговаривать, блефовать, делать ложные заявления или обвинения.
      Целью карты Событие является соседний игрок слева или справа, пока на карте не указано обратное.
    
Роль человека
    В начале игры все участники - члены спасательно-поисковой группы (играют роли людей), кроме игрока, получившего карту Нечто. Задача людей - выяснить кто из игроков Нечто и "поджарить" его при помощи Огнемёта. Игрок остаётся человеком пока Нечто не заразит его. Заражение не происходит если человек берёт карту Заражение! из колоды. Он не может её передать другому игроку, карту можно держать у себя в руке или сбросить. После получения карты Заражение! от Нечто игрок переходит в команду заражённых.
Роль заражённого
    Получив карту Заражение! от Нечто игрок не может её сбросить. У заражённого всегда на руке минимум одна карта Заражение! и её нельзя обменять. Задача заражённого помогать Нечто заражать других и скрывать от игроков, кто является Нечто. Если заражённый игрок вытащил из колоды ещё одну карту Заражение!, то он может выбрать одно из действий: сбросить, держать в руке или передать Нечто. 
Роль Нечто
    Участник, получивший карту Нечто, остается с этой ролью до конца игры. Он не может сбросить эту карту или обменять её. Задача Нечто - избавиться от людей путём заражения или уничтожения. Только Нечто может заражать людей передавая им карты Заражение!. Только Нечто знает кто в игре человек, а кто - заражённый и может в конце игры объявить об этом. Нечто может получать от заражённых игроков карты Заражение!, чтобы продолжать избавляться от людей. 
Смена мест
    Одним из важных элементов игры является физическая смена мест игроков за столом. Это, например, может быть необходимо игрокам для того, чтобы отдалиться от одного из участников или приблизиться к кому-то. Нечто вынужден использовать этот элемент для достижения своей цели - заразить всех игроков. Каждая смена мест может навеять подозрения или нарушить чьи-то планы.
    В любом случае, игрок который начал смену мест в свой ход, должен завершить его обменом карт со своим новым соседом по направлению хода. Далее ход переходит к игроку, согласно карте-указателю (Placeholder).
    Во время перемещений игроки всегда берут свои карты с собой.
    Заколоченные двери остаются лежать на своём месте.
    Игрок на Карантине не может быть целью смены мест, если на карте не указано иного.
Выбывание из игры
    Только карта Огнемёт может вывести игрока из игры, вне зависимости от его роли.  Целью должен быть игрок слева или справа. Действие карты Огнемёт может быть отменено картой Никакого шашлыка!.
   Игрок не может продолжать игру в случае Супер-заражения.  Оно происходит если: во-первых, у игрока на руке 4 карты Заражение!, во-вторых, ему необходимо сделать обмен с другим игроком (кроме случая обмена заражённого с Нечто). Далее игрок вскрывает карты, сбрасывает лицевой стороной вниз. "Это фиаско, братан!"
   (еще не реализовано) Нечто не может иметь на руке Огнемёт в конце своего хода. Если игроки узнают, что у Нечто есть эта карта на руках после его хода, то Нечто и заражённые проиграли.

![Таблица3](https://github.com/znsoft/StayAwayWeb/assets/4936144/45a5f7d0-1bd3-438f-9bce-493cac8447b4)

   Для пяти - добавляются существенные карты: Анализ, Страх и Карантин. Для шести -  колода значительно увеличивается.  Для 11 и 12 игроков - колода с максимальным числом карт.
     Создатели игры разделили карты по типам при помощи цвета в названии карт. 
Красный - Инфекция.
    Сюда входят карты Нечто и Заражение!
Зелёный - Действия.
    Карты: Огнемёт, Анализ, Топор, Подозрение, Виски, Упорство, Гляди по сторонам, Меняемся местами!, Сматывай удочки!, Соблазн.
Синий - Защита.
    Это карты: Страх, Мне и здесь неплохо, Нет уж, спасибо!, Мимо!, Никакого шашлыка!.
Жёлтый - Препятствия.
    Карты Карантин и Заколоченная дверь.
Карты категории Инфекция
     Получив такую карту вы обязаны всегда держать ее в руке ( эффекты других карт не избавляют от неё).   
Нечто (The Thing)
    Получив эту карту вы играете роль Нечто. 
Заражение! (Infected!)
    Если вы вытащили эту карту из колоды вы НЕ становитесь заражённым, но вы можете держать карту в руке или сбросить. 
Если вы в роли человека, то вы НЕ можете никому передать эту карту. 
Если вы в роли заражённого, то можете передать её только Нечто.
Если вы в роли Нечто, то можете передать только человеку.
          Если вы получили карту Заражение! от игрока, то он - Нечто!

Карты категории Действия
    Название карт категории Действия написано зеленым цветом. Карты этой категории могут быть сыграны только во время хода игрока (фаза 2). После того как карта сыграна, она сбрасывается "в закрытую".
Узнать карты
Анализ (Analysis)
    Вы можете применить её на соседнего игрока, чтобы он показал вам "в закрытую " все свои карты (вне зависимости от его роли). У карты нет противодействия.
Подозрение (Suspicious)
    Возьмите одну случайную карту с руки соседнего игрока, посмотрите её так, чтобы никто не видел и верните обратно. У карты нет противодействия.
Обменять карты
Соблазн (Seduction)
    Вы можете сыграть эту карту, чтобы инициировать обмен одной карты с любым участником (кроме игрока на Карантине). В этом случае фаза 3 не выполняется и ход игрока завершается. Противодействие - Нет уж, спасибо! или Мимо!
Упорство (Resolute)
    Возьмите три верхние карты Событие из колоды. Если попадутся карты Паника - сбросьте их неглядя. Выберите одну из трёх карт и возьмите себе в руку, остальные сбросьте "в закрытую". Далее фаза 2 повторяется и игрок может сыграть или сбросить одну карту. Вы можете снова сыграть карту Упорство.
Смена мест
Сматывай удочки! (You'd Better Run!)
    Поменяйтесь местами с любым игроком на ваш выбор. Далее совершите обмен картами (фаза 3) с новым соседом. Ваш ход завершён. Далее ходит игрок, который пересел на ваше место, напротив него карта-указатель. Противодействие - Мне и здесь не плохо.
Меняемся местами! (Change Places!)
    Сыграв карту, вы можете поменяться местами с соседом, если между вами нет Заколоченной двери и игрок не на Карантине.  Перед завершением хода обменяйтесь картами с новым соседом (фаза 3). Далее ход переходит к игроку, с которым вы менялись местами, напротив него карта-указатель.
Гляди по сторонам (Watch Your Back)
    С помощью этой карты вы можете поменять направление передачи хода и обмена картами. Переложите карту-указатель со стрелкой в обратную сторону. Далее обменяйтесь картами с игроком с учетом нового направления, затем ход переходит к нему. Передайте ему карту-указатель.
Особые
Огнемёт (Flamethrower)
    Уникальная карта, которая может вывести соседнего игрока из этой партии. Карта Огнемет не может быть использована, если вы на Карантине. Нельзя использовать эту карту, когда между игроками Заколоченая дверь. Противодействие - карта Никакого шашлыка!. 
Виски (Whiskey)
    Сыграв Виски вы показываете все свои карты всем игрокам.
Топор (Axe)
    Карта может быть сыграна на себя или на соседнего игрока, чтобы избавиться от Карантина или Заколоченной двери. Выбранная карта кладётся в сброс.
Карты категории Защита
    Названия карт категории Защита написаны Синим цветом. Эти карты могут быть сыграны только в ответ на:

карту Действия, сыгранную другим игроком на вас
действие карты Паника (если нет текста обратного)
предложение от игрока в его ход (фаза 3) поменяться картами

     Сыграв карту защиты, игрок сбрасывает её и должен взять замену из колоды. Если при вытаскивании карт из колоды попадаются карты Паника, сбросьте их "в закрытую".
Нет уж, спасибо! (No Thanks!)
    Эта карта может быть сыграна как защита от обмена картами. Вы можете защититься этой картой от предложения игрока или от эффекта другой карты.
Страх (Scary)
    Вы можете сыграть эту карту в ответ на предложение поменяться с вами картой. Вы можете отказаться от предложения, которое исходит от игрока или от эффекта карты. В дополнение вы можете посмотреть на карту, которую вам предлагают и "в закрытую" вернуть обратно.
Мимо! (Missed!)
    В ответ на предложение поменяться с вами картой вы можете сыграть карту Мимо!. В этом случае вы перенаправляете предложение обмена картой от игрока или эффекта карты на следующего игрока за вами (по направлению стрелки). Как и в случае с любой картой категории Защита, возьмите карту Событие из колоды на замену карте Мимо! в вашей руке. Если между вами и следующим игроком есть Заколоченная дверь или игрок находится на Карантине, то обмен не происходит. В случае если следующий игрок получает карту Заражение!, то он не становится заражённым. Игрок к которому переходит предложение обмена картами, должен обменяться или защититься. Далее ход игры продолжается как обычно и переходит к следующему игроку по стрелке.
Мне и здесь неплохо (I'm Comfortable)
    Эту карту вы можете сыграть в ответ на предложение поменяться местами. Предожение может исходить от игрока или эффекта карты.
Никакого шашлыка! (No Barbecue!)
    Карта может быть сыграна только чтобы защититься от действия карты Огнемёт. Использовав её, вы остаётесь в игре.
Карты категории Препятствия
    Названия этих карт написаны жёлтым цветом. Карты выкладываются на стол и остаются на своих местах. Карты Препятствия могут быть убраны игроком (Топор!) или эффектом карты Паника. 
Карантин (Quarantine)
    Вы можете сыграть эту карту только на соседнего игрока . Действие начинается немедленно и игрок на Карантине до истечения своего второго хода:
в фазе 1 берет карту из колоды "в открытую" для всех игроков
в случае сброса карты делает это "в открытую"
производит обмен карт "в открытую" (отдаёт свою карту "в открытую")
имеет запрет на использование карты Огнемёт 
не может использовать сам или быть целью смены мест (кроме случаев, если в карте явно указано что эффект Карантина может быть игнорирован)
              Карта Карантина может быть удалена и сброшена использованием карты Топор или эффектом карты Паника раньше конца второго хода.
          . 
              
Заколоченная дверь (Barred door)
    Игрок может сыграть эту карту, выложив между собой и соседним игроком. Соседние игроки между которыми находится Заколоченная дверь больше не могут:
играть друг на друга карты категории Действия
производить обмен картами через дверь
меняться местами
               Карта остаётся на месте независимо от перемещения игроков, до тех пор пока 
           не будет убарана картой Топор или эффектом карты Паника. 


![Таблица Паники](https://github.com/znsoft/StayAwayWeb/assets/4936144/160ccc48-ee7f-4e3c-b315-0179e3e53278)

           Для девяти игроков резко увеличивается количество карт Паника, а также добавляется много повторных карт. Больше всего добавляется новых карт при переходе от 4 к 5 игрокам.
Карты категории Смена мест
И это вы называете вечеринкой?
    Все сыгранные карты Карантин и Заколоченные двери сбрасываются. Затем начиная с вас и по часовой стрелке все игроки парами меняются местами. В случае нечётного числа игроков последний игрок остаётся на месте.
    Для простоты можно пронумеровать игроков , номер 1 - игрок вытянувший карту Паника, далее (по часовой стрелке), 2, 3.....  Меняются местами  1<->2 , 3<->4 , 5<->6 и так далее.
Убирайся прочь!
    Поменяйтесь местами с любым игроком (на ваш выбор), если он не на Карантине.
Раз, два...    ...Нечто поднялось со дна!
    Поменяйтесь с третьим от вас по счету игроком слева или справа (на ваш выбор). Игнорируйте все Заколоченные двери. Если игрок на Карантине, смены мест не происходит.
    Игрок разыгрывающий карту Паника в этом случае имеет номер 0, далее он отсчитывает от себя третьего игрока - 1, 2, 3 и меняется с ним местами.

Карты категории Обмен картами
Цепная реакция
    Каждый игрок одновременно с остальными отдаёт одну карту следующему по порядку хода игроку, игнорируя карты Карантин и Заколоченная дверь.
    Вы не можете отказаться от получения карты при помощи других карт.
    Нечто может заразить другого игрока, передав ему карту Заражение!
    Ваш ход заканчивается.
Свидание вслепую
    Поменяйте одну карту с руки на верхнюю карту общей колоды, сбрасывая все попадающиеся карты Паника. Ваш ход заканчивается.
Давай дружить?
    Поменяйтесь одной картой с любым игроком (на ваш выбор), если он не на Карантине.
Забывчивость
    Сбросьте 3 карты с руки и, только затем, возьмите 3 новые карты Событие. Сбрасывайте все попадающиеся карты Паника.
Карты категории Показ карт
Только между нами...
    Покажите все карты на руке соседнему игроку на ваш выбор.
Время признаний
    Начиная с вас и по порядку хода, каждый игрок делает одно из действий:
показывает все карты со своей руки всем игрокам
отказывается от показа своих карт
Время признаний заканчивается, когда кто-то из игроков показывает карту Заражение!, при этом нет необходимости показывать остальные карты на руке.
Уупс!
    Покажите все свои карты на руке остальным игрокам.
Карты категории Сброс карт Препятствий
 ...Три, четыре...
    ....открывайте дверь пошире!
    Все сыгранные карты Заколоченная дверь сбрасываются.
Старые верёвки
    Эти никчёмные верёвки рвутся от простого чиха!
    Все сыгранные карты Карантин сбрасываются.





(не реализовано) Дополнительные режимы
    Чтобы увеличить сложность игры и добавить преимущества Нечто или людям - вы можете соотвественно увеличить или уменьшить количество карт Заражение! в колоде.
    Чтобы увеличить сложность игры и добавить преимущество Нечто - вы можете убрать из стартовой колоды все карты Огнемёт и Анализ, положив их в колоду.
    Чтобы увеличить стратегический компонент можно ввести правило: игрок может использовать карты Соблазн, Сматывай удочки!, Давай дружить?, Убирайся прочь! только налево или направо, карты Карантина и\или Заколоченная дверь препятствуют этому в двух направлениях.
Опытные игроки могут составить колоду карт по-своему.
Режим Отмщения: Если Нечто выбыл из игры и в игре остались люди и заражённые, игра продолжается. Две команды сражаются, пока одна не сожжёт другую Огнемётом. Игрок Нечто может продолжать участвовать в обсуждениях и разговорах, потому что он знает кто за какую команду играет. Нечто может объявить в конце когда одна из команд покинет игру. В случае выживания людей - они побеждают, в случае если выбывают все люди - побеждают заражённые.


Различные тактические особенности:
Карта Мимо!  Если игрок, на которого перенаправили обмен картами получил Заражение! (не стал заражённым) то он может предположить два варианта: Нечто пытался заразить соседа или заражённый передавал карту Заражение! для Нечто. Но во втором случае игроку Нечто было бы странно играть карту Мимо! так как он знает что заражённый передаёт ему карту и это может быть важно. А значит остаётся один вариант - игрок через одного (использовал Мимо!) играет роль Нечто.
В случае если Нечто находится на Карантине, то его попытки заразить игроков будут видны всем. И игроку Нечто нужно принять решение, "открываться" или переждать\избавиться от Карантина чтобы продолжить заражать "в закрытую". 
Убирание карты Карантина с игрока, наводит на подозрение. Если это делает заражённый для Нечто чтобы помочь - то это может открыть их роли. 
Отличным ходом встречал передачу карты от Нечто игроку-человеку с "добрым словом", чтобы "усыпить бдительность". А позднее передача карты Заражение! когда игрок в роли человека уже скорее всего не будет защищаться.
Когда выводят из игры игрока-человека с помощью Огнемёта это странный и подозрительный шаг. Если на первых ходах это и будет делать игрок-человек, то делать это будет почти наугад. То есть вероятно что использовал Огнемёт заражённый или Нечто.
