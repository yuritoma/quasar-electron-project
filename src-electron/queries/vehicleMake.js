const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the path for the database
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchVehicleMakes(callback) {
  db.all("SELECT * FROM VehicleMakes", [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

function addVehicleMake(make, callback) {
  const stmt = db.prepare("INSERT INTO VehicleMakes (make_name) VALUES (?)");
  stmt.run([make.make_name], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

function editVehicleMake(make, callback) {
  const stmt = db.prepare(
    "UPDATE VehicleMakes SET make_name = ? WHERE make_id = ?"
  );
  stmt.run([make.make_name, make.make_id], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

function deleteVehicleMake(makeId, callback) {
  const stmt = db.prepare("DELETE FROM VehicleMakes WHERE make_id = ?");
  stmt.run([makeId], function (err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, "success");
    }
  });
}

module.exports = {
  fetchVehicleMakes,
  addVehicleMake,
  editVehicleMake,
  deleteVehicleMake,
};
