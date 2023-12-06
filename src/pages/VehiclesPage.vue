<template>
  <q-page padding>
    <q-table
      title="Vehicles"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="vehicles"
      :columns="columns"
      row-key="vehicle_id"
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
          label="Add Vehicle"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body="props">
        <q-tr @dblclick="editVehicle(props.row)" :props="props">
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
              @click.stop="editVehicle(props.row)"
            >
              <q-tooltip class="bg-info">Edit Vehicle</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="delete_forever"
              @click.stop="deleteVehicle(props.row)"
            >
              <q-tooltip class="bg-negative">Remove Vehicle</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Vehicle" : "Add New Vehicle" }}
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Form Fields -->
          <!-- Plate Number -->
          <q-input
            outlined
            v-model="newVehicle.plate_number"
            label="Plate Number"
            @keyup.enter="addOrEditVehicle"
            clearable
          />
          <!-- Owner -->
          <q-select
            outlined
            v-model="newVehicle.client_id"
            :options="vehicle_"
            label="Owner"
            option-value="client_id"
            option-label="client_name"
            use-input
            @keyup.enter="addOrEditVehicle"
            @filter="filterClients"
            clearable
          >
            <template v-slot:no-option>
              <q-btn flat @click="goToClientsTablePage">Add New Client</q-btn>
            </template>
          </q-select>

          <!-- Make -->
          <q-select
            outlined
            v-model="newVehicle.make_id"
            :options="makes"
            label="Make"
            option-value="make_id"
            option-label="make_name"
            @update:model-value="(value) => fetchModels(value.make_id)"
          />
          <!-- Model -->
          <q-select
            outlined
            v-model="newVehicle.model_id"
            :options="models"
            label="Model"
            option-value="model_id"
            option-label="model_name"
          />
          <!-- Type -->
          <q-select
            outlined
            v-model="newVehicle.type_id"
            :options="types"
            label="Type"
            option-value="type_id"
            option-label="type_name"
          />
          <!-- Horsepower -->
          <q-input
            outlined
            v-model="newVehicle.horsepower"
            label="Horsepower"
            type="number"
            @keyup.enter="addOrEditVehicle"
          />
          <!-- Year Built -->
          <q-input
            outlined
            v-model="newVehicle.year_built"
            label="Year Built"
            type="number"
            @keyup.enter="addOrEditVehicle"
          />
          <!-- Usage -->
          <q-select
            v-model="newVehicle.usage_id"
            :options="usages"
            label="Usage"
            option-label="usage_name"
            option-value="usage_id"
            outlined
            emit-value
            map-options
          />
          <!-- Engine Number -->
          <q-input
            outlined
            v-model="newVehicle.engine_number"
            label="Engine Number"
            @keyup.enter="addOrEditVehicle"
          />
          <!-- Chassis Number -->
          <q-input
            outlined
            v-model="newVehicle.chassis_number"
            label="Chassis Number"
            @keyup.enter="addOrEditVehicle"
          />
          <!-- Notes -->
          <q-input
            outlined
            v-model="newVehicle.notes"
            label="Notes"
            @keyup.enter="addOrEditVehicle"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditVehicle" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { watch } from "vue";
