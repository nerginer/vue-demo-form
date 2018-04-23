import { required, email, maxLength } from 'vuelidate/lib/validators'
import axios from 'axios';
import Vue from 'vue';

export default {
  name: 'app-form',
  data() {
    return {
      isSubmitted: false,
      isError: false,
      errorHeader: 'error.invalidFields',
      errors: [],
      types: this.getTypes(),
      submitting: false,
      form: {
        firstName: '',
        lastName: '',
        email: '',
        terms: false,
        type: null,
        additionalInfo: ''
      }
    }
  },
  methods: {
    submit() {
      this.$v.$touch();
      if (!this.$v.$error) {
        this.sendFormData();
      } else {
        this.validationError();
      }
    },
    enableSubmitLoader() {
      this.submitting = true;
    },
    disableSubmitLoader() {
      this.submitting = false;
    },
    sendFormData() {
      this.enableSubmitLoader();
      axios.post(Vue.config.formApiUrl, this.form).then(response => {
        this.submitSuccess(response);
        this.disableSubmitLoader();
      }).catch(error => {
        this.submitError(error);
        this.disableSubmitLoader();
      });
    },
    submitSuccess(response) {
      if (response.data.success) {
        this.isSubmitted = true;
        this.isError = false;
      } else {
        this.errorHeader = 'error.invalidFields';
        this.errors = response.data.errors;
        this.isError = true;
      }
    },
    submitError(error) {
      this.errorHeader = 'error.general';
      this.errors = [{'field': null, 'message': 'error.generalMessage'}];
      this.isError = true;
    },
    validationError() {
      this.errorHeader = 'error.invalidFields';
      this.errors = this.getErrors();
      this.isError = true;
    },
    isErrorField(field) {
      if (this.$v.form[field] && this.$v.form[field].$error) {
        return true;
      }
      return this.errors.some(el => el.field === field);
    },
    getErrors() {
      let errors = [];
      for (const field of Object.keys(this.form)) {
        if (this.$v.form[field] && this.$v.form[field].$error) {
          errors.push({'field': field, 'message': null});
        }
      }
      return errors;
    },
    getFieldClasses(field) {
      return { 
        'is-invalid': this.isErrorField(field)
      }
    },
    getCharactersLeft(field) {
      if (this.$v.form[field]) {
        return this.$v.form[field].$params.maxLength.max - this.form[field].length;
      }
      return 0;
    },
    getTypes() {
      return [{
        value: 'free', 
        label: 'Free trial subscription'
      }, {
        value: 'starter', 
        label: 'Starter subscription (50 € / month)'
      }, {
        value: 'enterprise', 
        label: 'Enterprise subscription (250 € / month)'
      }];
    },
    onFieldBlur(field) {
      if (this.$v.form[field]) {
        this.$v.form[field].$touch();
        if (this.$v.form[field].$error) {
          if (!this.errors.some(el => el.field === field)) {
            this.errors.push({'field': field, 'message': null});
          }
        } else {
          this.errors = this.errors.filter(el => el.field !== field);
        }
      }
    },
    reload() {
      window.location = '';
    }
  },
  validations: {
    form: {
      email: {
        required,
        email
      },
      firstName: {
        required
      },
      lastName: {
        required
      },
      type: {
        required
      },
      terms: {
        required
      },
      additionalInfo: {
        maxLength: maxLength(1000)
      }
    }
  },
  watch: {
    errors() {
      this.isError = this.errors.length > 0 ? true : false;
    }
  }
}
