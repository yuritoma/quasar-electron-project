const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchVehicleUsages(callback) {
  db.all("SELECT * FROM VehicleUsages", [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

function fetchFirstUsage(callback) {
  db.get("SELECT usage_name FROM VehicleUsages LIMIT 1;", (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row);
    }
  });
}

function addVehicleUsage(usage, callback) {
  const stmt = db.prepare("INSERT INTO VehicleUsages (usage_name) VALUES (?)");
  stmt.run([usage.usage_name], function (err) {
    if (err) {
      callback(err.message, null);
    } else {
      callback(null, "success");
    }
  });
}

function editVehicleUsage(usage, callback) {
  const stmt = db.prepare(
    "UPDATE VehicleUsages SET usage_name = ? WHERE usage_id = ?"
  );
  stmt.run([usage.usage_name, usage.usage_id], function (err) {
    if (err) {
      callback(err.message, null);
    } else {
      callback(null, "success");
    }
  });
}

function deleteVehicleUsage(usageId, callback) {
  const stmt = db.prepare("DELETE FROM VehicleUsages WHERE usage_id = ?");
  stmt.run([usageId], function (err) {
    if (err) {
      callback(err.message, null);
    } else {
      callback(null, "success");
    }
  });
}

module.exports = {
  fetchVehicleUsages,
  addVehicleUsage,
  editVehicleUsage,
  deleteVehicleUsage,
  fetchFirstUsage,
};
