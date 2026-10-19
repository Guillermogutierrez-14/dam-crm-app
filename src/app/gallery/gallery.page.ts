import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonToast
} from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.page.html',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonToast
  ],
})
export class GalleryPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  images: { name: string; url: string }[] = [];
  toastMessage = '';
  isToastOpen = false;

  async ngOnInit() {
    try {
      this.images = await this.supabaseService.getImages();
    } catch (e: any) {
      this.toastMessage = 'Error cargando imágenes: ' + e.message;
      this.isToastOpen = true;
    }
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  async logout() {
    await this.supabaseService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  setToastOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
}