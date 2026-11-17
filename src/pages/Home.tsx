import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import {
  add,
  cameraOutline,
  checkmark,
  cloudDownloadOutline,
  cloudUploadOutline,
  createOutline,
  locationOutline,
  moonOutline,
  sparklesOutline,
  sunnyOutline,
  trashOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';

import { importTasks, syncTasks } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { capturePhoto, currentLocation } from '../lib/device';
import { loadTasks, saveTasks } from '../lib/storage';
import { addTask, mergeTasks, removeTask, updateTask, type Task, type TaskLocation } from '../lib/tasks';
import './Home.css';

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Ocurrió un error inesperado.');

const Home: React.FC = () => {
  const { user } = useAuth();
  const username = user ?? '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadedUser, setLoadedUser] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dark, setDark] = useState(true);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiBusy, setApiBusy] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('ion-palette-dark', dark);
  }, [dark]);

  useEffect(() => {
    if (!username) return;

    let active = true;
    void loadTasks(username).then((saved) => {
      if (!active) return;
      setTasks(saved);
      setLoadedUser(username);
    });

    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => {
    if (loadedUser !== username) return;
    void saveTasks(username, tasks);
  }, [loadedUser, tasks, username]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPhoto(undefined);
    setEditingId(null);
  };

  const saveTask = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const cleanDescription = description.trim();
    setSaving(true);
    try {
      if (editingId) {
        setTasks((current) =>
          updateTask(current, editingId, { title: trimmedTitle, description: cleanDescription, photo }),
        );
      } else {
        let location: TaskLocation | undefined;
        try {
          location = await currentLocation();
        } catch (cause) {
          setToast(`${errorMessage(cause)} La tarea se guardó sin ubicación.`);
        }

        setTasks((current) =>
          addTask(current, { title: trimmedTitle, description: cleanDescription, photo, location }),
        );
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const attachPhoto = async () => {
    setPhotoBusy(true);
    try {
      setPhoto(await capturePhoto());
    } catch (cause) {
      setToast(errorMessage(cause));
    } finally {
      setPhotoBusy(false);
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setPhoto(task.photo);
  };

  const deleteTask = (id: string) => {
    setTasks((current) => removeTask(current, id));
    if (editingId === id) resetForm();
  };

  const importFromApi = async () => {
    setApiBusy(true);
    try {
      const imported = await importTasks();
      setTasks((current) => mergeTasks(current, imported));
      setToast(`${imported.length} tareas importadas desde la API.`);
    } catch (cause) {
      setToast(errorMessage(cause));
    } finally {
      setApiBusy(false);
    }
  };

  const syncToApi = async () => {
    setApiBusy(true);
    try {
      const synced = await syncTasks(tasks);
      setToast(`${synced} tareas sincronizadas con la API.`);
    } catch (cause) {
      setToast(errorMessage(cause));
    } finally {
      setApiBusy(false);
    }
  };

  return (
    <IonPage className="home-page">
      <div className="aurora-bg" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            <span className="brand">
              <IonIcon icon={sparklesOutline} aria-hidden="true" /> ToDo List
            </span>
          </IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            className="theme-toggle"
            aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
            onClick={() => setDark((value) => !value)}
          >
            <IonIcon slot="icon-only" icon={dark ? sunnyOutline : moonOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="home-content">
        <main className="wrap">
          <p className="lead">
            {tasks.length === 0
              ? 'Todo despejado. Agrega tu primera tarea.'
              : `${tasks.length} ${tasks.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}`}
          </p>

          <form
            className="task-form"
            onSubmit={(event) => {
              event.preventDefault();
              void saveTask();
            }}
          >
            <h2 className="form-title">{editingId ? 'Editar tarea' : 'Nueva tarea'}</h2>
            <IonInput
              label="Título"
              labelPlacement="stacked"
              placeholder="Ej. Preparar la exposición"
              value={title}
              maxlength={80}
              onIonInput={(event) => setTitle(event.detail.value ?? '')}
            />
            <IonTextarea
              label="Descripción"
              labelPlacement="stacked"
              placeholder="¿De qué se trata?"
              value={description}
              rows={2}
              autoGrow
              maxlength={240}
              onIonInput={(event) => setDescription(event.detail.value ?? '')}
            />

            <div className="peripheral-actions">
              {photo && <img className="photo-preview" src={photo} alt="Vista previa de la foto adjunta" />}
              <div className="peripheral-buttons">
                <IonButton
                  type="button"
                  fill="outline"
                  size="small"
                  className="peripheral-btn"
                  disabled={photoBusy || saving}
                  onClick={() => void attachPhoto()}
                >
                  <IonIcon slot="start" icon={cameraOutline} />
                  {photoBusy ? 'Abriendo cámara…' : photo ? 'Cambiar foto' : 'Adjuntar foto'}
                </IonButton>
                {photo && (
                  <IonButton type="button" fill="clear" className="ghost-btn" onClick={() => setPhoto(undefined)}>
                    Quitar foto
                  </IonButton>
                )}
              </div>
              {!editingId && (
                <IonNote className="peripheral-hint">
                  <IonIcon icon={locationOutline} aria-hidden="true" /> La ubicación se registra al guardar.
                </IonNote>
              )}
            </div>

            <div className="form-actions">
              <IonButton type="submit" className="primary-btn" disabled={!title.trim() || saving}>
                <IonIcon slot="start" icon={editingId ? checkmark : add} />
                {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar tarea'}
              </IonButton>
              {editingId && (
                <IonButton fill="clear" className="ghost-btn" onClick={resetForm}>
                  Cancelar
                </IonButton>
              )}
            </div>
          </form>

          <section className="api-actions" aria-label="Sincronización con API">
            <IonButton
              fill="outline"
              size="small"
              className="api-btn"
              disabled={apiBusy}
              onClick={() => void importFromApi()}
            >
              <IonIcon slot="start" icon={cloudDownloadOutline} />
              Importar desde API
            </IonButton>
            <IonButton
              fill="outline"
              size="small"
              className="api-btn"
              disabled={apiBusy || tasks.length === 0}
              onClick={() => void syncToApi()}
            >
              <IonIcon slot="start" icon={cloudUploadOutline} />
              Sincronizar
            </IonButton>
          </section>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={sparklesOutline} aria-hidden="true" />
              <p>Sin tareas por ahora</p>
              <IonNote>Usa el formulario para registrar tu primera tarea.</IonNote>
            </div>
          ) : (
            <IonList lines="none" className="task-list">
              {tasks.map((task) => (
                <IonItem key={task.id} className={`task-item${editingId === task.id ? ' is-editing' : ''}`}>
                  <IonLabel>
                    <h2>{task.title}</h2>
                    <p>{task.description || 'Sin descripción'}</p>
                    {task.photo && <img className="task-photo" src={task.photo} alt={`Foto de ${task.title}`} />}
                    {task.location && (
                      <a
                        className="task-location"
                        href={`https://www.google.com/maps?q=${task.location.latitude},${task.location.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <IonIcon icon={locationOutline} aria-hidden="true" />
                        {task.location.latitude.toFixed(4)}, {task.location.longitude.toFixed(4)}
                      </a>
                    )}
                  </IonLabel>
                  <IonButton
                    slot="end"
                    fill="clear"
                    className="icon-btn"
                    aria-label={`Editar ${task.title}`}
                    onClick={() => startEdit(task)}
                  >
                    <IonIcon slot="icon-only" icon={createOutline} />
                  </IonButton>
                  <IonButton
                    slot="end"
                    fill="clear"
                    className="icon-btn danger"
                    aria-label={`Eliminar ${task.title}`}
                    onClick={() => deleteTask(task.id)}
                  >
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          )}
        </main>
      </IonContent>

      <IonToast
        isOpen={Boolean(toast)}
        message={toast}
        duration={4000}
        position="bottom"
        onDidDismiss={() => setToast('')}
      />
    </IonPage>
  );
};

export default Home;
