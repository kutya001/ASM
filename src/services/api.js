import { createClient } from "@supabase/supabase-js";

// ========================
// SUPABASE CLIENT
// ========================

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://cddeypycepqycsvlqunp.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZGV5cHljZXBxeWNzdmxxdW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTg0MDUsImV4cCI6MjA5ODE5NDQwNX0.rzdZzmIc_IvY5pys5Dr2u2fEQzYUupOMC2whVZTUh84";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================
// FIELD MAPPINGS (DB snake_case ↔ App PascalCase)
// ========================

const FIELD_MAPS = {
  users: {
    id: "ID", username: "Username", password: "Password",
    name: "Name", phone: "Phone", role: "Role", status: "Status",
    organization_id: "OrganizationID",
  },
  records: {
    id: "ID", client_name: "ClientName", phone: "Phone", car_number: "CarNumber",
    brand_id: "BrandID", model_id: "ModelID", master_id: "MasterID",
    start_time: "StartTime", end_time: "EndTime", status: "Status",
    services_json: "ServicesJSON", additional_services: "AdditionalServices",
    total_amount: "TotalAmount", comment: "Comment", is_paid: "IsPaid",
    organization_id: "OrganizationID",
  },
  services: {
    id: "ID", name: "Name", price: "Price",
    organization_id: "OrganizationID",
    category_id: "CategoryID", global_service_id: "GlobalServiceID",
    is_custom: "IsCustom",
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
  organizations: {
    id: "ID", name: "Name",
  },
  service_categories: {
    id: "ID", name: "Name",
  },
  global_services: {
    id: "ID", category_id: "CategoryID", name: "Name", default_price: "DefaultPrice",
  },
  organization_brands: {
    organization_id: "OrganizationID", brand_id: "BrandID",
  },
  organization_models: {
    organization_id: "OrganizationID", model_id: "ModelID",
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
  Organizations: "organizations",
  ServiceCategories: "service_categories",
  GlobalServices: "global_services",
  OrganizationBrands: "organization_brands",
  OrganizationModels: "organization_models",
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
  organizations: "organizations",
  servicecategories: "service_categories",
  globalservices: "global_services",
  organizationbrands: "organization_brands",
  organizationmodels: "organization_models",
};

/**
 * Convert DB row (snake_case) → App object (PascalCase / Russian keys)
 */
export function toApp(table, dbRow) {
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
export function toDb(table, appObj) {
  if (!appObj) return null;
  const revMap = REVERSE_MAPS[table];
  if (!revMap) return appObj;
  const result = {};
  for (const [key, value] of Object.entries(appObj)) {
    if (key.startsWith("_")) continue; // skip internal fields
    const dbKey = revMap[key] || key;
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
// AUTH & REGISTRATION
// ========================

export async function loginUser(username, password) {
  if (!username || !password) throw new Error("Укажите логин и пароль");
  const email = `${username.trim()}@asm.local`;
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (authError || !authData.user) {
    throw new Error("Неверный логин или пароль");
  }
  
  // Fetch user profile from public.users
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();
    
  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new Error("Профиль пользователя не найден в системе");
  }
  
  const user = toApp("users", profile);
  if (user.Status !== "Approved" && user.Role !== "Superadmin") {
    await supabase.auth.signOut();
    throw new Error("Ваша учетная запись ожидает проверки Старшим мастером / Администратором");
  }
  return user;
}

export async function getOrganizations() {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name")
    .order("name", { ascending: true });
  handleError(error);
  return data || [];
}

export async function registerUserWithOrg(username, password, orgMode, orgValue) {
  if (!username || !password) throw new Error("Укажите логин и пароль");
  if (!orgValue) {
    throw new Error(orgMode === "create" ? "Укажите название организации" : "Выберите организацию");
  }

  // Check for existing user
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username.trim())
    .maybeSingle();
  if (existing) throw new Error("Пользователь с таким логином уже существует");

  let orgId = null;

  if (orgMode === "create") {
    // Check if organization name is already taken
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("name", orgValue.trim())
      .maybeSingle();
    if (existingOrg) throw new Error("Организация с таким названием уже существует");

    // Create new organization
    const { data: newOrg, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name: orgValue.trim() })
      .select()
      .single();
    handleError(orgErr);
    orgId = newOrg.id;
  } else {
    orgId = orgValue;
  }

  const role = orgMode === "create" ? "SenMaster" : "Master";
  const email = `${username.trim()}@asm.local`;

  const { error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        organization_id: orgId,
        name: "",
        phone: "",
      }
    }
  });
  handleError(signUpErr);

  return {
    success: true,
    message: orgMode === "create" 
      ? "Организация создана. Вы можете войти в систему." 
      : "Заявка отправлена. Ожидайте подтверждения Старшего мастера организации."
  };
}

