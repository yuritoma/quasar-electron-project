const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function fetchClientsFullName(callback) {
  const query = `
    SELECT client_id, 
           first_name || 
           COALESCE(' ' || middle_name, '') || 
           COALESCE(' ' || last_name, '') AS client_name, 
           date_of_birth as client_birthday
    FROM Clients
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

function fetchModels(makeId, callback) {
  db.all(
    "SELECT * FROM VehicleModels WHERE make_id = ?",
    [makeId],
    (err, rows) => {
      if (err) {
        console.error("SQLite Error in fetchModels:", err.message);
        callback([]);
        return;
      } else {
        callback(rows);
      }
    }
  );
}

function fetchTypes(callback) {
  const query = `SELECT * FROM VehicleTypes`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function fetchVehicles(callback) {
  const query = `
    SELECT 
           Vehicles.*,
           COALESCE(Clients.first_name, '') || 
           COALESCE(' ' || Clients.middle_name, '') || 
           COALESCE(' ' || Clients.last_name, '') AS client_name,
           COALESCE(VehicleMakes.make_name, '') AS make_name,
           COALESCE(VehicleModels.model_name, '') AS model_name,
           COALESCE(VehicleTypes.type_name, '') AS type_name,
           COALESCE(VehicleUsages.usage_name, '') AS usage_name
    FROM Vehicles
         LEFT JOIN
         VehicleMakes ON Vehicles.make_id = VehicleMakes.make_id
         LEFT JOIN
         VehicleModels ON Vehicles.model_id = VehicleModels.model_id
         LEFT JOIN
         VehicleTypes ON Vehicles.type_id = VehicleTypes.type_id
         LEFT JOIN
         Clients ON Vehicles.client_id = Clients.client_id
         LEFT JOIN
         VehicleUsages ON Vehicles.usage_id = VehicleUsages.usage_id;
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

function addVehicle(vehicle, callback) {
  const query = `
    INSERT INTO Vehicles (plate_number, client_id, make_id, model_id, type_id, horsepower, year_built, usage_id, engine_number, chassis_number, notes, data_saved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(
    query,
    [
      vehicle.plate_number,
      vehicle.client_id,
      vehicle.make_id,
      vehicle.model_id,
      vehicle.type_id,
      vehicle.horsepower,
      vehicle.year_built,
      vehicle.usage_id,
      vehicle.engine_number,
      vehicle.chassis_number,
      vehicle.notes,
      vehicle.data_saved_by,
    ],
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

function editVehicle(vehicle, callback) {
  const query = `
    UPDATE Vehicles
    SET client_id = ?, make_id = ?, model_id = ?, type_id = ?, horsepower = ?, year_built = ?, usage_id = ?, engine_number = ?, chassis_number = ?, data_saved_by = ?, notes = ?, plate_number =?
    WHERE vehicle_id = ?
  `;
  db.run(
    query,
    [
      vehicle.client_id,
      vehicle.make_id,
      vehicle.model_id,
      vehicle.type_id,
      vehicle.horsepower,
      vehicle.year_built,
      vehicle.usage_id,
      vehicle.engine_number,
      vehicle.chassis_number,
      vehicle.data_saved_by,
      vehicle.notes,
      vehicle.plate_number,
      vehicle.vehicle_id,
    ],
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

function deleteVehicle(vehicleId, callback) {
  const query = `
    DELETE FROM Vehicles
    WHERE vehicle_id = ?
  `;
  db.run(query, [vehicleId], function (err) {
    if (err) {
      console.error("Database error:", err);
      callback("failure");
      return;
    }
    callback("success");
  });
}

module.exports = {
  fetchVehicles,
  addVehicle,
  editVehicle,
  deleteVehicle,
  fetchClientsFullName,
  fetchModels,
  fetchTypes,
};
