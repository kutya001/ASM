import { createClient } from "@supabase/supabase-js";

// ========================
// SUPABASE CLIENT
// ========================

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://crxmpzvxvormtebimbbm.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyeG1wenZ4dm9ybXRlYmltYmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDk0MjMsImV4cCI6MjA5NjU4NTQyM30.CkB4j4dz4lRRtCEx4NxfitOz4WgtNHu6heoriDCJXBE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================
// FIELD MAPPINGS (DB snake_case ↔ App PascalCase)
// ========================

const FIELD_MAPS = {
  users: {
    id: "ID", username: "Username", password: "Password",
    name: "Name", phone: "Phone", role: "Role", status: "Status",
  },
  records: {
    id: "ID", client_name: "ClientName", phone: "Phone", car_number: "CarNumber",
    brand_id: "BrandID", model_id: "ModelID", master_id: "MasterID",
    start_time: "StartTime", end_time: "EndTime", status: "Status",
    services_json: "ServicesJSON", additional_services: "AdditionalServices",
    total_amount: "TotalAmount", comment: "Comment", is_paid: "IsPaid",
  },
  services: {
    id: "ID", name: "Name", price: "Price",
  },
  brands: {
    id: "ID", name: "Name",
  },
  models: {
    id: "ID", brand_id: "BrandID", name: "Name",
  },
  welcome_screens: {
    id: "ID", title: "Title", text: "Text",
  },
  game_records: {
    id: "ID", user_id: "UserID", username: "Username", game_id: "GameID",
    start_time: "StartTime", play_time: "PlayTime", score: "Score",
  },
  applications: {
    id: "ID",
    timestamp: "Отметка времени",
    client_name: "Ваше Имя",
    phone: "Контактный номер телефона",
    car_number: "Государственный номер машины (госномер)",
    brand_name: "Марка автомобиля",
    model_name: "Модель автомобиля",
    car_year: "Год выпуска автомобиля",
    selected_services: "Выберите необходимые услуги автоэлектрики (если применимо)",
    preferred_date: "Предполагаемая дата записи",
    preferred_time: "Предполагаемое время записи",
    comment: "Краткое описание проблемы или комментарий (по желанию)",
    email: "Адрес электронной почты",
    record_id: "IDRecords",
    status: "Статус Заявки",
  },
};

// Reverse maps: App key → DB key
const REVERSE_MAPS = {};
for (const [table, map] of Object.entries(FIELD_MAPS)) {
  REVERSE_MAPS[table] = {};
  for (const [dbKey, appKey] of Object.entries(map)) {
    REVERSE_MAPS[table][appKey] = dbKey;
  }
}

// Sheet name → DB table name
const TABLE_MAP = {
  Users: "users",
  Records: "records",
  Services: "services",
  Brands: "brands",
  Models: "models",
  WelcomeScreens: "welcome_screens",
  GameRecords: "game_records",
  "Заявки на Запись": "applications",
};

// Store key → DB table name
const STORE_KEY_MAP = {
  users: "users",
  records: "records",
  services: "services",
  brands: "brands",
  models: "models",
  welcomescreens: "welcome_screens",
  gamerecords: "game_records",
  applications: "applications",
};

/**
 * Convert DB row (snake_case) → App object (PascalCase / Russian keys)
 */
function toApp(table, dbRow) {
  if (!dbRow) return null;
  const map = FIELD_MAPS[table];
  if (!map) return dbRow;
  const result = {};
  for (const [key, value] of Object.entries(dbRow)) {
    const appKey = map[key] || key;
    result[appKey] = value;
  }
  return result;
}

/**
 * Convert App object → DB row (snake_case)
 */
function toDb(table, appObj) {
  if (!appObj) return null;
  const revMap = REVERSE_MAPS[table];
  if (!revMap) return appObj;
  const result = {};
  for (const [key, value] of Object.entries(appObj)) {
    if (key.startsWith("_")) continue; // skip internal fields like _role, _userId
    const dbKey = revMap[key] || key;
    // Only include keys that exist in the field map
    if (FIELD_MAPS[table][dbKey] !== undefined || Object.values(FIELD_MAPS[table]).includes(key)) {
      result[dbKey] = value;
    }
  }
  return result;
}

function resolveTable(sheetName) {
  return TABLE_MAP[sheetName] || STORE_KEY_MAP[sheetName] || sheetName;
}

function handleError(error) {
  if (error) {
    console.error("Supabase Error:", error);
    throw new Error(error.message || "Ошибка базы данных");
  }
}

// ========================
// AUTH
// ========================

export async function loginUser(username, password) {
  if (!username || !password) throw new Error("Укажите логин и пароль");
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();
  if (error || !data) throw new Error("Неверный логин или пароль");
  const user = toApp("users", data);
  if (user.Status !== "Approved" && user.Role !== "Superadmin") {
    throw new Error("Ваша учетная запись ожидает проверки Супер-администратором");
  }
  return { ID: user.ID, Username: user.Username, Role: user.Role, Name: user.Name, Phone: user.Phone };
}