export default {
  data() {
    return {
      filter: "",
      vehicles: [],
      vehicle_: [],
      makes: [],
      usages: [],
      models: [],
      types: [],
      columns: [
        {
          name: "plate_number",
          label: "Plate Number",
          align: "left",
          field: (row) => row.plate_number,
          sortable: true,
        },
        {
          name: "owner",
          label: "Owner",
          align: "left",
          field: (row) => row.client_name,
          sortable: true,
        },
        {
          name: "make",
          label: "Make",
          align: "left",
          field: (row) => row.make_name,
          sortable: true,
        },
        {
          name: "vehicle model",
          label: "Model",
          align: "left",
          field: (row) => row.model_name,
          sortable: true,
        },
        {
          name: "type_id",
          label: "Type",
          align: "left",
          field: (row) => row.type_name,
          sortable: true,
        },
        {
          name: "horsepower",
          label: "Horsepower",
          align: "left",
          field: (row) => row.horsepower,
          sortable: true,
        },
        {
          name: "year_built",
          label: "Year Built",
          align: "left",
          field: (row) => row.year_built,
          sortable: true,
        },
        {
          name: "usage",
          label: "Usage",
          align: "left",
          field: (row) => row.usage_name,
          sortable: true,
        },
        {
          name: "engine_number",
          label: "Engine Number",
          align: "left",
          field: (row) => row.engine_number,
          sortable: true,
        },
        {
          name: "chassis_number",
          label: "Chassis Number",
          align: "left",
          field: (row) => row.chassis_number,
          sortable: true,
        },
        {
          name: "notes",
          label: "Notes",
          align: "left",
          field: (row) => row.notes,
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
      newVehicle: {
        plate_number: "",
        client_id: "",
        make_id: "",
        model_id: "",
        type_id: "",
        horsepower: "",
        year_built: "",
        usage_id: "",
        engine_number: "",
        chassis_number: "",
        data_saved_by: "",
      },
      newClient: {
        firstName: "",
        middleName: "",
        lastName: "",
      },
      showForm: false,
      isEditing: false,
      vehicleToEdit: null,
    };
  },

  beforeRouteLeave(to, from, next) {
    if (to.name === "clients" && from.name === "vehicles") {
      // Store the newVehicle data in sessionStorage before navigating away
      sessionStorage.setItem(
        "tempNewVehicleData",
        JSON.stringify(this.newVehicle)
      );
    }
    next();
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.name === "clients" && to.name === "vehicles") {
        const initiatedFromAddVehicleForm = sessionStorage.getItem(
          "initiatedFromAddVehicleForm"
        );

        if (!initiatedFromAddVehicleForm) {
          return; // If not initiated from add vehicle form, do nothing
        }
        sessionStorage.removeItem("initiatedFromAddVehicleForm"); // Clear the stored flag

        const tempData = sessionStorage.getItem("tempNewVehicleData");
        if (tempData) {
          vm.newVehicle = JSON.parse(tempData);
          sessionStorage.removeItem("tempNewVehicleData"); // Clear the stored data
          // Automatically show the Add Vehicle form if there's stored data
          vm.showAddForm();
        }
      }
    });
  },
  async created() {
    try {
      this.originalVehicleList = await window.electron.fetchClientsFullName();
      this.vehicle_ = [...this.originalVehicleList];
      this.makes = await window.electron.fetchVehicleMakes();
      this.usages = await window.electron.fetchVehicleUsages();
      this.models = await window.electron.fetchVehicleModels();
      this.types = await window.electron.fetchTypes();
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
    this.fetchVehicles();
    if (this.$route.query.showAddForm) {
      this.showAddForm();
    }
  },

  methods: {
    async fetchVehicles() {
      try {
        const data = await window.electron.fetchVehicles();
        this.vehicles = data;
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    },

    async fetchVehicleMakes() {
      try {
        const data = await window.electron.fetchVehicleMakes();
        this.makes = data;
      } catch (error) {
        console.error("Failed to fetch Vehicle Makes:", error);
      }
    },

    async fetchVehicleUsages() {
      try {
        const data = await window.electron.fetchVehicleUsages();
        this.usages = data;
      } catch (error) {
        console.error("Failed to fetch Vehicle Usages:", error);
      }
    },

    async fetchVehicleModels() {
      try {
        const data = await window.electron.fetchVehicleModels();
        this.models = data;
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    },

    fetchVehicleDetails(clientId) {
      if (!clientId) {
        // console.log("returned");
        return;
      }

      window.electron
        .fetchVehicleDetails(clientId)
        .then((result) => {
          this.vehicleDetails = result.map((item) => ({
            value: item.vehicle_id,
            label: item.vehicle_details,
          }));
          this.$nextTick(() => {
            // console.log("Result from fetchVehicleDetails:", result);
          });
        })
        .catch((error) => {
          console.error("Error in fetchVehicleDetails:", error);
          this.vehicleDetails = [];
        });
    },

    async fetchModels(makeId) {
      // console.log("fetchModels called with makeId:", makeId);
      if (!makeId || typeof makeId !== "number") {
        this.models = [];
        return;
      }
      try {
        const result = await window.electron.fetchModels(makeId);
        this.models = result.map((item) => ({
          model_id: item.model_id,
          model_name: item.model_name,
        }));
        this.$nextTick(() => {
          // Reset the model_id when make is changed
          this.newVehicle.model_id = "";
          // console.log("Result from fetchModels:", result);
        });
        return result;
      } catch (error) {
        console.error("Error in fetchModels:", error);
        this.models = [];
        return [];
      }
    },

    async fetchTypes() {
      try {
        const data = await window.electron.fetchTypes();
        this.types = data;
      } catch (error) {
        console.error("Failed to fetch types:", error);
      }
    },

    showAddForm() {
      this.newVehicle.usage_id = {
        // Set default to the first usage option
        usage_id: this.usages[0]?.usage_id,
        usage_name: this.usages[0]?.usage_name,
      };
      this.showForm = true;
    },

    async editVehicle(vehicle) {
      this.isEditing = true;
      this.vehicleToEdit = vehicle;
      let result;
      try {
        result = await this.fetchModels(vehicle.make_id);
        // console.log("1- Result from fetchModels:", result);
      } catch (error) {
        console.error("Failed to fetch vehicle by ID:", error);
        return;
      }
      // const client = this.vehicle_.find(
      //   (client) => client.client_id === vehicle.client_id
      // );
      const model = result.find(
        (m) => parseInt(m.model_id) === parseInt(vehicle.model_id)
      );

      // console.log("2- model :", model);
      this.newVehicle = {
        plate_number: vehicle.plate_number,
        client_id: {
          client_id: vehicle.client_id,
          client_name: vehicle.client_name,
        },
        make_id: {
          make_id: vehicle.make_id,
          make_name: vehicle.make_name,
        },
        model_id: model,
        type_id: {
          type_id: vehicle.type_id,
          type_name: vehicle.type_name,
        },
        horsepower: vehicle.horsepower,
        year_built: vehicle.year_built,
        usage_id: {
          usage_id: vehicle.usage_id,
          usage_name: vehicle.usage_name,
        },
        engine_number: vehicle.engine_number,
        chassis_number: vehicle.chassis_number,
        vehicle_id: vehicle.vehicle_id,
        notes: vehicle.notes,
      };
      this.showForm = true;
    },

    deleteVehicle(vehicle) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this vehicle?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deleteVehicle(
              vehicle.vehicle_id
            );

            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Vehicle deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchVehicles();
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete vehicle:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete vehicle.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {
          // console.log("Delete vehicle cancelled");
        });
    },
    async addOrEditVehicle() {
      // Check for mandatory fields first
      if (
        !this.newVehicle.plate_number ||
        !this.newVehicle.client_id ||
        !this.newVehicle.type_id ||
        !this.newVehicle.usage_id
      ) {
        this.$q.notify({
          color: "red",
          message:
            "Mandatory fields missing. Please ensure Plate Number, Owner, Type, and Usage are filled in.",
        });
        return; // Exit out of the method
      }
      try {
        const vehicleData = JSON.parse(JSON.stringify(this.newVehicle));
        vehicleData.client_id =
          vehicleData.client_id.client_id || vehicleData.client_id;
        vehicleData.make_id =
          vehicleData.make_id.make_id || vehicleData.make_id;
        vehicleData.model_id =
          vehicleData.model_id.model_id || vehicleData.model_id;
        vehicleData.type_id =
          vehicleData.type_id.type_id || vehicleData.type_id;
        vehicleData.usage_id =
          vehicleData.usage_id.usage_id || vehicleData.usage_id;
        // Set data_saved_by from the local storage
        vehicleData.data_saved_by = localStorage.getItem("user");
        // console.log(
        //   "Adding or editing vehicle with vehicleID:",
        //   vehicleData.client_id
        // );
        if (this.isEditing) {
          const response = await window.electron.editVehicle(vehicleData);
          if (response === "success") {
            this.fetchVehicles();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Vehicle edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addVehicle(vehicleData);
          if (response === "success") {
            this.fetchVehicles();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Vehicle added successfully!",
            });
            // Redirect based on the 'returnToPolicyForm' query parameter
            if (this.$route.query.returnToPolicyForm === "true") {
              this.$router.push({
                name: "policies",
                query: { showAddForm: "true" },
              });
            }
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
        this.vehicleToEdit = null;
      }
    },

    resetForm() {
      this.newVehicle = {
        plate_number: "",
        client_id: "",
        make_id: "",
        model_id: "",
        type_id: "",
        horsepower: "",
        year_built: "",
        usage_id: "",
        engine_number: "",
        chassis_number: "",
        data_saved_by: "",
      };
    },
    cancelAddition() {
      console.log("cancel addition triggered");
      if (this.$route.query.fromPage === "policies") {
        this.$router.push({
          name: "policies",
          query: { showAddForm: "true" },
        });
      }
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.vehicleToEdit = null;
    },

    filterClients(val, update) {
      if (val === "") {
        update(() => {
          this.vehicle_ = this.originalVehicleList; // Restore original list
        });
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.vehicle_ = this.originalVehicleList.filter(
          (v) => v.client_name.toLowerCase().indexOf(needle) > -1
        );
      });
    },

    goToClientsTablePage() {
      sessionStorage.setItem("initiatedFromAddVehicleForm", "true");
      this.showForm = false; // Hide the form before navigating
      this.$router.push({
        name: "clients",
        query: { showAddForm: "true", fromPage: "vehicles" },
      });
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

  activated() {
    console.log("Activated hook triggered in Vehicles component");
    if (this.$route.query.showAddForm === "true") {
      this.showForm = true;
    }
  },
};
</script>
