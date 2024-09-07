import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import PixiCanvas from 'components/vue/PixiCanvas.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Ripple from 'primevue/ripple';
import App from './App.vue';
import lara from '@primevue/themes/lara';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'

const app = createApp(App);
app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: lara,
        darkModeSelector: 'system',
    },
});

app.use(ToastService);

app.directive('ripple', Ripple);
app.component('PixiCanvas', PixiCanvas);
app.component('ProgressSpinner', ProgressSpinner);

app.mount('#app');
