const DO_GET_OUTPUT = 'index';

function doGet(e) {
  // По старинке (на всякий случай)
  if (e && e.parameter && e.parameter.action) {
    return handleRequest(e.parameter.action, e.parameter);
  }
  return HtmlService.createHtmlOutputFromFile(DO_GET_OUTPUT)
    .setTitle('Auto Service Managment - ASM ERP')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    return handleRequest(payload.action, payload);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRequest(action, payload) {
  try {
    var result = null;
    if (action === 'loginUser') {
      result = loginUser(payload.username, payload.password);
    } else if (action === 'getDbVersions') {
      result = getDbVersions();
    } else if (action === 'registerUser') {
      result = registerUser(payload.username, payload.password, payload.name, payload.phone);
    } else if (action === 'approveUser') {
      result = approveUser(payload.userId, payload.data);
    } else if (action === 'getUsernames') {
      result = getUsernames();
    } else if (action === 'updateUserProfile') {
      result = updateUserProfile(payload.userId, payload.username, payload.password, payload.name, payload.phone);
    } else if (action === 'getInitData') {
      result = getInitData(payload.role, payload.userId);
    } else if (action === 'getTable') {
      result = getTable(payload.sheetName);
    } else if (action === 'addRow') {
      result = addRow(payload.sheetName, payload.obj);
    } else if (action === 'addRows') {
      result = addRows(payload.sheetName, payload.objects);
    } else if (action === 'bulkImport') {
      result = bulkImport(payload.data);
    } else if (action === 'updateRecord') {
      result = updateRecord(payload.obj);
    } else if (action === 'updateRow') {
      result = updateRow(payload.sheetName, payload.obj);
    } else if (action === 'deleteRow') {
      result = deleteRow(payload.sheetName, payload.id, payload.role, payload.userId);
    } else {
      throw new Error("Неизвестное действие: " + action);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, result: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================
// АВТОРИЗАЦИЯ
// ========================

function loginUser(username, password) {
  if (!username || !password) throw new Error("Укажите логин и пароль");
  var users = getTable('Users');
  var user = users.find(function(u) { return String(u.Username) === String(username) && String(u.Password) === String(password); });
  if (!user) throw new Error("Неверный логин или пароль");
  if (user.Status !== 'Approved' && user.Role !== 'Superadmin') {
     throw new Error("Ваша учетная запись ожидает проверки Супер-администратором");
  }
  return { ID: user.ID, Username: user.Username, Role: user.Role, Name: user.Name, Phone: user.Phone };
}

function registerUser(username, password, name, phone) {
  if (!username || !password) throw new Error("Укажите логин и пароль");
  var users = getTable('Users');
  if (users.some(function(u) { return u.Username === username; })) {
    throw new Error("Пользователь уже существует");
  }
  var newUser = {
    ID: Utilities.getUuid(),
    Username: username,
    Password: password,
    Name: name || '',
    Phone: phone || '',
    Role: 'Master',
    Status: 'Pending'
  };
  addRowBase('Users', newUser);
  return { success: true, message: "Заявка отправлена. Ожидайте подтверждения Суперадминистратора." };
}

function approveUser(userId, data) {
  var updates = {Status: 'Approved'};
  if (data) {
     if (data.Role) updates.Role = data.Role;
     if (data.Name !== undefined) updates.Name = data.Name;
     if (data.Phone !== undefined) updates.Phone = data.Phone;
  }
  updateRowBase('Users', userId, updates);
  return getTable('Users');
}

function getUsernames() {
  try {
    var users = getTable('Users');
    return users.map(function(u) {
      return { ID: u.ID, Username: u.Username, Role: u.Role, Status: u.Status, Name: u.Name, Phone: u.Phone };
    });
  } catch(e) {
    return [{ ID: 'u1', Username: 'admin', Role: 'Superadmin', Status: 'Approved' }];
  }
}

function updateUserProfile(userId, newUsername, newPassword, newName, newPhone) {
  if (!userId || !newUsername) throw new Error("Укажите логин");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var userIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(userId)) {
      userIndex = i;
    }
  }
  if (userIndex === -1) throw new Error("Пользователь не найден");
  
  for (var i = 1; i < data.length; i++) {
    if (i !== userIndex && String(data[i][1]) === String(newUsername)) {
      throw new Error("Это имя пользователя уже занято");
    }
  }
  var usernameCol = headers.indexOf('Username') + 1;
  var passwordCol = headers.indexOf('Password') + 1;
  var nameCol = headers.indexOf('Name') + 1;
  var phoneCol = headers.indexOf('Phone') + 1;
  sheet.getRange(userIndex + 1, usernameCol).setValue(newUsername);
  if (newPassword) sheet.getRange(userIndex + 1, passwordCol).setValue(newPassword);
  if (newName !== undefined && nameCol > 0) sheet.getRange(userIndex + 1, nameCol).setValue(newName);
  if (newPhone !== undefined && phoneCol > 0) sheet.getRange(userIndex + 1, phoneCol).setValue(newPhone);
  return { ID: userId, Username: newUsername, Name: newName || '', Phone: newPhone || '' };
}

// ========================
// ОПТИМИЗАЦИЯ ДАННЫХ (БАТЧИНГ)
// ========================

// Получить все данные приложения разом асинхронно
function getInitData(role, userId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var recordsSheet = ss.getSheetByName('Records');
  if (recordsSheet) {
    var headers = recordsSheet.getRange(1, 1, 1, recordsSheet.getLastColumn()).getValues()[0];
    if (headers.indexOf('AdditionalServices') === -1) {
      var servicesIndex = headers.indexOf('ServicesJSON');
      if (servicesIndex > -1) {
        recordsSheet.insertColumnAfter(servicesIndex + 1);
        recordsSheet.getRange(1, servicesIndex + 2).setValue('AdditionalServices').setFontWeight('bold');
      } else {
        recordsSheet.getRange(1, headers.length + 1).setValue('AdditionalServices').setFontWeight('bold');
      }
    }
  }

  var data = {
    records: getTable('Records'),
    services: getTable('Services'),
    users: getTable('Users'),
    brands: getTable('Brands'),
    models: getTable('Models'),
    applications: getTable('Заявки на Запись'),
    welcomescreens: getTable('WelcomeScreens'),
    gamerecords: getTable('GameRecords')
  };
  return data;
}

// ========================
// БАЗОВЫЕ МЕТОДЫ CRUD
// ========================

function getTable(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    if (sheetName === 'WelcomeScreens') {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['ID', 'Title', 'Text']);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.appendRow(['welcome_main', 'Добро пожаловать!', 'Анвар сушняк алыпкел']);
      updateSheetVersion('WelcomeScreens');
    } else {
      return [];
    }
  }
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var result = [];
  for(var i = 1; i < data.length; i++) {
    var obj = {};
    for(var j = 0; j < headers.length; j++) {
       var h = headers[j];
       var val = data[i][j];
       if (h === 'ServicesJSON' && typeof val === 'string' && val.trim().startsWith('[')) {
           try { val = JSON.parse(val); } catch(e) { val = []; }
       }
       obj[h] = val;
    }
    result.push(obj);
  }
  return result;
}

