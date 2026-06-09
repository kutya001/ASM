function createDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tables = {
    'Users': ['ID', 'Username', 'Password', 'Name', 'Phone', 'Role', 'Status'],
    'Records': ['ID', 'ClientName', 'Phone', 'CarNumber', 'BrandID', 'ModelID', 'MasterID', 'StartTime', 'EndTime', 'Status', 'ServicesJSON', 'AdditionalServices', 'TotalAmount', 'Comment', 'IsPaid'],
    'Services': ['ID', 'Name', 'Price'],
    'Brands': ['ID', 'Name'],
    'Models': ['ID', 'BrandID', 'Name'],
    'WelcomeScreens': ['ID', 'Title', 'Text'],
    'GameRecords': ['ID', 'UserID', 'Username', 'GameID', 'StartTime', 'PlayTime', 'Score'],
    'Заявки на Запись': [
      'Отметка времени', 'Ваше Имя', 'Контактный номер телефона', 'Государственный номер машины (госномер)', 
      'Марка автомобиля', 'Модель автомобиля', 'Год выпуска автомобиля', 
      'Выберите необходимые услуги автоэлектрики (если применимо)', 'Предполагаемая дата записи', 'Предполагаемое время записи', 
      'Краткое описание проблемы или комментарий (по желанию)', 'Адрес электронной почты', 'IDRecords', 'Статус Заявки'
    ]
  };

  for (var tab in tables) {
    var sheet = ss.getSheetByName(tab);
    if (!sheet) {
      sheet = ss.insertSheet(tab);
      sheet.appendRow(tables[tab]);
      sheet.getRange(1, 1, 1, tables[tab].length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }

  // Создание дефолтного Супер-админа, если пользователей нет
  var usersSheet = ss.getSheetByName('Users');
  if (usersSheet && usersSheet.getLastRow() === 1) {
    usersSheet.appendRow([Utilities.getUuid(), 'admin', 'admin', 'Суперадмин', '', 'Superadmin', 'Approved']);
  }

  // Заполнение справочника Марок и Моделей, если пуст
  var brandsSheet = ss.getSheetByName('Brands');
  if (brandsSheet && brandsSheet.getLastRow() === 1) {
    var b_lada = Utilities.getUuid();
    var b_gaz = Utilities.getUuid();
    var b_uaz = Utilities.getUuid();
    var b_chevrolet = Utilities.getUuid();
    var b_daewoo = Utilities.getUuid();
    var b_ravon = Utilities.getUuid();
    var b_hyundai = Utilities.getUuid();
    var b_kia = Utilities.getUuid();
    var b_toyota = Utilities.getUuid();
    var b_nissan = Utilities.getUuid();
    var b_renault = Utilities.getUuid();
    var b_volkswagen = Utilities.getUuid();
    var b_skoda = Utilities.getUuid();
    var b_chery = Utilities.getUuid();
    var b_geely = Utilities.getUuid();
    var b_haval = Utilities.getUuid();
    
    brandsSheet.appendRow([b_lada, 'Lada (ВАЗ)']);
    brandsSheet.appendRow([b_gaz, 'GAZ (ГАЗ)']);
    brandsSheet.appendRow([b_uaz, 'UAZ (УАЗ)']);
    brandsSheet.appendRow([b_chevrolet, 'Chevrolet']);
    brandsSheet.appendRow([b_daewoo, 'Daewoo']);
    brandsSheet.appendRow([b_ravon, 'Ravon']);
    brandsSheet.appendRow([b_hyundai, 'Hyundai']);
    brandsSheet.appendRow([b_kia, 'Kia']);
    brandsSheet.appendRow([b_toyota, 'Toyota']);
    brandsSheet.appendRow([b_nissan, 'Nissan']);
    brandsSheet.appendRow([b_renault, 'Renault']);
    brandsSheet.appendRow([b_volkswagen, 'Volkswagen']);
    brandsSheet.appendRow([b_skoda, 'Skoda']);
    brandsSheet.appendRow([b_chery, 'Chery']);
    brandsSheet.appendRow([b_geely, 'Geely']);
    brandsSheet.appendRow([b_haval, 'Haval']);

    var modelsSheet = ss.getSheetByName('Models');
    if (modelsSheet && modelsSheet.getLastRow() === 1) {
      modelsSheet.appendRow([Utilities.getUuid(), b_lada, 'Granta']);
      modelsSheet.appendRow([Utilities.getUuid(), b_lada, 'Vesta']);
      modelsSheet.appendRow([Utilities.getUuid(), b_lada, 'Priora']);
      modelsSheet.appendRow([Utilities.getUuid(), b_lada, 'Niva (4x4)']);
      modelsSheet.appendRow([Utilities.getUuid(), b_lada, 'Largus']);
      modelsSheet.appendRow([Utilities.getUuid(), b_lada, 'Kalina']);
      modelsSheet.appendRow([Utilities.getUuid(), b_gaz, 'Gazelle']);
      modelsSheet.appendRow([Utilities.getUuid(), b_gaz, 'Volga']);
      modelsSheet.appendRow([Utilities.getUuid(), b_chevrolet, 'Cobalt']);
      modelsSheet.appendRow([Utilities.getUuid(), b_chevrolet, 'Spark']);
      modelsSheet.appendRow([Utilities.getUuid(), b_chevrolet, 'Nexia 3']);
      modelsSheet.appendRow([Utilities.getUuid(), b_chevrolet, 'Cruze']);
      modelsSheet.appendRow([Utilities.getUuid(), b_daewoo, 'Nexia']);
      modelsSheet.appendRow([Utilities.getUuid(), b_daewoo, 'Matiz']);
      modelsSheet.appendRow([Utilities.getUuid(), b_hyundai, 'Solaris']);
      modelsSheet.appendRow([Utilities.getUuid(), b_hyundai, 'Creta']);
      modelsSheet.appendRow([Utilities.getUuid(), b_hyundai, 'Accent']);
      modelsSheet.appendRow([Utilities.getUuid(), b_hyundai, 'Elantra']);
      modelsSheet.appendRow([Utilities.getUuid(), b_hyundai, 'Santa Fe']);
      modelsSheet.appendRow([Utilities.getUuid(), b_kia, 'Rio']);
      modelsSheet.appendRow([Utilities.getUuid(), b_kia, 'Sportage']);
      modelsSheet.appendRow([Utilities.getUuid(), b_kia, 'Optima / K5']);
      modelsSheet.appendRow([Utilities.getUuid(), b_toyota, 'Camry']);
      modelsSheet.appendRow([Utilities.getUuid(), b_toyota, 'Corolla']);
      modelsSheet.appendRow([Utilities.getUuid(), b_toyota, 'RAV4']);
      modelsSheet.appendRow([Utilities.getUuid(), b_toyota, 'Land Cruiser']);
      modelsSheet.appendRow([Utilities.getUuid(), b_volkswagen, 'Polo']);
      modelsSheet.appendRow([Utilities.getUuid(), b_volkswagen, 'Tiguan']);
      modelsSheet.appendRow([Utilities.getUuid(), b_skoda, 'Rapid']);
      modelsSheet.appendRow([Utilities.getUuid(), b_skoda, 'Octavia']);
    }
  }

  // Заполнение справочника Услуг, если пуст
  var servicesSheet = ss.getSheetByName('Services');
  if (servicesSheet && servicesSheet.getLastRow() === 1) {
    servicesSheet.appendRow([Utilities.getUuid(), 'Компьютерная диагностика двигателя', 1000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Диагностика осциллографом', 2000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Поиск и устранение обрыва проводки', 1500]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Адаптация дроссельной заслонки', 800]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Ремонт генератора (замена щеток/диодного моста)', 3500]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Ремонт стартера (замена бендикса/втягивающего)', 3000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Снятие/установка генератора/стартера', 1500]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Зарядка и обслуживание АКБ', 500]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Замена ламп накаливания и ксенона (1 шт)', 300]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Установка автосигнализации (с автозапуском)', 5000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Демонтаж старой автосигнализации', 1500]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Ремонт и программирование брелоков', 1000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Ремонт мотора стеклоподъемника', 1200]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Чистка форсунок ультразвуком', 2500]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Замена свечей зажигания (4 шт)', 800]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Прошивка ЭБУ / Чип-тюнинг (Евро-2)', 8000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Замена лямбда-зонда (датчика кислорода)', 1000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Замена датчика распредвала/коленвала', 1200]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Восстановление блока SRS / Airbag', 4000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Адаптация и прошивка роботизированной КПП', 2000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Сброс сервисных интервалов и ошибок', 500]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Ремонт щитка приборов / замена шлейфов', 3000]);
    servicesSheet.appendRow([Utilities.getUuid(), 'Установка и подключение автомагнитолы', 1500]);
  }
  
  Logger.log("База данных БД успешно создана с отношениями FK, заполненными справочниками и таблицей Users.");
}
