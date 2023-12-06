<template>
  <q-page padding>
    <q-table
      title="Vehicle Makes"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="vehicleMakes"
      :columns="columns"
      row-key="make_id"
      :pagination="{ rowsPerPage: 25 }"
      flat
      bordered
      grid-mode="full"
      :filter="filter"
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
          label="Add Make"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat no-caps dense @click="editMake(props.row)">
            <q-tooltip class="bg-info"> Edit Make </q-tooltip>
          </q-btn>
          <q-btn flat icon="delete_forever" @click="deleteMake(props.row)">
            <q-tooltip class="bg-negative"> Remove Make </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Vehicle Make" : "Add New Vehicle Make" }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Make Name -->
          <q-input
            outlined
            v-model="newMake.make_name"
            label="Make Name"
            @keyup.enter="addOrEditMake"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditMake" />
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
      vehicleMakes: [],
      columns: [
        {
          name: "make_name",
          label: "Make Name",
          align: "left",
          field: (row) => row.make_name,
          sortable: true,
        },
        {
          name: "actions",
          label: "Actions",
          align: "center",
          field: (row) => row,
          sortable: false,
        },
      ],
      newMake: {
        make_name: "",
      },
      showForm: false,
      isEditing: false,
      makeToEdit: null,
    };
  },
  async created() {
    this.fetchVehicleMakes();
  },
  methods: {
    async fetchVehicleMakes() {
      try {
        const data = await window.electron.fetchVehicleMakes();
        this.vehicleMakes = data;
      } catch (error) {
        console.error("Failed to fetch vehicle makes:", error);
      }
    },
    showAddForm() {
      this.showForm = true;
    },
    editMake(make) {
      this.isEditing = true;
      this.makeToEdit = make;
      this.newMake = {
        make_name: make.make_name,
      };
      this.showForm = true;
    },
    deleteMake(make) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this vehicle make?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deleteVehicleMake(
              make.make_id
            );
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Vehicle make deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchVehicleMakes();
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete vehicle make:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete vehicle make.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {
          // console.log("Delete vehicle make cancelled");
        });
    },
    async addOrEditMake() {
      try {
        const makeData = JSON.parse(JSON.stringify(this.newMake));
        if (this.isEditing) {
          makeData.make_id = this.makeToEdit.make_id;
          const response = await window.electron.editVehicleMake(makeData);
          if (response === "success") {
            this.fetchVehicleMakes();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Vehicle make edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addVehicleMake(makeData);
          if (response === "success") {
            this.fetchVehicleMakes();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Vehicle make added successfully!",
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
        this.isEditing = false;
        this.makeToEdit = null;
      }
    },
    resetForm() {
      this.newMake = {
        make_name: "",
      };
    },
    cancelAddition() {
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.makeToEdit = null;
    },
  },
};
</script>