function addRow(sheetName, obj) {
  addRowBase(sheetName, obj);
  return sheetName === 'Records' ? getTable('Records') : getInitData(obj._role || 'Master', obj._userId);
}

function addRowBase(sheetName, obj) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!obj.ID) obj.ID = Utilities.getUuid();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  for(var i = 0; i < headers.length; i++) {
    var h = headers[i];
    if (h === 'StartTime' && sheetName === 'Records') row.push(obj.StartTime || new Date().toISOString());
    else if (h === 'EndTime' && sheetName === 'Records') {
      if (obj.Status === 'Выполнен') {
        row.push(obj.EndTime || new Date().toISOString());
      } else {
        row.push('');
      }
    }
    else if (h === 'ServicesJSON') row.push(typeof obj[h] === 'string' ? obj[h] : JSON.stringify(obj[h] || []));
    else if (h === 'Phone' && obj[h] && typeof obj[h] === 'string' && obj[h].startsWith('+')) row.push("'" + obj[h]);
    else row.push(obj[h] !== undefined ? obj[h] : '');
  }
  sheet.appendRow(row);
  updateSheetVersion(sheetName);
}

function updateRecord(obj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Records');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  for(var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(obj.ID)) { // ID is col A, robust matching
      var row = [];
      var oldStatus = data[i][headers.indexOf('Status')];
      var oldEndTime = data[i][headers.indexOf('EndTime')];
      for(var j = 0; j < headers.length; j++) {
         var h = headers[j];
         if (h === 'EndTime' && obj.Status === 'Выполнен') {
             row.push(obj.EndTime || oldEndTime || new Date().toISOString());
         } else if (h === 'EndTime' && obj.Status !== 'Выполнен') {
             row.push('');
         } else if (h === 'ServicesJSON') {
             row.push(typeof obj[h] === 'string' ? obj[h] : JSON.stringify(obj[h] || []));
         } else if (h === 'Phone' && obj[h] && typeof obj[h] === 'string' && obj[h].startsWith('+')) {
             row.push("'" + obj[h]);
         } else {
             row.push(obj[h] !== undefined ? obj[h] : data[i][j]);
         }
      }
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      break;
    }
  }
  updateSheetVersion('Records');
  return getTable('Records');
}

