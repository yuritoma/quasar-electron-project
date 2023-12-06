const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchVehicleTypes(callback) {
  db.all("SELECT * FROM VehicleTypes", [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

function addVehicleType(type, callback) {
  const stmt = db.prepare("INSERT INTO VehicleTypes (type_name) VALUES (?)");
  stmt.run([type.type_name], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

function editVehicleType(type, callback) {
  const stmt = db.prepare(
    "UPDATE VehicleTypes SET type_name = ? WHERE type_id = ?"
  );
  stmt.run([type.type_name, type.type_id], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

function deleteVehicleType(typeId, callback) {
  const stmt = db.prepare("DELETE FROM VehicleTypes WHERE type_id = ?");
  stmt.run([typeId], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

module.exports = {
  fetchVehicleTypes,
  addVehicleType,
  editVehicleType,
  deleteVehicleType,
};
