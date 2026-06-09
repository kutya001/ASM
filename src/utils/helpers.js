export function formatDate(isoString) {
  if (!isoString) return { date: "—", time: "" };
  try {
    let d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return { date: String(isoString), time: "" };
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const dateStr = `${day}.${month}.${year}`;

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    const timeStr = `${hours}:${minutes}:${seconds}`;

    return {
      date: dateStr,
      time: timeStr,
    };
  } catch (e) {
    return { date: String(isoString), time: "" };
  }
}

export function formatLocalDate(val) {
  if (!val) return "—";
  let str = String(val).trim();
  // If in dd.mm.yyyy format already
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) {
    return str;
  }
  try {
    let d = new Date(val);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }
  } catch (e) {}
  return val;
}

export function formatLocalTime(val) {
  if (!val) return "—";
  let str = String(val).trim();
  // If in hh:mm:ss or hh:mm format already
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    if (str.length === 5) {
      return str + ":00";
    }
    return str;
  }
  // If Google Sheets stored it as standard ISO date or other date
  try {
    let d = new Date(val);
    if (!isNaN(d.getTime())) {
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    }
  } catch (e) {}
  return val;
}

export function getDuration(start, end) {
  if (!start || !end) return "";
  let s = new Date(start);
  let e = new Date(end);
  let diffMs = e - s;
  if (diffMs < 0) return "0 мин";
  let diffMins = Math.floor(diffMs / 60000);
  let hours = Math.floor(diffMins / 60);
  let mins = diffMins % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;

  let parts = [];
  if (days > 0) parts.push(days + " дн");
  if (hours > 0) parts.push(hours + " ч");
  if (mins > 0 || parts.length === 0) parts.push(mins + " мин");
  return parts.join(" ");
}

export function formatPhoneInput(val) {
  if (!val) return "+996";
  let raw = val.replace(/\D/g, "");
  if (raw.startsWith("996")) raw = raw.slice(3);
  raw = raw.slice(0, 9); // limit to 9 digits after 996
  let formatted = "+996";
  if (raw.length > 0) formatted += " " + raw.substring(0, 3);
  if (raw.length > 3) formatted += " " + raw.substring(3, 6);
  if (raw.length > 6) formatted += " " + raw.substring(6, 9);
  return formatted;
}
