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
  IonToolbar,
} from '@ionic/react';
import {
  add,
  checkmark,
  createOutline,
  moonOutline,
  sparklesOutline,
  sunnyOutline,
  trashOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';

import { addTask, removeTask, updateTask, type Task } from '../lib/tasks';
import './Home.css';

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('ion-palette-dark', dark);
  }, [dark]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingId(null);
  };

  const saveTask = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setTasks((current) =>
      editingId
        ? updateTask(current, editingId, trimmedTitle, description.trim())
        : addTask(current, trimmedTitle, description.trim()),
    );
    resetForm();
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
  };

  const deleteTask = (id: string) => {
    setTasks((current) => removeTask(current, id));
    if (editingId === id) resetForm();
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
              saveTask();
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
            <div className="form-actions">
              <IonButton type="submit" className="primary-btn" disabled={!title.trim()}>
                <IonIcon slot="start" icon={editingId ? checkmark : add} />
                {editingId ? 'Guardar cambios' : 'Agregar tarea'}
              </IonButton>
              {editingId && (
                <IonButton fill="clear" className="ghost-btn" onClick={resetForm}>
                  Cancelar
                </IonButton>
              )}
            </div>
          </form>

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
    </IonPage>
  );
};

export default Home;
