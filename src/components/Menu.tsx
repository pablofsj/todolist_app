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
import { informationCircleOutline, listOutline, logOutOutline, sparklesOutline } from 'ionicons/icons';

import { useAuth } from '../lib/auth-context';
import './Menu.css';

const links = [
  { url: '/tareas', icon: listOutline, label: 'Tareas' },
  { url: '/acerca', icon: informationCircleOutline, label: 'Acerca de' },
];

const Menu: React.FC = () => {
  const { user, logout } = useAuth();

  return (
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
        <p className="menu-user">Sesión: {user}</p>
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
        <IonItem button detail={false} className="menu-logout" aria-label="Cerrar sesión" onClick={() => void logout()}>
          <IonIcon slot="start" icon={logOutOutline} aria-hidden="true" />
          <IonLabel>Cerrar sesión</IonLabel>
        </IonItem>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
