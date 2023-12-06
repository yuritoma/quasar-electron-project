const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");

// Determine the path for the database
const dbPath = path.resolve(__dirname, "..", "..", "BrokINS.db");
const db = new sqlite3.Database(dbPath);

function authenticateUser(username, password, callback) {
  db.get(
    "SELECT user_password, role FROM users WHERE user_name = ? COLLATE NOCASE",
    [username],
    (err, row) => {
      if (err) {
        console.error("Database error:", err);
        callback(false);
        return;
      }
      if (row) {
        bcrypt.compare(password, row.user_password, (err, result) => {
          if (err) {
            console.error("Bcrypt error:", err);
            callback(false);
            return;
          }
          if (result) {
            // console.log("Authentication successful:", row.role); // Log success
            callback({ isAuthenticated: true, role: row.role });
          } else {
            console.log("Password mismatch"); // Log failure
            callback(false);
          }
        });
      } else {
        console.log("User not found"); // Log failure
        callback(false);
      }
    }
  );
}

function fetchUsers(callback) {
  db.all("SELECT * FROM Users", [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      callback([]);
      return;
    }
    callback(rows);
  });
}

// Add a new user
function addUser(user, callback) {
  const saltRounds = 10;
  bcrypt.hash(user.user_password, saltRounds, (err, hash) => {
    if (err) {
      callback(false);
      return;
    }
    const query =
      "INSERT INTO Users (first_name, last_name, role, user_password, user_name) VALUES (?, ?, ?, ?, ?)";
    db.run(
      query,
      [
        user.first_name,
        user.last_name,
        user.role,
        hash,
        user.user_name.toLowerCase(),
      ],
      (err) => {
        if (err) {
          callback(false);
          return;
        }
        callback(true);
      }
    );
  });
}

// Edit an existing user
function editUser(user, callback) {
  // If the password is being updated, hash it. Otherwise, just update the other fields.
  if (user.user_password) {
    const saltRounds = 10;
    bcrypt.hash(user.user_password, saltRounds, (err, hash) => {
      if (err) {
        callback(false);
        return;
      }
      const query =
        "UPDATE Users SET first_name = ?, last_name = ?, role = ?, user_password = ?, user_name = ? WHERE user_id = ?";
      db.run(
        query,
        [
          user.first_name,
          user.last_name,
          user.role,
          hash,
          user.user_name.toLowerCase(),
          user.user_id,
        ],
        (err) => {
          if (err) {
            callback(false);
            return;
          }
          callback(true);
        }
      );
    });
  } else {
    const query =
      "UPDATE Users SET first_name = ?, last_name = ?, role = ?, user_name = ? WHERE user_id = ?";
    db.run(
      query,
      [
        user.first_name,
        user.last_name,
        user.role,
        user.user_name.toLowerCase(),
        user.user_id,
      ],
      (err) => {
        if (err) {
          callback(false);
          return;
        }
        callback(true);
      }
    );
  }
}

// Delete a user
function deleteUser(userId, callback) {
  const query = "DELETE FROM Users WHERE user_id = ?";
  db.run(query, [userId], (err) => {
    if (err) {
      callback(false);
      return;
    }
    callback(true);
  });
}

module.exports = {
  db,
  authenticateUser,
  fetchUsers,
  addUser,
  editUser,
  deleteUser,
};