export async function approveUser(userId, data) {
  if (!data) return getTable("Users");
  
  // Fetch current user details to have full context for updating claims
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
    
  if (!profile) throw new Error("Пользователь не найден");
  
  const appProfile = toApp("users", profile);
  
  const role = data.Role || appProfile.Role;
  const status = data.Status || appProfile.Status;
  const orgId = data.OrganizationID || appProfile.OrganizationID;
  const name = data.Name !== undefined ? data.Name : (appProfile.Name || "");
  const phone = data.Phone !== undefined ? data.Phone : (appProfile.Phone || "");

  const { error: rpcErr } = await supabase.rpc("update_user_claims", {
    target_user_id: userId,
    new_role: role,
    new_status: status,
    new_org_id: orgId,
    new_name: name,
    new_phone: phone
  });
  handleError(rpcErr);
  
  return getTable("Users");
}

export async function getUsernames() {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, role, status, name, phone, organization_id");
  handleError(error);
  return (data || []).map((u) => toApp("users", u));
}

export async function updateUserProfile(userId, newPassword, newName, newPhone) {
  if (!userId) throw new Error("Укажите пользователя");

  // Update password in Supabase Auth if provided
  if (newPassword) {
    const { error: authErr } = await supabase.auth.updateUser({
      password: newPassword
    });
    handleError(authErr);
  }

  // Update name and phone in public.users
  const { error: dbErr } = await supabase
    .from("users")
    .update({
      name: newName,
      phone: newPhone
    })
    .eq("id", userId);
  handleError(dbErr);

  // Update auth.users metadata to match
  const { error: metaErr } = await supabase.auth.updateUser({
    data: {
      name: newName,
      phone: newPhone
    }
  });
  handleError(metaErr);

  return { success: true };
}

// ========================
// DATA LOADING
// ========================

