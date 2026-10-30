import { IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import './About.css';

const About: React.FC = () => (
  <IonPage className="about-page">
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonMenuButton slot="start" />
        <IonTitle>Acerca de</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen className="about-content">
      <main className="about-wrap">
        <h1 className="about-title">ToDo List</h1>
        <p className="about-lead">
          Aplicación móvil para registrar y organizar tareas pendientes. Cada tarea tiene título y descripción, y se
          puede agregar, editar o eliminar desde la pantalla principal.
        </p>
      </main>
    </IonContent>
  </IonPage>
);

export default About;
