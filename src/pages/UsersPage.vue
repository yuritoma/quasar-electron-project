<template>
  <q-page padding>
    <div class="row justify-between items-center q-pb-md">
      <div class="text-h4">Users</div>
    </div>
    <q-table
      :rows="users"
      :columns="columns"
      row-key="user_id"
      :visible-columns="[
        'user_name',
        'first_name',
        'last_name',
        'role',
        'actions',
      ]"
      bordered
      grid-mode="full"
      :filter="filter"
      v-model:selected="selected"
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :pagination="{ rowsPerPage: 25 }"
    >
      <template v-slot:top-right>
        <q-input
          borderless
          dense
          filled
          debounce="300"
          v-model="filter"
          placeholder="Search"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          class="q-ml-md"
          color="primary"
          icon="add"
          label="Add User"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body="props">
        <q-tr @dblclick="editUser(props.row)" :props="props">
          <template v-for="col in props.cols">
            <q-td :key="col.name" :props="props" v-if="col.name !== 'actions'">
              {{ col.value }}
            </q-td>
          </template>
          <q-td key="actions" class="text-center">
            <q-btn
              icon="edit"
              flat
              no-caps
              dense
              @click.stop="editUser(props.row)"
            >
              <q-tooltip class="bg-info">Edit User</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="delete_forever"
              @click.stop="deleteUser(props.row)"
            >
              <q-tooltip class="bg-negative">Remove User</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit User" : "Add New User" }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            v-model="newUser.first_name"
            label="First Name"
            @keyup.enter="addOrEditUser"
          />
          <q-input
            outlined
            v-model="newUser.last_name"
            label="Last Name"
            @keyup.enter="addOrEditUser"
          />
          <q-input
            outlined
            v-model="newUser.user_name"
            label="Username"
            @keyup.enter="addOrEditUser"
          />
          <q-select
            outlined
            v-model="newUser.role"
            :options="['Admin', 'User']"
            label="Role"
          />
          <q-input
            outlined
            v-model="newUser.user_password"
            label="Password"
            type="password"
            @keyup.enter="addOrEditUser"
          />
          <q-input
            outlined
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            @keyup.enter="addOrEditUser"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="cancelAddition" />
          <q-btn label="Save" color="primary" @click="addOrEditUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      confirmPassword: "",
      filter: "",
      users: [],
      columns: [
        {
          name: "first_name",
          required: true,
          label: "First Name",
          align: "left",
          field: (row) => row.first_name,
        },
        {
          name: "last_name",
          required: true,
          label: "Last Name",
          align: "left",
          field: (row) => row.last_name,
        },
        {
          name: "user_name",
          required: true,
          label: "Username",
          align: "left",
          field: (row) => row.user_name,
        },
        {
          name: "role",
          required: true,
          label: "Role",
          align: "left",
          field: (row) => row.role,
        },
        {
          name: "actions",
          required: true,
          label: "Actions",
          align: "center",
          field: (row) => "actions",
          sortable: false,
        },
      ],
      newUser: {
        first_name: "",
        last_name: "",
        user_name: "",
        role: "",
        user_password: "",
      },
      showForm: false,
      isEditing: false,
      userToEdit: null,
      userToDelete: null,
    };
  },

  async created() {
    this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      try {
        const data = await window.electron.fetchUsers();
        this.users = data;
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    },

    showAddForm() {
      this.showForm = true;
    },

    editUser(user) {
      console.log("Editing user:", user);
      this.isEditing = true;
      this.userToEdit = user;
      this.newUser = { ...user }; // Make a shallow copy
      this.confirmPassword = this.newUser.user_password;
      this.showForm = true;
    },

    deleteUser(userId) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this user?",
          ok: {
            label: "Yes, Delete",
            color: "negative",
          },
          cancel: {
            label: "Cancel",
            color: "primary",
          },
        })
        .onOk(async () => {
          // console.log("User confirmed deletion.");
          // console.log("Sending user ID for deletion:", userId.user_id);
          try {
            const deleteResponse = await window.electron.deleteUser(
              userId.user_id
            ); // Send just the ID
            // console.log("Delete response:", deleteResponse);
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "User deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchUsers(); // Refresh the users list
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete user:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete user.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {
          // console.log("delete user cancelled");
        });
    },

    async addOrEditUser() {
      if (
        !this.newUser.first_name ||
        !this.newUser.user_name ||
        !this.newUser.user_password
      ) {
        this.$q.notify({
          color: "red",
          message: "First name, username, and password are required.",
        });
        return;
      }
      if (this.newUser.user_password !== this.confirmPassword) {
        this.$q.notify({
          color: "red",
          message: "Passwords do not match.",
        });
        return;
      }
      try {
        const userData = JSON.parse(JSON.stringify(this.newUser));
        if (this.isEditing) {
          const response = await window.electron.editUser(userData);
          if (response === "success") {
            this.fetchUsers();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "User edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addUser(userData);
          if (response === "success") {
            this.fetchUsers();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "User added successfully!",
            });
          } else {
            throw new Error(response);
          }
        }
      } catch (error) {
        console.error("Failed operation:", error);
        this.$q.notify({
          color: "red",
          message: error.message || "An error occurred.",
        });
      } finally {
        // Reset the form and related flags
        this.isEditing = false;
        this.userToEdit = null;
      }
    },
    resetForm() {
      this.newUser = {
        first_name: "",
        last_name: "",
        user_name: "",
        role: "",
        user_password: "",
      };
      this.confirmPassword = "";
    },
    cancelAddition() {
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.userToEdit = null;
    },
    handleKeydown(e) {
      if (e.key === "Escape" && this.showForm) {
        this.showForm = false;
        this.resetForm();
      }
    },
  },
  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
};
</script>
