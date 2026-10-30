import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { informationCircleOutline, listOutline, sparklesOutline } from 'ionicons/icons';

import './Menu.css';

const links = [
  { url: '/tareas', icon: listOutline, label: 'Tareas' },
  { url: '/acerca', icon: informationCircleOutline, label: 'Acerca de' },
];

const Menu: React.FC = () => (
  <IonMenu contentId="main" type="overlay">
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonTitle>
          <span className="menu-brand">
            <IonIcon icon={sparklesOutline} aria-hidden="true" /> ToDo List
          </span>
        </IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonMenuToggle autoHide={false}>
        <IonList lines="none" className="menu-list">
          {links.map(({ url, icon, label }) => (
            <IonItem key={url} routerLink={url} routerDirection="none" detail={false}>
              <IonIcon slot="start" icon={icon} aria-hidden="true" />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonMenuToggle>
    </IonContent>
  </IonMenu>
);

export default Menu;
