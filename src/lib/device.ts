import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

import type { TaskLocation } from './tasks';

export const capturePhoto = async (): Promise<string> => {
  const native = Capacitor.isNativePlatform();

  if (native) {
    let status = await Camera.checkPermissions();
    if (status.camera !== 'granted') {
      status = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
    }
    if (status.camera !== 'granted') {
      throw new Error('Permiso de cámara denegado. Habilítalo en los ajustes del dispositivo.');
    }
  }

  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    source: native ? CameraSource.Prompt : CameraSource.Photos,
    quality: 60,
    width: 800,
  });

  if (!photo.dataUrl) throw new Error('No se pudo obtener la imagen.');
  return photo.dataUrl;
};

export const currentLocation = async (): Promise<TaskLocation> => {
  let status = await Geolocation.checkPermissions();
  if (status.location !== 'granted') {
    status = await Geolocation.requestPermissions();
  }
  if (status.location !== 'granted') {
    throw new Error('Permiso de ubicación denegado. Habilítalo en los ajustes del dispositivo.');
  }

  const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
};
