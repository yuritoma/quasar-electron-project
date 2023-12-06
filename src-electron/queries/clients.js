const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the path for the database
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
console.log("dbPath: ", dbPath);
const db = new sqlite3.Database(dbPath);

function fetchClients(callback) {
  db.all(
    `SELECT 
      client_id,
      first_name,
      COALESCE(middle_name, '') AS middle_name,
      COALESCE(last_name, '') AS last_name,
      date_of_birth,
      (strftime('%Y', 'now') - strftime('%Y', date_of_birth)) - 
      (strftime('%m-%d', 'now') < strftime('%m-%d', date_of_birth)) AS age,
      address,
      email,
      phone_number,
      notes,
      data_saved_by
    FROM Clients`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        callback([]);
        return;
      }
      callback(rows);
    }
  );
}

function addClient(client, callback) {
  const {
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    address,
    email,
    phone_number,
    notes,
    data_saved_by,
  } = client;
  const stmt = db.prepare(
    "INSERT INTO Clients (first_name, middle_name, last_name, date_of_birth, address, email, phone_number, notes, data_saved_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  stmt.run(
    [
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      address,
      email,
      phone_number,
      notes,
      data_saved_by,
    ],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        callback(false);
        return;
      }
      callback(true);
    }
  );
}

function editClient(client, callback) {
  const {
    client_id,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    address,
    email,
    phone_number,
    notes,
    data_saved_by,
  } = client;
  const stmt = db.prepare(
    "UPDATE Clients SET first_name = ?, middle_name = ?, last_name = ?, date_of_birth = ?, address = ?, email = ?, phone_number = ?, notes = ?, data_saved_by = ? WHERE client_id = ?"
  );

  stmt.run(
    [
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      address,
      email,
      phone_number,
      notes,
      data_saved_by,
      client_id,
    ],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        callback(false);
        return;
      }
      callback(true);
    }
  );
}

function deleteClient(clientId, callback) {
  const stmt = db.prepare("DELETE FROM Clients WHERE client_id = ?");

  stmt.run([clientId], function (err) {
    if (err) {
      console.error("Database error:", err);
      callback(false);
      return;
    }
    callback(true);
  });
}

module.exports = {
  fetchClients,
  addClient,
  editClient,
  deleteClient,
};