export async function getInitData(role, userId, orgId) {
  const isSuper = role === "Superadmin";

  const recordsQuery = supabase.from("records").select("*").order("start_time", { ascending: false });
  const servicesQuery = supabase.from("services").select("*").order("name", { ascending: true });
  const usersQuery = supabase.from("users").select("id, username, password, role, status, name, phone, organization_id");
  const brandsQuery = supabase.from("brands").select("*").order("name", { ascending: true });
  const modelsQuery = supabase.from("models").select("*").order("name", { ascending: true });
  const welcomescreensQuery = supabase.from("welcome_screens").select("*");
  const gamerecordsQuery = supabase.from("game_records").select("*");
  const orgsQuery = supabase.from("organizations").select("*").order("name", { ascending: true });
  const serviceCategoriesQuery = supabase.from("service_categories").select("*").order("name", { ascending: true });
  const globalServicesQuery = supabase.from("global_services").select("*").order("name", { ascending: true });
  const orgBrandsQuery = supabase.from("organization_brands").select("*");
  const orgModelsQuery = supabase.from("organization_models").select("*");

  if (!isSuper && orgId) {
    recordsQuery.eq("organization_id", orgId);
    servicesQuery.eq("organization_id", orgId);
    usersQuery.eq("organization_id", orgId);
    orgBrandsQuery.eq("organization_id", orgId);
    orgModelsQuery.eq("organization_id", orgId);
  }

  const [
    { data: records, error: errRecords },
    { data: services, error: errServices },
    { data: users, error: errUsers },
    { data: brands, error: errBrands },
    { data: models, error: errModels },
    { data: welcomescreens, error: errWS },
    { data: gamerecords, error: errGR },
    { data: orgs, error: errOrgs },
    { data: serviceCategories, error: errSC },
    { data: globalServices, error: errGS },
    { data: orgBrands, error: errOB },
    { data: orgModels, error: errOM },
  ] = await Promise.all([
    recordsQuery,
    servicesQuery,
    usersQuery,
    brandsQuery,
    modelsQuery,
    welcomescreensQuery,
    gamerecordsQuery,
    orgsQuery,
    serviceCategoriesQuery,
    globalServicesQuery,
    orgBrandsQuery,
    orgModelsQuery,
  ]);

  if (errRecords) handleError(errRecords);
  if (errServices) handleError(errServices);
  if (errUsers) handleError(errUsers);
  if (errBrands) handleError(errBrands);
  if (errModels) handleError(errModels);
  if (errWS) handleError(errWS);
  if (errGR) handleError(errGR);
  if (errOrgs) handleError(errOrgs);
  if (errSC) handleError(errSC);
  if (errGS) handleError(errGS);
  if (errOB) handleError(errOB);
  if (errOM) handleError(errOM);

  const mappedBrands = (brands || []).map((b) => toApp("brands", b));
  const mappedModels = (models || []).map((m) => toApp("models", m));

  let finalBrands = mappedBrands;
  let finalModels = mappedModels;

  if (!isSuper && orgId) {
    const activeBrandIds = (orgBrands || []).map((ob) => ob.brand_id);
    const activeModelIds = (orgModels || []).map((om) => om.model_id);

    finalBrands = mappedBrands.filter((b) => activeBrandIds.includes(b.ID));
    finalModels = mappedModels.filter((m) => activeModelIds.includes(m.ID));
  }

  return {
    records: (records || []).map((r) => toApp("records", r)),
    services: (services || []).map((s) => toApp("services", s)),
    users: (users || []).map((u) => toApp("users", u)),
    brands: finalBrands,
    models: finalModels,
    globalbrands: mappedBrands,
    globalmodels: mappedModels,
    welcomescreens: (welcomescreens || []).map((w) => toApp("welcome_screens", w)),
    gamerecords: (gamerecords || []).map((g) => toApp("game_records", g)),
    organizations: (orgs || []).map((o) => toApp("organizations", o)),
    servicecategories: (serviceCategories || []).map((sc) => toApp("service_categories", sc)),
    globalservices: (globalServices || []).map((gs) => toApp("global_services", gs)),
    organizationbrands: (orgBrands || []).map((ob) => toApp("organization_brands", ob)),
    organizationmodels: (orgModels || []).map((om) => toApp("organization_models", om)),
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

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(str) {
  if (!str) return false;
  return uuidRegex.test(str);
}

export async function addRow(sheetName, obj) {
  const table = resolveTable(sheetName);
  const dbObj = toDb(table, obj);

  if (dbObj.id && !isValidUUID(dbObj.id)) {
    delete dbObj.id;
  } else if (!dbObj.id) {
    delete dbObj.id;
  }

  if (table === "records") {
    if (!dbObj.start_time) dbObj.start_time = new Date().toISOString();
    if (dbObj.status === "Выполнен") {
      if (!dbObj.end_time) dbObj.end_time = new Date().toISOString();
    } else {
      dbObj.end_time = null;
    }
    if (typeof dbObj.services_json === "string") {
      try { dbObj.services_json = JSON.parse(dbObj.services_json); } catch { dbObj.services_json = []; }
    }
  }

  const { data, error } = await supabase.from(table).insert(dbObj).select();
  handleError(error);

  return toApp(table, data[0]);
}

export async function addRows(sheetName, objects) {
  if (!objects || !Array.isArray(objects) || objects.length === 0) {
    return [];
  }
  const table = resolveTable(sheetName);
  const dbObjects = objects.map((obj) => {
    const dbObj = toDb(table, obj);
    if (dbObj.id && !isValidUUID(dbObj.id)) {
      delete dbObj.id;
    } else if (!dbObj.id) {
      delete dbObj.id;
    }
    if (table === "records") {
      if (!dbObj.start_time) dbObj.start_time = new Date().toISOString();
      dbObj.end_time = null;
      if (typeof dbObj.services_json === "string") {
        try { dbObj.services_json = JSON.parse(dbObj.services_json); } catch { dbObj.services_json = []; }
      }
    }
    return dbObj;
  });

  const { data, error } = await supabase.from(table).insert(dbObjects).select();
  handleError(error);

  return (data || []).map((row) => toApp(table, row));
}

export async function updateRecord(obj) {
  const dbObj = toDb("records", obj);
  const id = dbObj.id;
  delete dbObj.id;

  if (dbObj.status === "Выполнен") {
    if (!dbObj.end_time) dbObj.end_time = new Date().toISOString();
  } else {
    dbObj.end_time = null;
  }

  if (typeof dbObj.services_json === "string") {
    try { dbObj.services_json = JSON.parse(dbObj.services_json); } catch { dbObj.services_json = []; }
  }

  const { data, error } = await supabase.from("records").update(dbObj).eq("id", id).select();
  handleError(error);
  return toApp("records", data[0]);
}

export async function updateRow(sheetName, obj) {
  const table = resolveTable(sheetName);
  const dbObj = toDb(table, obj);
  const id = dbObj.id;
  delete dbObj.id;

  const { data, error } = await supabase.from(table).update(dbObj).eq("id", id).select();
  handleError(error);
  return toApp(table, data[0]);
}

export async function deleteRow(sheetName, id) {
  const table = resolveTable(sheetName);
  let query = supabase.from(table).delete();
  if (typeof id === "object" && id !== null) {
    for (const [key, val] of Object.entries(id)) {
      const dbKey = REVERSE_MAPS[table] && REVERSE_MAPS[table][key] ? REVERSE_MAPS[table][key] : key;
      query = query.eq(dbKey, val);
    }
  } else {
    query = query.eq("id", id);
  }
  const { error } = await query;
  handleError(error);
  return { id };
}

export async function bulkImport(data) {
  const role = data._role || "Master";
  const userId = data._userId || "";
  const orgId = data.OrganizationID || "";

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
    const { data: existingServices } = await supabase.from("services").select("id, name").eq("organization_id", orgId);
    const existingNames = new Set((existingServices || []).map((s) => s.name.toLowerCase()));
    const newServices = data.services
      .filter((s) => s.Name && !existingNames.has(s.Name.trim().toLowerCase()))
      .map((s) => ({ name: s.Name.trim(), price: s.Price || 0, organization_id: orgId }));
    if (newServices.length > 0) {
      await supabase.from("services").insert(newServices);
    }
  }

  return getInitData(role, userId, orgId);
}
