<template>
  <q-page padding>
    <q-table
      title="Vehicle Usages"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="vehicleUsages"
      :columns="columns"
      row-key="usage_id"
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
          label="Add Usage"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat no-caps dense @click="editUsage(props.row)">
            <q-tooltip class="bg-info"> Edit Usage </q-tooltip>
          </q-btn>
          <q-btn flat icon="delete_forever" @click="deleteUsage(props.row)">
            <q-tooltip class="bg-negative"> Remove Usage </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Vehicle Usage" : "Add New Vehicle Usage" }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Usage Name -->
          <q-input
            outlined
            v-model="newUsage.usage_name"
            label="Usage Name"
            @keyup.enter="addOrEditUsage"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditUsage" />
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
      vehicleUsages: [],
      columns: [
        {
          name: "usage_name",
          label: "Usage Name",
          align: "left",
          field: (row) => row.usage_name,
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
      newUsage: {
        usage_name: "",
      },
      showForm: false,
      isEditing: false,
      usageToEdit: null,
    };
  },
  async created() {
    this.fetchVehicleUsages();
  },
  methods: {
    async fetchVehicleUsages() {
      try {
        const data = await window.electron.fetchVehicleUsages();
        this.vehicleUsages = data;
      } catch (error) {
        console.error("Failed to fetch vehicle usages:", error);
      }
    },
    showAddForm() {
      this.showForm = true;
    },
    editUsage(usage) {
      this.isEditing = true;
      this.usageToEdit = usage;
      this.newUsage = {
        usage_name: usage.usage_name,
      };
      this.showForm = true;
    },
    deleteUsage(usage) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this vehicle usage?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deleteVehicleUsage(
              usage.usage_id
            );
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Vehicle usage deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchVehicleUsages();
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete vehicle usage:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete vehicle usage.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {});
    },
    async addOrEditUsage() {
      try {
        const usageData = JSON.parse(JSON.stringify(this.newUsage));
        if (this.isEditing) {
          usageData.usage_id = this.usageToEdit.usage_id;
          const response = await window.electron.editVehicleUsage(usageData);
          if (response === "success") {
            this.fetchVehicleUsages();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Vehicle usage edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addVehicleUsage(usageData);
          if (response === "success") {
            this.fetchVehicleUsages();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Vehicle usage added successfully!",
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
        this.usageToEdit = null;
      }
    },
    resetForm() {
      this.newUsage = {
        usage_name: "",
      };
    },
    cancelAddition() {
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.usageToEdit = null;
    },
  },
};
</script>
