import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { capturePhoto, currentLocation } from './device';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: vi.fn(() => true) } }));

vi.mock('@capacitor/camera', () => ({
  Camera: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getPhoto: vi.fn(),
  },
  CameraResultType: { DataUrl: 'dataUrl' },
  CameraSource: { Prompt: 'PROMPT', Photos: 'PHOTOS' },
}));

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getCurrentPosition: vi.fn(),
  },
}));

const camera = vi.mocked(Camera);
const geolocation = vi.mocked(Geolocation);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
});

describe('capturePhoto', () => {
  test('solicita permiso y devuelve la imagen en base64', async () => {
    camera.checkPermissions.mockResolvedValue({ camera: 'prompt', photos: 'granted' } as never);
    camera.requestPermissions.mockResolvedValue({ camera: 'granted', photos: 'granted' } as never);
    camera.getPhoto.mockResolvedValue({ dataUrl: 'data:image/png;base64,abc' } as never);

    await expect(capturePhoto()).resolves.toBe('data:image/png;base64,abc');
    expect(camera.requestPermissions).toHaveBeenCalledWith({ permissions: ['camera', 'photos'] });
  });

  test('falla con un mensaje claro si el permiso de cámara es denegado', async () => {
    camera.checkPermissions.mockResolvedValue({ camera: 'denied', photos: 'granted' } as never);
    camera.requestPermissions.mockResolvedValue({ camera: 'denied', photos: 'granted' } as never);

    await expect(capturePhoto()).rejects.toThrow('Permiso de cámara denegado');
    expect(camera.getPhoto).not.toHaveBeenCalled();
  });

  test('falla si la cámara no entrega imagen', async () => {
    camera.checkPermissions.mockResolvedValue({ camera: 'granted', photos: 'granted' } as never);
    camera.getPhoto.mockResolvedValue({} as never);

    await expect(capturePhoto()).rejects.toThrow('No se pudo obtener la imagen');
  });
});

describe('currentLocation', () => {
  test('solicita permiso y devuelve latitud y longitud', async () => {
    geolocation.checkPermissions.mockResolvedValue({ location: 'prompt' } as never);
    geolocation.requestPermissions.mockResolvedValue({ location: 'granted' } as never);
    geolocation.getCurrentPosition.mockResolvedValue({
      coords: { latitude: -33.4489, longitude: -70.6693 },
    } as never);

    await expect(currentLocation()).resolves.toEqual({ latitude: -33.4489, longitude: -70.6693 });
  });

  test('falla con un mensaje claro si el permiso es denegado', async () => {
    geolocation.checkPermissions.mockResolvedValue({ location: 'denied' } as never);
    geolocation.requestPermissions.mockResolvedValue({ location: 'denied' } as never);

    await expect(currentLocation()).rejects.toThrow('Permiso de ubicación denegado');
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });

  test('no vuelve a pedir permiso si ya estaba concedido', async () => {
    geolocation.checkPermissions.mockResolvedValue({ location: 'granted' } as never);
    geolocation.getCurrentPosition.mockResolvedValue({
      coords: { latitude: 1, longitude: 2 },
    } as never);

    await expect(currentLocation()).resolves.toEqual({ latitude: 1, longitude: 2 });
    expect(geolocation.requestPermissions).not.toHaveBeenCalled();
  });

  test('en web no llama a requestPermissions y usa la geolocalización del navegador', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    geolocation.getCurrentPosition.mockResolvedValue({
      coords: { latitude: -33.4489, longitude: -70.6693 },
    } as never);

    await expect(currentLocation()).resolves.toEqual({ latitude: -33.4489, longitude: -70.6693 });
    expect(geolocation.checkPermissions).not.toHaveBeenCalled();
    expect(geolocation.requestPermissions).not.toHaveBeenCalled();
  });

  test('traduce el rechazo del navegador a un mensaje claro', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    geolocation.getCurrentPosition.mockRejectedValue({ code: 1 });

    await expect(currentLocation()).rejects.toThrow('Permiso de ubicación denegado');
  });
});
