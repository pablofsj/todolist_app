import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { lockClosedOutline, logInOutline, personAddOutline, sparklesOutline } from 'ionicons/icons';
import { useState } from 'react';

import { useAuth } from '../lib/auth-context';
import './Login.css';

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Ocurrió un error inesperado.');

const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      if (creating) await register(username, password);
      else await login(username, password);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <IonPage className="login-page">
      <div className="aurora-bg" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>
            <span className="brand">
              <IonIcon icon={sparklesOutline} aria-hidden="true" /> ToDo List
            </span>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="login-content">
        <main className="login-wrap">
          <section className="login-card">
            <h1 className="login-title">{creating ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
            <p className="login-lead">Tus tareas quedan guardadas en este dispositivo y protegidas con tu usuario.</p>

            <form
              className="login-form"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <IonInput
                label="Usuario"
                labelPlacement="stacked"
                autocomplete="username"
                value={username}
                maxlength={30}
                onIonInput={(event) => setUsername(event.detail.value ?? '')}
              />
              <IonInput
                label="Contraseña"
                labelPlacement="stacked"
                type="password"
                autocomplete={creating ? 'new-password' : 'current-password'}
                value={password}
                onIonInput={(event) => setPassword(event.detail.value ?? '')}
              />

              {error && (
                <IonNote color="danger" role="alert" className="login-error">
                  {error}
                </IonNote>
              )}

              <IonButton
                type="submit"
                expand="block"
                className="login-btn"
                disabled={busy || !username.trim() || !password}
              >
                <IonIcon slot="start" icon={creating ? personAddOutline : logInOutline} />
                {busy ? 'Verificando…' : creating ? 'Crear cuenta' : 'Ingresar'}
              </IonButton>

              <IonButton
                type="button"
                fill="clear"
                className="login-switch"
                onClick={() => {
                  setCreating((value) => !value);
                  setError('');
                }}
              >
                <IonIcon slot="start" icon={lockClosedOutline} />
                {creating ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
              </IonButton>
            </form>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Login;