function updateRow(sheetName, obj) {
  var id = obj.ID;
  var role = obj._role;
  var userId = obj._userId;
  updateRowBase(sheetName, id, obj);
  return getInitData(role || 'Master', userId);
}

function isIdMatch(cellVal, id) {
  if (String(cellVal) === String(id)) return true;
  if (!cellVal || !id) return false;
  if (cellVal instanceof Date) {
    var cellMs = cellVal.getTime();
    var idMs = Date.parse(id);
    if (!isNaN(idMs) && Math.abs(cellMs - idMs) < 2000) return true; // match within 2 seconds tolerance
    try {
      if (cellVal.toISOString() === new Date(id).toISOString()) return true;
    } catch(e) {}
  }
  return false;
}

function updateRowBase(sheetName, id, updates) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  for(var i = 1; i < data.length; i++) {
    if(isIdMatch(data[i][0], id)) {
      for(var key in updates) {
        var colIndex = headers.indexOf(key);
        if(colIndex > -1) {
          if (key === 'ServicesJSON') {
             sheet.getRange(i + 1, colIndex + 1).setValue(typeof updates[key] === 'string' ? updates[key] : JSON.stringify(updates[key] || []));
          } else if (key === 'Phone' && updates[key] && typeof updates[key] === 'string' && updates[key].startsWith('+')) {
             sheet.getRange(i + 1, colIndex + 1).setValue("'" + updates[key]);
          } else {
             sheet.getRange(i + 1, colIndex + 1).setValue(updates[key]);
          }
        }
      }
      break;
    }
  }
  updateSheetVersion(sheetName);
}

