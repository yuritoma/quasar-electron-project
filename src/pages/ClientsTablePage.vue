<template>
  <q-page padding>
    <q-table
      title="Clients"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="clients"
      :columns="columns"
      row-key="client_id"
      :visible-columns="[
        'name',
        'date_of_birth',
        'age',
        'address',
        'email',
        'phone_number',
        'actions',
        'notes',
      ]"
      :pagination="{ rowsPerPage: 25 }"
      flat
      bordered
      grid-mode="full"
      :filter="filter"
      v-model:selected="selected"
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
          label="Add Client"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body="props">
        <q-tr @dblclick="editClient(props.row)" :props="props">
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
              @click.stop="editClient(props.row)"
            >
              <q-tooltip class="bg-info">Edit Client</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="delete_forever"
              @click.stop="deleteClient(props.row)"
            >
              <q-tooltip class="bg-negative">Remove Client</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:body-cell-notes="props">
        <q-td :props="props" class="notes-column">
          {{ props.row.notes }}
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Client" : "Add New Client" }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            @keyup.enter="addOrEditClient"
            outlined
            v-model="newClient.first_name"
            label="First Name"
          />
          <q-input
            outlined
            v-model="newClient.middle_name"
            label="Middle Name"
            @keyup.enter="addOrEditClient"
          />
          <q-input
            outlined
            v-model="newClient.last_name"
            label="Last Name"
            @keyup.enter="addOrEditClient"
          />
          <q-separator></q-separator>
          <q-input
            outlined
            v-model="newClient.date_of_birth"
            label="Date of Birth"
            type="date"
            @keyup.enter="addOrEditClient"
          />
          <q-input
            outlined
            v-model="newClient.address"
            label="Address"
            type="textarea"
            @keyup.enter="addOrEditClient"
            autogrow
          />
          <q-input
            outlined
            v-model="newClient.email"
            label="Email"
            type="email"
            @keyup.enter="addOrEditClient"
          />
          <q-input
            outlined
            v-model="newClient.phone_number"
            label="Phone Number"
            type="tel"
            @keyup.enter="addOrEditClient"
          />
          <q-input
            outlined
            v-model="newClient.notes"
            label="Notes"
            @keyup.enter="addOrEditClient"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditClient" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      filter: "",
      clients: [],
      columns: [
        {
          name: "client_id",
          label: "ID",
          align: "left",
          field: (row) => row.client_id,
          sortable: true,
        },
        {
          name: "name",
          label: "Name",
          align: "left",
          field: (row) => {
            let fullName = "";
            if (row.first_name) {
              fullName += row.first_name;
            }
            if (row.middle_name) {
              fullName += fullName ? ` ${row.middle_name}` : row.middle_name;
            }
            if (row.last_name) {
              fullName += fullName ? ` ${row.last_name}` : row.last_name;
            }
            return fullName;
          },
          sortable: true,
        },
        {
          name: "date_of_birth",
          label: "Date of Birth",
          align: "left",
          field: (row) => row.date_of_birth,
          sortable: true,
        },
        {
          name: "age",
          label: "Client Age",
          align: "left",
          field: (row) => row.age,
          sortable: true,
        },
        {
          name: "address",
          label: "Address",
          align: "left",
          field: (row) => row.address,
          sortable: false,
        },
        {
          name: "email",
          label: "Email",
          align: "left",
          field: (row) => row.email,
          sortable: false,
        },
        {
          name: "phone_number",
          label: "Phone Number",
          align: "left",
          field: (row) => row.phone_number,
          sortable: false,
        },
        {
          name: "notes",
          label: "Notes",
          align: "left",
          field: (row) => row.notes,
          sortable: false,
        },
        {
          name: "actions",
          label: "Actions",
          align: "center",
          field: (row) => row,
          sortable: false,
        },
      ],
      newClient: {
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        client_birthday: "",
        address: "",
        email: "",
        phone_number: "",
        notes: "",
        data_saved_by: "",
      },
      showForm: false,
      isEditing: false,
      clientToEdit: null,
      clientToDelete: null,
    };
  },

  async created() {
    this.fetchClients();
    if (this.$route.query.showAddForm) {
      this.showAddForm();
    }
  },

  methods: {
    async fetchClients() {
      try {
        const data = await window.electron.fetchClients();
        this.clients = data;
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    },
    showAddForm() {
      this.showForm = true;
    },
    editClient(client) {
      this.isEditing = true;
      this.clientToEdit = client;
      this.newClient = { ...client }; // Make a shallow copy
      this.showForm = true;
    },

    deleteClient(clientId) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this client?",
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
          // console.log("Sending client ID for deletion:", clientId.client_id);
          try {
            const deleteResponse = await window.electron.deleteClient(
              clientId.client_id
            ); // Send just the ID
            // console.log("Delete response:", deleteResponse);
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Client deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchClients(); // Refresh the client list
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete client:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete client.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {
          // console.log("delete client cancelled");
        });
    },

    async addOrEditClient() {
      if (!this.newClient.first_name) {
        this.$q.notify({
          color: "red",
          message: "First name is required!",
        });
        return;
      }
      try {
        const clientData = JSON.parse(JSON.stringify(this.newClient));
        clientData.data_saved_by = localStorage.getItem("user");

        let response;
        if (this.isEditing) {
          response = await window.electron.editClient(clientData);
          if (response === "success") {
            this.fetchClients();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Client edited successfully!",
            });
          }
        } else {
          response = await window.electron.addClient(clientData);
          if (response === "success") {
            this.fetchClients();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Client added successfully!",
            });
            // Redirect based on the 'fromPage' query parameter
            if (this.$route.query.fromPage === "vehicles") {
              this.$router.push({
                name: "vehicles",
                query: { showAddForm: "true" },
              });
            } else if (this.$route.query.fromPage === "policies") {
              this.$router.push({
                name: "policies",
                query: { showAddForm: "true" },
              });
            }
          }
        }
        if (response !== "success") {
          throw new Error(response);
        }
      } catch (error) {
        console.error("Failed operation:", error);
        this.$q.notify({
          color: "red",
          message: error.message || "An error occurred.",
        });
      } finally {
        this.isEditing = false;
        this.clientToEdit = null;
      }
    },

    resetForm() {
      this.newClient = {
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        client_birthday: "",
        address: "",
        email: "",
        phone_number: "",
        notes: "",
      };
    },
    cancelAddition() {
      console.log("cancel addition triggered");
      if (this.$route.query.fromPage === "vehicles") {
        this.$router.push({
          name: "vehicles",
          query: { showAddForm: "true" },
        });
      } else if (this.$route.query.fromPage === "policies") {
        this.$router.push({
          name: "policies",
          query: { showAddForm: "true" },
        });
      }
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.clientToEdit = null;
    },

    handleKeydown(e) {
      console.log("escape clicked");
      if (e.key === "Escape" && this.showForm) {
        this.showForm = false;
        this.cancelAddition();
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

<style>
.notes-column {
  max-width: 200px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
</style>
