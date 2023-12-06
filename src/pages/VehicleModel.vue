<template>
  <q-page padding>
    <q-table
      title="Vehicle Models"
      dense
      :rows-per-page-options="[10, 15, 20, 25, 30, 35, 40, 45, 50]"
      :rows="models"
      :columns="columns"
      row-key="model_id"
      :visible-columns="['model_name', 'make_name', 'actions']"
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
          label="Add Model"
          @click="showAddForm"
        />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat no-caps dense @click="editModel(props.row)">
            <q-tooltip class="bg-info"> Edit Model </q-tooltip>
          </q-btn>
          <q-btn flat icon="delete_forever" @click="deleteModel(props.row)">
            <q-tooltip class="bg-negative"> Remove Model </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEditing ? "Edit Vehicle Model" : "Add New Vehicle Model" }}
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Model Name -->
          <q-input
            outlined
            v-model="newModel.model_name"
            label="Model Name"
            @keyup.enter="addOrEditModel"
          />

          <!-- Vehicle Make -->
          <q-select
            outlined
            v-model="newModel.make_id"
            :options="vehicleMakes"
            label="Vehicle Make"
            :option-value="(option) => option.make_id"
            option-label="make_name"
            @keyup.enter="addOrEditModel"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddition" />
          <q-btn color="primary" label="Add" @click="addOrEditModel" />
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
      models: [],
      vehicleMakes: [],
      columns: [
        {
          name: "model_name",
          label: "Model Name",
          align: "left",
          field: (row) => row.model_name,
          sortable: true,
        },
        {
          name: "make_name",
          label: "Vehicle Make",
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
      newModel: {
        model_name: "",
        make_id: "",
      },
      showForm: false,
      isEditing: false,
      modelToEdit: null,
    };
  },

  async created() {
    this.fetchModels();
    try {
      this.vehicleMakes = await window.electron.fetchVehicleMakes();
    } catch (error) {
      console.error("Failed to fetch vehicle makes:", error);
    }
  },

  methods: {
    async fetchModels() {
      try {
        const data = await window.electron.fetchVehicleModels();
        this.models = data;
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    },
    showAddForm() {
      this.showForm = true;
    },

    editModel(model) {
      this.isEditing = true;
      this.modelToEdit = model;

      // Find the vehicle make object that matches the make_id of the model
      const vehicleMake = this.vehicleMakes.find(
        (make) => make.make_id === model.make_id
      );

      // Check if vehicleMake is found
      if (!vehicleMake) {
        console.error("Vehicle make not found for make_id:", model.make_id);
        return; // Exit the method if vehicleMake is not found
      }
      this.newModel = {
        model_id: model.model_id,
        model_name: model.model_name,
        make_id: vehicleMake, // Set the entire make object
      };
      this.showForm = true;
    },

    deleteModel(model) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this model?",
          ok: { label: "Yes, Delete", color: "negative" },
          cancel: { label: "Cancel", color: "primary" },
        })
        .onOk(async () => {
          try {
            const deleteResponse = await window.electron.deleteVehicleModel(
              model.model_id
            );
            if (deleteResponse === "success") {
              this.$q.notify({
                color: "green",
                message: "Model deleted successfully.",
                icon: "check",
                position: "bottom",
              });
              this.fetchModels();
            } else {
              throw new Error(deleteResponse);
            }
          } catch (error) {
            console.error("Failed to delete model:", error);
            this.$q.notify({
              color: "red",
              message: "Failed to delete model.",
              icon: "error",
              position: "bottom",
            });
          }
        })
        .onCancel(() => {
          // console.log("Delete model cancelled");
        });
    },

    async addOrEditModel() {
      try {
        const modelData = JSON.parse(JSON.stringify(this.newModel));
        modelData.make_id = modelData.make_id.make_id;
        // console.log("Data to send:", modelData);
        if (this.isEditing) {
          const response = await window.electron.editVehicleModel(modelData);
          if (response === "success") {
            this.fetchModels();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Model edited successfully!",
            });
          } else {
            throw new Error(response);
          }
        } else {
          const response = await window.electron.addVehicleModel(modelData);
          if (response === "success") {
            this.fetchModels();
            this.showForm = false;
            this.resetForm();
            this.$q.notify({
              color: "green",
              message: "Model added successfully!",
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
        this.modelToEdit = null;
      }
    },

    resetForm() {
      this.newModel = {
        model_name: "",
        make_id: "",
      };
    },
    cancelAddition() {
      this.showForm = false;
      this.resetForm();
      this.isEditing = false;
      this.modelToEdit = null;
    },
  },
};
</script>