export async function registerUser(username, password, name, phone) {
  if (!username || !password) throw new Error("Укажите логин и пароль");

  // Check for existing user
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existing) throw new Error("Пользователь уже существует");

  const { error } = await supabase.from("users").insert({
    username, password,
    name: name || "",
    phone: phone || "",
    role: "Master",
    status: "Pending",
  });
  handleError(error);
  return { success: true, message: "Заявка отправлена. Ожидайте подтверждения Суперадминистратора." };
}

export async function approveUser(userId, data) {
  const updates = { status: "Approved" };
  if (data) {
    if (data.Role) updates.role = data.Role;
    if (data.Name !== undefined) updates.name = data.Name;
    if (data.Phone !== undefined) updates.phone = data.Phone;
  }
  const { error } = await supabase.from("users").update(updates).eq("id", userId);
  handleError(error);
  return getTable("Users");
}

export async function getUsernames() {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, role, status, name, phone");
  handleError(error);
  return (data || []).map((u) => toApp("users", u));
}

export async function updateUserProfile(userId, newUsername, newPassword, newName, newPhone) {
  if (!userId || !newUsername) throw new Error("Укажите логин");

  // Check uniqueness
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", newUsername)
    .neq("id", userId)
    .maybeSingle();
  if (existing) throw new Error("Это имя пользователя уже занято");

  const updates = { username: newUsername };
  if (newPassword) updates.password = newPassword;
  if (newName !== undefined) updates.name = newName;
  if (newPhone !== undefined) updates.phone = newPhone;

  const { error } = await supabase.from("users").update(updates).eq("id", userId);
  handleError(error);
  return { ID: userId, Username: newUsername, Name: newName || "", Phone: newPhone || "" };
}

// ========================
// DATA LOADING
// ========================

export async function getInitData(role, userId) {
  const [
    { data: records },
    { data: services },
    { data: users },
    { data: brands },
    { data: models },
    { data: applications },
    { data: welcomescreens },
    { data: gamerecords },
  ] = await Promise.all([
    supabase.from("records").select("*").order("start_time", { ascending: false }),
    supabase.from("services").select("*"),
    supabase.from("users").select("id, username, role, status, name, phone"),
    supabase.from("brands").select("*"),
    supabase.from("models").select("*"),
    supabase.from("applications").select("*"),
    supabase.from("welcome_screens").select("*"),
    supabase.from("game_records").select("*"),
  ]);

  return {
    records: (records || []).map((r) => toApp("records", r)),
    services: (services || []).map((s) => toApp("services", s)),
    users: (users || []).map((u) => toApp("users", u)),
    brands: (brands || []).map((b) => toApp("brands", b)),
    models: (models || []).map((m) => toApp("models", m)),
    applications: (applications || []).map((a) => toApp("applications", a)),
    welcomescreens: (welcomescreens || []).map((w) => toApp("welcome_screens", w)),
    gamerecords: (gamerecords || []).map((g) => toApp("game_records", g)),
  };
}

export async function getTable(sheetName) {
  const table = resolveTable(sheetName);
  const { data, error } = await supabase.from(table).select("*");
  handleError(error);
  return (data || []).map((row) => toApp(table, row));
}

// ========================
// CRUD
// ========================

export async function addRow(sheetName, obj) {
  const table = resolveTable(sheetName);
  const dbObj = toDb(table, obj);

  // Generate UUID if no ID provided
  if (!dbObj.id) delete dbObj.id; // let DB generate

  // Handle Records-specific logic
  if (table === "records") {
    if (!dbObj.start_time) dbObj.start_time = new Date().toISOString();
    if (dbObj.status === "Выполнен") {
      if (!dbObj.end_time) dbObj.end_time = new Date().toISOString();
    } else {
      dbObj.end_time = null;
    }
    // ServicesJSON: ensure it's proper JSONB
    if (typeof dbObj.services_json === "string") {
      try { dbObj.services_json = JSON.parse(dbObj.services_json); } catch { dbObj.services_json = []; }
    }
  }

  const { data, error } = await supabase.from(table).insert(dbObj).select();
  handleError(error);

  if (table === "records") {
    return getTable("Records");
  }
  return getInitData(obj._role || "Master", obj._userId);
}

export async function addRows(sheetName, objects) {
  if (!objects || !Array.isArray(objects) || objects.length === 0) {
    return getInitData("Master", "");
  }
  const table = resolveTable(sheetName);
  const dbObjects = objects.map((obj) => {
    const dbObj = toDb(table, obj);
    if (!dbObj.id) delete dbObj.id;
    if (table === "records") {
      if (!dbObj.start_time) dbObj.start_time = new Date().toISOString();
      dbObj.end_time = null;
      if (typeof dbObj.services_json === "string") {
        try { dbObj.services_json = JSON.parse(dbObj.services_json); } catch { dbObj.services_json = []; }
      }
    }
    return dbObj;
  });

  const { error } = await supabase.from(table).insert(dbObjects);
  handleError(error);

  const firstObj = objects[0];
  if (table === "records") return getTable("Records");
  return getInitData(firstObj._role || "Master", firstObj._userId);
}