function deleteRow(sheetName, id, role, userId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  for(var i = 1; i < data.length; i++) {
    if(isIdMatch(data[i][0], id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  updateSheetVersion(sheetName);
  return sheetName === 'Records' ? getTable('Records') : getInitData(role || 'Master', userId);
}

function addRows(sheetName, objects) {
  if (!objects || !Array.isArray(objects) || objects.length === 0) return getInitData('Master', '');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var lastRow = sheet.getLastRow();
  
  var rowsToAppend = [];
  var now = new Date().toISOString();
  
  objects.forEach(function(obj) {
    if (!obj.ID) obj.ID = Utilities.getUuid();
    var row = [];
    for(var i = 0; i < headers.length; i++) {
      var h = headers[i];
      if (h === 'StartTime' && sheetName === 'Records') row.push(now);
      else if (h === 'EndTime') row.push('');
      else if (h === 'ServicesJSON') row.push(typeof obj[h] === 'string' ? obj[h] : JSON.stringify(obj[h] || []));
      else if (h === 'Phone' && obj[h] && typeof obj[h] === 'string' && obj[h].startsWith('+')) row.push("'" + obj[h]);
      else row.push(obj[h] !== undefined ? obj[h] : '');
    }
    rowsToAppend.push(row);
  });
  
  sheet.getRange(lastRow + 1, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
  updateSheetVersion(sheetName);
  
  var firstObj = objects[0];
  return sheetName === 'Records' ? getTable('Records') : getInitData(firstObj._role || 'Master', firstObj._userId);
}

function bulkImport(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var role = data._role || 'Master';
  var userId = data._userId || '';
  
  function getSheetData(name) {
    var s = ss.getSheetByName(name);
    var vals = s.getDataRange().getValues();
    var headers = vals[0];
    var list = [];
    for(var i=1; i<vals.length; i++) {
       var obj = {};
       for(var j=0; j<headers.length; j++) obj[headers[j]] = vals[i][j];
       list.push(obj);
    }
    return { sheet: s, headers: headers, data: list };
  }

  // 1. Process Brands
  var brandsInfo = getSheetData('Brands');
  var existingBrands = brandsInfo.data;
  var brandsToAppend = [];
  if (data.brands) {
    data.brands.forEach(function(b) {
      var name = String(b.Name || '').trim();
      if (!name) return;
      var exists = existingBrands.some(function(eb) { return String(eb.Name).toLowerCase() === name.toLowerCase(); });
      if (!exists) {
        var newId = b.ID || Utilities.getUuid();
        var row = brandsInfo.headers.map(function(h) {
          if (h === 'ID') return newId;
          if (h === 'Name') return name;
          return '';
        });
        brandsToAppend.push(row);
        existingBrands.push({ ID: newId, Name: name });
      }
    });
  }
  if (brandsToAppend.length > 0) {
    brandsInfo.sheet.getRange(brandsInfo.sheet.getLastRow() + 1, 1, brandsToAppend.length, brandsInfo.headers.length).setValues(brandsToAppend);
  }

  // 2. Process Models
  var modelsInfo = getSheetData('Models');
  var existingModels = modelsInfo.data;
  var modelsToAppend = [];
  if (data.models) {
    data.models.forEach(function(m) {
      var name = String(m.Name || '').trim();
      if (!name) return;
      
      var brandId = m.BrandID;
      // Prefer looking up by BrandName to ensure we get the correct UUID from existingBrands
      if (m.BrandName) {
        var b = existingBrands.find(function(eb) { 
          return String(eb.Name || '').trim().toLowerCase() === String(m.BrandName).trim().toLowerCase(); 
        });
        if (b) brandId = b.ID;
      }
      
      if (!brandId) return;
      var exists = existingModels.some(function(em) { 
        return String(em.BrandID) === String(brandId) && String(em.Name).toLowerCase() === name.toLowerCase(); 
      });
      if (!exists) {
        var newId = m.ID || Utilities.getUuid();
        var row = modelsInfo.headers.map(function(h) {
          if (h === 'ID') return newId;
          if (h === 'BrandID') return brandId;
          if (h === 'Name') return name;
          return '';
        });
        modelsToAppend.push(row);
        existingModels.push({ ID: newId, BrandID: brandId, Name: name });
      }
    });
  }
  if (modelsToAppend.length > 0) {
    modelsInfo.sheet.getRange(modelsInfo.sheet.getLastRow() + 1, 1, modelsToAppend.length, modelsInfo.headers.length).setValues(modelsToAppend);
  }

  // 3. Process Services
  var servicesInfo = getSheetData('Services');
  var existingServices = servicesInfo.data;
  var servicesToAppend = [];
  if (data.services) {
    data.services.forEach(function(s) {
      var name = String(s.Name || '').trim();
      if (!name) return;
      var exists = existingServices.some(function(es) { return String(es.Name).toLowerCase() === name.toLowerCase(); });
      if (!exists) {
        var row = servicesInfo.headers.map(function(h) {
          if (h === 'ID') return s.ID || Utilities.getUuid();
          if (h === 'Name') return name;
          if (h === 'Price') return s.Price || 0;
          return '';
        });
        servicesToAppend.push(row);
      }
    });
  }
  if (servicesToAppend.length > 0) {
    servicesInfo.sheet.getRange(servicesInfo.sheet.getLastRow() + 1, 1, servicesToAppend.length, servicesInfo.headers.length).setValues(servicesToAppend);
    updateSheetVersion('Services');
  }
  
  if (brandsToAppend.length > 0) {
    updateSheetVersion('Brands');
  }
  if (modelsToAppend.length > 0) {
    updateSheetVersion('Models');
  }

  return getInitData(role, userId);
}

// Versioning and Sync
function updateSheetVersion(sheetName) {
  try {
    var key = String(sheetName).toLowerCase() + '_version';
    var now = String(Date.now());
    var props = PropertiesService.getScriptProperties();
    props.setProperty(key, now);
  } catch (e) {
    // Fail-safe
  }
}

function getDbVersions() {
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    return {
      records: props.records_version || '1',
      services: props.services_version || '1',
      users: props.users_version || '1',
      brands: props.brands_version || '1',
      models: props.models_version || '1',
      applications: props.applications_version || '1',
      welcomescreens: props.welcomescreens_version || '1',
      gamerecords: props.gamerecords_version || '1'
    };
  } catch (e) {
    return {
      records: '1',
      services: '1',
      users: '1',
      brands: '1',
      models: '1',
      applications: '1',
      welcomescreens: '1',
      gamerecords: '1'
    };
  }
}
