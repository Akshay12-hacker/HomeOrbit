class SubscriptionStore {
  activePlan = null;

  plans = [];

  loading = false;

  error = '';

  setActivePlan(plan) {
    this.activePlan = plan;
  }

  setPlans(plans) {
    this.plans = plans;
  }

  setLoading(value) {
    this.loading = value;
  }

  setError(error) {
    this.error = error;
  }

  clear() {
    this.activePlan = null;
    this.plans = [];
    this.error = '';
  }
}

export default new SubscriptionStore();