export async function updateRecord(obj) {
  const dbObj = toDb("records", obj);
  const id = dbObj.id;
  delete dbObj.id;

  // EndTime logic
  if (dbObj.status === "Выполнен") {
    if (!dbObj.end_time) dbObj.end_time = new Date().toISOString();
  } else {
    dbObj.end_time = null;
  }

  // ServicesJSON
  if (typeof dbObj.services_json === "string") {
    try { dbObj.services_json = JSON.parse(dbObj.services_json); } catch { dbObj.services_json = []; }
  }

  const { error } = await supabase.from("records").update(dbObj).eq("id", id);
  handleError(error);
  return getTable("Records");
}

export async function updateRow(sheetName, obj) {
  const table = resolveTable(sheetName);
  const dbObj = toDb(table, obj);
  const id = dbObj.id;
  delete dbObj.id;

  const { error } = await supabase.from(table).update(dbObj).eq("id", id);
  handleError(error);
  return getInitData(obj._role || "Master", obj._userId);
}

export async function deleteRow(sheetName, id, role, userId) {
  const table = resolveTable(sheetName);
  const { error } = await supabase.from(table).delete().eq("id", id);
  handleError(error);
  if (table === "records") return getTable("Records");
  return getInitData(role || "Master", userId);
}

export async function bulkImport(data) {
  const role = data._role || "Master";
  const userId = data._userId || "";

  // 1. Brands
  if (data.brands && data.brands.length > 0) {
    const { data: existingBrands } = await supabase.from("brands").select("id, name");
    const existingNames = new Set((existingBrands || []).map((b) => b.name.toLowerCase()));
    const newBrands = data.brands
      .filter((b) => b.Name && !existingNames.has(b.Name.trim().toLowerCase()))
      .map((b) => ({ name: b.Name.trim() }));
    if (newBrands.length > 0) {
      await supabase.from("brands").insert(newBrands);
    }
  }

  // 2. Models
  if (data.models && data.models.length > 0) {
    const { data: allBrands } = await supabase.from("brands").select("id, name");
    const { data: existingModels } = await supabase.from("models").select("id, brand_id, name");
    const brandMap = {};
    (allBrands || []).forEach((b) => { brandMap[b.name.toLowerCase()] = b.id; });

    const newModels = [];
    for (const m of data.models) {
      const name = (m.Name || "").trim();
      if (!name) continue;
      let brandId = m.BrandID;
      if (m.BrandName) {
        brandId = brandMap[m.BrandName.trim().toLowerCase()] || brandId;
      }
      if (!brandId) continue;
      const exists = (existingModels || []).some(
        (em) => String(em.brand_id) === String(brandId) && em.name.toLowerCase() === name.toLowerCase()
      );
      if (!exists) newModels.push({ brand_id: brandId, name });
    }
    if (newModels.length > 0) {
      await supabase.from("models").insert(newModels);
    }
  }

  // 3. Services
  if (data.services && data.services.length > 0) {
    const { data: existingServices } = await supabase.from("services").select("id, name");
    const existingNames = new Set((existingServices || []).map((s) => s.name.toLowerCase()));
    const newServices = data.services
      .filter((s) => s.Name && !existingNames.has(s.Name.trim().toLowerCase()))
      .map((s) => ({ name: s.Name.trim(), price: s.Price || 0 }));
    if (newServices.length > 0) {
      await supabase.from("services").insert(newServices);
    }
  }

  return getInitData(role, userId);
}

// ========================
// BACKWARD COMPAT: runGS adapter
// ========================

/**
 * Drop-in replacement for the old runGS() function.
 * Routes action names to the new Supabase-backed functions.
 * This allows the store to be migrated incrementally.
 */
export const runGS = async (func, ...args) => {
  switch (func) {
    case "loginUser":
      return loginUser(args[0], args[1]);
    case "registerUser":
      return registerUser(args[0], args[1], args[2], args[3]);
    case "approveUser":
      return approveUser(args[0], args[1]);
    case "getUsernames":
      return getUsernames();
    case "updateUserProfile":
      return updateUserProfile(args[0], args[1], args[2], args[3], args[4]);
    case "getInitData":
      return getInitData(args[0], args[1]);
    case "getTable":
      return getTable(args[0]);
    case "addRow":
      return addRow(args[0], args[1]);
    case "addRows":
      return addRows(args[0], args[1]);
    case "bulkImport":
      return bulkImport(args[0]);
    case "updateRecord":
      return updateRecord(args[0]);
    case "updateRow":
      return updateRow(args[0], args[1]);
    case "deleteRow":
      return deleteRow(args[0], args[1], args[2], args[3]);
    case "getDbVersions":
      // No longer needed — Realtime replaces polling
      return {
        records: "1", services: "1", users: "1", brands: "1",
        models: "1", applications: "1", welcomescreens: "1", gamerecords: "1",
      };
    default:
      throw new Error("Неизвестное действие: " + func);
  }
};
