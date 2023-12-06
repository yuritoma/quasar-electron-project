const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the path for the database
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchVehicleModels(callback) {
  const query = `
    SELECT vm.*, vmake.make_name
    FROM VehicleModels vm
    JOIN VehicleMakes vmake ON vm.make_id = vmake.make_id
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function addVehicleModel(model, callback) {
  const query = `
    INSERT INTO VehicleModels (model_name, make_id)
    VALUES (?, ?)
  `;
  db.run(query, [model.model_name, model.make_id], function (err) {
    if (err) {
      console.error("Database error:", err);
      callback("failure");
      return;
    }
    callback("success");
  });
}

function editVehicleModel(model, callback) {
  const query = `
    UPDATE VehicleModels
    SET model_name = ?, make_id = ?
    WHERE model_id = ?
  `;
  db.run(
    query,
    [model.model_name, model.make_id, model.model_id],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        callback("failure");
        return;
      }
      callback("success");
    }
  );
}

function deleteVehicleModel(modelId, callback) {
  const query = `
    DELETE FROM VehicleModels
    WHERE model_id = ?
  `;
  db.run(query, [modelId], function (err) {
    if (err) {
      console.error("Database error:", err);
      callback("failure");
      return;
    }
    callback("success");
  });
}

module.exports = {
  fetchVehicleModels,
  addVehicleModel,
  editVehicleModel,
  deleteVehicleModel,
};
