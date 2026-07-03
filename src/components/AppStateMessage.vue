<script setup lang="ts">
type StateType = "empty" | "error" | "info" | "loading";

interface Props {
  type?: StateType;
  title: string;
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: "",
  type: "info",
});

const getAlertType = (type: StateType): "error" | "info" | "warning" => {
  if (type === "error") {
    return "error";
  }
  if (type === "empty") {
    return "warning";
  }
  return "info";
};
</script>

<template>
  <v-container class="app-state-message">
    <v-alert
      :type="getAlertType(props.type)"
      variant="tonal"
      class="app-state-message__alert"
    >
      <div class="app-state-message__content">
        <v-progress-circular
          v-if="props.type === 'loading'"
          color="primary"
          indeterminate
          size="28"
          width="3"
        />
        <div>
          <p class="app-state-message__title">{{ props.title }}</p>
          <p v-if="props.message" class="app-state-message__body">
            {{ props.message }}
          </p>
        </div>
      </div>
    </v-alert>
  </v-container>
</template>

<style scoped>
.app-state-message {
  max-width: 800px;
  padding-bottom: 16px;
  padding-top: 16px;
}

.app-state-message__alert {
  border-radius: 8px;
}

.app-state-message__content {
  align-items: center;
  display: flex;
  gap: 12px;
}

.app-state-message__title {
  font-size: 1.1rem;
  font-weight: bold;
  line-height: 1.4;
  margin: 0;
}

.app-state-message__body {
  line-height: 1.6;
  margin: 4px 0 0;
}
</style>
