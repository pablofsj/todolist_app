import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.todolist',
  appName: 'ToDo List',
  webDir: 'dist',
  plugins: {
    Camera: {
      promptLabelHeader: 'Foto de la tarea',
      promptLabelPhoto: 'Elegir de la galería',
      promptLabelPicture: 'Tomar foto',
    },
  },
};

export default config;
